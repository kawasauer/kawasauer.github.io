/* =========================================================
   MISSÃO INCLUSÃO
   SCRIPT.JS
   Versão aprimorada
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

/* =========================================================
   ELEMENTOS
========================================================= */

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const finishScreen = document.getElementById("finishScreen");

const playButton = document.getElementById("playButton");
const fullscreenStartButton = document.getElementById("fullscreenStartButton");
const accessibilityButton = document.getElementById("accessibilityButton");

const accessibilityGameButton =
    document.getElementById("accessibilityGameButton");

const closeAccessibilityButton =
    document.getElementById("closeAccessibilityButton");

const pauseButton = document.getElementById("pauseButton");
const closePauseButton = document.getElementById("closePauseButton");
const continueButton = document.getElementById("continueButton");

const pauseAccessibilityButton =
    document.getElementById("pauseAccessibilityButton");

const pauseRestartButton =
    document.getElementById("pauseRestartButton");

const pauseFullscreenButton =
    document.getElementById("pauseFullscreenButton");

const mainMenuButton =
    document.getElementById("mainMenuButton");

const restartButton =
    document.getElementById("restartButton");

const restartGameButton =
    document.getElementById("restartGameButton");

const hintButton =
    document.getElementById("hintButton");

const pauseOverlay =
    document.getElementById("pauseOverlay");

const accessibilityPanel =
    document.getElementById("accessibilityPanel");

const phaseNumber =
    document.getElementById("phaseNumber");

const phaseTheme =
    document.getElementById("phaseTheme");

const missionTitle =
    document.getElementById("missionTitle");

const objective =
    document.getElementById("objective");

const livesElement =
    document.getElementById("lives");

const keyStatus =
    document.getElementById("keyStatus");

const symbolStatus =
    document.getElementById("symbolStatus");

const switchStatus =
    document.getElementById("switchStatus");

const doorStatus =
    document.getElementById("doorStatus");

const messageBox =
    document.getElementById("messageBox");

const progressBar =
    document.getElementById("progressBar");

const finalHints =
    document.getElementById("finalHints");

const finalLives =
    document.getElementById("finalLives");

/* =========================================================
   ESTADO DO JOGO
========================================================= */

let gameStarted = false;
let gameWon = false;
let gamePaused = false;

let currentLevel = 1;

let lives = 3;

let keysCollected = 0;
let symbolsActivated = 0;
let switchesActivated = 0;

let totalKeys = 0;
let totalSymbols = 0;
let totalSwitches = 0;

let missionComplete = false;

let doorTransitionStarted = false;
let levelChanging = false;

let messageTimer = null;

let doorHintCooldown = 0;

let hintCooldown = 0;

let hintsUsed = 0;
let phaseHints = 0;

let animationTime = 0;

let keysPressed = {};

/* =========================================================
   OBJETOS DO MAPA
========================================================= */

let walls = [];
let collectibles = [];
let symbols = [];
let switches = [];
let doors = [];
let decorations = [];

/* =========================================================
   TOQUE / A*
========================================================= */

const PATH_CELL_SIZE = 20;

const PATH_COLS =
    Math.floor(W / PATH_CELL_SIZE);

const PATH_ROWS =
    Math.floor(H / PATH_CELL_SIZE);

let touchTarget = null;

let touchPath = [];

let touchPathIndex = 0;

let touchStuckFrames = 0;

/* =========================================================
   ACESSIBILIDADE
========================================================= */

let largeTextEnabled = false;
let highContrastEnabled = false;
let colorblindEnabled = false;
let assistEnabled = false;
let touchModeEnabled = false;
let soundEnabled = true;

/* =========================================================
   ÁUDIO
========================================================= */

let audioContext = null;

function initAudio() {

    if (!soundEnabled) {
        return;
    }

    try {

        if (!audioContext) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        }

        if (
            audioContext &&
            audioContext.state === "suspended"
        ) {
            audioContext.resume();
        }

    } catch (error) {

        console.log(
            "Áudio não disponível."
        );

    }
}

function tone(
    frequency,
    duration = 0.08,
    type = "sine",
    gainValue = 0.035
) {

    if (
        !soundEnabled ||
        !audioContext
    ) {
        return;
    }

    try {

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.type = type;

        oscillator.frequency.value =
            frequency;

        gain.gain.value =
            gainValue;

        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );

        const now =
            audioContext.currentTime;

        gain.gain.setValueAtTime(
            gainValue,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + duration
        );

        oscillator.start(now);

        oscillator.stop(
            now + duration
        );

    } catch (error) {
        /* ignora erro de áudio */
    }
}

function soundStart() {
    tone(500, 0.1);
    setTimeout(
        () => tone(700, 0.1),
        100
    );
}

function soundKey() {

    tone(700, 0.08);

    setTimeout(
        () => tone(980, 0.1),
        70
    );
}

function soundSwitch() {
    tone(520, 0.1);
}

function soundCorrect() {
    tone(850, 0.1);
}

function soundWrong() {
    tone(
        170,
        0.18,
        "sawtooth",
        0.025
    );
}

function soundLocked() {
    tone(
        120,
        0.12,
        "square"
    );
}

function soundUnlock() {

    tone(500, 0.08);

    setTimeout(
        () => tone(700, 0.08),
        80
    );

    setTimeout(
        () => tone(950, 0.15),
        160
    );
}

function soundDoor() {
    tone(360, 0.3);
}

function soundVictory() {

    const notes = [
        523,
        659,
        784,
        1046
    ];

    notes.forEach(
        (note, index) => {

            setTimeout(
                () => tone(note, 0.18),
                index * 120
            );

        }
    );
}

function soundError() {

    tone(
        100,
        0.25,
        "sawtooth",
        0.02
    );
}

/* =========================================================
   JOGADOR
========================================================= */

const player = {

    x: 55,
    y: 300,

    width: 28,
    height: 28,

    speed: 4,

    color: "#64b5ff"

};

/* =========================================================
   TEMAS
========================================================= */

const themes = {

    park: {
        floor: "#183b30",
        path: "#295943",
        wall: "#244a39",
        accent: "#69d7a0"
    },

    city: {
        floor: "#27364d",
        path: "#3e5572",
        wall: "#344761",
        accent: "#70a7ff"
    },

    communication: {
        floor: "#30234c",
        path: "#523c75",
        wall: "#463361",
        accent: "#d49cff"
    },

    cooperation: {
        floor: "#40351d",
        path: "#6b5930",
        wall: "#574a28",
        accent: "#ffd36a"
    },

    inclusion: {
        floor: "#3b2140",
        path: "#68405e",
        wall: "#57344e",
        accent: "#ff8fd0"
    },

    accessibility: {
        floor: "#193d45",
        path: "#2c6570",
        wall: "#25545d",
        accent: "#6ee7ef"
    },

    laboratory: {
        floor: "#1d3040",
        path: "#31566d",
        wall: "#29495c",
        accent: "#79c8ff"
    },

    union: {
        floor: "#263d2b",
        path: "#3f6847",
        wall: "#35583e",
        accent: "#8fe6a2"
    },

    challenge: {
        floor: "#3c2b20",
        path: "#694b35",
        wall: "#5a412e",
        accent: "#ffb06e"
    },

    final: {
        floor: "#25214a",
        path: "#4a4080",
        wall: "#3d3569",
        accent: "#a99cff"
    }

};

/* =========================================================
   FASES
========================================================= */

const levelInfo = [

    {
        theme: "Parque da Amizade",
        title: "Primeiro Passo",
        type: "tutorial",
        themeKey: "park",
        goal:
            "Aprenda a explorar: encontre a chave e abra a saída.",
        start: {
            x: 55,
            y: 300
        }
    },

    {
        theme: "Cidade das Possibilidades",
        title: "Rotas Diferentes",
        type: "keys",
        themeKey: "city",
        goal:
            "Encontre as duas chaves e atravesse a cidade.",
        start: {
            x: 55,
            y: 300
        }
    },

    {
        theme: "Centro da Comunicação",
        title: "Na Ordem Certa",
        type: "symbols",
        themeKey: "communication",
        goal:
            "Ative os símbolos na ordem indicada pelos números.",
        start: {
            x: 55,
            y: 300
        }
    },

    {
        theme: "Parque da Cooperação",
        title: "Pontos de Ação",
        type: "switches",
        themeKey: "cooperation",
        goal:
            "Ative os três interruptores para liberar a saída.",
        start: {
            x: 55,
            y: 300
        }
    },

    {
        theme: "Praça da Inclusão",
        title: "Cada Um do Seu Jeito",
        type: "mixed",
        themeKey: "inclusion",
        goal:
            "Combine chaves, símbolos e interruptores.",
        start: {
            x: 55,
            y: 300
        }
    },

    {
        theme: "Centro da Acessibilidade",
        title: "Caminhos Acessíveis",
        type: "mixed",
        themeKey: "accessibility",
        goal:
            "Complete os desafios usando as rotas disponíveis.",
        start: {
            x: 55,
            y: 300
        }
    },

    {
        theme: "Laboratório",
        title: "Comunicação em Ação",
        type: "sequence",
        themeKey: "laboratory",
        goal:
            "Colete, observe e siga a sequência correta.",
        start: {
            x: 55,
            y: 300
        }
    },

    {
        theme: "Praça da União",
        title: "Todos Juntos",
        type: "mixed",
        themeKey: "union",
        goal:
            "Complete diferentes tipos de desafio pela praça.",
        start: {
            x: 55,
            y: 300
        }
    },

    {
        theme: "Cidade dos Desafios",
        title: "Escolhas e Soluções",
        type: "mixed",
        themeKey: "challenge",
        goal:
            "Encontre todos os objetivos e use as pistas quando precisar.",
        start: {
            x: 55,
            y: 300
        }
    },

    {
        theme: "Centro da Inclusão",
        title: "A Grande Inclusão",
        type: "final",
        themeKey: "final",
        goal:
            "Complete a missão final usando tudo o que aprendeu.",
        start: {
            x: 55,
            y: 300
        }
    }

];

