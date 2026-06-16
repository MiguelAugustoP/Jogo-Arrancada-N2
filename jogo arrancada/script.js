// =========================
// ELEMENTOS
// =========================

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const distanceSelect = document.getElementById("distanceSelect");

const menu = document.getElementById("menu");
const camera = document.getElementById("camera");
const track = document.getElementById("track");

const car1 = document.getElementById("car1");
const car2 = document.getElementById("car2");

const finishLine = document.getElementById("finishLine");

const countdownOverlay = document.getElementById("countdownOverlay");
const countdownText = document.getElementById("countdownText");

const lights = document.querySelectorAll(".light");

const raceState = document.getElementById("raceState");

const timerEl = document.getElementById("timer");

const speed1El = document.getElementById("speed1");
const speed2El = document.getElementById("speed2");

const remaining1El = document.getElementById("remaining1");
const remaining2El = document.getElementById("remaining2");

const penalty1El = document.getElementById("penalty1");
const penalty2El = document.getElementById("penalty2");

const totalDistanceEl = document.getElementById("totalDistance");

const falseStartMessage = document.getElementById("falseStartMessage");

const btnP1 = document.getElementById("btnP1");
const btnP2 = document.getElementById("btnP2");

const resultScreen = document.getElementById("resultScreen");

const winnerText = document.getElementById("winnerText");
const finalTime = document.getElementById("finalTime");

const maxSpeed1El = document.getElementById("maxSpeed1");
const maxSpeed2El = document.getElementById("maxSpeed2");

const finalPenalty1 = document.getElementById("finalPenalty1");
const finalPenalty2 = document.getElementById("finalPenalty2");

// =========================
// ESTADO DO JOGO
// =========================

let raceDistance = 400;

let raceStarted = false;
let raceFinished = false;
let countdownRunning = false;

let timer = 0;
let animationId;

let p1 = createPlayer();
let p2 = createPlayer();

function createPlayer() {
    return {
        position: 0,
        speed: 0,
        maxSpeed: 0,
        penalty: 0
    };
}

// =========================
// INICIAR
// =========================

startBtn.addEventListener("click", () => {

    raceDistance = Number(distanceSelect.value);

    totalDistanceEl.textContent = raceDistance;

    menu.style.display = "none";

    startCountdown();
});

// =========================
// CONTAGEM REGRESSIVA
// =========================

