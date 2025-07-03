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

// Mobile controls
const btnJump = document.getElementById('btn-jump');
const btnCrouch = document.getElementById('btn-crouch');
const btnTheme = document.getElementById('btn-theme');
if (btnJump) {
    btnJump.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (!dino.isJumping && !isGameOver) {
            dino.vy = dino.jumpPower;
            dino.isJumping = true;
        }
    });
}
if (btnCrouch) {
    btnCrouch.addEventListener('touchstart', function(e) {
        e.preventDefault();
        crouch = true;
    });
    btnCrouch.addEventListener('touchend', function(e) {
        e.preventDefault();
        crouch = false;
    });
}
if (btnTheme) {
    btnTheme.addEventListener('touchstart', function(e) {
        e.preventDefault();
        toggleTheme();
    });
}

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
let combo = 0;
let maxCombo = 0;
let lastJumpedObstacle = null;
let highScore = Number(localStorage.getItem('highScore') || 0);
let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');

function drawCombo() {
    if (combo > 1) {
        ctx.font = '22px Arial';
        ctx.fillStyle = '#FF4081';
        ctx.fillText('Combo x' + combo, 350, 40);
    }
    if (maxCombo > 1) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#FF4081';
        ctx.fillText('Max Combo: ' + maxCombo, 350, 65);
    }
}

function checkCombo() {
    // Nếu Dino vừa nhảy qua chướng ngại vật mà không va chạm
    for (let ob of obstacles) {
        if (
            ob.x + ob.width < dino.x &&
            ob !== lastJumpedObstacle &&
            dino.isJumping &&
            ob.x + ob.width > dino.x - 20 // chỉ tính khi vừa nhảy qua
        ) {
            combo++;
            if (combo > maxCombo) maxCombo = combo;
            lastJumpedObstacle = ob;
            return;
        }
    }
    // Nếu chạm đất mà không nhảy qua mới thì reset combo
    if (!dino.isJumping && lastJumpedObstacle) {
        lastJumpedObstacle = null;
        if (combo > 1) {
            // thưởng điểm combo
            score += combo * 10;
        }
        combo = 0;
    }
}

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

const OBSTACLE_TYPES = ['cactus', 'bird', 'rock', 'trap'];
function randomObstacleType() {
    return OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
}

function createObstacle() {
    const type = randomObstacleType();
    let y = 240, width = 20, height = 40, speed = 8;
    if (type === 'bird') {
        y = Math.random() > 0.5 ? 180 : 120;
        width = 40; height = 24;
        speed = 10;
    } else if (type === 'rock') {
        width = 32; height = 32;
        y = 248;
        speed = 7;
    } else if (type === 'trap') {
        width = 36; height = 18;
        y = 262;
        speed = 8.5;
    }
    return { x: 800, y, width, height, speed, type };
}

let obstacles = [createObstacle()];

function drawObstacle(ob) {
    if (ob.type === 'cactus') {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
        ctx.fillStyle = '#388E3C';
        ctx.fillRect(ob.x + 4, ob.y - 16, 12, 16);
    } else if (ob.type === 'bird') {
        ctx.fillStyle = '#424242';
        ctx.beginPath();
        ctx.ellipse(ob.x + ob.width/2, ob.y + ob.height/2, ob.width/2, ob.height/2, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(ob.x + ob.width - 8, ob.y + ob.height/2 - 2, 6, 4);
    } else if (ob.type === 'rock') {
        ctx.fillStyle = '#757575';
        ctx.beginPath();
        ctx.arc(ob.x + ob.width/2, ob.y + ob.height/2, ob.width/2, 0, 2 * Math.PI);
        ctx.fill();
    } else if (ob.type === 'trap') {
        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
        ctx.strokeStyle = '#fff';
        for (let i = 0; i < ob.width; i += 6) {
            ctx.beginPath();
            ctx.moveTo(ob.x + i, ob.y);
            ctx.lineTo(ob.x + i + 3, ob.y - 8);
            ctx.stroke();
        }
    }
}

const ITEM_TYPES = ['star', 'cake', 'shield'];
function randomItemType() {
    return ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
}
function createItem() {
    const type = randomItemType();
    let y = 180 + Math.random() * 60;
    let x = 800 + Math.random() * 400;
    return { x, y, width: 28, height: 28, speed: 7, type, collected: false };
}
let items = [];
let itemScore = 0;

function drawItem(item) {
    if (item.type === 'star') {
        ctx.save();
        ctx.translate(item.x + 14, item.y + 14);
        ctx.rotate(Math.PI / 10 * (score % 20));
        ctx.fillStyle = '#FFD600';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(4, -4);
            ctx.lineTo(12, -4);
            ctx.lineTo(6, 2);
            ctx.lineTo(8, 10);
            ctx.lineTo(0, 6);
            ctx.lineTo(-8, 10);
            ctx.lineTo(-6, 2);
            ctx.lineTo(-12, -4);
            ctx.lineTo(-4, -4);
            ctx.closePath();
            ctx.fill();
            ctx.rotate(Math.PI * 2 / 5);
        }
        ctx.restore();
    } else if (item.type === 'cake') {
        ctx.fillStyle = '#FF7043';
        ctx.fillRect(item.x, item.y + 10, 28, 12);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(item.x, item.y + 6, 28, 6);
        ctx.fillStyle = '#FFD600';
        ctx.beginPath();
        ctx.arc(item.x + 14, item.y + 6, 4, 0, 2 * Math.PI);
        ctx.fill();
    } else if (item.type === 'shield') {
        ctx.strokeStyle = '#1976D2';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(item.x + 14, item.y + 14, 12, Math.PI, 2 * Math.PI);
        ctx.lineTo(item.x + 14, item.y + 26);
        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = 1;
    }
}