/* =========================================================
   FUNÇÕES BÁSICAS
========================================================= */

function rect(
    x,
    y,
    width,
    height
) {

    return {
        x,
        y,
        width,
        height
    };

}

function collides(a, b) {

    return (

        a.x <
            b.x + b.width &&

        a.x + a.width >
            b.x &&

        a.y <
            b.y + b.height &&

        a.y + a.height >
            b.y

    );

}

function distance(a, b) {

    const ax =
        a.x + a.width / 2;

    const ay =
        a.y + a.height / 2;

    const bx =
        b.x + b.width / 2;

    const by =
        b.y + b.height / 2;

    return Math.hypot(
        ax - bx,
        ay - by
    );

}

function center(object) {

    return {

        x:
            object.x +
            object.width / 2,

        y:
            object.y +
            object.height / 2

    };

}

/* =========================================================
   MENSAGENS
========================================================= */

function showMessage(
    text,
    duration = 2200
) {

    messageBox.textContent =
        text;

    clearTimeout(
        messageTimer
    );

    messageTimer =
        setTimeout(
            () => {

                if (
                    gameStarted &&
                    !gamePaused
                ) {

                    messageBox.textContent =
                        "Continue explorando. Você consegue!";

                }

            },
            duration
        );

}

/* =========================================================
   TELA CHEIA
========================================================= */

function enterFullscreen() {

    const element =
        document.documentElement;

    if (
        !document.fullscreenElement
    ) {

        if (
            element.requestFullscreen
        ) {

            element.requestFullscreen();

        }

    } else {

        if (
            document.exitFullscreen
        ) {

            document.exitFullscreen();

        }

    }

}

/* =========================================================
   ACESSIBILIDADE
========================================================= */

function updateAccessibilityUI() {

    const largeTextStatus =
        document.getElementById(
            "largeTextStatus"
        );

    const contrastStatus =
        document.getElementById(
            "contrastStatus"
        );

    const colorblindStatus =
        document.getElementById(
            "colorblindStatus"
        );

    const assistStatus =
        document.getElementById(
            "assistStatus"
        );

    const touchModeStatus =
        document.getElementById(
            "touchModeStatus"
        );

    const soundStatus =
        document.getElementById(
            "soundStatus"
        );

    const largeTextButton =
        document.getElementById(
            "largeTextButton"
        );

    const contrastButton =
        document.getElementById(
            "contrastButton"
        );

    const colorblindButton =
        document.getElementById(
            "colorblindButton"
        );

    const assistButton =
        document.getElementById(
            "assistButton"
        );

    const touchModeButton =
        document.getElementById(
            "touchModeButton"
        );

    const soundButton =
        document.getElementById(
            "soundButton"
        );

    if (largeTextStatus) {

        largeTextStatus.textContent =
            largeTextEnabled
                ? "Ativado"
                : "Desativado";

    }

    if (contrastStatus) {

        contrastStatus.textContent =
            highContrastEnabled
                ? "Ativado"
                : "Desativado";

    }

    if (colorblindStatus) {

        colorblindStatus.textContent =
            colorblindEnabled
                ? "Ativado"
                : "Desativado";

    }

    if (assistStatus) {

        assistStatus.textContent =
            assistEnabled
                ? "Ativado"
                : "Desativado";

    }

    if (touchModeStatus) {

        touchModeStatus.textContent =
            touchModeEnabled
                ? "Ativado"
                : "Desativado";

    }

    if (soundStatus) {

        soundStatus.textContent =
            soundEnabled
                ? "Ativado"
                : "Desativado";

    }

    if (largeTextButton) {

        largeTextButton.textContent =
            largeTextEnabled
                ? "Desativar"
                : "Ativar";

    }

    if (contrastButton) {

        contrastButton.textContent =
            highContrastEnabled
                ? "Desativar"
                : "Ativar";

    }

    if (colorblindButton) {

        colorblindButton.textContent =
            colorblindEnabled
                ? "Desativar"
                : "Ativar";

    }

    if (assistButton) {

        assistButton.textContent =
            assistEnabled
                ? "Desativar"
                : "Ativar";

    }

    if (touchModeButton) {

        touchModeButton.textContent =
            touchModeEnabled
                ? "Desativar"
                : "Ativar";

    }

    if (soundButton) {

        soundButton.textContent =
            soundEnabled
                ? "Desativar"
                : "Ativar";

    }

    document.body.classList.toggle(
        "large-text",
        largeTextEnabled
    );

    document.body.classList.toggle(
        "high-contrast",
        highContrastEnabled
    );

    document.body.classList.toggle(
        "colorblind-mode",
        colorblindEnabled
    );

}

if (accessibilityButton) {

    accessibilityButton.onclick =
        () => {

            accessibilityPanel.classList.add(
                "open"
            );

        };

}

if (accessibilityGameButton) {

    accessibilityGameButton.onclick =
        () => {

            accessibilityPanel.classList.add(
                "open"
            );

        };

}

if (closeAccessibilityButton) {

    closeAccessibilityButton.onclick =
        () => {

            accessibilityPanel.classList.remove(
                "open"
            );

        };

}

/* =========================================================
   BOTÕES DE ACESSIBILIDADE
========================================================= */

document.getElementById(
    "largeTextButton"
).onclick = () => {

    largeTextEnabled =
        !largeTextEnabled;

    updateAccessibilityUI();

};

document.getElementById(
    "contrastButton"
).onclick = () => {

    highContrastEnabled =
        !highContrastEnabled;

    updateAccessibilityUI();

};

document.getElementById(
    "colorblindButton"
).onclick = () => {

    colorblindEnabled =
        !colorblindEnabled;

    updateAccessibilityUI();

};

document.getElementById(
    "assistButton"
).onclick = () => {

    assistEnabled =
        !assistEnabled;

    updateAccessibilityUI();

    showMessage(
        assistEnabled
            ? "💡 Assistência ativada. Os objetivos importantes ficarão mais fáceis de localizar."
            : "💡 Assistência desativada.",
        3000
    );

};

document.getElementById(
    "touchModeButton"
).onclick = () => {

    touchModeEnabled =
        !touchModeEnabled;

    clearTouchPath();

    updateAccessibilityUI();

    showMessage(
        touchModeEnabled
            ? "👆 Modo toque ativado. Toque no mapa para caminhar."
            : "🎮 Modo toque desativado.",
        2500
    );

};

document.getElementById(
    "soundButton"
).onclick = () => {

    soundEnabled =
        !soundEnabled;

    if (soundEnabled) {

        initAudio();

    }

    updateAccessibilityUI();

};

/* =========================================================
   PAUSA
========================================================= */

function togglePause() {

    if (
        !gameStarted ||
        gameWon
    ) {
        return;
    }

    gamePaused =
        !gamePaused;

    pauseOverlay.classList.toggle(
        "open",
        gamePaused
    );

    if (gamePaused) {

        clearTouchPath();

    } else {

        initAudio();

    }

}

pauseButton.onclick =
    togglePause;

closePauseButton.onclick =
    togglePause;

continueButton.onclick =
    togglePause;

pauseAccessibilityButton.onclick =
    () => {

        accessibilityPanel.classList.add(
            "open"
        );

    };

pauseRestartButton.onclick =
    () => {

        togglePause();

        loadLevel(
            currentLevel
        );

    };

pauseFullscreenButton.onclick =
    enterFullscreen;

/* =========================================================
   MENU PRINCIPAL
========================================================= */

function mainMenu() {

    gameStarted = false;
    gamePaused = false;
    gameWon = false;

    keysPressed = {};

    clearTouchPath();

    pauseOverlay.classList.remove(
        "open"
    );

    accessibilityPanel.classList.remove(
        "open"
    );

    gameScreen.classList.remove(
        "active"
    );

    finishScreen.classList.remove(
        "active"
    );

    startScreen.classList.add(
        "active"
    );

}

mainMenuButton.onclick =
    mainMenu;

/* =========================================================
   TECLADO
========================================================= */

window.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        keysPressed[key] = true;

        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                " ",
                "w",
                "a",
                "s",
                "d"
            ].includes(key)
        ) {

            event.preventDefault();

        }

        if (
            event.key === "Escape"
        ) {

            if (
                accessibilityPanel.classList.contains(
                    "open"
                )
            ) {

                accessibilityPanel.classList.remove(
                    "open"
                );

            } else {

                togglePause();

            }

        }

        if (
            key === "e" ||
            event.key === " "
        ) {

            if (
                gameStarted &&
                !gamePaused
            ) {

                interactDoor();

            }

        }

        if (
            key === "h" &&
            gameStarted &&
            !gamePaused
        ) {

            giveHint();

        }

    }
);

window.addEventListener(
    "keyup",
    event => {

        delete keysPressed[
            event.key.toLowerCase()
        ];

    }
);

/* =========================================================
   CONTROLES DE TOQUE
========================================================= */

