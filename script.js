document.addEventListener('DOMContentLoaded', () => {

    // --- OBJETOS DE DADOS E CONFIGURAÇÕES ---

    let gecko = {}; // Será preenchido por createNewGecko() ou loadGame()
    
    // Temperamentos e Diálogos
    const temperamentos = {
        agradecido: {
            nome: "Agradecido",
            dialogues: {
                inicio: ["E aí, tudo certo? Valeu por me tirar da caixa!", "Opa, lugar novo! Curti."],
                feed: ["Nossa, que delícia! Muito obrigado!", "Você é a melhor pessoa!", "Tava precisando, valeu!"],
                water: ["Água! Perfeito, obrigado!", "Refrescante! Valeu mesmo."],
                explore: ["Uhuul! Adoro explorar!", "Isso é muito divertido!"],
                low_status: ["Tô com um pouco de fome...", "Uma aguinha ia bem agora."],
                happy: ["A vida é boa!", "Tô felizão aqui com você!"],
                evento_bom: ["Que legal! Adorei a surpresa!", "Oba! Que sorte a minha!"],
                evento_ruim: ["Ai, que susto!", "Não gostei disso..."]
            }
        },
        bravo: {
            nome: "Bravo",
            dialogues: {
                inicio: ["Onde eu tô? Que lugar é esse?!", "Não me enche, tá?"],
                feed: ["Tá, tá, já comi. Não fez mais que sua obrigação.", "Hum... Comida.", "Até que não tá ruim."],
                water: ["Finalmente, água. Tava quase secando aqui.", "Já era hora, né?"],
                explore: ["Grande coisa, dar uma volta no mesmo lugar.", "Tá, vou. Mas é só pra esticar as pernas."],
                low_status: ["Ei, tô com fome! Vai me deixar morrer aqui?", "QUAL É A DA SEDE?!"],
                happy: ["...Até que aqui não é tão ruim. Mas não se acostuma."],
                evento_bom: ["Humph. Sorte de principiante.", "Tá, isso foi legal. Satisfeito?"],
                evento_ruim: ["Mas que palhaçada é essa?!", "Para com isso!"]
            }
        },
        truta_sp: {
            nome: "Truta de SP",
            dialogues: {
                inicio: ["E aí, jão? Firmeza nesse pote?", "Qual a boa, meu chapa?"],
                feed: ["Aí sim, cachorro! Rango na faixa, tá ligado?", "Essa larica tá monstra, truta. Valeu!", "É nóis!"],
                water: ["Pô, na moral, essa água salvou. É de filtro?", "Aí dei valor, meu parceiro."],
                explore: ["Bora dar um rolê no cafofo! Demorô!", "Explorar o pico, já é!"],
                low_status: ["Ô, jão, tô na larica aqui. Desenrola um rango aí.", "Mano, mó sede... Qual foi?"],
                happy: ["Tô suave na nave!", "Esse pote aqui é daora, parça."],
                evento_bom: ["Aí sim, bot fé! Bagulho loco!", "É disso que eu tô falando!"],
                evento_ruim: ["Ih, mó treta... Que fita é essa?", "Bagulho zuado, meu."]
            }
        },
        carioca_gema: {
            nome: "Carioca da Gema",
            dialogues: {
                inicio: ["Aí, mermão! Que que tá pegando? Esse pote é sinistro!", "Qual foi, parceiro? Cheguei na área."],
                feed: ["Pô, show de bola! Matou a fome legal!", "É isso, essa parada tá boa demais!", "Caraca, valeu!"],
                water: ["Mandou bem! Tava amarradão por uma água.", "Isso que é vida boa, valeu, chefe!"],
                explore: ["Partiu dar um rolé! Sem caô!", "Maneiro! Explorar o território."],
                low_status: ["Aí, tô bolado, na moral. Cadê o rango?", "Pô, a garganta tá seca..."],
                happy: ["Tô tranquilão, curtindo a vista.", "Isso aqui tá o puro suco do sucesso!"],
                evento_bom: ["Ih, rapaz! Hoje é meu dia de sorte!", "Aí sim! Que beleza!"],
                evento_ruim: ["Que parada é essa?! Maior vacilo!", "Ih, sujou..."]
            }
        },
        baiano_retado: {
            nome: "Baiano Retado",
            dialogues: {
                inicio: ["Ó paí, que lugar arretado! Já gostei, meu rei.", "Oxe! Onde é que eu vim parar?"],
                feed: ["Tá vendo, é? Barriga cheia, coração contente.", "Hum, que comida boa da gota!", "Show de bola!"],
                water: ["Ô, meu bom, essa água caiu que nem um manjar.", "Valeu, pivete!"],
                explore: ["Bora ver qual é a desse lugar. Se pique!", "Vou ali e volto, visse?"],
                low_status: ["Véi, a fome tá batendo que é um barril...", "Lá ele... com essa sede toda."],
                happy: ["Tô de boa na lagoa, painho.", "Aí eu vi vantagem!"],
                evento_bom: ["Que baba, meu rei! Coisa boa!", "Oxente, que sorte!"],
                evento_ruim: ["Que desgraça é essa?! Deu a gota!", "Aí é barril dobrado..."]
            }
        },
        gaucho_trilegal: {
            nome: "Gaúcho Trilegal",
            dialogues: {
                inicio: ["Mas bah, tchê! Que canto ajeitado esse.", "Capaz! Onde fui me meter, guri?"],
                feed: ["Nossa, que rango campeiro! Me caiu bem, vivente.", "Trilegal essa comida!", "Obrigado, prenda!"],
                water: ["Essa água lavou a alma, tchê!", "Era o que faltava pra matar a sede."],
                explore: ["Vamo dar uma bombeada por essas bandas.", "Me vou por aí, e já volto."],
                low_status: ["Bah, tô com uma fome de leão...", "Me serve um mate... digo, uma água, guria."],
                happy: ["Tô mais faceiro que guri de bombacha nova!", "Que lugar tri!"],
                evento_bom: ["Que barbaridade! Hoje tô com a sorte grande!", "Coisa buena! "],
                evento_ruim: ["Mas que desatino! Isso não se faz!", "Que frio na barriga, tchê!"]
            }
        }
    };

    // Eventos Aleatórios
    const eventosAleatorios = [
        { nome: "Mosca no Pote", chance: 0.1, efeito: () => { gecko.happiness = Math.min(100, gecko.happiness + 20); gecko.hunger = Math.min(100, gecko.hunger + 10); logMessage('evento_bom'); messageLog.textContent += " (Uma mosca entrou e virou lanche!)"; playSound('happy'); } },
        { nome: "Sombra Assustadora", chance: 0.1, efeito: () => { gecko.happiness = Math.max(0, gecko.happiness - 15); logMessage('evento_ruim'); messageLog.textContent += " (Uma sombra passou e assustou ela!)"; playSound('sad'); } },
        { nome: "Sol Aconchegante", chance: 0.15, efeito: () => { gecko.happiness = Math.min(100, gecko.happiness + 10); logMessage('evento_bom'); messageLog.textContent += " (Um raio de sol aqueceu o pote.)"; playSound('happy'); } },
    ];
    
    // Itens com efeitos passivos
    const shopItems = {
        folha: { name: "Folha Seca", cost: 15, sprite: "assets/item_folha.png", position: { top: '75%', left: '10%' }, desc: "Reduz a fome em 10%", passiveEffect: () => gecko.decayRates.hunger *= 0.9 },
        pedra: { name: "Pedra Lisa", cost: 25, sprite: "assets/item_pedra.png", position: { top: '70%', left: '70%' }, desc: "Aumenta felicidade", passiveEffect: () => gecko.happiness = Math.min(100, gecko.happiness + 0.2) },
        graveto: { name: "Graveto", cost: 20, sprite: "assets/item_graveto.png", position: { top: '20%', left: '25%' }, desc: "Reduz a sede em 10%", passiveEffect: () => gecko.decayRates.thirst *= 0.9 }
    };

    // --- ELEMENTOS DO DOM ---
    const healthBar = document.getElementById('health-bar');
    const daysDisplay = document.getElementById('days-display');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalDaysDisplay = document.getElementById('final-days');
    const restartButton = document.getElementById('restart-button');
    const hungerBar = document.getElementById('hunger-bar');
    const thirstBar = document.getElementById('thirst-bar');
    const happinessBar = document.getElementById('happiness-bar');
    const geckoSprite = document.getElementById('gecko-sprite');
    const messageLog = document.querySelector('#message-log p');
    const jarContainer = document.getElementById('jar-container');
    const pointsDisplay = document.getElementById('points-display');
    const shopItemsContainer = document.getElementById('shop-items');
    const jarItemsContainer = document.getElementById('jar-items');

    const feedButton = document.getElementById('feed-button');
    const waterButton = document.getElementById('water-button');
    const exploreButton = document.getElementById('explore-button');


    let gameInterval; // Para poder parar e reiniciar

    // --- FUNÇÕES DE LÓGICA DO JOGO ---

    function createNewGecko() {
        const keys = Object.keys(temperamentos);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        
        return {
            health: 100,
            hunger: 100,
            thirst: 100,
            happiness: 100,
            pontos: 20,
            days: 0,
            temperamento: temperamentos[randomKey],
            ownedItems: [],
            decayRates: { hunger: 0.5, thirst: 0.8, happiness: 0.5, health: 1.0 },
            isEating: false,
            isDrinking: false,
        };
    }
    
    // Funções de Salvar e Carregar
    function saveGame() {
        localStorage.setItem('geckoSaveData', JSON.stringify(gecko));
    }

    function loadGame() {
        const savedData = localStorage.getItem('geckoSaveData');
        if (savedData) {
            gecko = JSON.parse(savedData);
            // Reconecta o temperamento ao objeto de diálogos, que não é salvo no JSON
            gecko.temperamento = Object.values(temperamentos).find(t => t.nome === gecko.temperamento.nome);
            console.log("Jogo carregado!");
        } else {
            gecko = createNewGecko();
            console.log("Novo jogo criado!");
        }
    }

    // Função de Som
    function playSound(soundName) {
        try {
            new Audio(`assets/sound_${soundName}.mp3`).play();
        } catch(e) {
            console.log(`Não foi possível tocar o som: ${soundName}`);
        }
    }
    
    function updateAllDisplays() {
        healthBar.style.width = `${gecko.health}%`;
        hungerBar.style.width = `${gecko.hunger}%`;
        thirstBar.style.width = `${gecko.thirst}%`;
        happinessBar.style.width = `${gecko.happiness}%`;
        pointsDisplay.textContent = gecko.pontos;
        daysDisplay.textContent = gecko.days;
        updateGeckoSprite();
    }

    function logMessage(eventType) {
        const messages = gecko.temperamento.dialogues[eventType];
        if (messages) {
            const message = messages[Math.floor(Math.random() * messages.length)];
            messageLog.textContent = `"${message}"`;
        }
    }

    function updateGeckoSprite() {
        if (gecko.isEating) geckoSprite.src = 'assets/gecko_comendo.png';
        else if (gecko.isDrinking) geckoSprite.src = 'assets/gecko_bebendo.png';
        else if (gecko.health < 40) geckoSprite.src = 'assets/gecko_triste.png'
        else if (gecko.happiness > 70 && gecko.hunger > 50 && gecko.thirst > 50) {
            geckoSprite.src = 'assets/gecko_feliz.png';
            if (Math.random() < 0.1) logMessage('happy');
        } else if (gecko.happiness < 30 || gecko.hunger < 30 || gecko.thirst < 30) {
            geckoSprite.src = 'assets/gecko_triste.png';
            if (Math.random() < 0.2) logMessage('low_status');
        } else {
            geckoSprite.src = 'assets/gecko_normal.png';
        }
    }

    // --- AÇÕES DO JOGADOR (com som) ---
    feedButton.addEventListener('click', () => {
        if (gecko.hunger < 100) { 
            gecko.hunger = Math.min(100, gecko.hunger + 15); 
            gecko.happiness = Math.min(100, gecko.happiness + 5); 
            logMessage('feed'); 
            gecko.isEating = true; 
            playSound('eat'); 
            setTimeout(() => { gecko.isEating = false; }, 1500); 
        }
    });

    waterButton.addEventListener('click', () => {
        if (gecko.thirst < 100) { 
            gecko.thirst = Math.min(100, gecko.thirst + 20); 
            gecko.happiness = Math.min(100, gecko.happiness + 5); 
            logMessage('water'); 
            gecko.isDrinking = true; 
            playSound('water'); 
            setTimeout(() => { gecko.isDrinking = false; }, 1500); 
        }
    });

    exploreButton.addEventListener('click', () => { 
        gecko.happiness = Math.min(100, gecko.happiness + 10); 
        gecko.hunger = Math.max(0, gecko.hunger - 5); 
        gecko.thirst = Math.max(0, gecko.thirst - 5); 
        logMessage('explore'); 
        playSound('click'); 
        geckoSprite.style.transform = 'scale(1.1)'; 
        setTimeout(() => { geckoSprite.style.transform = 'scale(1)'; }, 300); 
    });
    
    // --- LÓGICA DA LOJA (Atualizada com descrição) ---
    function initializeShop() {
        shopItemsContainer.innerHTML = ''; // Limpa a loja para recarregar
        for (const itemId in shopItems) {
            const item = shopItems[itemId];
            const btn = document.createElement('button');
            btn.className = 'shop-item-btn';
            btn.id = `buy-${itemId}`;
            btn.innerHTML = `<img src="${item.sprite}" alt="${item.name}"><br>${item.name} (${item.cost} pts)<div class="item-desc">${item.desc}</div>`;
            btn.onclick = () => buyItem(itemId);
            if (gecko.ownedItems.includes(itemId)) {
                btn.disabled = true; // Desabilita se já possui
            }
            shopItemsContainer.appendChild(btn);
        }
    }

    function buyItem(itemId) {
        const item = shopItems[itemId];
        if (gecko.pontos >= item.cost && !gecko.ownedItems.includes(itemId)) {
            gecko.pontos -= item.cost;
            gecko.ownedItems.push(itemId);
            gecko.happiness = Math.min(100, gecko.happiness + 15);
            
            placeItemInJar(item);
            document.getElementById(`buy-${itemId}`).disabled = true;
            messageLog.textContent = `Você comprou: ${item.name}!`;
            playSound('buy');
        }
    }
    
    function placeItemInJar(item) { 
        const itemImg = document.createElement('img'); 
        itemImg.src = item.sprite; 
        itemImg.className = 'jar-item'; 
        itemImg.style.top = item.position.top; 
        itemImg.style.left = item.position.left; 
        jarItemsContainer.appendChild(itemImg); 
    }

    function applyPassiveEffects() {
        // Reseta as taxas para o padrão antes de aplicar os bônus
        gecko.decayRates = { hunger: 0.5, thirst: 0.8, happiness: 0.5, health: 1.0 };
        gecko.ownedItems.forEach(itemId => {
            if (shopItems[itemId] && shopItems[itemId].passiveEffect) {
                shopItems[itemId].passiveEffect();
            }
        });
    }

    // --- GAME LOOP E CICLOS DO JOGO ---

    function triggerRandomEvent() {
        for (const evento of eventosAleatorios) {
            if (Math.random() < evento.chance) {
                evento.efeito();
                return; // Garante que apenas um evento ocorra por vez
            }
        }
    }

    function gameLoop() {
        applyPassiveEffects();

        // Diminui status
        gecko.hunger = Math.max(0, gecko.hunger - gecko.decayRates.hunger);
        gecko.thirst = Math.max(0, gecko.thirst - gecko.decayRates.thirst);

        // Diminui felicidade se necessidades estiverem baixas
        if (gecko.hunger < 40 || gecko.thirst < 40) {
            gecko.happiness = Math.max(0, gecko.happiness - gecko.decayRates.happiness);
        }

        // Diminui saúde se necessidades estiverem críticas
        if (gecko.hunger < 15 || gecko.thirst < 15) {
            gecko.health = Math.max(0, gecko.health - gecko.decayRates.health);
        } else if (gecko.health < 100) {
            // Recupera saúde lentamente se estiver bem cuidado
            gecko.health = Math.min(100, gecko.health + 0.2);
        }

        // Ganha pontos por cuidar bem
        if (gecko.happiness > 80 && gecko.hunger > 80 && gecko.thirst > 80) {
            gecko.pontos += 1;
        }
        
        // Dispara evento aleatório de vez em quando
        if (Math.random() < 0.05) { // 5% de chance a cada 2 segundos
            triggerRandomEvent();
        }

        updateAllDisplays();
        saveGame(); // Salva o progresso a cada ciclo

        // Condição de Game Over
        if (gecko.health <= 0) {
            showGameOver();
        }
    }

    function toggleDayNight() {
        jarContainer.classList.toggle('day');
        jarContainer.classList.toggle('night');
        if (jarContainer.classList.contains('day')) {
            gecko.days++; // Conta um dia quando o ciclo vira dia
        }
    }

    function showGameOver() {
        playSound('sad');
        clearInterval(gameInterval);
        finalDaysDisplay.textContent = gecko.days;
        gameOverScreen.classList.remove('hidden');
    }
    
    restartButton.addEventListener('click', () => {
        localStorage.removeItem('geckoSaveData'); // Limpa o save
        gameOverScreen.classList.add('hidden');
        initializeGame();
    });

    function initializeGame() {
        loadGame();
        
        jarContainer.classList.add('day');
        jarItemsContainer.innerHTML = ''; // Limpa itens visuais
        gecko.ownedItems.forEach(id => placeItemInJar(shopItems[id])); // Recoloca os itens do save

        initializeShop();
        logMessage('inicio');
        updateAllDisplays();

        gameInterval = setInterval(gameLoop, 2000);
        setInterval(toggleDayNight, 30000); // 30s por ciclo
    }

    // --- INICIA O JOGO ---
    initializeGame();
});
