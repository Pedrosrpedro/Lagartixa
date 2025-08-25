// ==========================================================================
// PARTE 2: LÓGICA DO JOGO E INTERATIVIDADE
// Este arquivo utiliza as variáveis e dados definidos em script_data.js
// para fazer o jogo funcionar. Contém o gameLoop, ações do jogador,
// atualizações de UI e sistemas complexos.
// ==========================================================================

// Expõe funções de gameplay para serem acessíveis por event listeners
// que podem ser definidos antes deste script ser totalmente lido.
window.petGecko = petGecko;
window.forage = forage;
window.giveWater = giveWater;
window.openFoodPrepModal = openFoodPrepModal;
window.startMinigame = startMinigame;
window.openDiaryModal = openDiaryModal;
window.openAchievementsModal = openAchievementsModal;
window.useCave = useCave;
window.usePool = usePool;
window.releaseGecko = releaseGecko;

function initializeGame() {
    // Aplica bônus permanentes do Legado
    if (gecko.legacyData.upgrades['instinto']) {
        const level = gecko.legacyData.upgrades['instinto'].level;
        gecko.hunger = Math.min(100, gecko.hunger + (level * 10)); // Começa com mais fome
        gecko.thirst = Math.min(100, gecko.thirst + (level * 10)); // Começa com mais sede
    }

    updateBackground();

    // Recria a estrutura interna do pote para evitar duplicatas ao carregar saves
    const jarContainerContent = `
        <div id="season-overlay"></div>
        <div id="weather-overlay"></div>
        <div id="substrate-layer"></div>
        <div id="jar-items"></div>
        <div id="whim-bubble" class="hidden"></div>
        <div id="thought-bubble" class="hidden"></div>
        <img id="gecko-sprite" src="assets/gecko_filhote_normal.png" alt="Lagartixa">
        <img id="bird-sprite" class="hidden" src="assets/passaro.png" alt="Pássaro">
    `;
    jarContainer.innerHTML = jarContainerContent;
    
    // Reatribui o event listener ao novo sprite da lagartixa
    document.getElementById('gecko-sprite').addEventListener('click', petGecko);

    // Reposiciona os móveis salvos
    gecko.placedFurnishings.forEach(item => placeFurnishingInJar(item.id, item.x, item.y));
    
    // Aplica o substrato salvo
    if (gecko.currentSubstrate !== 'none' && jarUpgrades[gecko.currentSubstrate]) {
        document.getElementById('substrate-layer').style.backgroundImage = `url('assets/${jarUpgrades[gecko.currentSubstrate].img}')`;
    }

    initializeShop();
    updateAllDisplays();
    logMessage('inicio');
    restartIntervals();
}

function showLegacyMenu() {
    const legacyData = JSON.parse(localStorage.getItem('geckoLegacyData')) || { points: 0, upgrades: {} };
    legacyPointsDisplay.textContent = legacyData.points;
    legacyUpgradesList.innerHTML = '';
    
    for (const id in legacyUpgrades) {
        const upgrade = legacyUpgrades[id];
        const currentLevel = (legacyData.upgrades[id] && legacyData.upgrades[id].level) || 0;
        const btn = document.createElement('button');
        
        if (currentLevel >= upgrade.maxLevel) {
            btn.textContent = `${upgrade.name} (MAX)`;
            btn.disabled = true;
        } else {
            const cost = upgrade.cost * (currentLevel + 1);
            btn.textContent = `${upgrade.name.replace(/\(Nv\. \d+\)/, `(Nv. ${currentLevel + 1})`)} - ${cost} pts`;
            if (legacyData.points < cost) btn.disabled = true;
            
            btn.onclick = () => {
                legacyData.points -= cost;
                if (!legacyData.upgrades[id]) legacyData.upgrades[id] = { level: 0 };
                legacyData.upgrades[id].level++;
                localStorage.setItem('geckoLegacyData', JSON.stringify(legacyData));
                showLegacyMenu();
            };
        }
        legacyUpgradesList.appendChild(btn);
    }
    legacyMenu.classList.remove('hidden');
}

// ==========================================================================
// 5. SISTEMAS DO MUNDO (GAMELOOP, TEMPO, EVENTOS)
// ==========================================================================

