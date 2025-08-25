// ==========================================================================
// PARTE 1: A BASE DE DADOS E O MOTOR DO JOGO
// Este arquivo define TODAS as variáveis, objetos de dados e funções
// de setup inicial, como save/load e o menu principal.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. OBJETOS DE DADOS E CONFIGURAÇÕES GLOBAIS
    // ==========================================================================
    let gecko = {};

    const temperamentos = {
        agradecido: { nome: "Agradecido", dialogues: { inicio: ["E aí, tudo certo? Valeu por me tirar da caixa!", "Opa, lugar novo! Curti."], feed: ["Nossa, que delícia! Muito obrigado!", "Você é a melhor pessoa!", "Tava precisando, valeu!"], water: ["Água! Perfeito, obrigado!", "Refrescante! Valeu mesmo."], explore: ["Uhuul! Adoro explorar!", "Isso é muito divertido!"], low_status: ["Tô com um pouco de fome...", "Uma aguinha ia bem agora."], happy: ["A vida é boa!", "Tô felizão aqui com você!"], evento_bom: ["Que legal! Adorei a surpresa!", "Oba! Que sorte a minha!"], evento_ruim: ["Ai, que susto!", "Não gostei disso..."] } },
        bravo: { nome: "Bravo", dialogues: { inicio: ["Onde eu tô? Que lugar é esse?!", "Não me enche, tá?"], feed: ["Tá, tá, já comi. Não fez mais que sua obrigação.", "Hum... Comida.", "Até que não tá ruim."], water: ["Finalmente, água. Tava quase secando aqui.", "Já era hora, né?"], explore: ["Grande coisa, dar uma volta no mesmo lugar.", "Tá, vou. Mas é só pra esticar as pernas."], low_status: ["Ei, tô com fome! Vai me deixar morrer aqui?", "QUAL É A DA SEDE?!"], happy: ["...Até que aqui não é tão ruim. Mas não se acostuma."], evento_bom: ["Humph. Sorte de principiante.", "Tá, isso foi legal. Satisfeito?"], evento_ruim: ["Mas que palhaçada é essa?!", "Para com isso!"] } },
        truta_sp: { nome: "Truta de SP", dialogues: { inicio: ["E aí, jão? Firmeza nesse pote?", "Qual a boa, meu chapa?"], feed: ["Aí sim, cachorro! Rango na faixa, tá ligado?", "Essa larica tá monstra, truta. Valeu!", "É nóis!"], water: ["Pô, na moral, essa água salvou. É de filtro?", "Aí dei valor, meu parceiro."], explore: ["Bora dar um rolê no cafofo! Demorô!", "Explorar o pico, já é!"], low_status: ["Ô, jão, tô na larica aqui. Desenrola um rango aí.", "Mano, mó sede... Qual foi?"], happy: ["Tô suave na nave!", "Esse pote aqui é daora, parça."], evento_bom: ["Aí sim, bot fé! Bagulho loco!", "É disso que eu tô falando!"], evento_ruim: ["Ih, mó treta... Que fita é essa?", "Bagulho zuado, meu."] } },
        carioca_gema: { nome: "Carioca da Gema", dialogues: { inicio: ["Aí, mermão! Que que tá pegando? Esse pote é sinistro!", "Qual foi, parceiro? Cheguei na área."], feed: ["Pô, show de bola! Matou a fome legal!", "É isso, essa parada tá boa demais!", "Caraca, valeu!"], water: ["Mandou bem! Tava amarradão por uma água.", "Isso que é vida boa, valeu, chefe!"], explore: ["Partiu dar um rolé! Sem caô!", "Maneiro! Explorar o território."], low_status: ["Aí, tô bolado, na moral. Cadê o rango?", "Pô, a garganta tá seca..."], happy: ["Tô tranquilão, curtindo a vista.", "Isso aqui tá o puro suco do sucesso!"], evento_bom: ["Ih, rapaz! Hoje é meu dia de sorte!", "Aí sim! Que beleza!"], evento_ruim: ["Que parada é essa?! Maior vacilo!", "Ih, sujou..."] } },
        baiano_retado: { nome: "Baiano Retado", dialogues: { inicio: ["Ó paí, que lugar arretado! Já gostei, meu rei.", "Oxe! Onde é que eu vim parar?"], feed: ["Tá vendo, é? Barriga cheia, coração contente.", "Hum, que comida boa da gota!", "Show de bola!"], water: ["Ô, meu bom, essa água caiu que nem um manjar.", "Valeu, pivete!"], explore: ["Bora ver qual é a desse lugar. Se pique!", "Vou ali e volto, visse?"], low_status: ["Véi, a fome tá batendo que é um barril...", "Lá ele... com essa sede toda."], happy: ["Tô de boa na lagoa, painho.", "Aí eu vi vantagem!"], evento_bom: ["Que baba, meu rei! Coisa boa!", "Oxente, que sorte!"], evento_ruim: ["Que desgraça é essa?! Deu a gota!", "Aí é barril dobrado..."] } },
        gaucho_trilegal: { nome: "Gaúcho Trilegal", dialogues: { inicio: ["Mas bah, tchê! Que canto ajeitado esse.", "Capaz! Onde fui me meter, guri?"], feed: ["Nossa, que rango campeiro! Me caiu bem, vivente.", "Trilegal essa comida!", "Obrigado, prenda!"], water: ["Essa água lavou a alma, tchê!", "Era o que faltava pra matar a sede."], explore: ["Vamo dar uma bombeada por essas bandas.", "Me vou por aí, e já volto."], low_status: ["Bah, tô com uma fome de leão...", "Me serve um mate... digo, uma água, guria."], happy: ["Tô mais faceiro que guri de bombacha nova!", "Que lugar tri!"], evento_bom: ["Que barbaridade! Hoje tô com a sorte grande!", "Coisa buena! "], evento_ruim: ["Mas que desatino! Isso não se faz!", "Que frio na barriga, tchê!"] } }
    };
    const lifeStages = {
        filhote: { name: "Filhote", nextStageDay: 5, spriteKey: "filhote", decayMod: 1.2 },
        jovem: { name: "Jovem", nextStageDay: 15, spriteKey: "jovem", decayMod: 1.0 },
        adulto: { name: "Adulto", nextStageDay: 30, spriteKey: "adulto", decayMod: 0.9 },
        anciao: { name: "Ancião", nextStageDay: Infinity, spriteKey: "anciao", decayMod: 1.1 }
    };
    const seasons = {
        primavera: { name: "Primavera", icon: "icone_estacao_primavera.png", class: "season-spring", effects: () => gecko.happiness = Math.min(100, gecko.happiness + 0.1) },
        verao: { name: "Verão", icon: "icone_estacao_verao.png", class: "season-summer", effects: () => gecko.decayRates.thirst *= 1.3 },
        outono: { name: "Outono", icon: "icone_estacao_outono.png", class: "season-autumn", effects: () => {} },
        inverno: { name: "Inverno", icon: "icone_estacao_inverno.png", class: "season-winter", effects: () => { gecko.decayRates.hunger *= 1.3; gecko.decayRates.happiness *= 1.1; } }
    };
    const moods = {
        contente: { name: "Contente", icon: "humor_contente.png" },
        entediado: { name: "Entediado", icon: "humor_entediado.png" },
        estressado: { name: "Estressado", icon: "humor_estressado.png" }
    };
    const habitats = {
        pote: { name: "Pote de Vidro", furnishingLimit: 4, bg_day: 'fundo_pote_dia.png', bg_night: 'fundo_pote_noite.png', nextUpgrade: 'bacia' },
        bacia: { name: "Bacia Espaçosa", furnishingLimit: 7, bg_day: 'fundo_bacia_dia.png', bg_night: 'fundo_bacia_noite.png', cost: 500, passiveBonus: () => gecko.decayRates.happiness *= 0.9, nextUpgrade: 'terrario' },
        terrario: { name: "Terrário Panorâmico", furnishingLimit: 12, bg_day: 'fundo_terrario_dia.png', bg_night: 'fundo_terrario_noite.png', cost: 1200, passiveBonus: () => { gecko.decayRates.happiness *= 0.8; gecko.decayRates.hunger *= 0.95; }, nextUpgrade: null }
    };
    const ingredients = {
        minhoca: { name: "Minhoca Seca", sprite: "ingrediente_minhoca.png" },
        broto: { name: "Broto Verde", sprite: "ingrediente_broto.png" },
        fruta: { name: "Fruta Silvestre", sprite: "ingrediente_fruta.png" }
    };
    const recipes = {
        salada: { name: "Salada de Brotos", sprite: "refeicao_salada.png", ingredients: { broto: 2 }, hunger: 25, happiness: 10 },
        espeto: { name: "Espeto de Minhoca", sprite: "refeicao_espeto.png", ingredients: { minhoca: 1, fruta: 1 }, hunger: 40, happiness: 20 }
    };
    const shopItems = {
        remedio: { name: "Remédio", cost: 200, sprite: "icone_doente.png", desc: "Cura qualquer doença." }
    };
    const furnishings = {
        poster1: { name: "Pôster Lagartinho", cost: 50, sprite: "item_poster_1.png", type: 'wall', size: { w: 50, h: 70 } },
        poster2: { name: "Pôster Pôr do Sol", cost: 50, sprite: "item_poster_2.png", type: 'wall', size: { w: 70, h: 50 } },
        caverna: { name: "Caverna Aconchegante", cost: 300, sprite: "item_caverna.png", type: 'floor', size: { w: 120, h: 80 }, interactive: true, action: 'use-cave' },
        piscina: { name: "Piscina de Pedra", cost: 300, sprite: "item_piscina.png", type: 'floor', size: { w: 100, h: 60 }, interactive: true, action: 'use-pool' },
        lampada: { name: "Lâmpada de Aquecimento", cost: 400, sprite: "item_lampada.png", type: 'wall', size: { w: 80, h: 80 }, interactive: false, requiredHabitat: 'terrario' },
        tronco: { name: "Tronco Grande", cost: 350, sprite: "item_tronco.png", type: 'floor', size: { w: 150, h: 90 }, interactive: false, requiredHabitat: 'terrario' }
    };
    const jarUpgrades = {
        filtro: { name: "Filtro de Água", cost: 150, desc: "Sede diminui 20% mais devagar." },
        substrato_areia: { name: "Areia do Deserto", cost: 120, img: "substrato_areia.png" },
        substrato_terra: { name: "Terra Fofa", cost: 120, img: "substrato_terra.png" },
        substrato_musgo: { name: "Musgo Úmido", cost: 120, img: "substrato_musgo.png" }
    };
    const cosmetics = {
        default: { name: "Padrão", cost: 0, class: 'bg-default'},
        floresta: { name: "Floresta", cost: 100, class: 'bg-floresta' },
        praia: { name: "Praia", cost: 100, class: 'bg-praia' },
        cidade: { name: "Cidade", cost: 100, class: 'bg-cidade' }
    };
    const legacyUpgrades = {
        sorte: { name: "Sorte Herdada", cost: 5, maxLevel: 3, desc: "Aumenta a chance de eventos bons." },
        instinto: { name: "Instinto de Sobrevivência", cost: 10, maxLevel: 3, desc: "Comece com status de fome e sede mais altos." },
        carisma: { name: "Carisma Genético", cost: 8, maxLevel: 3, desc: "Ganhe pontos 10% mais rápido." }
    };
    const achievements = {
        sobrevivente: { name: "Sobrevivente Novato", desc: "Sobreviva por 10 dias.", goal: 10, reward: 50, tracker: () => gecko.days },
        gourmet: { name: "Gourmet", desc: "Prepare 10 refeições.", goal: 10, reward: 30, tracker: () => gecko.stats.timesFed },
        comprador: { name: "Decorador de Potes", desc: "Coloque 5 móveis no pote.", goal: 5, reward: 100, tracker: () => gecko.placedFurnishings.length },
        carinhoso: { name: "Cheio de Carinho", desc: "Faça carinho 50 vezes.", goal: 50, reward: 40, tracker: () => gecko.stats.timesPetted },
        reiDaMosca: { name: "Rei da Mosca", desc: "Pegue 10 moscas em uma única partida.", goal: 10, reward: 75, tracker: () => gecko.stats.bestMinigameScore }
    };
    const eventosAleatorios = [
        { nome: "Mosca no Pote", chance: 0.1, efeito: () => { gecko.happiness = Math.min(100, gecko.happiness + 20); gecko.hunger = Math.min(100, gecko.hunger + 10); logMessage('evento_bom'); messageLog.textContent += " (Uma mosca entrou e virou lanche!)"; playSound('happy'); } },
        { nome: "Sombra Assustadora", chance: 0.1, efeito: () => { gecko.happiness = Math.max(0, gecko.happiness - 15); logMessage('evento_ruim'); messageLog.textContent += " (Uma sombra passou e assustou ela!)"; playSound('sad'); } },
        { nome: "Sol Aconchegante", chance: 0.15, efeito: () => { gecko.happiness = Math.min(100, gecko.happiness + 10); logMessage('evento_bom'); messageLog.textContent += " (Um raio de sol aqueceu o pote.)"; playSound('happy'); } },
    ];

    // ==========================================================================
    // 2. ELEMENTOS DO DOM (CACHE)
    // ==========================================================================
    const gameBody = document.getElementById('game-body');
    const legacyMenu = document.getElementById('legacy-menu');
    const legacyPointsDisplay = document.getElementById('legacy-points-display');
    const legacyUpgradesList = document.getElementById('legacy-upgrades-list');
    const startNewLegacyGameButton = document.getElementById('start-new-legacy-game');
    const mainMenu = document.getElementById('main-menu');
    const newGameButton = document.getElementById('new-game-button');
    const continueButton = document.getElementById('continue-button');
    const gameContainer = document.getElementById('game-container');
    const geckoNameDisplay = document.getElementById('gecko-name-display');
    const moodStatus = document.getElementById('mood-status');
    const seasonIndicator = document.getElementById('season-indicator');
    const habitatNameDisplay = document.getElementById('habitat-name-display');
    const furnishingLimitDisplay = document.getElementById('furnishing-limit-display');
    const sicknessStatus = document.getElementById('sickness-status');
    const daysDisplay = document.getElementById('days-display');
    const healthBar = document.getElementById('health-bar');
    const hungerBar = document.getElementById('hunger-bar');
    const thirstBar = document.getElementById('thirst-bar');
    const happinessBar = document.getElementById('happiness-bar');
    const jarContainer = document.getElementById('jar-container');
    const actionsContainer = document.getElementById('actions');
    const exploreButton = document.getElementById('explore-button');
    const prepareFoodButton = document.getElementById('prepare-food-button');
    const waterButton = document.getElementById('water-button');
    const playButton = document.getElementById('play-button');
    const diaryButton = document.getElementById('diary-button');
    const achievementsButton = document.getElementById('achievements-button');
    const saveButton = document.getElementById('save-button');
    const useCaveButton = document.getElementById('use-cave-button');
    const usePoolButton = document.getElementById('use-pool-button');
    const releaseButton = document.getElementById('release-button');
    const messageLog = document.querySelector('#message-log p');
    const inventoryItemsContainer = document.getElementById('inventory-items');
    const ingredientInventory = document.getElementById('ingredient-inventory');
    const shopTabs = document.querySelectorAll('.shop-tab');
    const shopContents = document.querySelectorAll('.shop-content');
    const pointsDisplay = document.getElementById('points-display');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalDaysDisplay = document.getElementById('final-days');
    const restartButton = document.getElementById('restart-button');
    const minigameScreen = document.getElementById('minigame-screen');
    const minigameTimer = document.getElementById('minigame-timer');
    const minigameScore = document.getElementById('minigame-score');
    const flyTarget = document.getElementById('fly-target');
    const achievementsModal = document.getElementById('achievements-modal');
    const achievementsList = document.getElementById('achievements-list');
    const diaryModal = document.getElementById('diary-modal');
    const diaryGeckoName = document.getElementById('diary-gecko-name');
    const diaryTemperament = document.getElementById('diary-temperament');
    const diaryMood = document.getElementById('diary-mood');
    const diaryLogList = document.getElementById('diary-log-list');
    const diarySkillsList = document.getElementById('diary-skills-list');
    const foodPrepModal = document.getElementById('food-prep-modal');
    const recipeList = document.getElementById('recipe-list');
    const allCloseButtons = document.querySelectorAll('.close-button');

    // ==========================================================================
    // 3. ESTADO DO JOGO E VARIÁVEIS GLOBAIS
    // ==========================================================================
    let gameInterval, dayNightInterval, whimInterval, idleInterval;
    let isPlacementMode = false;
    let itemToPlace = null;
    let placementGhost = null;
    let currentWeather = 'ensolarado';

    // ==========================================================================
    // 4. FUNÇÕES DE FLUXO DE JOGO E ESTADO (SAVE, LOAD, MENUS)
    // ==========================================================================
    function createNewGecko(name, legacyData) {
        const keys = Object.keys(temperamentos);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        let newGecko = {
            name: name,
            health: 100, hunger: 100, thirst: 100, happiness: 100,
            pontos: 20, days: 0,
            temperamento: temperamentos[randomKey],
            lifeStage: 'filhote',
            currentSeason: 'primavera',
            currentMood: 'contente',
            currentHabitat: 'pote',
            currentSubstrate: 'none',
            currentBackground: 'bg-default',
            isSick: false,
            isInjured: false,
            recoveryProgress: 0,
            canBeReleased: true,
            isInteracting: false,
            lastPetTime: 0,
            stats: { timesFed: 0, timesPetted: 0, bestMinigameScore: 0, lastActionDay: 0 },
            skills: { forager: { level: 1, xp: 0 }, athlete: { level: 1, xp: 0 } },
            inventory: { ingredients: {}, furnishings: [] },
            placedFurnishings: [],
            ownedUpgrades: [],
            achievements: JSON.parse(JSON.stringify(achievements)),
            diaryLog: [`Dia 0: Nasci neste ${habitats.pote.name}.`],
            currentWhim: null,
            legacyData: legacyData || { points: 0, upgrades: {} },
            decayRates: { hunger: 0.5, thirst: 0.8, happiness: 0.5, health: 1.0 }
        };

        if (newGecko.legacyData.upgrades['instinto']) {
            const level = newGecko.legacyData.upgrades['instinto'].level;
            newGecko.hunger = Math.min(100, newGecko.hunger + (level * 10));
            newGecko.thirst = Math.min(100, newGecko.thirst + (level * 10));
        }
        return newGecko;
    }

    function saveGame(showMsg = false) {
        localStorage.setItem('geckoSaveData', JSON.stringify(gecko));
        if (showMsg) {
            messageLog.textContent = "Jogo salvo com sucesso!";
            saveButton.style.transform = 'scale(1.1)';
            setTimeout(() => saveButton.style.transform = 'scale(1)', 200);
        }
    }

    function loadGame() {
        const savedData = localStorage.getItem('geckoSaveData');
        if (savedData) {
            gecko = JSON.parse(savedData);
            gecko.temperamento = Object.values(temperamentos).find(t => t.nome === gecko.temperamento.nome);
            if (!gecko.skills) gecko.skills = { forager: { level: 1, xp: 0 }, athlete: { level: 1, xp: 0 } };
            if (!gecko.legacyData) gecko.legacyData = { points: 0, upgrades: {} };
            if (!gecko.achievements) gecko.achievements = JSON.parse(JSON.stringify(achievements));
        }
    }

    function setupMainMenu() {
        if (localStorage.getItem('geckoSaveData')) {
            continueButton.disabled = false;
        } else {
            continueButton.disabled = true;
        }
    }

    function startGame(isNew, name) {
        mainMenu.classList.add('hidden');
        legacyMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        if (isNew) {
            const legacyData = JSON.parse(localStorage.getItem('geckoLegacyData')) || { points: 0, upgrades: {} };
            gecko = createNewGecko(name, legacyData);
        } else {
            loadGame();
        }
        initializeGame();
    }
    
    // O PONTO DE ENTRADA PRINCIPAL PARA O JOGO EM SI
    window.initializeGame = initializeGame;
});```

Ok, agora pode colar este código em `script_data.js` e eu lhe enviarei a segunda parte.
