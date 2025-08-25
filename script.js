document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÕES E ESTADO INICIAL ---

    const gecko = {
        hunger: 100,
        thirst: 100,
        happiness: 100,
        isEating: false,
        isDrinking: false,
        pontos: 20, // NOVO: Moeda do jogo
        temperamento: null, // NOVO: Será definido no início
        ownedItems: [], // NOVO: Itens que o jogador possui
    };

    // --- NOVA SEÇÃO: TEMPERAMENTOS E DIÁLOGOS ---
    const temperamentos = {
        agradecido: {
            nome: "Agradecido",
            dialogues: {
                inicio: ["E aí, tudo certo? Valeu por me tirar da caixa!", "Opa, lugar novo! Curti."],
                feed: ["Nossa, que delícia! Muito obrigado!", "Você é a melhor pessoa!", "Tava precisando, valeu!"],
                water: ["Água! Perfeito, obrigado!", "Refrescante! Valeu mesmo."],
                explore: ["Uhuul! Adoro explorar!", "Isso é muito divertido!"],
                low_status: ["Tô com um pouco de fome...", "Uma aguinha ia bem agora."],
                happy: ["A vida é boa!", "Tô felizão aqui com você!"]
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
                happy: ["...Até que aqui não é tão ruim. Mas não se acostuma."]
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
                happy: ["Tô suave na nave!", "Esse pote aqui é daora, parça."]
            }
        }
    };

    // --- NOVA SEÇÃO: ITENS DA LOJA ---
    const shopItems = {
        folha: { name: "Folha Seca", cost: 15, sprite: "assets/item_folha.png", position: { top: '75%', left: '10%' } },
        pedra: { name: "Pedra Lisa", cost: 25, sprite: "assets/item_pedra.png", position: { top: '70%', left: '70%' } },
        graveto: { name: "Graveto", cost: 20, sprite: "assets/item_graveto.png", position: { top: '20%', left: '25%' } }
    };

    // --- ELEMENTOS DO DOM ---
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

    // --- FUNÇÕES DE ATUALIZAÇÃO E LÓGICA ---

    function updateStatusBars() {
        hungerBar.style.width = `${gecko.hunger}%`;
        thirstBar.style.width = `${gecko.thirst}%`;
        happinessBar.style.width = `${gecko.happiness}%`;
    }
    
    // NOVO: Atualiza a exibição de pontos
    function updatePointsDisplay() {
        pointsDisplay.textContent = gecko.pontos;
    }

    function updateGeckoSprite() {
        if (gecko.isEating) geckoSprite.src = 'assets/gecko_comendo.png';
        else if (gecko.isDrinking) geckoSprite.src = 'assets/gecko_bebendo.png';
        else if (gecko.happiness > 70 && gecko.hunger > 50 && gecko.thirst > 50) {
            geckoSprite.src = 'assets/gecko_feliz.png';
            if (Math.random() < 0.1) logMessage('happy'); // Pequena chance de falar algo feliz
        } else if (gecko.happiness < 30 || gecko.hunger < 30 || gecko.thirst < 30) {
            geckoSprite.src = 'assets/gecko_triste.png';
            if (Math.random() < 0.2) logMessage('low_status'); // Chance maior de reclamar
        } else {
            geckoSprite.src = 'assets/gecko_normal.png';
        }
    }

    // REFEITA: Função de mensagem agora usa os temperamentos
    function logMessage(eventType) {
        const messages = gecko.temperamento.dialogues[eventType];
        if (messages) {
            const message = messages[Math.floor(Math.random() * messages.length)];
            messageLog.textContent = `"${message}"`;
        }
    }

    // --- AÇÕES DO JOGADOR ---
    feedButton.addEventListener('click', () => {
        if (gecko.hunger < 100) {
            gecko.hunger = Math.min(100, gecko.hunger + 15);
            gecko.happiness = Math.min(100, gecko.happiness + 5);
            logMessage('feed');
            gecko.isEating = true;
            setTimeout(() => { gecko.isEating = false; }, 1500);
        }
    });

    waterButton.addEventListener('click', () => {
        if (gecko.thirst < 100) {
            gecko.thirst = Math.min(100, gecko.thirst + 20);
            gecko.happiness = Math.min(100, gecko.happiness + 5);
            logMessage('water');
            gecko.isDrinking = true;
            setTimeout(() => { gecko.isDrinking = false; }, 1500);
        }
    });

    exploreButton.addEventListener('click', () => {
        gecko.happiness = Math.min(100, gecko.happiness + 10);
        gecko.hunger = Math.max(0, gecko.hunger - 5);
        gecko.thirst = Math.max(0, gecko.thirst - 5);
        logMessage('explore');
        geckoSprite.style.transform = 'scale(1.1)';
        setTimeout(() => { geckoSprite.style.transform = 'scale(1)'; }, 300);
    });

    // --- NOVAS FUNÇÕES: LOJA E ITENS ---
    function initializeShop() {
        for (const itemId in shopItems) {
            const item = shopItems[itemId];
            const btn = document.createElement('button');
            btn.className = 'shop-item-btn';
            btn.id = `buy-${itemId}`;
            btn.innerHTML = `<img src="${item.sprite}" alt="${item.name}"><br>${item.name} (${item.cost} pts)`;
            btn.onclick = () => buyItem(itemId);
            shopItemsContainer.appendChild(btn);
        }
    }

    function buyItem(itemId) {
        const item = shopItems[itemId];
        if (gecko.pontos >= item.cost && !gecko.ownedItems.includes(itemId)) {
            gecko.pontos -= item.cost;
            gecko.ownedItems.push(itemId);
            gecko.happiness = Math.min(100, gecko.happiness + 15); // Bônus de felicidade por item novo
            
            updatePointsDisplay();
            placeItemInJar(item);
            
            document.getElementById(`buy-${itemId}`).disabled = true;
            messageLog.textContent = `Você comprou: ${item.name}!`;
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
    
    // --- NOVA FUNÇÃO: CICLO DIA/NOITE ---
    function toggleDayNight() {
        jarContainer.classList.toggle('day');
        jarContainer.classList.toggle('night');
    }

    // --- FUNÇÃO PRINCIPAL E INICIALIZAÇÃO DO JOGO ---
    function gameLoop() {
        gecko.hunger = Math.max(0, gecko.hunger - 0.5);
        gecko.thirst = Math.max(0, gecko.thirst - 0.8);

        if (gecko.hunger < 40 || gecko.thirst < 40) {
            gecko.happiness = Math.max(0, gecko.happiness - 0.5);
        }

        // Ganha pontos por cuidar bem
        if (gecko.happiness > 80 && gecko.hunger > 80 && gecko.thirst > 80) {
            gecko.pontos += 1;
            updatePointsDisplay();
        }

        if (gecko.hunger === 0 || gecko.thirst === 0) {
            messageLog.textContent = "Oh não! Você não cuidou bem da sua lagartixa.";
            clearInterval(gameInterval);
            return;
        }

        updateStatusBars();
        updateGeckoSprite();
    }

    function initializeGame() {
        // Escolhe o temperamento
        const keys = Object.keys(temperamentos);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        gecko.temperamento = temperamentos[randomKey];

        // Configurações iniciais
        jarContainer.classList.add('day'); // Começa de dia
        updateStatusBars();
        updatePointsDisplay();
        initializeShop();
        logMessage('inicio');

        // Inicia os ciclos do jogo
        const gameInterval = setInterval(gameLoop, 2000);
        setInterval(toggleDayNight, 30000); // Muda de dia/noite a cada 30 segundos
    }

    initializeGame();
});
