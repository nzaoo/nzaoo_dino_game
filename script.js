import { updateGround, setupGround } from "./ground.js"
import { updateDino, setupDino, getDinoRect, setDinoLose } from "./dino.js"
import { updateCactus, setupCactus, getCactusRects } from "./cactus.js"
import { updatePowerup, setupPowerup, getIsInvincible, activateInvincibility } from "./powerup.js"
import { updateBoss, setupBoss, getBossRect, isBossActive, getBossProjectiles } from "./boss.js"

const WORLD_WIDTH = 100 // Chiều rộng thế giới game (đơn vị ảo)
const WORLD_HEIGHT = 30 // Chiều cao thế giới game (đơn vị ảo)
const SPEED_SCALE_INCREASE = 0.000002 // Tốc độ tăng dần của game

// DOM Elements
const worldElem = document.querySelector("[data-world]")
const scoreElem = document.querySelector("[data-score]")
const startScreenElem = document.querySelector("[data-start-screen]")
const highScoreElem = document.querySelector("[data-high-score]")
const comboElem = document.querySelector('[data-combo]') // Hiển thị combo trên UI

// Menu Elements
const mainMenuElem = document.querySelector("[data-main-menu]")
const playBtn = document.querySelector("[data-play-btn]")
const instructionsBtn = document.querySelector("[data-instructions-btn]")
const leaderboardBtn = document.querySelector("[data-leaderboard-btn]")
const settingsBtn = document.querySelector("[data-settings-btn]")

// Modal Elements
const instructionsModal = document.querySelector("[data-instructions-modal]")
const leaderboardModal = document.querySelector("[data-leaderboard-modal]")
const settingsModal = document.querySelector("[data-settings-modal]")
const gameoverModal = document.querySelector("[data-gameover-modal]")
const pauseMenu = document.querySelector("[data-pause-menu]")

// Game Over Elements
const finalScoreElem = document.querySelector("[data-final-score]")
const finalHighscoreElem = document.querySelector("[data-final-highscore]")
const finalComboElem = document.querySelector("[data-final-combo]")
const restartBtn = document.querySelector("[data-restart-btn]")
const mainMenuBtn = document.querySelector("[data-main-menu-btn]")

// Pause Elements
const pauseBtn = document.querySelector("[data-pause-btn]")
const resumeBtn = document.querySelector("[data-resume-btn]")
const pauseMainMenuBtn = document.querySelector("[data-pause-main-menu-btn]")

// Settings Elements
const soundToggle = document.querySelector("[data-sound-toggle]")
const musicToggle = document.querySelector("[data-music-toggle]")
const difficultySelect = document.querySelector("[data-difficulty-select]")
const themeSelect = document.querySelector("[data-theme-select]")

// Loading Elements
const loadingScreen = document.querySelector("[data-loading-screen]")
const loadingProgress = document.querySelector("[data-loading-progress]")

// Audio
const hitSound = new Audio("imgs/hit.wav") // Âm thanh khi va chạm chướng ngại vật
let backgroundMusic = null // Nhạc nền của game
let isMuted = false // Trạng thái tắt/bật âm thanh

// Âm thanh vật phẩm - thêm xử lý lỗi
const soundPowerupInv = new Audio('imgs/powerup-inv.wav') // Âm thanh powerup bất tử
const soundPowerupScore = new Audio('imgs/powerup-score.wav') // Âm thanh powerup điểm số
const soundPowerupJump = new Audio('imgs/powerup-jump.wav') // Âm thanh powerup nhảy cao
const soundModeChange = new Audio('imgs/mode-change.wav') // Âm thanh khi đổi chế độ chơi

// Xử lý lỗi audio
const audioElements = [hitSound, soundPowerupInv, soundPowerupScore, soundPowerupJump, soundModeChange] // Danh sách các audio để kiểm tra lỗi
audioElements.forEach(audio => {
  audio.addEventListener('error', () => {
    console.log('Audio file not found, continuing without sound')
  })
})

// Game State
let lastTime // Thời gian frame cuối cùng
let speedScale = 1 // Tốc độ hiện tại của game
let speedScaleTarget = 1 // Tốc độ mục tiêu của game
const SPEED_SCALE_SMOOTH_STEP = 0.01 // Bước tăng mượt cho tốc độ game
let score = 0 // Điểm số hiện tại của người chơi
let highScore = Number(localStorage.getItem("highScore")) || 0 // Lưu high score của người chơi
let maxCombo = 0 // Combo lớn nhất đạt được trong game
let isPaused = false // Trạng thái tạm dừng game
let isGameRunning = false // Trạng thái game đang chạy hay không
let bossPause = false // Trạng thái tạm dừng khi boss xuất hiện