document
    .querySelectorAll(
        "#touchControls button"
    )
    .forEach(button => {

        button.addEventListener(
            "pointerdown",
            () => {

                keysPressed[
                    button.dataset.key
                ] = true;

            }
        );

        [
            "pointerup",
            "pointercancel",
            "pointerleave"
        ].forEach(
            eventName => {

                button.addEventListener(
                    eventName,
                    () => {

                        delete keysPressed[
                            button.dataset.key
                        ];

                    }
                );

            }
        );

    });

/* =========================================================
   TOQUE NO MAPA
========================================================= */

canvas.addEventListener(
    "pointerdown",
    event => {

        if (
            !gameStarted ||
            gamePaused ||
            !touchModeEnabled
        ) {

            return;

        }

        const bounds =
            canvas.getBoundingClientRect();

        const x =
            (
                event.clientX -
                bounds.left
            ) *
            W /
            bounds.width;

        const y =
            (
                event.clientY -
                bounds.top
            ) *
            H /
            bounds.height;

        const objectiveAtPoint =
            getNearestObjectiveAt(
                x,
                y
            );

        if (objectiveAtPoint) {

            const point =
                center(
                    objectiveAtPoint
                );

            touchTarget = {
                x: point.x,
                y: point.y
            };

            createTouchPath(
                point.x,
                point.y
            );

            return;

        }

        const door =
            doors[0];

        if (
            door &&
            Math.hypot(
                x - center(door).x,
                y - center(door).y
            ) < 90
        ) {

            const point =
                center(door);

            touchTarget = point;

            createTouchPath(
                point.x,
                point.y
            );

            return;

        }

        const targetX =
            Math.max(
                25,
                Math.min(
                    W - 25,
                    x
                )
            );

        const targetY =
            Math.max(
                25,
                Math.min(
                    H - 25,
                    y
                )
            );

        touchTarget = {
            x: targetX,
            y: targetY
        };

        createTouchPath(
            targetX,
            targetY
        );

    }
);

/* =========================================================
   CRIAÇÃO DOS OBJETOS
========================================================= */

function addWall(
    x,
    y,
    width,
    height
) {

    walls.push(
        rect(
            x,
            y,
            width,
            height
        )
    );

}

function addKey(
    x,
    y
) {

    collectibles.push({

        ...rect(
            x,
            y,
            28,
            28
        ),

        collected: false

    });

}

function addSymbol(
    x,
    y,
    order,
    shape
) {

    symbols.push({

        ...rect(
            x,
            y,
            34,
            34
        ),

        order,
        shape,

        activated: false

    });

}

function addSwitch(
    x,
    y
) {

    switches.push({

        ...rect(
            x,
            y,
            34,
            34
        ),

        activated: false

    });

}

function addDoor(
    x,
    y
) {

    doors.push({

        ...rect(
            x,
            y,
            48,
            80
        ),

        open: false

    });

}

function addDecoration(
    type,
    x,
    y,
    extra = {}
) {

    decorations.push({

        type,
        x,
        y,
        ...extra

    });

}

/* =========================================================
   BORDAS
========================================================= */

function createBorders() {

    addWall(
        0,
        0,
        W,
        18
    );

    addWall(
        0,
        H - 18,
        W,
        18
    );

    addWall(
        0,
        0,
        18,
        H
    );

    addWall(
        W - 18,
        0,
        18,
        H
    );

}

/* =========================================================
   CONSTRUÇÃO DAS FASES
========================================================= */

function buildLevel(level) {

    /* -----------------------------------------------------
       FASE 1
    ----------------------------------------------------- */

    if (level === 1) {

        addWall(
            220,
            70,
            30,
            470
        );

        addWall(
            470,
            0,
            30,
            400
        );

        addWall(
            720,
            230,
            30,
            400
        );

        addKey(
            320,
            310
        );

        addDoor(
            980,
            275
        );

        addDecoration(
            "tree",
            120,
            100
        );

        addDecoration(
            "tree",
            900,
            120
        );

        addDecoration(
            "bench",
            360,
            150
        );

        addDecoration(
            "flower",
            570,
            470
        );

    }

    /* -----------------------------------------------------
       FASE 2
    ----------------------------------------------------- */

    if (level === 2) {

        addWall(
            210,
            70,
            30,
            500
        );

        addWall(
            420,
            0,
            30,
            420
        );

        addWall(
            640,
            210,
            30,
            420
        );

        addWall(
            840,
            0,
            30,
            420
        );

        addKey(
            300,
            310
        );

        addKey(
            550,
            110
        );

        addDoor(
            980,
            275
        );

        addDecoration(
            "building",
            100,
            80
        );

        addDecoration(
            "building",
            900,
            480
        );

        addDecoration(
            "lamp",
            580,
            500
        );

        addDecoration(
            "lamp",
            780,
            120
        );

    }

    /* -----------------------------------------------------
       FASE 3
    ----------------------------------------------------- */

    if (level === 3) {

        addWall(
            190,
            70,
            30,
            470
        );

        addWall(
            390,
            0,
            30,
            400
        );

        addWall(
            590,
            230,
            30,
            400
        );

        addWall(
            790,
            0,
            30,
            400
        );

        addSymbol(
            280,
            310,
            1,
            "circle"
        );

        addSymbol(
            500,
            100,
            2,
            "triangle"
        );

        addSymbol(
            690,
            460,
            3,
            "square"
        );

        addDoor(
            980,
            275
        );

        addDecoration(
            "crystal",
            105,
            120
        );

        addDecoration(
            "crystal",
            920,
            470
        );

    }

    /* -----------------------------------------------------
       FASE 4
    ----------------------------------------------------- */

    if (level === 4) {

        addWall(
            220,
            70,
            30,
            470
        );

        addWall(
            460,
            0,
            30,
            400
        );

        addWall(
            700,
            230,
            30,
            400
        );

        addWall(
            880,
            0,
            30,
            400
        );

        addSwitch(
            320,
            310
        );

        addSwitch(
            560,
            100
        );

        addSwitch(
            800,
            460
        );

        addDoor(
            980,
            275
        );

        addDecoration(
            "tree",
            120,
            100
        );

        addDecoration(
            "bench",
            560,
            500
        );

        addDecoration(
            "tree",
            940,
            120
        );

    }

    /* -----------------------------------------------------
       FASE 5
    ----------------------------------------------------- */

    if (level === 5) {

        addWall(
            180,
            70,
            30,
            470
        );

        addWall(
            350,
            0,
            30,
            400
        );

        addWall(
            520,
            230,
            30,
            400
        );

        addWall(
            690,
            0,
            30,
            400
        );

        addWall(
            860,
            230,
            30,
            400
        );

        addKey(
            270,
            310
        );

        addKey(
            450,
            100
        );

        addSymbol(
            300,
            460,
            1,
            "circle"
        );

        addSymbol(
            600,
            100,
            2,
            "triangle"
        );

        addSymbol(
            780,
            460,
            3,
            "square"
        );

        addSwitch(
            110,
            310
        );

        addSwitch(
            500,
            470
        );

        addSwitch(
            940,
            100
        );

        addDoor(
            980,
            275
        );

        addDecoration(
            "rainbow",
            520,
            170
        );

    }

    /* -----------------------------------------------------
       FASE 6
    ----------------------------------------------------- */

    if (level === 6) {

        addWall(
            180,
            70,
            30,
            470
        );

        addWall(
            350,
            0,
            30,
            400
        );

        addWall(
            520,
            230,
            30,
            400
        );

        addWall(
            690,
            0,
            30,
            400
        );

        addWall(
            860,
            230,
            30,
            400
        );

        addKey(
            270,
            310
        );

        addKey(
            450,
            100
        );

        addKey(
            610,
            470
        );

        addSwitch(
            110,
            310
        );

        addSwitch(
            480,
            470
        );

        addSwitch(
            800,
            100
        );

        addDoor(
            980,
            275
        );

        addDecoration(
            "ramp",
            285,
            160
        );

        addDecoration(
            "ramp",
            760,
            420
        );

    }

    /* -----------------------------------------------------
       FASE 7
    ----------------------------------------------------- */

    if (level === 7) {

        addWall(
            160,
            70,
            30,
            470
        );

        addWall(
            320,
            0,
            30,
            400
        );

        addWall(
            480,
            230,
            30,
            400
        );

        addWall(
            640,
            0,
            30,
            400
        );

        addWall(
            800,
            230,
            30,
            400
        );

        addKey(
            240,
            310
        );

        addKey(
            400,
            100
        );

        addKey(
            720,
            470
        );

        addSymbol(
            270,
            460,
            1,
            "circle"
        );

        addSymbol(
            410,
            310,
            2,
            "triangle"
        );

        addSymbol(
            560,
            100,
            3,
            "square"
        );

        addSymbol(
            730,
            310,
            4,
            "circle"
        );

        addDoor(
            980,
            275
        );

        addDecoration(
            "crystal",
            100,
            100
        );

        addDecoration(
            "crystal",
            900,
            480
        );

    }

    /* -----------------------------------------------------
       FASE 8
    ----------------------------------------------------- */

    if (level === 8) {

        addWall(
            200,
            70,
            30,
            470
        );

        addWall(
            390,
            0,
            30,
            400
        );

        addWall(
            580,
            230,
            30,
            400
        );

        addWall(
            770,
            0,
            30,
            400
        );

        addWall(
            910,
            230,
            30,
            400
        );

        addKey(
            270,
            310
        );

        addKey(
            460,
            100
        );

        addKey(
            650,
            470
        );

        addKey(
            840,
            100
        );

        addSymbol(
            300,
            460,
            1,
            "circle"
        );

        addSymbol(
            520,
            310,
            2,
            "triangle"
        );

        addSymbol(
            700,
            100,
            3,
            "square"
        );

        addSwitch(
            110,
            310
        );

        addSwitch(
            350,
            470
        );

        addSwitch(
            700,
            470
        );

        addSwitch(
            940,
            100
        );

        addDoor(
            980,
            275
        );

        addDecoration(
            "rainbow",
            540,
            160
        );

        addDecoration(
            "tree",
            105,
            120
        );

    }

    /* -----------------------------------------------------
       FASE 9
    ----------------------------------------------------- */

    if (level === 9) {

        addWall(
            170,
            70,
            30,
            470
        );

        addWall(
            340,
            0,
            30,
            400
        );

        addWall(
            510,
            230,
            30,
            400
        );

        addWall(
            680,
            0,
            30,
            400
        );

        addWall(
            850,
            230,
            30,
            400
        );

        addKey(
            250,
            310
        );

        addKey(
            420,
            100
        );

        addKey(
            590,
            470
        );

        addKey(
            760,
            100
        );

        addSymbol(
            280,
            460,
            1,
            "circle"
        );

        addSymbol(
            440,
            310,
            2,
            "triangle"
        );

        addSymbol(
            590,
            100,
            3,
            "square"
        );

        addSymbol(
            760,
            460,
            4,
            "circle"
        );

        addSwitch(
            100,
            310
        );

        addSwitch(
            300,
            100
        );

        addSwitch(
            610,
            310
        );

        addSwitch(
            950,
            100
        );

        addDoor(
            980,
            275
        );

        addDecoration(
            "building",
            90,
            80
        );

        addDecoration(
            "building",
            900,
            470
        );

    }

    /* -----------------------------------------------------
       FASE 10
    ----------------------------------------------------- */

    if (level === 10) {

        addWall(
            150,
            70,
            30,
            470
        );

        addWall(
            310,
            0,
            30,
            400
        );

        addWall(
            470,
            230,
            30,
            400
        );

        addWall(
            630,
            0,
            30,
            400
        );

        addWall(
            790,
            230,
            30,
            400
        );

        addWall(
            910,
            0,
            30,
            400
        );

        addKey(
            220,
            310
        );

        addKey(
            380,
            100
        );

        addKey(
            540,
            470
        );

        addKey(
            700,
            100
        );

        addKey(
            860,
            470
        );

        addSymbol(
            250,
            460,
            1,
            "circle"
        );

        addSymbol(
            400,
            310,
            2,
            "triangle"
        );

        addSymbol(
            550,
            100,
            3,
            "square"
        );

        addSymbol(
            700,
            310,
            4,
            "circle"
        );

        addSymbol(
            850,
            100,
            5,
            "triangle"
        );

        addSwitch(
            100,
            310
        );

        addSwitch(
            300,
            470
        );

        addSwitch(
            530,
            310
        );

        addSwitch(
            700,
            470
        );

        addSwitch(
            950,
            100
        );

        addDoor(
            980,
            275
        );

        addDecoration(
            "rainbow",
            540,
            165
        );

        addDecoration(
            "monument",
            940,
            500
        );

    }

}