function gameLoop() {
    applyPassiveEffects();

    const decayModifier = lifeStages[gecko.lifeStage].decayMod;
    gecko.hunger = Math.max(0, gecko.hunger - (gecko.decayRates.hunger * decayModifier));
    gecko.thirst = Math.max(0, gecko.thirst - (gecko.decayRates.thirst * decayModifier));

    if (gecko.hunger < 40 || gecko.thirst < 40) {
        gecko.happiness = Math.max(0, gecko.happiness - gecko.decayRates.happiness);
    }
    
    if (gecko.isInjured) {
        gecko.health = Math.min(10, gecko.health); // Trava a vida em 10
        if (gecko.hunger > 90 && gecko.thirst > 90 && gecko.happiness > 50) {
            gecko.recoveryProgress++;
        }
        if (gecko.recoveryProgress >= 90) { // 90 ciclos x 2s = 3 minutos de cuidado intensivo
            gecko.isInjured = false;
            gecko.recoveryProgress = 0;
            gecko.health = 50;
            logToDiary("As feridas estão cicatrizando. Graças a você, acho que vou ficar bem.");
            messageLog.textContent = `${gecko.name} se recuperou totalmente do trauma!`;
            setTimeout(() => { gecko.canBeReleased = true; }, 60000); // Pode ser solto de novo após 1 minuto
        }
    } else if (gecko.isSick) {
        gecko.health = Math.max(0, gecko.health - 0.5);
    } else if (gecko.hunger < 15 || gecko.thirst < 15) {
        gecko.health = Math.max(0, gecko.health - gecko.decayRates.health);
    } else if (gecko.health < 100) {
        gecko.health = Math.min(100, gecko.health + 0.2);
    }

    if (gecko.happiness > 80 && gecko.hunger > 80 && gecko.thirst > 80) {
        const legacyBonus = gecko.legacyData.upgrades['carisma'] ? 1 + (gecko.legacyData.upgrades['carisma'].level * 0.1) : 1;
        gecko.pontos += 1 * legacyBonus;
    }

    const eventChance = gecko.legacyData.upgrades['sorte'] ? 0.05 + (gecko.legacyData.upgrades['sorte'].level * 0.01) : 0.05;
    if (Math.random() < eventChance) triggerRandomEvent();
    if (Math.random() < 0.005) triggerRareVisitor();
    if (Math.random() < 0.01 && !gecko.isSick && !gecko.isInjured) becomeSick();

    updateAllDisplays();
    checkReleaseConditions();

    if (gecko.health <= 0) {
        showGameOver();
    }
}

function toggleDayNight() {
    jarContainer.classList.toggle('day');
    jarContainer.classList.toggle('night');
    if (jarContainer.classList.contains('day')) {
        gecko.days++;
        updateSeason();
        checkLifeStage();
        checkAchievements();
    }
    updateHabitatDisplay();
    updateThoughtBubble();
}

function updateSeason() {
    const day = gecko.days;
    let newSeason = 'verao';
    if (day % 28 < 7) newSeason = 'primavera';
    else if (day % 28 < 14) newSeason = 'verao';
    else if (day % 28 < 21) newSeason = 'outono';
    else newSeason = 'inverno';
    if (gecko.currentSeason !== newSeason) {
        gecko.currentSeason = newSeason;
        logToDiary(`A estação mudou para ${seasons[newSeason].name}.`);
        document.getElementById('season-indicator').src = `assets/${seasons[newSeason].icon}`;
        document.getElementById('season-indicator').title = `Estação: ${seasons[newSeason].name}`;
        const seasonOverlayEl = document.getElementById('season-overlay');
        seasonOverlayEl.className = `season-overlay ${seasons[newSeason].class}`;
        seasonOverlayEl.style.opacity = '1';
        setTimeout(() => seasonOverlayEl.style.opacity = '0', 3000);
    }
}