// Cài đặt game: âm thanh, nhạc, độ khó, theme
let gameSettings = {
  soundEnabled: true,
  musicEnabled: false,
  difficulty: 'normal',
  theme: 'default'
}

// Load settings from localStorage
loadSettings()

// Speed boost variables
const SPEED_BOOST_INTERVAL_MS = 30000
const SPEED_BOOST_SCORE = 500
const SPEED_BOOST_AMOUNT = 0.05
let lastSpeedBoostTime = 0 // Thời gian tăng tốc cuối cùng
let lastSpeedBoostScore = 0

// Combo system
let comboCount = 0 // Số lượng combo hiện tại
let lastObstaclePassed = null // Chướng ngại vật cuối cùng đã vượt qua
let comboTimeout = null // Timeout để reset combo
const COMBO_REQUIRE = 3 // Số chướng ngại vật cần để được combo
const COMBO_BONUS = 100 // Số điểm thưởng khi đạt combo

// Jump power
let jumpPower = 1 // Sức bật nhảy hiện tại của dino
const DEFAULT_JUMP_POWER = 1 // Sức bật nhảy mặc định
const BOOSTED_JUMP_POWER = 1.7 // Sức bật nhảy khi nhận powerup
const JUMP_BOOST_DURATION = 5000 // Thời gian hiệu lực powerup nhảy cao (ms)
let jumpBoostTimeout = null // Timeout cho hiệu ứng powerup nhảy cao
window.jumpPower = jumpPower

window.addEventListener("powerup:score", () => {
  score += 200
  scoreElem.textContent = Math.floor(score)
  try {
    soundPowerupScore.currentTime = 0; soundPowerupScore.play()
  } catch (e) {
    console.log('Could not play sound effect')
  }
})

window.addEventListener("powerup:jump", () => {
  jumpPower = BOOSTED_JUMP_POWER
  window.jumpPower = jumpPower
  if (jumpBoostTimeout) clearTimeout(jumpBoostTimeout)
  jumpBoostTimeout = setTimeout(() => {
    jumpPower = DEFAULT_JUMP_POWER
    window.jumpPower = jumpPower
  }, JUMP_BOOST_DURATION)
  try {
    soundPowerupJump.currentTime = 0; soundPowerupJump.play()
  } catch (e) {
    console.log('Could not play sound effect')
  }
})

window.addEventListener("powerup:invincibility", () => {
  try {
    soundPowerupInv.currentTime = 0; soundPowerupInv.play()
  } catch (e) {
    console.log('Could not play sound effect')
  }
})

// Phát âm thanh khi đổi chế độ chơi
const modeBtns = document.querySelectorAll('.mode-btn')
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    try {
      soundModeChange.currentTime = 0; soundModeChange.play()
    } catch (e) {
      console.log('Could not play sound effect')
    }
  })
})

let selectedMode = localStorage.getItem('selectedMode') || 'classic'; // Chế độ chơi được chọn

// Initialize the game
init()

// Khởi tạo game, hiển thị loading, thiết lập sự kiện, load leaderboard
function init() {
  console.log('Initializing game...')
  showLoadingScreen()
  setupEventListeners()
  loadLeaderboard()
  setTimeout(() => {
    hideLoadingScreen()
    showMainMenu()
    console.log('Game initialized successfully')
  }, 2000)
}

// Hiển thị màn hình loading với thanh tiến trình giả lập
function showLoadingScreen() {
  loadingScreen.style.display = 'flex'
  let progress = 0
  const interval = setInterval(() => {
    progress += Math.random() * 30
    if (progress > 100) progress = 100
    loadingProgress.style.width = `${progress}%`
    if (progress >= 100) {
      clearInterval(interval)
    }
  }, 100)
}

// Ẩn màn hình loading
function hideLoadingScreen() {
  loadingScreen.style.display = 'none'
}