/* =========================================================
   ORGANIZAÇÃO DOS OBJETIVOS
========================================================= */

function getObjectiveCenter(object) {

    return {

        x:
            object.x +
            object.width / 2,

        y:
            object.y +
            object.height / 2

    };

}

function objectiveHitsWall(
    object
) {

    const test = {

        x:
            object.x - 8,

        y:
            object.y - 8,

        width:
            object.width + 16,

        height:
            object.height + 16

    };

    return walls.some(
        wall =>
            collides(
                test,
                wall
            )
    );

}

function objectiveHitsDoor(
    object
) {

    const test = {

        x:
            object.x - 8,

        y:
            object.y - 8,

        width:
            object.width + 16,

        height:
            object.height + 16

    };

    return doors.some(
        door =>
            collides(
                test,
                door
            )
    );

}

function objectiveHitsAnother(
    object,
    allObjectives
) {

    const test = {

        x:
            object.x - 12,

        y:
            object.y - 12,

        width:
            object.width + 24,

        height:
            object.height + 24

    };

    return allObjectives.some(
        other => {

            if (
                other === object
            ) {
                return false;
            }

            return collides(
                test,
                other
            );

        }
    );

}

function isObjectivePositionValid(
    object,
    allObjectives
) {

    if (
        objectiveHitsWall(
            object
        )
    ) {

        return false;

    }

    if (
        objectiveHitsDoor(
            object
        )
    ) {

        return false;

    }

    if (
        objectiveHitsAnother(
            object,
            allObjectives
        )
    ) {

        return false;

    }

    return true;

}

function findSafeObjectivePosition(
    object,
    allObjectives
) {

    const originalX =
        object.x;

    const originalY =
        object.y;

    if (
        isObjectivePositionValid(
            object,
            allObjectives
        )
    ) {

        return true;

    }

    const offsets = [

        [0, -40],
        [0, 40],
        [-40, 0],
        [40, 0],

        [-60, -60],
        [60, -60],
        [-60, 60],
        [60, 60],

        [-80, 0],
        [80, 0],
        [0, -80],
        [0, 80]

    ];

    for (
        const [dx, dy]
        of offsets
    ) {

        object.x =
            originalX + dx;

        object.y =
            originalY + dy;

        if (
            isObjectivePositionValid(
                object,
                allObjectives
            )
        ) {

            return true;

        }

    }

    object.x =
        originalX;

    object.y =
        originalY;

    return false;

}

function organizeObjectives() {

    const allObjectives = [

        ...collectibles,

        ...symbols,

        ...switches

    ];

    /*
       Importante:
       primeiro criamos uma cópia das posições
       para não considerar objetivos ainda não
       processados como obstáculos.
    */

    const placed = [];

    for (
        const original
        of allObjectives
    ) {

        const copy = {

            ...original

        };

        if (
            findSafeObjectivePosition(
                copy,
                placed
            )
        ) {

            original.x =
                copy.x;

            original.y =
                copy.y;

        }

        placed.push(
            original
        );

    }

}

/* =========================================================
   CARREGAR FASE
========================================================= */

function loadLevel(
    level
) {

    currentLevel =
        level;

    keysCollected = 0;

    symbolsActivated = 0;

    switchesActivated = 0;

    missionComplete = false;

    doorTransitionStarted = false;

    levelChanging = false;

    phaseHints = 0;

    walls = [];
    collectibles = [];
    symbols = [];
    switches = [];
    doors = [];
    decorations = [];

    clearTouchPath();

    createBorders();

    buildLevel(
        level
    );

    organizeObjectives();

    totalKeys =
        collectibles.length;

    totalSymbols =
        symbols.length;

    totalSwitches =
        switches.length;

    const info =
        levelInfo[
            level - 1
        ];

    player.x =
        info.start.x;

    player.y =
        info.start.y;

    updateInterface();

    showMessage(
        info.goal,
        4000
    );

    draw();

}

/* =========================================================
   MOVIMENTO MANUAL
========================================================= */

function tryMove(
    dx,
    dy
) {

    let newX =
        player.x + dx;

    let newY =
        player.y;

    const horizontal =
        {

            x: newX,

            y: newY,

            width:
                player.width,

            height:
                player.height

        };

    if (
        newX >= 18 &&
        newX + player.width <= W - 18 &&
        !walls.some(
            wall =>
                collides(
                    horizontal,
                    wall
                )
        )
    ) {

        player.x =
            newX;

    }

    newX =
        player.x;

    newY =
        player.y + dy;

    const vertical =
        {

            x: newX,

            y: newY,

            width:
                player.width,

            height:
                player.height

        };

    if (
        newY >= 18 &&
        newY + player.height <= H - 18 &&
        !walls.some(
            wall =>
                collides(
                    vertical,
                    wall
                )
        )
    ) {

        player.y =
            newY;

    }

}

function movePlayer() {

    let dx = 0;
    let dy = 0;

    if (
        keysPressed.arrowleft ||
        keysPressed.a
    ) {

        dx--;

    }

    if (
        keysPressed.arrowright ||
        keysPressed.d
    ) {

        dx++;

    }

    if (
        keysPressed.arrowup ||
        keysPressed.w
    ) {

        dy--;

    }

    if (
        keysPressed.arrowdown ||
        keysPressed.s
    ) {

        dy++;

    }

    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const length =
            Math.hypot(
                dx,
                dy
            );

        dx /=
            length;

        dy /=
            length;

        clearTouchPath();

        tryMove(
            dx * player.speed,
            dy * player.speed
        );

    }

}

/* =========================================================
   A*
========================================================= */

function worldToCell(
    x,
    y
) {

    return {

        col:
            Math.max(
                0,
                Math.min(
                    PATH_COLS - 1,
                    Math.floor(
                        x /
                        PATH_CELL_SIZE
                    )
                )
            ),

        row:
            Math.max(
                0,
                Math.min(
                    PATH_ROWS - 1,
                    Math.floor(
                        y /
                        PATH_CELL_SIZE
                    )
                )
            )

    };

}

function cellToWorld(
    col,
    row
) {

    return {

        x:
            col *
                PATH_CELL_SIZE +
            PATH_CELL_SIZE / 2,

        y:
            row *
                PATH_CELL_SIZE +
            PATH_CELL_SIZE / 2

    };

}

