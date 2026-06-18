// ELEMENTOS

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");
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
const btnP1 = document.getElementById("btnP1");
const btnP2 = document.getElementById("btnP2");
const resultScreen = document.getElementById("resultScreen");
const winnerText = document.getElementById("winnerText");
const finalTime = document.getElementById("finalTime");
const maxSpeed1El = document.getElementById("maxSpeed1");
const maxSpeed2El = document.getElementById("maxSpeed2");

// ESTADO DO JOGO

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
        maxSpeed: 0
    };
}

// INICIAR

startBtn.addEventListener("click", () => {
    raceDistance = Number(distanceSelect.value);
    menu.style.display = "none";
    startCountdown();
});

// CONTAGEM REGRESSIVA

async function startCountdown() {
    countdownRunning = true;
    raceStarted = false;
    countdownOverlay.style.display = "flex";
    lights.forEach(light => light.classList.remove("active"));
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
    raceStarted = true;
    countdownRunning = false;
    timer = 0;
    gameLoop();
}
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ACELERAÇÃO

function accelerate(player) {
    if (!raceStarted) return;
    player.speed += 0.9;
    if (player.speed > 80) {
        player.speed = 80;
    }
}

// TECLADO

document.addEventListener("keydown", e => {
    if (e.repeat) return;
    if (e.key.toLowerCase() === "a") {
        accelerate(p1);
    }
    if (e.key.toLowerCase() === "l") {
        accelerate(p2);
    }
});

// TOUCH

btnP1.addEventListener("touchstart", e => {
    e.preventDefault();
    accelerate(p1);
});

btnP2.addEventListener("touchstart", e => {
    e.preventDefault();
    accelerate(p2);
});

// CLIQUE

btnP1.addEventListener("click", () => {
    accelerate(p1);
});

btnP2.addEventListener("click", () => {
    accelerate(p2);
});

// LOOP PRINCIPAL

function gameLoop() {
    if (raceFinished) return;
    timer += 1 / 60;
    updatePlayer(p1);
    updatePlayer(p2);
    updateCars();
    updateCamera();
    showFinishLineWhenClose();
    checkWinner();

    animationId = requestAnimationFrame(gameLoop);
}

// FÍSICA

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

// CARROS

function updateCars() {
    car1.style.transform =
        `translateX(${p1.position}px)`;

    car2.style.transform =
        `translateX(${p2.position}px)`;
}

// CÂMERA

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

// CHEGADA APARECE APENAS QUANDO ESTIVER PRÓXIMA

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
    }
}

// VENCEDOR

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

// RESULTADO

function showResult(winner) {
    const finalRaceTime = timer;
    winnerText.textContent =
        `Vencedor: ${winner}`;
    finalTime.textContent =
        `${finalRaceTime.toFixed(2)}s`;
    maxSpeed1El.textContent =
        Math.round(p1.maxSpeed * 10) + " km/h";
    maxSpeed2El.textContent =
        Math.round(p2.maxSpeed * 10) + " km/h";

    resultScreen.style.display = "flex";
}

// REINICIAR

restartBtn.addEventListener("click", resetRace);

function resetRace() {
    raceFinished = false;
    raceStarted = false;
    countdownRunning = false;
    timer = 0;
    p1 = createPlayer();
    p2 = createPlayer();

    car1.style.transform =
        "translateX(0px)";

    car2.style.transform =
        "translateX(0px)";

    track.style.transform =
        "translateX(0px)";

    finishLine.style.opacity = "0";
    resultScreen.style.display = "none";
    startCountdown();
}

menuBtn.addEventListener("click", returnToMenu);

function returnToMenu() {
    raceFinished = false;
    raceStarted = false;
    countdownRunning = false;
    cancelAnimationFrame(animationId);
    timer = 0;
    p1 = createPlayer();
    p2 = createPlayer();
    car1.style.transform = "translateX(0px)";
    car2.style.transform = "translateX(0px)";
    track.style.transform = "translateX(0px)";
    finishLine.style.opacity = "0";
    resultScreen.style.display = "none";
    menu.style.display = "flex";
}