// Thiết lập các sự kiện cho nút menu, bàn phím, v.v.
function setupEventListeners() {
  // Menu buttons
  playBtn.addEventListener('click', () => {
    console.log('Play button clicked');
    startGame();
  })
  instructionsBtn.addEventListener('click', () => showModal(instructionsModal))
  leaderboardBtn.addEventListener('click', () => showModal(leaderboardModal))
  settingsBtn.addEventListener('click', () => showModal(settingsModal))

  // Close buttons
  document.querySelector("[data-close-instructions]").addEventListener('click', () => hideModal(instructionsModal))
  document.querySelector("[data-close-leaderboard]").addEventListener('click', () => hideModal(leaderboardModal))
  document.querySelector("[data-close-settings]").addEventListener('click', () => hideModal(settingsModal))

  // Game over buttons
  restartBtn.addEventListener('click', restartGame)
  mainMenuBtn.addEventListener('click', showMainMenu)
  pauseMainMenuBtn.addEventListener('click', showMainMenu)

  // Pause buttons
  pauseBtn.addEventListener('click', togglePause)
  resumeBtn.addEventListener('click', togglePause)

  // Settings
  soundToggle.addEventListener('change', updateSettings)
  musicToggle.addEventListener('change', updateSettings)
  difficultySelect.addEventListener('change', updateSettings)
  themeSelect.addEventListener('change', updateSettings)

  // Clear leaderboard
  document.querySelector("[data-clear-leaderboard]").addEventListener('click', clearLeaderboard)

  // Reset high score
  document.querySelector('[data-reset-highscore]').addEventListener('click', () => {
    localStorage.removeItem('highScore');
    highScore = 0;
    highScoreElem.textContent = 'High Score: 0';
    // Cập nhật high score ở các nơi khác nếu cần
    const allHighScoreElems = document.querySelectorAll('[data-high-score], [data-final-highscore]');
    allHighScoreElems.forEach(e => e.textContent = 'High Score: 0');
    alert('High score has been reset!');
  });

  // Keyboard events
  document.addEventListener('keydown', handleKeyPress)
  
  // Click to start
  startScreenElem.addEventListener('click', startGame);
  const startContentElem = document.querySelector('.start-content');
  if (startContentElem) {
    startContentElem.addEventListener('click', startGame);
  }

  const characterBtns = document.querySelectorAll('.character-btn')
  let selectedCharacter = localStorage.getItem('selectedCharacter') || 'green'

  characterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCharacter = btn.dataset.character
      localStorage.setItem('selectedCharacter', selectedCharacter)
      characterBtns.forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
    })
    if (btn.dataset.character === selectedCharacter) {
      btn.classList.add('selected')
    }
  })

  const modeBtns = document.querySelectorAll('.mode-btn')
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedMode = btn.dataset.mode
      localStorage.setItem('selectedMode', selectedMode)
      modeBtns.forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
    })
    if (btn.dataset.mode === selectedMode) {
      btn.classList.add('selected')
    }
  })
}

function handleKeyPress(event) {
  if (event.code === 'Space' && !isGameRunning) {
    event.preventDefault()
    startGame()
  } else if (event.code === 'Escape' && isGameRunning) {
    event.preventDefault()
    togglePause()
  }
}

// Hiển thị lại menu chính khi kết thúc hoặc tạm dừng game
function showMainMenu() {
  mainMenuElem.style.display = 'flex'
  worldElem.classList.remove('show')
  isGameRunning = false
  resetGameState()
}

function startGame() {
  console.log('Starting game...')
  mainMenuElem.style.display = 'none'
  worldElem.classList.add('show')
  isGameRunning = true
  resetGameState()

  // Áp dụng logic từng chế độ
  if (selectedMode === 'hard') {
    speedScale = 1.5
    speedScaleTarget = 1.5
    // Có thể tăng tần suất chướng ngại vật ở các file khác nếu muốn
  } else if (selectedMode === 'endless') {
    speedScale = 1
    speedScaleTarget = 1
    // Không tăng tốc độ trong updateSpeedScale
    window.isEndlessMode = true
  } else if (selectedMode === 'time') {
    speedScale = 1
    speedScaleTarget = 1
    window.isTimeAttack = true
    window.timeAttackTime = 30000 // 30 giây
  } else {
    speedScale = 1
    speedScaleTarget = 1
    window.isEndlessMode = false
    window.isTimeAttack = false
  }

  // Start background music if enabled
  if (gameSettings.musicEnabled && !isMuted) {
    startBackgroundMusic()
  }

  handleStart()
  console.log('Game started successfully')
}