function isWalkablePosition(
    x,
    y
) {

    const test = {

        x:
            x - player.width / 2,

        y:
            y - player.height / 2,

        width:
            player.width,

        height:
            player.height

    };

    if (
        test.x < 18 ||
        test.y < 18 ||
        test.x + test.width >
            W - 18 ||
        test.y + test.height >
            H - 18
    ) {

        return false;

    }

    return !walls.some(
        wall =>
            collides(
                test,
                wall
            )
    );

}

function isCellWalkable(
    col,
    row
) {

    if (
        col < 1 ||
        row < 1 ||
        col >= PATH_COLS - 1 ||
        row >= PATH_ROWS - 1
    ) {

        return false;

    }

    const point =
        cellToWorld(
            col,
            row
        );

    return isWalkablePosition(
        point.x,
        point.y
    );

}

function findNearestWalkableCell(
    cell
) {

    for (
        let radius = 0;
        radius <= 12;
        radius++
    ) {

        for (
            let row = -radius;
            row <= radius;
            row++
        ) {

            for (
                let col = -radius;
                col <= radius;
                col++
            ) {

                if (
                    Math.abs(col) !== radius &&
                    Math.abs(row) !== radius
                ) {

                    continue;

                }

                const c =
                    cell.col + col;

                const r =
                    cell.row + row;

                if (
                    isCellWalkable(
                        c,
                        r
                    )
                ) {

                    return {
                        col: c,
                        row: r
                    };

                }

            }

        }

    }

    return null;

}

function findPathAStar(
    start,
    goal
) {

    if (
        !start ||
        !goal
    ) {

        return null;

    }

    const key =
        cell =>
            `${cell.col},${cell.row}`;

    const openSet = [
        start
    ];

    const cameFrom =
        new Map();

    const gScore =
        new Map();

    const fScore =
        new Map();

    gScore.set(
        key(start),
        0
    );

    fScore.set(
        key(start),
        Math.abs(
            start.col -
            goal.col
        ) +
        Math.abs(
            start.row -
            goal.row
        )
    );

    while (
        openSet.length > 0
    ) {

        openSet.sort(
            (a, b) =>
                (
                    fScore.get(
                        key(a)
                    ) ?? Infinity
                ) -
                (
                    fScore.get(
                        key(b)
                    ) ?? Infinity
                )
        );

        const current =
            openSet.shift();

        if (
            current.col === goal.col &&
            current.row === goal.row
        ) {

            const path = [
                current
            ];

            let currentKey =
                key(current);

            while (
                cameFrom.has(
                    currentKey
                )
            ) {

                const previous =
                    cameFrom.get(
                        currentKey
                    );

                path.push(
                    previous
                );

                currentKey =
                    key(previous);

            }

            return path.reverse();

        }

        const directions = [

            {
                col: 1,
                row: 0
            },

            {
                col: -1,
                row: 0
            },

            {
                col: 0,
                row: 1
            },

            {
                col: 0,
                row: -1
            }

        ];

        for (
            const direction
            of directions
        ) {

            const neighbor = {

                col:
                    current.col +
                    direction.col,

                row:
                    current.row +
                    direction.row

            };

            if (
                !isCellWalkable(
                    neighbor.col,
                    neighbor.row
                )
            ) {

                continue;

            }

            const neighborKey =
                key(neighbor);

            const tentativeG =
                (
                    gScore.get(
                        key(current)
                    ) ??
                    Infinity
                ) + 1;

            if (
                tentativeG <
                (
                    gScore.get(
                        neighborKey
                    ) ??
                    Infinity
                )
            ) {

                cameFrom.set(
                    neighborKey,
                    current
                );

                gScore.set(
                    neighborKey,
                    tentativeG
                );

                const heuristic =
                    Math.abs(
                        neighbor.col -
                        goal.col
                    ) +
                    Math.abs(
                        neighbor.row -
                        goal.row
                    );

                fScore.set(
                    neighborKey,
                    tentativeG +
                    heuristic
                );

                if (
                    !openSet.some(
                        cell =>
                            cell.col ===
                                neighbor.col &&
                            cell.row ===
                                neighbor.row
                    )
                ) {

                    openSet.push(
                        neighbor
                    );

                }

            }

        }

    }

    return null;

}

/* =========================================================
   CAMINHO DE TOQUE
========================================================= */

function simplifyPath(
    path
) {

    if (
        !path ||
        path.length <= 2
    ) {

        return path || [];

    }

    const result = [
        path[0]
    ];

    let previousDirection =
        null;

    for (
        let i = 1;
        i < path.length;
        i++
    ) {

        const previous =
            path[i - 1];

        const current =
            path[i];

        const direction = {

            col:
                Math.sign(
                    current.col -
                    previous.col
                ),

            row:
                Math.sign(
                    current.row -
                    previous.row
                )

        };

        if (
            previousDirection &&
            (
                direction.col !==
                    previousDirection.col ||
                direction.row !==
                    previousDirection.row
            )
        ) {

            result.push(
                previous
            );

        }

        previousDirection =
            direction;

    }

    result.push(
        path[
            path.length - 1
        ]
    );

    return result;

}

function createTouchPath(
    targetX,
    targetY
) {

    if (
        !gameStarted ||
        gamePaused
    ) {

        return;

    }

    const startX =
        player.x +
        player.width / 2;

    const startY =
        player.y +
        player.height / 2;

    const startCell =
        findNearestWalkableCell(
            worldToCell(
                startX,
                startY
            )
        );

    const targetCell =
        findNearestWalkableCell(
            worldToCell(
                targetX,
                targetY
            )
        );

    if (
        !startCell ||
        !targetCell
    ) {

        touchPath = [];

        touchPathIndex = 0;

        showMessage(
            "⚠️ Não encontrei um caminho até esse ponto.",
            2000
        );

        return;

    }

    const rawPath =
        findPathAStar(
            startCell,
            targetCell
        );

    if (
        !rawPath ||
        rawPath.length === 0
    ) {

        touchPath = [];

        touchPathIndex = 0;

        showMessage(
            "⚠️ Não encontrei um caminho até esse ponto.",
            2000
        );

        return;

    }

    const simplifiedPath =
        simplifyPath(
            rawPath
        );

    touchPath =
        simplifiedPath.map(
            cell =>
                cellToWorld(
                    cell.col,
                    cell.row
                )
        );

    touchPathIndex = 0;

    while (
        touchPathIndex <
        touchPath.length
    ) {

        const point =
            touchPath[
                touchPathIndex
            ];

        const dx =
            point.x -
            startX;

        const dy =
            point.y -
            startY;

        if (
            Math.hypot(
                dx,
                dy
            ) > 10
        ) {

            break;

        }

        touchPathIndex++;

    }

    touchStuckFrames = 0;

}

function clearTouchPath() {

    touchTarget = null;

    touchPath = [];

    touchPathIndex = 0;

    touchStuckFrames = 0;

}

function moveToTouch() {

    if (
        !touchTarget ||
        touchPath.length === 0
    ) {

        return;

    }

    if (
        touchPathIndex >=
        touchPath.length
    ) {

        clearTouchPath();

        return;

    }

    const waypoint =
        touchPath[
            touchPathIndex
        ];

    const playerCenterX =
        player.x +
        player.width / 2;

    const playerCenterY =
        player.y +
        player.height / 2;

    const dx =
        waypoint.x -
        playerCenterX;

    const dy =
        waypoint.y -
        playerCenterY;

    const distanceToWaypoint =
        Math.hypot(
            dx,
            dy
        );

    if (
        distanceToWaypoint < 7
    ) {

        touchPathIndex++;

        touchStuckFrames = 0;

        return;

    }

    const amount =
        Math.min(
            player.speed,
            distanceToWaypoint
        );

    const oldX =
        player.x;

    const oldY =
        player.y;

    tryMove(
        dx /
            distanceToWaypoint *
            amount,

        dy /
            distanceToWaypoint *
            amount
    );

    if (
        Math.abs(
            player.x - oldX
        ) < 0.01 &&
        Math.abs(
            player.y - oldY
        ) < 0.01
    ) {

        touchStuckFrames++;

    } else {

        touchStuckFrames = 0;

    }

    if (
        touchStuckFrames >= 8
    ) {

        touchStuckFrames = 0;

        createTouchPath(
            touchTarget.x,
            touchTarget.y
        );

    }

}

/* =========================================================
   LOCALIZAR OBJETIVO PRÓXIMO
========================================================= */

function getNearestObjectiveAt(
    x,
    y
) {

    const allObjectives = [

        ...collectibles.filter(
            item =>
                !item.collected
        ),

        ...symbols.filter(
            item =>
                !item.activated
        ),

        ...switches.filter(
            item =>
                !item.activated
        )

    ];

    let closest = null;

    let closestDistance = 70;

    for (
        const item
        of allObjectives
    ) {

        const point =
            getObjectiveCenter(
                item
            );

        const d =
            Math.hypot(
                x - point.x,
                y - point.y
            );

        if (
            d < closestDistance
        ) {

            closestDistance = d;

            closest = item;

        }

    }

    return closest;

}

/* =========================================================
   OBJETIVOS
========================================================= */

function checkCollectibles() {

    for (
        const item
        of collectibles
    ) {

        if (
            !item.collected &&
            collides(
                player,
                item
            )
        ) {

            item.collected = true;

            keysCollected++;

            soundKey();

            showMessage(
                `🔑 Chave encontrada! ${keysCollected}/${totalKeys}`,
                1800
            );

            updateInterface();

        }

    }

}

