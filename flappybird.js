//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
let gameStarted = false;
let gameRunning = false;

// ✅ minimum horizontal distance between pipe sets
let minPipeDistance = 220;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Get UI elements
    const startScreen = document.getElementById("startScreen");
    const gameOverScreen = document.getElementById("gameOverScreen");
    const thanksMessage = document.getElementById("thanksMessage");
    const startBtn = document.getElementById("startBtn");
    const restartBtn = document.getElementById("restartBtn");
    const quitBtn = document.getElementById("quitBtn");

    // Button event listeners
    startBtn.addEventListener("click", startGame);
    restartBtn.addEventListener("click", startGame);
    quitBtn.addEventListener("click", quitGame);

    // Keyboard event listener
    document.addEventListener("keydown", handleKeyPress);

    // Start with the start screen visible
    showStartScreen();
};

function update() {
    requestAnimationFrame(update);
    
    if (!gameRunning) return;
    if (gameOver) {
        handleGameOver();
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // bird physics
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
        return;
    }

    // pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            return;
        }
    }

    // remove off-screen pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    
    // center score
    let scoreText = score.toString();
    let scoreWidth = context.measureText(scoreText).width;
    context.fillText(scoreText, (board.width - scoreWidth) / 2, 50);
}

function placePipes() {
    if (gameOver) return;

    // ✅ enforce minimum horizontal distance
    if (pipeArray.length > 0) {
        let lastPipe = pipeArray[pipeArray.length - 1];
        if (pipeX - lastPipe.x < minPipeDistance) {
            return;
        }
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function handleKeyPress(e) {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        if (!gameStarted) {
            startGame();
        } else if (gameRunning && !gameOver) {
            velocityY = -6;
        }
    }
}

function moveBird(e) {
    if (gameRunning && !gameOver && (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX")) {
        velocityY = -6;
    }
}

function startGame() {
    // Reset game state
    gameStarted = true;
    gameRunning = true;
    gameOver = false;
    score = 0;
    bird.y = birdY;
    velocityY = 0;
    pipeArray = [];

    // Hide all screens
    hideAllScreens();

    // Start game loops
    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
}

function handleGameOver() {
    gameRunning = false;
    const gameOverScreen = document.getElementById("gameOverScreen");
    const finalScore = document.getElementById("finalScore");
    finalScore.textContent = `Final Score: ${Math.floor(score)}`;
    gameOverScreen.classList.remove("hidden");
}

function quitGame() {
    console.log("Quit game called");
    hideAllScreens();
    const thanksMessage = document.getElementById("thanksMessage");
    thanksMessage.classList.remove("hidden");
    
    // Stop the game
    gameRunning = false;
    gameStarted = false;
    
    // Clear the canvas
    context.clearRect(0, 0, board.width, board.height);
    
    // Redirect to main menu after 3 seconds
    console.log("Setting 3-second timeout to return to main menu");
    setTimeout(() => {
        console.log("Timeout triggered - showing start screen");
        showStartScreen();
    }, 3000);
}

function showStartScreen() {
    console.log("showStartScreen called");
    // Hide only game over and thanks screens, not the start screen
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("thanksMessage").classList.add("hidden");
    
    const startScreen = document.getElementById("startScreen");
    startScreen.classList.remove("hidden");
    console.log("Start screen should now be visible");
}

function hideAllScreens() {
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("thanksMessage").classList.add("hidden");
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