function applyPassiveEffects() {
    gecko.decayRates = { hunger: 0.5, thirst: 0.8, happiness: 0.5, health: 1.0 };
    seasons[gecko.currentSeason].effects();
    if (habitats[gecko.currentHabitat].passiveBonus) habitats[gecko.currentHabitat].passiveBonus();
    if (gecko.currentSubstrate !== 'none' && jarUpgrades[gecko.currentSubstrate].effect) jarUpgrades[gecko.currentSubstrate].effect();
    gecko.ownedUpgrades.forEach(upgradeId => {
        if (jarUpgrades[upgradeId] && jarUpgrades[upgradeId].effect) {
            jarUpgrades[upgradeId].effect();
        }
    });
}

// ==========================================================================
// 6. FUNÇÕES DE ATUALIZAÇÃO DE UI
// ==========================================================================
function updateAllDisplays() {
    geckoNameDisplay.textContent = gecko.name;
    healthBar.style.width = `${gecko.health}%`;
    hungerBar.style.width = `${gecko.hunger}%`;
    thirstBar.style.width = `${gecko.thirst}%`;
    happinessBar.style.width = `${gecko.happiness}%`;
    pointsDisplay.textContent = Math.floor(gecko.pontos);
    daysDisplay.textContent = gecko.days;
    updateGeckoSprite();
    updateMood();
    updateHabitatDisplay();
    updateInventoryDisplay();
    updateIngredientDisplay();
    sicknessStatus.classList.toggle('hidden', !gecko.isSick);
}

function updateGeckoSprite() {
    const geckoImg = document.getElementById('gecko-sprite');
    if (!geckoImg) return;
    if (gecko.isInteracting) return;
    if (gecko.isInjured) {
        if (gecko.hunger < 20 || gecko.thirst < 20 || gecko.happiness < 10) geckoImg.src = 'assets/gecko_injured_critical.png';
        else if (gecko.happiness > 60) geckoImg.src = 'assets/gecko_injured_recovering.png';
        else geckoImg.src = 'assets/gecko_injured_normal.png';
        return;
    }
    if (gecko.isEating) { geckoImg.src = `assets/gecko_comendo.png`; return; }
    if (gecko.isDrinking) { geckoImg.src = `assets/gecko_bebendo.png`; return; }

    const stageKey = lifeStages[gecko.lifeStage].spriteKey;
    let state = "normal";
    if (gecko.health < 40) state = 'triste';
    else if (gecko.happiness > 70 && gecko.hunger > 50) state = 'feliz';
    geckoImg.src = `assets/gecko_${stageKey}_${state}.png`;
}

function updateHabitatDisplay() {
    const currentHabitatData = habitats[gecko.currentHabitat];
    const isNight = jarContainer.classList.contains('night');
    habitatNameDisplay.textContent = currentHabitatData.name;
    furnishingLimitDisplay.textContent = `Móveis: ${gecko.placedFurnishings.length}/${currentHabitatData.furnishingLimit}`;
    jarContainer.style.backgroundImage = `url('assets/${isNight ? currentHabitatData.bg_night : currentHabitatData.bg_day}')`;
}

function updateMood() {
    let newMood = 'contente';
    if (gecko.happiness < 30 && gecko.hunger < 30) newMood = 'estressado';
    else if (gecko.happiness < 50 && gecko.stats.lastActionDay < gecko.days - 1) newMood = 'entediado';
    if (gecko.currentMood !== newMood) {
        gecko.currentMood = newMood;
        moodStatus.src = `assets/${moods[newMood].icon}`;
        moodStatus.title = `Humor: ${moods[newMood].name}`;
    }
}

function updateInventoryDisplay() {
    inventoryItemsContainer.innerHTML = '';
    gecko.inventory.furnishings.forEach(itemId => {
        const itemData = furnishings[itemId];
        const itemEl = document.createElement('div');
        itemEl.className = 'inventory-item';
        itemEl.style.backgroundImage = `url('assets/${itemData.sprite}')`;
        itemEl.title = `Colocar ${itemData.name}`;
        itemEl.onclick = () => startPlacementMode(itemId);
        inventoryItemsContainer.appendChild(itemEl);
    });
}