// Đặt lại trạng thái game về mặc định khi bắt đầu hoặc kết thúc
function resetGameState() {
  lastTime = null
  speedScale = 1
  speedScaleTarget = 1
  score = 0
  maxCombo = 0
  comboCount = 0
  lastObstaclePassed = null
  bossPause = false
  isPaused = false
  
  // Reset UI
  scoreElem.textContent = '0'
  comboElem.textContent = ''
  pauseMenu.classList.remove('show')
  
  // Setup game elements
  setupGround()
  setupDino()
  setupCactus()
  setupPowerup()
  setupBoss()
  
  document.querySelector('[data-dino]').style.filter = ''
}

function togglePause() {
  if (!isGameRunning) return
  
  isPaused = !isPaused
  if (isPaused) {
    pauseMenu.classList.add('show')
  } else {
    pauseMenu.classList.remove('show')
  }
}

function restartGame() {
  hideModal(gameoverModal)
  startGame()
}

function showModal(modal) {
  modal.classList.add('show')
}

function hideModal(modal) {
  modal.classList.remove('show')
}

function showGameOver() {
  finalScoreElem.textContent = Math.floor(score)
  finalHighscoreElem.textContent = highScore
  finalComboElem.textContent = maxCombo
  
  // Add to leaderboard
  addToLeaderboard(Math.floor(score))
  
  showModal(gameoverModal)
}

function updateSettings() {
  gameSettings.soundEnabled = soundToggle.checked
  gameSettings.musicEnabled = musicToggle.checked
  gameSettings.difficulty = difficultySelect.value
  gameSettings.theme = themeSelect.value
  
  // Apply theme
  document.body.className = `theme-${gameSettings.theme}`
  
  // Handle music
  if (gameSettings.musicEnabled && isGameRunning && !isMuted) {
    startBackgroundMusic()
  } else {
    stopBackgroundMusic()
  }
  
  // Save settings
  localStorage.setItem('gameSettings', JSON.stringify(gameSettings))
}

function loadSettings() {
  const saved = localStorage.getItem('gameSettings')
  if (saved) {
    gameSettings = { ...gameSettings, ...JSON.parse(saved) }
    
    // Apply settings to UI
    soundToggle.checked = gameSettings.soundEnabled
    musicToggle.checked = gameSettings.musicEnabled
    difficultySelect.value = gameSettings.difficulty
    themeSelect.value = gameSettings.theme
    
    // Apply theme
    document.body.className = `theme-${gameSettings.theme}`
  }
}

function startBackgroundMusic() {
  // Placeholder for background music
  // In a real implementation, you would load and play background music here
  console.log('Background music started')
}

function stopBackgroundMusic() {
  // Placeholder for stopping background music
  console.log('Background music stopped')
}

function loadLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]')
  const leaderboardList = document.querySelector("[data-leaderboard-list]")
  leaderboardList.innerHTML = ''
  
  leaderboard.forEach((entry, index) => {
    const item = document.createElement('div')
    item.className = 'leaderboard-item'
    item.innerHTML = `
      <span class="leaderboard-rank">#${index + 1}</span>
      <span>${entry.score}</span>
      <span>${new Date(entry.date).toLocaleDateString()}</span>
    `
    leaderboardList.appendChild(item)
  })
}

function addToLeaderboard(score) {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]')
  leaderboard.push({
    score: score,
    date: new Date().toISOString()
  })
  
  // Sort by score (highest first) and keep only top 10
  leaderboard.sort((a, b) => b.score - a.score)
  leaderboard.splice(10)
  
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard))
  loadLeaderboard()
}

function clearLeaderboard() {
  localStorage.removeItem('leaderboard')
  loadLeaderboard()
}

setPixelToWorldScale()
window.addEventListener("resize", setPixelToWorldScale)

function update(time) {
  if (lastTime == null) {
    lastTime = time
    lastSpeedBoostTime = time
    window.requestAnimationFrame(update)
    return
  }
  
  if (isPaused || !isGameRunning) {
    window.requestAnimationFrame(update)
    return
  }
  
  const delta = time - lastTime

  updateGround(delta, speedScale)
  updateDino(delta, speedScale)
  if (!bossPause) {
    updateCactus(delta, speedScale)
    updatePowerup(delta, speedScale, () => {
      activateInvincibility(() => {
        document.querySelector('[data-dino]').style.filter = ''
      })
      document.querySelector('[data-dino]').style.filter = 'drop-shadow(0 0 16px yellow) brightness(1.3)';
    })
  }
  updateBoss(delta, score, () => { bossPause = true }, () => { bossPause = false })
  updateCombo()
  updateSpeedScale(delta)
  updateScore(delta)
  checkSpeedBoost(time)
  if (checkLose()) return handleLose()

  lastTime = time
  window.requestAnimationFrame(update)
}

