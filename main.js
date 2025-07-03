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
    if ((e.code === 'Space' || e.key === ' ') && !dino.isJumping) {
        dino.vy = dino.jumpPower;
        dino.isJumping = true;
    }
    if (e.code === 'ArrowDown' || e.key === 'ArrowDown') {
        crouch = true;
    }
});
window.addEventListener('keyup', function(e) {
    if (e.code === 'ArrowDown' || e.key === 'ArrowDown') {
        crouch = false;
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

let dinoFrame = 0;
let dinoLegUp = true;
let crouch = false;

function drawDino() {
    let y = dino.y;
    let height = dino.height;
    // Khi cúi thì thấp hơn
    if (crouch && !dino.isJumping) {
        height = 28;
        y = dino.y + 16;
    }
    if (characterType === 'dino') {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(dino.x, y, dino.width, height);
        // Đầu khủng long
        ctx.fillStyle = '#388E3C';
        ctx.fillRect(dino.x + 28, y + 8, 16, 16);
        // Chân động
        ctx.fillStyle = '#2e7d32';
        if (!dino.isJumping && !crouch) {
            if (dinoLegUp) {
                ctx.fillRect(dino.x + 6, y + height, 8, 12);
                ctx.fillRect(dino.x + 30, y + height, 8, 6);
            } else {
                ctx.fillRect(dino.x + 6, y + height, 8, 6);
                ctx.fillRect(dino.x + 30, y + height, 8, 12);
            }
        } else if (dino.isJumping) {
            ctx.fillRect(dino.x + 10, y + height, 8, 6);
            ctx.fillRect(dino.x + 28, y + height, 8, 6);
        }
    } else if (characterType === 'cat') {
        ctx.fillStyle = '#FFD600';
        ctx.fillRect(dino.x, y, dino.width, height);
        ctx.fillStyle = '#FFA000';
        ctx.beginPath();
        ctx.moveTo(dino.x + 8, y);
        ctx.lineTo(dino.x + 16, y - 12);
        ctx.lineTo(dino.x + 24, y);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(dino.x + 32, y);
        ctx.lineTo(dino.x + 36, y - 10);
        ctx.lineTo(dino.x + 40, y);
        ctx.closePath();
        ctx.fill();
        // Chân động
        ctx.fillStyle = '#FFA000';
        if (!dino.isJumping && !crouch) {
            if (dinoLegUp) {
                ctx.fillRect(dino.x + 8, y + height, 6, 10);
                ctx.fillRect(dino.x + 28, y + height, 6, 5);
            } else {
                ctx.fillRect(dino.x + 8, y + height, 6, 5);
                ctx.fillRect(dino.x + 28, y + height, 6, 10);
            }
        } else if (dino.isJumping) {
            ctx.fillRect(dino.x + 12, y + height, 6, 5);
            ctx.fillRect(dino.x + 26, y + height, 6, 5);
        }
    } else if (characterType === 'robot') {
        ctx.fillStyle = '#90A4AE';
        ctx.fillRect(dino.x, y, dino.width, height);
        ctx.fillStyle = '#607D8B';
        ctx.fillRect(dino.x + 10, y - 18, 24, 18);
        ctx.fillStyle = '#fff';
        ctx.fillRect(dino.x + 16, y - 10, 4, 4);
        ctx.fillRect(dino.x + 28, y - 10, 4, 4);
        // Chân động
        ctx.fillStyle = '#263238';
        if (!dino.isJumping && !crouch) {
            if (dinoLegUp) {
                ctx.fillRect(dino.x + 8, y + height, 6, 10);
                ctx.fillRect(dino.x + 28, y + height, 6, 5);
            } else {
                ctx.fillRect(dino.x + 8, y + height, 6, 5);
                ctx.fillRect(dino.x + 28, y + height, 6, 10);
            }
        } else if (dino.isJumping) {
            ctx.fillRect(dino.x + 12, y + height, 6, 5);
            ctx.fillRect(dino.x + 26, y + height, 6, 5);
        }
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
    // Hoạt ảnh chạy
    if (!dino.isJumping && !crouch && !isGameOver) {
        if (dinoFrame % 8 === 0) dinoLegUp = !dinoLegUp;
        dinoFrame++;
    }
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