function checkSymbols() {

    for (
        const symbol
        of symbols
    ) {

        if (
            symbol.activated ||
            !collides(
                player,
                symbol
            )
        ) {

            continue;

        }

        const expected =
            symbolsActivated + 1;

        if (
            symbol.order === expected
        ) {

            symbol.activated = true;

            symbolsActivated++;

            soundCorrect();

            if (
                symbolsActivated ===
                totalSymbols
            ) {

                showMessage(
                    "🔷 Todos os símbolos foram ativados!",
                    2500
                );

            } else {

                showMessage(
                    `✓ Símbolo ${symbol.order} ativado.`,
                    1600
                );

            }

            updateInterface();

        } else {

            soundWrong();

            showMessage(
                `❌ Ordem incorreta. O próximo é o símbolo ${expected}.`,
                2500
            );

            loseLife();

        }

    }

}

function checkSwitches() {

    for (
        const item
        of switches
    ) {

        if (
            !item.activated &&
            collides(
                player,
                item
            )
        ) {

            item.activated = true;

            switchesActivated++;

            soundSwitch();

            showMessage(
                `⚡ Interruptor ativado! ${switchesActivated}/${totalSwitches}`,
                1800
            );

            updateInterface();

        }

    }

}

/* =========================================================
   MISSÃO
========================================================= */

function allComplete() {

    return (

        keysCollected >= totalKeys &&

        symbolsActivated >= totalSymbols &&

        switchesActivated >= totalSwitches

    );

}

function missingObjectives() {

    const missing = [];

    if (
        keysCollected <
        totalKeys
    ) {

        missing.push(
            `${totalKeys - keysCollected} chave(s)`
        );

    }

    if (
        symbolsActivated <
        totalSymbols
    ) {

        missing.push(
            `${totalSymbols - symbolsActivated} símbolo(s)`
        );

    }

    if (
        switchesActivated <
        totalSwitches
    ) {

        missing.push(
            `${totalSwitches - switchesActivated} interruptor(es)`
        );

    }

    return missing;

}

function checkMission() {

    if (
        missionComplete ||
        !allComplete()
    ) {

        return;

    }

    missionComplete = true;

    for (
        const door
        of doors
    ) {

        door.open = true;

    }

    soundUnlock();

    showMessage(
        "🔓 Todos os desafios concluídos! A saída foi desbloqueada!",
        4000
    );

    updateInterface();

}

/* =========================================================
   PORTA
========================================================= */

function nearestDoor() {

    let closest = null;

    let closestDistance =
        Infinity;

    for (
        const door
        of doors
    ) {

        const d =
            distance(
                player,
                door
            );

        if (
            d <
            closestDistance
        ) {

            closest =
                door;

            closestDistance =
                d;

        }

    }

    return closest;

}

function interactDoor() {

    if (
        !gameStarted ||
        gamePaused
    ) {

        return;

    }

    const door =
        nearestDoor();

    if (!door) {

        return;

    }

    const d =
        distance(
            player,
            door
        );

    if (
        d > 100
    ) {

        showMessage(
            "🚪 Aproxime-se da saída.",
            1800
        );

        return;

    }

    if (
        !missionComplete
    ) {

        soundLocked();

        showMessage(
            "🔒 A porta está bloqueada. Ainda falta: " +
            missingObjectives().join(
                ", "
            ) +
            ".",
            3000
        );

        return;

    }

    openDoor();

}

function checkDoorCollision() {

    for (
        const door
        of doors
    ) {

        if (
            !collides(
                player,
                door
            )
        ) {

            continue;

        }

        if (
            missionComplete
        ) {

            openDoor();

        } else {

            const now =
                Date.now();

            if (
                now >
                doorHintCooldown
            ) {

                doorHintCooldown =
                    now + 2000;

                soundLocked();

                showMessage(
                    "🔒 A saída está bloqueada. Complete os desafios.",
                    2000
                );

            }

        }

    }

}

function openDoor() {

    if (
        doorTransitionStarted ||
        levelChanging
    ) {

        return;

    }

    doorTransitionStarted =
        true;

    clearTouchPath();

    soundDoor();

    showMessage(
        "🚪 Saída aberta! Avançando...",
        1300
    );

    setTimeout(
        completeLevel,
        1300
    );

}

/* =========================================================
   VIDAS
========================================================= */

function loseLife() {

    lives--;

    soundError();

    clearTouchPath();

    if (
        lives <= 0
    ) {

        showMessage(
            "💥 Você perdeu todas as vidas. Reiniciando a fase...",
            1800
        );

        setTimeout(
            () => {

                if (
                    gameStarted
                ) {

                    lives = 3;

                    loadLevel(
                        currentLevel
                    );

                }

            },
            1800
        );

        return;

    }

    const info =
        levelInfo[
            currentLevel - 1
        ];

    player.x =
        info.start.x;

    player.y =
        info.start.y;

    updateInterface();

}

/* =========================================================
   DICAS
========================================================= */

function giveHint() {

    if (
        !gameStarted ||
        gamePaused
    ) {

        return;

    }

    const now =
        Date.now();

    if (
        now <
        hintCooldown
    ) {

        showMessage(
            "💡 A dica ainda está recarregando...",
            1200
        );

        return;

    }

    hintCooldown =
        now + 2500;

    hintsUsed++;

    phaseHints++;

    const nextObjective =
        getNextObjective();

    if (!nextObjective) {

        if (
            missionComplete
        ) {

            showMessage(
                "🚪 A saída está liberada. Vá até a porta!",
                2500
            );

        } else {

            showMessage(
                "💡 Explore o mapa. Os objetivos possuem símbolos diferentes.",
                2500
            );

        }

        return;

    }

    const point =
        getObjectiveCenter(
            nextObjective
        );

    touchTarget = {
        x: point.x,
        y: point.y
    };

    if (
        touchModeEnabled
    ) {

        createTouchPath(
            point.x,
            point.y
        );

    }

    showMessage(
        getHintText(
            nextObjective
        ),
        3000
    );

}

function getNextObjective() {

    const nextKey =
        collectibles.find(
            item =>
                !item.collected
        );

    const nextSymbol =
        symbols.find(
            item =>
                !item.activated &&
                item.order ===
                    symbolsActivated + 1
        );

    const nextSwitch =
        switches.find(
            item =>
                !item.activated
        );

    const options = [];

    if (nextKey) {

        options.push({
            item: nextKey,
            priority: 1
        });

    }

    if (nextSymbol) {

        options.push({
            item: nextSymbol,
            priority: 2
        });

    }

    if (nextSwitch) {

        options.push({
            item: nextSwitch,
            priority: 3
        });

    }

    options.sort(
        (a, b) =>
            a.priority -
            b.priority
    );

    return options.length
        ? options[0].item
        : null;

}

function getHintText(
    item
) {

    if (
        item.collected === false &&
        item.order === undefined &&
        item.activated === undefined
    ) {

        return "💡 Procure a chave destacada. Ela é necessária para liberar a missão.";

    }

    if (
        item.order !== undefined
    ) {

        return `💡 Procure o símbolo de número ${item.order}. A sequência é importante.`;

    }

    return "💡 Procure o próximo interruptor. Ele ajuda a liberar a saída.";

}

/* =========================================================
   COMPLETAR FASE
========================================================= */

function completeLevel() {

    if (
        levelChanging
    ) {

        return;

    }

    levelChanging =
        true;

    clearTouchPath();

    if (
        currentLevel < 10
    ) {

        showMessage(
            `🎉 Fase ${currentLevel} concluída!`,
            1100
        );

        setTimeout(
            () => {

                currentLevel++;

                loadLevel(
                    currentLevel
                );

            },
            1200
        );

    } else {

        gameWon = true;

        gameStarted = false;

        soundVictory();

        finalHints.textContent =
            hintsUsed;

        finalLives.textContent =
            lives;

        setTimeout(
            () => {

                gameScreen.classList.remove(
                    "active"
                );

                finishScreen.classList.add(
                    "active"
                );

            },
            900
        );

    }

}

/* =========================================================
   DESENHO - FUNDO
========================================================= */

function drawBackground() {

    const theme =
        themes[
            levelInfo[
                currentLevel - 1
            ].themeKey
        ];

    ctx.fillStyle =
        theme.floor;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    /* caminhos */

    ctx.fillStyle =
        theme.path;

    for (
        let x = 20;
        x < W - 20;
        x += 80
    ) {

        ctx.fillRect(
            x,
            18,
            36,
            H - 36
        );

    }

    /* linhas decorativas */

    ctx.globalAlpha =
        0.08;

    ctx.strokeStyle =
        "#ffffff";

    ctx.lineWidth = 1;

    for (
        let x = 0;
        x <= W;
        x += 40
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            H
        );

        ctx.stroke();

    }

    for (
        let y = 0;
        y <= H;
        y += 40
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            W,
            y
        );

        ctx.stroke();

    }

    ctx.globalAlpha = 1;

    /* pontos animados */

    ctx.globalAlpha =
        0.12;

    for (
        let i = 0;
        i < 30;
        i++
    ) {

        const x =
            (
                i * 173
                + animationTime * (
                    0.02 + i * 0.001
                )
            ) % W;

        const y =
            (
                i * 97
            ) % H;

        ctx.fillStyle =
            theme.accent;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            1.5,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    ctx.globalAlpha = 1;

}

