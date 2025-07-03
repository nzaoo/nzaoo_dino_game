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
let isNight = false;
let stars = Array.from({length: 30}, () => ({
    x: Math.random() * 800,
    y: Math.random() * 120,
    r: Math.random() * 1.5 + 0.5
}));

// Background layers
const skyColor = '#B3E5FC';
const hills = [
    { x: 0, y: 200, width: 300, height: 80, speed: 1.5 },
    { x: 400, y: 220, width: 250, height: 60, speed: 1.2 }
];
const clouds = [
    { x: 100, y: 60, width: 60, height: 30, speed: 2 },
    { x: 350, y: 40, width: 80, height: 40, speed: 1.5 },
    { x: 700, y: 80, width: 50, height: 25, speed: 1.8 }
];

let characterType = 'dino';
const characterSelect = document.getElementById('character');
if (characterSelect) {
    characterSelect.addEventListener('change', function(e) {
        characterType = e.target.value;
    });
}

function toggleTheme() {
    isNight = !isNight;
}

window.addEventListener('keydown', function(e) {
    if (e.code === 'KeyT' || e.key === 't') {
        toggleTheme();
    }
});

function drawBackground() {
    // Sky
    ctx.fillStyle = isNight ? '#22223b' : skyColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Stars (night only)
    if (isNight) {
        ctx.fillStyle = '#fff';
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
    // Hills
    hills.forEach(hill => {
        ctx.fillStyle = isNight ? '#495057' : '#81C784';
        ctx.beginPath();
        ctx.ellipse(hill.x + hill.width/2, hill.y + hill.height, hill.width/2, hill.height, 0, Math.PI, 0, true);
        ctx.fill();
    });
    // Clouds (day only)
    if (!isNight) {
        clouds.forEach(cloud => {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.width, cloud.height, 0, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
}

function updateBackground() {
    hills.forEach(hill => {
        hill.x -= hill.speed;
        if (hill.x + hill.width < 0) hill.x = canvas.width;
    });
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) cloud.x = canvas.width + Math.random() * 100;
    });
}

function drawDino() {
    if (characterType === 'dino') {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
        // Đầu khủng long
        ctx.fillStyle = '#388E3C';
        ctx.fillRect(dino.x + 28, dino.y + 8, 16, 16);
    } else if (characterType === 'cat') {
        // Thân mèo
        ctx.fillStyle = '#FFD600';
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
        // Tai mèo
        ctx.fillStyle = '#FFA000';
        ctx.beginPath();
        ctx.moveTo(dino.x + 8, dino.y);
        ctx.lineTo(dino.x + 16, dino.y - 12);
        ctx.lineTo(dino.x + 24, dino.y);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(dino.x + 32, dino.y);
        ctx.lineTo(dino.x + 36, dino.y - 10);
        ctx.lineTo(dino.x + 40, dino.y);
        ctx.closePath();
        ctx.fill();
    } else if (characterType === 'robot') {
        // Thân robot
        ctx.fillStyle = '#90A4AE';
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
        // Đầu robot
        ctx.fillStyle = '#607D8B';
        ctx.fillRect(dino.x + 10, dino.y - 18, 24, 18);
        // Mắt robot
        ctx.fillStyle = '#fff';
        ctx.fillRect(dino.x + 16, dino.y - 10, 4, 4);
        ctx.fillRect(dino.x + 28, dino.y - 10, 4, 4);
    }
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
    drawBackground();
    updateBackground();
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