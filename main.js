// Khởi tạo canvas và context
const gameContainer = document.getElementById('game-container');
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 300;
gameContainer.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Dino object
const dino = {
    x: 50,
    y: 220,
    width: 44,
    height: 44,
    vy: 0,
    gravity: 1.2,
    jumpPower: -18,
    isJumping: false
};

// Obstacle object
const obstacle = {
    x: 800,
    y: 240,
    width: 20,
    height: 40,
    speed: 8
};

let score = 0;
let isGameOver = false;

function drawDino() {
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

function drawObstacle() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

function drawScore() {
    ctx.font = '24px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Score: ' + score, 20, 40);
}

// Xử lý nhảy
window.addEventListener('keydown', function(e) {
    if ((e.code === 'Space' || e.key === ' ') && !dino.isJumping) {
        dino.vy = dino.jumpPower;
        dino.isJumping = true;
    }
});

function updateDino() {
    dino.y += dino.vy;
    dino.vy += dino.gravity;
    // Chạm đất
    if (dino.y >= 220) {
        dino.y = 220;
        dino.vy = 0;
        dino.isJumping = false;
    }
}

function updateObstacle() {
    obstacle.x -= obstacle.speed;
    if (obstacle.x + obstacle.width < 0) {
        obstacle.x = 800 + Math.random() * 200;
    }
}

function checkCollision() {
    return (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
    );
}

function resetGame() {
    obstacle.x = 800;
    score = 0;
    isGameOver = false;
    dino.y = 220;
    dino.vy = 0;
    dino.isJumping = false;
    gameLoop();
}

// Hàm game loop cơ bản
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateDino();
    updateObstacle();
    drawDino();
    drawObstacle();
    drawScore();
    if (checkCollision()) {
        ctx.font = '40px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText('Game Over', 300, 150);
        isGameOver = true;
        return;
    }
    score++;
    requestAnimationFrame(gameLoop);
}

// Restart game khi nhấn phím R
window.addEventListener('keydown', function(e) {
    if (isGameOver && (e.code === 'KeyR' || e.key === 'r')) {
        resetGame();
    }
});

gameLoop(); 