/* =========================================================
   PAREDES
========================================================= */

function drawWalls() {

    const theme =
        themes[
            levelInfo[
                currentLevel - 1
            ].themeKey
        ];

    for (
        const wall
        of walls
    ) {

        ctx.fillStyle =
            "rgba(0,0,0,0.25)";

        ctx.fillRect(
            wall.x + 5,
            wall.y + 7,
            wall.width,
            wall.height
        );

        ctx.fillStyle =
            theme.wall;

        ctx.fillRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );

        ctx.fillStyle =
            "rgba(255,255,255,0.12)";

        ctx.fillRect(
            wall.x,
            wall.y,
            wall.width,
            4
        );

        ctx.strokeStyle =
            "rgba(255,255,255,0.18)";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );

    }

}

/* =========================================================
   DECORAÇÕES
========================================================= */

function drawDecorations() {

    for (
        const decoration
        of decorations
    ) {

        switch (
            decoration.type
        ) {

            case "tree":
                drawTree(
                    decoration.x,
                    decoration.y
                );
                break;

            case "flower":
                drawFlower(
                    decoration.x,
                    decoration.y
                );
                break;

            case "bench":
                drawBench(
                    decoration.x,
                    decoration.y
                );
                break;

            case "building":
                drawBuilding(
                    decoration.x,
                    decoration.y
                );
                break;

            case "lamp":
                drawLamp(
                    decoration.x,
                    decoration.y
                );
                break;

            case "crystal":
                drawCrystal(
                    decoration.x,
                    decoration.y
                );
                break;

            case "rainbow":
                drawRainbow(
                    decoration.x,
                    decoration.y
                );
                break;

            case "ramp":
                drawRamp(
                    decoration.x,
                    decoration.y
                );
                break;

            case "monument":
                drawMonument(
                    decoration.x,
                    decoration.y
                );
                break;

        }

    }

}

function drawTree(
    x,
    y
) {

    ctx.fillStyle =
        "#68452d";

    ctx.fillRect(
        x + 15,
        y + 25,
        14,
        40
    );

    ctx.fillStyle =
        "#2a9b63";

    ctx.beginPath();

    ctx.arc(
        x + 22,
        y + 23,
        26,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#43bf78";

    ctx.beginPath();

    ctx.arc(
        x + 12,
        y + 12,
        14,
        0,
        Math.PI * 2
    );

    ctx.fill();

}

function drawFlower(
    x,
    y
) {

    ctx.strokeStyle =
        "#65c98c";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        x + 10,
        y + 20
    );

    ctx.lineTo(
        x + 10,
        y + 35
    );

    ctx.stroke();

    ctx.fillStyle =
        "#ff83ba";

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const angle =
            i *
            Math.PI *
            2 /
            5;

        ctx.beginPath();

        ctx.arc(
            x +
                10 +
                Math.cos(angle) * 8,

            y +
                20 +
                Math.sin(angle) * 8,

            5,

            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    ctx.fillStyle =
        "#ffd85a";

    ctx.beginPath();

    ctx.arc(
        x + 10,
        y + 20,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();

}

function drawBench(
    x,
    y
) {

    ctx.fillStyle =
        "#8d633d";

    ctx.fillRect(
        x,
        y,
        70,
        10
    );

    ctx.fillRect(
        x,
        y + 22,
        70,
        10
    );

    ctx.fillRect(
        x + 8,
        y + 32,
        7,
        25
    );

    ctx.fillRect(
        x + 55,
        y + 32,
        7,
        25
    );

}

function drawBuilding(
    x,
    y
) {

    ctx.fillStyle =
        "#273d59";

    ctx.fillRect(
        x,
        y,
        90,
        105
    );

    ctx.fillStyle =
        "#3d638b";

    ctx.fillRect(
        x,
        y,
        90,
        10
    );

    for (
        let row = 0;
        row < 3;
        row++
    ) {

        for (
            let col = 0;
            col < 3;
            col++
        ) {

            ctx.fillStyle =
                "#78a8d3";

            ctx.fillRect(
                x +
                    12 +
                    col * 25,

                y +
                    22 +
                    row * 25,

                13,
                14
            );

        }

    }

}

function drawLamp(
    x,
    y
) {

    ctx.strokeStyle =
        "#8194a9";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
        x,
        y
    );

    ctx.lineTo(
        x,
        y + 70
    );

    ctx.stroke();

    ctx.fillStyle =
        "#ffe58a";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.globalAlpha =
        0.12;

    ctx.fillStyle =
        "#ffe58a";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        32,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.globalAlpha = 1;

}

function drawCrystal(
    x,
    y
) {

    const pulse =
        1 +
        Math.sin(
            animationTime * 0.004 +
            x
        ) *
        0.08;

    ctx.save();

    ctx.translate(
        x + 20,
        y + 20
    );

    ctx.scale(
        pulse,
        pulse
    );

    ctx.fillStyle =
        "#8bd8ff";

    ctx.beginPath();

    ctx.moveTo(
        0,
        -22
    );

    ctx.lineTo(
        15,
        0
    );

    ctx.lineTo(
        0,
        22
    );

    ctx.lineTo(
        -15,
        0
    );

    ctx.closePath();

    ctx.fill();

    ctx.strokeStyle =
        "#d9f5ff";

    ctx.stroke();

    ctx.restore();

}

function drawRainbow(
    x,
    y
) {

    ctx.lineWidth = 8;

    const colors = [
        "#ff6b6b",
        "#ffca5c",
        "#72d572",
        "#63a4ff",
        "#bd76ff"
    ];

    colors.forEach(
        (
            color,
            index
        ) => {

            ctx.strokeStyle =
                color;

            ctx.beginPath();

            ctx.arc(
                x + 50,
                y + 60,
                65 - index * 8,
                Math.PI,
                Math.PI * 2
            );

            ctx.stroke();

        }
    );

}

function drawRamp(
    x,
    y
) {

    ctx.fillStyle =
        "#8da9c1";

    ctx.beginPath();

    ctx.moveTo(
        x,
        y + 45
    );

    ctx.lineTo(
        x + 85,
        y + 45
    );

    ctx.lineTo(
        x + 85,
        y
    );

    ctx.closePath();

    ctx.fill();

    ctx.strokeStyle =
        "#d5e5f2";

    ctx.stroke();

    ctx.strokeStyle =
        "#52728e";

    ctx.lineWidth = 3;

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x + 12 + i * 14,
            y + 42
        );

        ctx.lineTo(
            x + 42 + i * 14,
            y + 5
        );

        ctx.stroke();

    }

}

function drawMonument(
    x,
    y
) {

    ctx.fillStyle =
        "#8073c7";

    ctx.fillRect(
        x,
        y,
        80,
        18
    );

    ctx.fillRect(
        x + 10,
        y - 35,
        60,
        35
    );

    ctx.fillStyle =
        "#a99cff";

    ctx.beginPath();

    ctx.arc(
        x + 40,
        y - 50,
        17,
        0,
        Math.PI * 2
    );

    ctx.fill();

}

/* =========================================================
   CHAVES
========================================================= */

function drawKeys() {

    const theme =
        themes[
            levelInfo[
                currentLevel - 1
            ].themeKey
        ];

    for (
        const key
        of collectibles
    ) {

        if (
            key.collected
        ) {

            continue;

        }

        const point =
            center(key);

        const pulse =
            Math.sin(
                animationTime *
                0.005
            ) *
            3;

        ctx.save();

        ctx.translate(
            point.x,
            point.y
        );

        ctx.shadowColor =
            theme.accent;

        ctx.shadowBlur =
            15;

        ctx.strokeStyle =
            "#ffe477";

        ctx.lineWidth = 5;

        ctx.beginPath();

        ctx.arc(
            -5,
            -4,
            7,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(
            1,
            1
        );

        ctx.lineTo(
            12 + pulse,
            12
        );

        ctx.lineTo(
            18,
            7
        );

        ctx.moveTo(
            10,
            10
        );

        ctx.lineTo(
            5,
            15
        );

        ctx.stroke();

        if (
            assistEnabled
        ) {

            ctx.shadowBlur = 0;

            ctx.strokeStyle =
                "#ffffff";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                22,
                0,
                Math.PI * 2
            );

            ctx.stroke();

        }

        ctx.restore();

    }

}

/* =========================================================
   SÍMBOLOS
========================================================= */

function drawSymbols() {

    for (
        const symbol
        of symbols
    ) {

        if (
            symbol.activated
        ) {

            continue;

        }

        const point =
            center(symbol);

        const size = 14;

        ctx.save();

        ctx.translate(
            point.x,
            point.y
        );

        ctx.shadowColor =
            "#ffffff";

        ctx.shadowBlur =
            10;

        ctx.fillStyle =
            symbol.shape === "circle"
                ? "#6dd8ff"
                : symbol.shape === "triangle"
                    ? "#ffbd63"
                    : "#cf8dff";

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 3;

        ctx.beginPath();

        if (
            symbol.shape === "circle"
        ) {

            ctx.arc(
                0,
                0,
                size,
                0,
                Math.PI * 2
            );

        } else if (
            symbol.shape === "triangle"
        ) {

            ctx.moveTo(
                0,
                -size
            );

            ctx.lineTo(
                size,
                size
            );

            ctx.lineTo(
                -size,
                size
            );

            ctx.closePath();

        } else {

            ctx.rect(
                -size,
                -size,
                size * 2,
                size * 2
            );

        }

        ctx.fill();

        ctx.stroke();

        /* número */

        ctx.shadowBlur = 0;

        ctx.fillStyle =
            "#101827";

        ctx.font =
            "bold 13px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            symbol.order,
            0,
            1
        );

        if (
            assistEnabled ||
            colorblindEnabled
        ) {

            ctx.strokeStyle =
                "#ffffff";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                22,
                0,
                Math.PI * 2
            );

            ctx.stroke();

        }

        ctx.restore();

    }

}

