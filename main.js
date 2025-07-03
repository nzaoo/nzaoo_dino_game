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

function drawDino() {
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

// Hàm game loop cơ bản
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDino();
    // Sẽ vẽ game ở đây
    requestAnimationFrame(gameLoop);
}

gameLoop(); 