function updateIngredientDisplay() {
    ingredientInventory.innerHTML = '';
    for(const id in gecko.inventory.ingredients) {
        const count = gecko.inventory.ingredients[id];
        if (count > 0) {
            const itemData = ingredients[id];
            const itemEl = document.createElement('div');
            itemEl.className = 'ingredient-item';
            itemEl.innerHTML = `<img src="assets/${itemData.sprite}" title="${itemData.name}"><span>x${count}</span>`;
            ingredientInventory.appendChild(itemEl);
        }
    }
}

// ==========================================================================
// 7. AÇÕES DO JOGADOR
// ==========================================================================
// ==========================================================================
// 7. AÇÕES DO JOGADOR
// Contém todas as funções que são acionadas por cliques em botões
// ou outras interações diretas do jogador.
// ==========================================================================

function petGecko() {
    // Cooldown para evitar spam de carinho
    if (!gecko.lastPetTime || (Date.now() - gecko.lastPetTime > 3000)) {
        gecko.happiness = Math.min(100, gecko.happiness + 2);
        gecko.lastPetTime = Date.now();
        gecko.stats.timesPetted++;
        gecko.stats.lastActionDay = gecko.days;

        messageLog.textContent = "Você fez um carinho na sua lagartixa.";
        
        checkAchievements();
        playSound('click');
        fulfillWhim('pet');
    }
}

function forage() {
    gecko.stats.lastActionDay = gecko.days;
    const skillLevel = gecko.skills.forager.level;
    let foundItem = null;

    // A chance de encontrar algo aumenta com a habilidade
    if (Math.random() < 0.5 + (skillLevel * 0.05)) {
        const possibleFinds = Object.keys(ingredients);
        foundItem = possibleFinds[Math.floor(Math.random() * possibleFinds.length)];
    }

    if (foundItem) {
        if (!gecko.inventory.ingredients[foundItem]) {
            gecko.inventory.ingredients[foundItem] = 0;
        }
        gecko.inventory.ingredients[foundItem]++;
        messageLog.textContent = `Você encontrou: 1x ${ingredients[foundItem].name}!`;
        updateIngredientDisplay();
    } else {
        messageLog.textContent = "Não encontrou nada de especial desta vez...";
    }

    addSkillXp('forager', 1);
    playSound('click');
    fulfillWhim('forage');
}

function giveWater() {
    gecko.stats.lastActionDay = gecko.days;
    if (gecko.thirst < 100) {
        gecko.thirst = Math.min(100, gecko.thirst + 20);
        gecko.happiness = Math.min(100, gecko.happiness + 5);
        logMessage('water');
        gecko.isDrinking = true;
        updateGeckoSprite();
        playSound('water');
        setTimeout(() => {
            gecko.isDrinking = false;
            updateGeckoSprite();
        }, 1500); // Animação dura 1.5 segundos
    } else {
        messageLog.textContent = "Sua lagartixa não está com sede.";
    }
}

function openFoodPrepModal() {
    recipeList.innerHTML = ''; // Limpa a lista de receitas anterior
    for (const id in recipes) {
        const recipe = recipes[id];
        const recipeEl = document.createElement('div');
        recipeEl.className = 'recipe';

        let ingredientsText = 'Ingredientes: ';
        let hasIngredients = true;
        for (const ingredientId in recipe.ingredients) {
            const requiredCount = recipe.ingredients[ingredientId];
            const ownedCount = gecko.inventory.ingredients[ingredientId] || 0;
            ingredientsText += `${requiredCount}x ${ingredients[ingredientId].name} (Você tem ${ownedCount}), `;
            if (ownedCount < requiredCount) {
                hasIngredients = false;
            }
        }

        recipeEl.innerHTML = `
            <strong>${recipe.name}</strong>
            <button class="recipe-button" id="prepare-${id}">Preparar</button>
            <p>Recupera ${recipe.hunger} de Fome e ${recipe.happiness} de Felicidade.</p>
            <p class="recipe-ingredients">${ingredientsText.slice(0, -2)}</p>
        `;

        recipeList.appendChild(recipeEl);

        const prepareBtn = document.getElementById(`prepare-${id}`);
        if (!hasIngredients) {
            prepareBtn.disabled = true;
        }
        prepareBtn.onclick = () => prepareRecipe(id);
    }
    foodPrepModal.classList.remove('hidden');
}

