// Khởi tạo canvas và context
const gameContainer = document.getElementById('game-container');
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 300;
gameContainer.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Hàm game loop cơ bản
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Sẽ vẽ game ở đây
    requestAnimationFrame(gameLoop);
}

gameLoop(); 