function checkLose() {
  const dinoRect = shrinkRect(getDinoRect(), 5)
  if (getIsInvincible()) return false
  const bossRect = getBossRect()
  if (bossRect && isBossActive() && isCollision(bossRect, dinoRect)) return true
  if (getBossProjectiles().some(rect => isCollision(rect, dinoRect))) return true
  return (
    getCactusRects().some(rect => isCollision(shrinkRect(rect, 5), dinoRect))
  )
}

function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  )
}

function shrinkRect(rect, amount) {
  return {
    left: rect.left + amount,
    top: rect.top + amount,
    right: rect.right - amount,
    bottom: rect.bottom - amount
  }
}

function updateSpeedScale(delta) {
  if (window.isEndlessMode) {
    speedScale = 1
    speedScaleTarget = 1
    return
  }
  if (window.isTimeAttack) {
    window.timeAttackTime -= delta
    if (window.timeAttackTime <= 0) {
      isGameRunning = false
      showGameOver()
      return
    }
  }
  if (speedScale < speedScaleTarget) {
    speedScale = Math.min(speedScale + SPEED_SCALE_SMOOTH_STEP, speedScaleTarget)
  } else {
    speedScale += delta * SPEED_SCALE_INCREASE
  }
}

function updateScore(delta) {
  score += delta * 0.01
  scoreElem.textContent = Math.floor(score)
  if (score > highScore) {
    highScore = Math.floor(score)
    highScoreElem.textContent = `High Score: ${highScore}`
    localStorage.setItem("highScore", highScore)
  }
}

function checkSpeedBoost(time) {
  if (time - lastSpeedBoostTime > SPEED_BOOST_INTERVAL_MS) {
    speedScaleTarget += SPEED_BOOST_AMOUNT
    lastSpeedBoostTime = time
  }
  if (score - lastSpeedBoostScore > SPEED_BOOST_SCORE) {
    speedScaleTarget += SPEED_BOOST_AMOUNT
    lastSpeedBoostScore = score
  }
}

function updateCombo() {
  const obstacles = [
    ...document.querySelectorAll('[data-cactus]')
  ]
  const dinoRect = shrinkRect(getDinoRect(), 5)
  let passed = false
  obstacles.forEach(obs => {
    const rect = shrinkRect(obs.getBoundingClientRect(), 5)
    if (rect.right < dinoRect.left && obs !== lastObstaclePassed) {
      comboCount++
      maxCombo = Math.max(maxCombo, comboCount)
      lastObstaclePassed = obs
      passed = true
    }
  })
  
  if (checkLose()) {
    comboCount = 0
    comboElem.textContent = ''
    lastObstaclePassed = null
    return
  }
  
  if (comboCount > 0 && comboCount % COMBO_REQUIRE === 0 && passed) {
    score += COMBO_BONUS
    showComboEffect(comboCount)
  }
}

function showComboEffect(count) {
  comboElem.textContent = `COMBO x${count}! +${COMBO_BONUS}`
  if (comboTimeout) clearTimeout(comboTimeout)
  comboTimeout = setTimeout(() => {
    comboElem.textContent = ''
  }, 1200)
}

function handleStart() {
  lastTime = null
  speedScale = 1
  speedScaleTarget = 1
  score = 0
  highScoreElem.textContent = `High Score: ${highScore}`
  lastSpeedBoostTime = 0
  lastSpeedBoostScore = 0
  setupGround()
  setupDino()
  setupCactus()
  setupPowerup()
  setupBoss()
  document.querySelector('[data-dino]').style.filter = ''
  comboCount = 0
  comboElem.textContent = ''
  lastObstaclePassed = null
  bossPause = false
  startScreenElem.classList.add("hide")
  window.requestAnimationFrame(update)
}

function handleLose() {
  if (gameSettings.soundEnabled && !isMuted) {
    try {
      hitSound.currentTime = 0
      hitSound.play()
    } catch (e) {
      console.log('Could not play hit sound')
    }
  }
  setDinoLose()
  stopBackgroundMusic()
  isGameRunning = false
  showGameOver()
}

function setPixelToWorldScale() {
  let worldToPixelScale
  if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
    worldToPixelScale = window.innerWidth / WORLD_WIDTH
  } else {
    worldToPixelScale = window.innerHeight / WORLD_HEIGHT
  }

  worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
  worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`
}