function prepareRecipe(recipeId) {
    const recipe = recipes[recipeId];
    
    // Subtrai os ingredientes do inventário
    for (const ingredientId in recipe.ingredients) {
        gecko.inventory.ingredients[ingredientId] -= recipe.ingredients[ingredientId];
    }
    
    // Aplica os bônus
    gecko.hunger = Math.min(100, gecko.hunger + recipe.hunger);
    gecko.happiness = Math.min(100, gecko.happiness + recipe.happiness);
    gecko.stats.timesFed++;
    gecko.stats.lastActionDay = gecko.days;

    messageLog.textContent = `${gecko.name} adorou o(a) ${recipe.name}!`;
    logToDiary(`Comi um(a) ${recipe.name} delicioso(a).`);
    
    updateIngredientDisplay();
    checkAchievements();
    fulfillWhim(`eat_${recipeId}`);
    
    foodPrepModal.classList.add('hidden');
    playSound('eat');
}

function startMinigame() {
    clearInterval(gameInterval); // Pausa o jogo principal
    minigameScreen.classList.remove('hidden');
    let minigameScoreCount = 0;
    minigameScore.textContent = minigameScoreCount;
    let timeLeft = 10;
    minigameTimer.textContent = timeLeft;

    playSound('click');
    moveFly();

    const flyInterval = setInterval(moveFly, 900); // Mosca se move
    const timerInterval = setInterval(() => {
        timeLeft--;
        minigameTimer.textContent = timeLeft;
        if (timeLeft <= 0) {
            endMinigame(minigameScoreCount, timerInterval, flyInterval);
        }
    }, 1000);

    flyTarget.onclick = () => {
        minigameScoreCount++;
        minigameScore.textContent = minigameScoreCount;
        playSound('click');
        moveFly();
    };
}

function moveFly() {
    const rect = jarContainer.getBoundingClientRect();
    const top = Math.random() * (rect.height - 40);
    const left = Math.random() * (rect.width - 40);
    flyTarget.style.top = `${top}px`;
    flyTarget.style.left = `${left}px`;
}

function endMinigame(score, timerInterval, flyInterval) {
    clearInterval(timerInterval);
    clearInterval(flyInterval);
    minigameScreen.classList.add('hidden');
    
    const happinessGain = score * 5;
    gecko.happiness = Math.min(100, gecko.happiness + happinessGain);
    addSkillXp('athlete', score);

    if (score > gecko.stats.bestMinigameScore) {
        gecko.stats.bestMinigameScore = score;
        checkAchievements();
    }
    
    messageLog.textContent = `Vocês brincaram! Você pegou ${score} moscas. (+${happinessGain} felicidade)`;
    playSound('happy');
    fulfillWhim('play');

    gameInterval = setInterval(gameLoop, 2000); // Retoma o jogo
}

function useCave() {
    if (gecko.isInteracting) return;
    gecko.isInteracting = true;
    gecko.stats.lastActionDay = gecko.days;

    const geckoImg = document.getElementById('gecko-sprite');
    geckoImg.src = 'assets/gecko_escondido.png';
    messageLog.textContent = `${gecko.name} está se sentindo seguro na caverna.`;
    gecko.happiness = Math.min(100, gecko.happiness + 15);
    logToDiary("Tirei um cochilo na minha caverna.");
    playSound('click');
    fulfillWhim('use_cave');

    setTimeout(() => {
        gecko.isInteracting = false;
        updateGeckoSprite();
    }, 5000); // Fica 5 segundos
}

function usePool() {
    if (gecko.isInteracting) return;
    gecko.isInteracting = true;
    gecko.stats.lastActionDay = gecko.days;

    const geckoImg = document.getElementById('gecko-sprite');
    geckoImg.src = 'assets/gecko_nadando.png';
    messageLog.textContent = `${gecko.name} está se refrescando na piscina.`;
    gecko.thirst = Math.min(100, gecko.thirst + 10);
    gecko.happiness = Math.min(100, gecko.happiness + 10);
    logToDiary("Dei um mergulho para relaxar.");
    playSound('water');
    fulfillWhim('use_pool');

    setTimeout(() => {
        gecko.isInteracting = false;
        updateGeckoSprite();
    }, 5000); // Fica 5 segundos
}