/* =========================================================
   INTERRUPTORES
========================================================= */

function drawSwitches() {

    for (
        const item
        of switches
    ) {

        const point =
            center(item);

        const pulse =
            Math.sin(
                animationTime *
                0.006
            ) *
            2;

        ctx.save();

        ctx.translate(
            point.x,
            point.y
        );

        ctx.fillStyle =
            item.activated
                ? "#39d98a"
                : "#e28a3b";

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 2;

        ctx.fillRect(
            -16,
            -12,
            32,
            24
        );

        ctx.strokeRect(
            -16,
            -12,
            32,
            24
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            6 + pulse,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#17212e";

        ctx.font =
            "bold 10px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            item.activated
                ? "✓"
                : "!",
            0,
            1
        );

        ctx.restore();

    }

}

/* =========================================================
   PORTAS
========================================================= */

function drawDoors() {

    for (
        const door
        of doors
    ) {

        const point =
            center(door);

        ctx.save();

        ctx.fillStyle =
            door.open
                ? "#2b9b6a"
                : "#315c8f";

        ctx.shadowColor =
            door.open
                ? "#48d597"
                : "#5aa5ff";

        ctx.shadowBlur =
            14;

        ctx.fillRect(
            door.x,
            door.y,
            door.width,
            door.height
        );

        ctx.shadowBlur = 0;

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            door.x,
            door.y,
            door.width,
            door.height
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 20px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            door.open
                ? "✓"
                : "🔒",
            point.x,
            point.y
        );

        if (
            assistEnabled
        ) {

            ctx.strokeStyle =
                "#ffffff";

            ctx.setLineDash([
                5,
                4
            ]);

            ctx.lineWidth = 3;

            ctx.strokeRect(
                door.x - 6,
                door.y - 6,
                door.width + 12,
                door.height + 12
            );

            ctx.setLineDash([]);

        }

        ctx.restore();

    }

}

/* =========================================================
   CAMINHO DO TOQUE
========================================================= */

function drawTouchPath() {

    if (
        touchPath.length === 0
    ) {

        return;

    }

    ctx.save();

    ctx.strokeStyle =
        "#ffffff";

    ctx.globalAlpha =
        0.6;

    ctx.lineWidth = 3;

    ctx.setLineDash([
        8,
        8
    ]);

    ctx.beginPath();

    const first =
        touchPath[
            touchPathIndex
        ];

    if (!first) {

        ctx.restore();

        return;

    }

    ctx.moveTo(
        first.x,
        first.y
    );

    for (
        let i =
            touchPathIndex + 1;
        i < touchPath.length;
        i++
    ) {

        ctx.lineTo(
            touchPath[i].x,
            touchPath[i].y
        );

    }

    ctx.stroke();

    ctx.setLineDash([]);

    for (
        let i =
            touchPathIndex;
        i < touchPath.length;
        i++
    ) {

        const point =
            touchPath[i];

        ctx.fillStyle =
            "#ffffff";

        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    ctx.restore();

}

/* =========================================================
   JOGADOR
========================================================= */

function drawPlayer() {

    const point =
        center(player);

    ctx.save();

    ctx.translate(
        point.x,
        point.y
    );

    ctx.shadowColor =
        "#64b5ff";

    ctx.shadowBlur =
        15;

    ctx.fillStyle =
        player.color;

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        15,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle =
        "#ffffff";

    ctx.lineWidth = 2;

    ctx.stroke();

    /* olhos */

    ctx.fillStyle =
        "#07101c";

    ctx.beginPath();

    ctx.arc(
        -5,
        -3,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.arc(
        5,
        -3,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.fill();

    if (
        assistEnabled
    ) {

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            22,
            0,
            Math.PI * 2
        );

        ctx.stroke();

    }

    ctx.restore();

    if (
        touchTarget
    ) {

        ctx.save();

        ctx.strokeStyle =
            "#ffffff";

        ctx.globalAlpha =
            0.55;

        ctx.lineWidth = 2;

        ctx.setLineDash([
            5,
            5
        ]);

        ctx.beginPath();

        ctx.arc(
            touchTarget.x,
            touchTarget.y,
            13 +
                Math.sin(
                    animationTime *
                    0.01
                ) *
                3,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        ctx.setLineDash([]);

        ctx.restore();

    }

}

/* =========================================================
   HUD DENTRO DO CANVAS
========================================================= */

function drawObjectiveBeacon() {

    if (
        !assistEnabled
    ) {

        return;

    }

    const target =
        getNextObjective();

    if (!target) {

        return;

    }

    const point =
        center(target);

    const pulse =
        28 +
        Math.sin(
            animationTime *
            0.006
        ) *
        5;

    ctx.save();

    ctx.strokeStyle =
        "#ffffff";

    ctx.globalAlpha =
        0.45;

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        point.x,
        point.y,
        pulse,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.globalAlpha =
        0.15;

    ctx.fillStyle =
        "#ffffff";

    ctx.beginPath();

    ctx.arc(
        point.x,
        point.y,
        pulse,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();

}

/* =========================================================
   DESENHO GERAL
========================================================= */

function draw() {

    drawBackground();

    drawDecorations();

    drawWalls();

    drawObjectiveBeacon();

    drawTouchPath();

    drawKeys();

    drawSymbols();

    drawSwitches();

    drawDoors();

    drawPlayer();

}

/* =========================================================
   INTERFACE
========================================================= */

function updateInterface() {

    const info =
        levelInfo[
            currentLevel - 1
        ];

    phaseNumber.textContent =
        `FASE ${currentLevel} / 10`;

    phaseTheme.textContent =
        info.theme;

    missionTitle.textContent =
        info.title;

    livesElement.textContent =
        "❤️".repeat(
            Math.max(
                lives,
                0
            )
        );

    keyStatus.textContent =
        `🔑 Chaves: ${keysCollected}/${totalKeys}`;

    symbolStatus.textContent =
        `🔷 Símbolos: ${symbolsActivated}/${totalSymbols}`;

    switchStatus.textContent =
        `⚡ Interruptores: ${switchesActivated}/${totalSwitches}`;

    if (
        missionComplete
    ) {

        doorStatus.textContent =
            "🟢 Saída liberada";

    } else {

        doorStatus.textContent =
            "🔒 Porta bloqueada";

    }

    const totalObjectives =
        totalKeys +
        totalSymbols +
        totalSwitches;

    const completedObjectives =
        keysCollected +
        symbolsActivated +
        switchesActivated;

    const progress =
        totalObjectives > 0
            ? (
                completedObjectives /
                totalObjectives
            ) * 100
            : 0;

    progressBar.style.width =
        `${progress}%`;

    if (
        assistEnabled
    ) {

        if (
            missionComplete
        ) {

            objective.textContent =
                "Vá até a saída. A porta está liberada!";

        } else {

            const missing =
                missingObjectives();

            objective.textContent =
                "Faltam: " +
                missing.join(
                    ", "
                );

        }

    } else {

        objective.textContent =
            info.goal;

    }

}

/* =========================================================
   LOOP
========================================================= */

function gameLoop(
    timestamp
) {

    animationTime =
        timestamp;

    if (
        gameStarted &&
        !gameWon &&
        !gamePaused
    ) {

        movePlayer();

        if (
            !(
                keysPressed.arrowleft ||
                keysPressed.arrowright ||
                keysPressed.arrowup ||
                keysPressed.arrowdown ||
                keysPressed.a ||
                keysPressed.d ||
                keysPressed.w ||
                keysPressed.s
            )
        ) {

            moveToTouch();

        }

        checkCollectibles();

        checkSymbols();

        checkSwitches();

        checkMission();

        checkDoorCollision();

        updateInterface();

        draw();

    }

    requestAnimationFrame(
        gameLoop
    );

}

/* =========================================================
   BOTÕES PRINCIPAIS
========================================================= */

function startGame() {

    initAudio();

    soundStart();

    gameStarted = true;

    gameWon = false;

    gamePaused = false;

    lives = 3;

    hintsUsed = 0;

    currentLevel = 1;

    startScreen.classList.remove(
        "active"
    );

    finishScreen.classList.remove(
        "active"
    );

    gameScreen.classList.add(
        "active"
    );

    loadLevel(
        1
    );

}

playButton.onclick =
    startGame;

restartButton.onclick =
    () => {

        lives = 3;

        loadLevel(
            currentLevel
        );

    };

restartGameButton.onclick =
    () => {

        lives = 3;

        hintsUsed = 0;

        currentLevel = 1;

        gameWon = false;

        gameStarted = true;

        finishScreen.classList.remove(
            "active"
        );

        gameScreen.classList.add(
            "active"
        );

        loadLevel(
            1
        );

    };

fullscreenStartButton.onclick =
    enterFullscreen;

fullscreenButton.onclick =
    enterFullscreen;

hintButton.onclick =
    giveHint;

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

updateAccessibilityUI();

loadLevel(
    1
);

requestAnimationFrame(
    gameLoop
);