async function startCountdown() {

    countdownRunning = true;
    raceStarted = false;

    countdownOverlay.style.display = "flex";

    lights.forEach(light => light.classList.remove("active"));

    raceState.textContent = "Preparar";

    countdownText.textContent = "Preparar";

    lights[0].classList.add("active");

    await wait(1000);

    countdownText.textContent = "Atenção";

    lights[1].classList.add("active");

    await wait(1000);

    countdownText.textContent = "Já";

    lights[2].classList.add("active");

    await wait(600);

    countdownOverlay.style.display = "none";

    raceState.textContent = "Corrida";

    raceStarted = true;
    countdownRunning = false;

    timer = 0;

    gameLoop();
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =========================
// ACELERAÇÃO
// =========================

function accelerate(player) {

    if (!raceStarted) return;

    player.speed += 0.9;

    if (player.speed > 30) {
        player.speed = 30;
    }
}

// =========================
// LARGADA FALSA
// =========================

function falseStart(player) {

    if (!countdownRunning) return;

    player.penalty += 1;

    updatePenaltyUI();

    falseStartMessage.style.display = "block";

    setTimeout(() => {
        falseStartMessage.style.display = "none";
    }, 1200);
}

// =========================
// TECLADO
// =========================

document.addEventListener("keydown", e => {

    if (e.repeat) return;

    if (e.key.toLowerCase() === "a") {

        if (countdownRunning) {
            falseStart(p1);
        } else {
            accelerate(p1);
        }
    }

    if (e.key.toLowerCase() === "l") {

        if (countdownRunning) {
            falseStart(p2);
        } else {
            accelerate(p2);
        }
    }
});

// =========================
// TOUCH
// =========================

btnP1.addEventListener("touchstart", e => {
    e.preventDefault();

    if (countdownRunning) {
        falseStart(p1);
    } else {
        accelerate(p1);
    }
});

btnP2.addEventListener("touchstart", e => {
    e.preventDefault();

    if (countdownRunning) {
        falseStart(p2);
    } else {
        accelerate(p2);
    }
});

// Clique para desktop

btnP1.addEventListener("click", () => {

    if (countdownRunning) {
        falseStart(p1);
    } else {
        accelerate(p1);
    }
});

btnP2.addEventListener("click", () => {

    if (countdownRunning) {
        falseStart(p2);
    } else {
        accelerate(p2);
    }
});

// =========================
// LOOP PRINCIPAL
// =========================

function gameLoop() {

    if (raceFinished) return;

    timer += 1 / 60;

    timerEl.textContent = timer.toFixed(2);

    updatePlayer(p1);
    updatePlayer(p2);

    updateCars();

    updateHUD();

    updateCamera();

    showFinishLineWhenClose();

    checkWinner();

    animationId = requestAnimationFrame(gameLoop);
}

// =========================
// FÍSICA
// =========================

function updatePlayer(player) {

    player.speed *= 0.985;

    if (player.speed < 0.02) {
        player.speed = 0;
    }

    player.position += player.speed;

    if (player.speed > player.maxSpeed) {
        player.maxSpeed = player.speed;
    }
}

// =========================
// CARROS
// =========================

function updateCars() {

    car1.style.transform =
        `translateX(${p1.position}px)`;

    car2.style.transform =
        `translateX(${p2.position}px)`;
}

// =========================
// HUD
// =========================

function updateHUD() {

    speed1El.textContent =
        Math.round(p1.speed * 10);

    speed2El.textContent =
        Math.round(p2.speed * 10);

    remaining1El.textContent =
        Math.max(
            0,
            Math.round(raceDistance - p1.position / 10)
        );

    remaining2El.textContent =
        Math.max(
            0,
            Math.round(raceDistance - p2.position / 10)
        );
}

function updatePenaltyUI() {

    penalty1El.textContent = p1.penalty;
    penalty2El.textContent = p2.penalty;
}

// =========================
// CÂMERA
// =========================

function updateCamera() {

    const leader =
        Math.max(
            p1.position,
            p2.position
        );

    let cameraX =
        leader - window.innerWidth / 3;

    if (cameraX < 0) {
        cameraX = 0;
    }

    track.style.transform =
        `translateX(-${cameraX}px)`;
}

// =========================
// CHEGADA APARECE APENAS
// QUANDO ESTIVER PRÓXIMA
// =========================

function showFinishLineWhenClose() {

    const leader =
        Math.max(
            p1.position,
            p2.position
        );

    const finishPosition =
        raceDistance * 10;

    finishLine.style.left =
        finishPosition + "px";

    const distanceLeft =
        raceDistance - leader / 10;

    if (distanceLeft <= 50) {

        finishLine.style.opacity = "1";

        raceState.textContent =
            "Aproximação da chegada";
    }
}

// =========================
// VENCEDOR
// =========================

function checkWinner() {

    const finish =
        raceDistance * 10;

    if (
        p1.position >= finish ||
        p2.position >= finish
    ) {

        raceFinished = true;

        cancelAnimationFrame(animationId);

        let winner;

        if (p1.position > p2.position) {
            winner = "Player 1";
        } else {
            winner = "Player 2";
        }

        showResult(winner);
    }
}

// =========================
// RESULTADO
// =========================

function showResult(winner) {

    raceState.textContent = "Finalizada";

    const finalRaceTime =
        timer;

    winnerText.textContent =
        `Vencedor: ${winner}`;

    finalTime.textContent =
        `${finalRaceTime.toFixed(2)}s`;

    maxSpeed1El.textContent =
        Math.round(p1.maxSpeed * 10) + " km/h";

    maxSpeed2El.textContent =
        Math.round(p2.maxSpeed * 10) + " km/h";

    finalPenalty1.textContent =
        p1.penalty + "s";

    finalPenalty2.textContent =
        p2.penalty + "s";

    resultScreen.style.display = "flex";
}

// =========================
// REINICIAR
// =========================

restartBtn.addEventListener("click", resetRace);

function resetRace() {

    raceFinished = false;
    raceStarted = false;
    countdownRunning = false;

    timer = 0;

    p1 = createPlayer();
    p2 = createPlayer();

    updatePenaltyUI();

    car1.style.transform =
        "translateX(0px)";

    car2.style.transform =
        "translateX(0px)";

    track.style.transform =
        "translateX(0px)";

    finishLine.style.opacity = "0";

    timerEl.textContent = "0.00";

    speed1El.textContent = "0";
    speed2El.textContent = "0";

    remaining1El.textContent =
        raceDistance;

    remaining2El.textContent =
        raceDistance;

    resultScreen.style.display = "none";

    startCountdown();
}