function openDiaryModal() {
    diaryGeckoName.textContent = gecko.name;
    diaryTemperament.textContent = gecko.temperamento.nome;
    diaryMood.textContent = moods[gecko.currentMood].name;
    
    diaryLogList.innerHTML = '';
    gecko.diaryLog.forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        diaryLogList.appendChild(li);
    });

    diarySkillsList.innerHTML = '';
    for(const skillId in gecko.skills) {
        const skill = gecko.skills[skillId];
        diarySkillsList.innerHTML += `<p><strong>${skillId.charAt(0).toUpperCase() + skillId.slice(1)}:</strong> Nível ${skill.level} (${skill.xp} XP)</p>`;
    }

    diaryModal.classList.remove('hidden');
}

function openAchievementsModal() {
    achievementsList.innerHTML = '';
    for (const key in gecko.achievements) {
        const ach = gecko.achievements[key];
        const li = document.createElement('li');
        if (ach.unlocked) {
            li.classList.add('unlocked');
        }
        li.innerHTML = `${ach.name} <br> <span class="achievement-progress">${ach.desc} (${Math.min(ach.tracker(), ach.goal)} / ${ach.goal})</span>`;
        achievementsList.appendChild(li);
    }
    achievementsModal.classList.remove('hidden');
}

// ==========================================================================
// 8. LÓGICA DE LIBERTAÇÃO E O PÁSSARO
// ==========================================================================
function releaseGecko() {
    if (!gecko.canBeReleased) {
        messageLog.textContent = `${gecko.name} ainda está se recuperando e tem medo de sair.`;
        return;
    }
    if (!confirm("Você tem certeza que quer libertar sua lagartixa? Ela viveu uma vida feliz e está pronta para a natureza. O jogo será reiniciado.")) return;
    
    disableAllButtons();
    clearIntervals();
    messageLog.textContent = `${gecko.name} respira fundo, pronto para a liberdade...`;
    
    setTimeout(() => {
        logToDiary("Chegou a hora. Adeus, meu amigo.");
        document.getElementById('gecko-sprite').style.transition = 'transform 2s linear';
        document.getElementById('gecko-sprite').style.transform = 'translateX(-300px) scale(0.5)';
    }, 2000);

    setTimeout(() => {
        const releaseSuccessRate = gecko.legacyData.upgrades['sorte'] ? 0.8 + (gecko.legacyData.upgrades['sorte'].level * 0.05) : 0.8;
        if (Math.random() < releaseSuccessRate) {
            showSuccessfulReleaseScreen();
        } else {
            triggerBirdEvent();
        }
    }, 4500);
}

function triggerBirdEvent() {
    const bird = document.getElementById('bird-sprite');
    const geckoImg = document.getElementById('gecko-sprite');
    messageLog.textContent = "Espere... que som é esse no céu?!";
    playSound('passaro');
    bird.classList.remove('hidden');
    bird.style.transform = 'translate(-100px, 100px) scale(1.5)';
    setTimeout(() => {
        messageLog.textContent = `OH NÃO! ${gecko.name} FOI PEGO(A)!`;
        geckoImg.style.transition = 'none';
        geckoImg.style.transform = 'translate(-100px, 100px) scale(0.3)';
    }, 1500);
    setTimeout(() => {
        bird.style.transform = 'translate(-150px, -200px) scale(1)';
        geckoImg.style.transform = 'translate(-150px, -200px) scale(0.3)';
    }, 3500);
    setTimeout(() => {
        messageLog.textContent = "O pássaro... deixou cair!";
        playSound('queda');
        geckoImg.style.transition = 'transform 0.5s cubic-bezier(.7,-0.4,.8,1)';
        geckoImg.style.transform = 'translate(0, 0) scale(1) rotate(720deg)';
    }, 5500);
    setTimeout(() => {
        bird.classList.add('hidden');
        gecko.isInjured = true;
        gecko.health = 10;
        gecko.happiness = 0;
        gecko.canBeReleased = false;
        geckoImg.src = 'assets/gecko_injured_critical.png';
        logToDiary("Eu vi a morte... o céu é uma mentira. Nunca mais saio daqui.");
        messageLog.textContent = `${gecko.name} voltou correndo para o pote, todo quebrado! Ele precisa de cuidados intensivos.`;
        playSound('correndo');
        restartIntervals();
        enableAllButtons();
    }, 6500);
}