function updateItems() {
    for (let item of items) {
        item.x -= item.speed;
    }
    // Xóa item đã ra khỏi màn hình hoặc đã thu thập
    items = items.filter(item => item.x + item.width > 0 && !item.collected);
    // Thêm item mới ngẫu nhiên
    if (items.length === 0 || (items[items.length-1].x < 400 && Math.random() < 0.02)) {
        items.push(createItem());
    }
}

function checkItemCollision(item) {
    return (
        dino.x < item.x + item.width &&
        dino.x + dino.width > item.x &&
        dino.y < item.y + item.height &&
        dino.y + dino.height > item.y
    );
}

function drawScore() {
    ctx.font = '24px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Score: ' + score, 20, 40);
}

function drawHighScore() {
    ctx.font = '18px Arial';
    ctx.fillStyle = '#009688';
    ctx.fillText('High Score: ' + highScore, 20, 70);
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

function updateObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= obstacles[i].speed;
    }
    // Xóa chướng ngại vật đã ra khỏi màn hình và thêm mới
    if (obstacles.length === 0 || obstacles[obstacles.length-1].x < 400) {
        obstacles.push(createObstacle());
    }
    if (obstacles[0].x + obstacles[0].width < 0) {
        obstacles.shift();
    }
}

function checkCollision() {
    for (let ob of obstacles) {
        if (
            dino.x < ob.x + ob.width &&
            dino.x + dino.width > ob.x &&
            dino.y < ob.y + ob.height &&
            dino.y + dino.height > ob.y
        ) {
            return true;
        }
    }
    return false;
}

function updateLeaderboard(newScore) {
    leaderboard.push(newScore);
    leaderboard = leaderboard.sort((a, b) => b - a).slice(0, 5);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function drawLeaderboard() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Top 5:', 680, 70);
    leaderboard.forEach((score, i) => {
        ctx.fillText((i + 1) + '. ' + score, 680, 90 + i * 20);
    });
}

function resetGame() {
    obstacles = [createObstacle()];
    items = [];
    itemScore = 0;
    combo = 0;
    maxCombo = 0;
    lastJumpedObstacle = null;
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
    updateObstacles();
    updateItems();
    checkCombo();
    // Hoạt ảnh chạy
    if (!dino.isJumping && !crouch && !isGameOver) {
        if (dinoFrame % 8 === 0) dinoLegUp = !dinoLegUp;
        dinoFrame++;
    }
    drawDino();
    for (let ob of obstacles) drawObstacle(ob);
    for (let item of items) {
        if (!item.collected) drawItem(item);
        if (!item.collected && checkItemCollision(item)) {
            item.collected = true;
            itemScore += 10;
        }
    }
    drawScore();
    drawCombo();
    drawHighScore();
    drawLeaderboard();
    ctx.font = '18px Arial';
    ctx.fillStyle = '#1976D2';
    ctx.fillText('Item: ' + itemScore, 680, 40);
    if (checkCollision()) {
        ctx.font = '40px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText('Game Over', 300, 150);
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        updateLeaderboard(score);
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