function showSuccessfulReleaseScreen() {
    const unlockedAchievements = Object.values(gecko.achievements).filter(a => a.unlocked).length;
    const pointsEarned = Math.floor(gecko.days / 5) + gecko.placedFurnishings.length + unlockedAchievements;
    const currentLegacy = JSON.parse(localStorage.getItem('geckoLegacyData')) || { points: 0, upgrades: {} };
    currentLegacy.points += pointsEarned;
    localStorage.setItem('geckoLegacyData', JSON.stringify(currentLegacy));
    gameContainer.classList.add('hidden');
    showLegacyMenu();
}

// ==========================================================================
// 9. HELPER FUNCTIONS (Funções Auxiliares)
// ==========================================================================
function playSound(soundName) {
    try { new Audio(`assets/sound_${soundName}.mp3`).play(); } 
    catch(e) { console.error(`Não foi possível tocar o som: ${soundName}`, e); }
}

function logToDiary(message) {
    gecko.diaryLog.unshift(`Dia ${gecko.days}: ${message}`);
    if (gecko.diaryLog.length > 10) gecko.diaryLog.pop();
}

function disableAllButtons() { actionsContainer.querySelectorAll('button').forEach(b => b.disabled = true); }
function enableAllButtons() { actionsContainer.querySelectorAll('button').forEach(b => b.disabled = false); }
function clearIntervals() {
    clearInterval(gameInterval);
    clearInterval(dayNightInterval);
    clearInterval(whimInterval);
    clearInterval(idleInterval);
}
function restartIntervals() {
    clearIntervals();
    gameInterval = setInterval(gameLoop, 2000);
    dayNightInterval = setInterval(toggleDayNight, 30000);
    idleInterval = setInterval(() => {
        const geckoImg = document.getElementById('gecko-sprite');
        if (geckoImg) {
            geckoImg.classList.add('idle-animation');
            setTimeout(() => geckoImg.classList.remove('idle-animation'), 500);
        }
    }, 8000);
    whimInterval = setInterval(() => {
        if (!gecko.currentWhim && Math.random() < 0.3) generateWhim();
    }, 15000);
}

// ==========================================================================
// 10. EVENT LISTENERS
// ==========================================================================
newGameButton.addEventListener('click', () => {
    const name = prompt("Qual será o nome da sua lagartixa?", "Lagartixo");
    if (name) {
        localStorage.removeItem('geckoSaveData');
        startGame(true, name);
    }
});
continueButton.addEventListener('click', () => startGame(false));
startNewLegacyGameButton.addEventListener('click', () => {
    const name = prompt("Qual será o nome da sua nova lagartixa?", "Lagartixo Jr.");
    if (name) {
        localStorage.removeItem('geckoSaveData');
        startGame(true, name);
    }
});
restartButton.addEventListener('click', () => {
    localStorage.removeItem('geckoSaveData');
    location.reload();
});
allCloseButtons.forEach(btn => btn.onclick = () => btn.closest('.modal').classList.add('hidden'));

exploreButton.addEventListener('click', forage);
waterButton.addEventListener('click', giveWater);
saveButton.addEventListener('click', () => saveGame(true));
prepareFoodButton.addEventListener('click', openFoodPrepModal);
playButton.addEventListener('click', startMinigame);
diaryButton.addEventListener('click', openDiaryModal);
achievementsButton.addEventListener('click', openAchievementsModal);
useCaveButton.addEventListener('click', useCave);
usePoolButton.addEventListener('click', usePool);
releaseButton.addEventListener('click', releaseGo);

// ==========================================================================
// 11. INICIALIZAÇÃO GERAL DO JOGO
// Este código só roda depois que ambos os scripts foram carregados.
// ==========================================================================

// Expõe a função para que script_data.js possa "vê-la"
window.initializeGame = initializeGame; 

// Agora que tudo está carregado e pronto, inicie o menu principal.
setupMainMenu();
