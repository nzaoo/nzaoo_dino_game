/**
 * DINO RUNNER - Main Game Script
 * Refactored for cleaner code and better performance
 */

import { updateGround, setupGround } from "./ground.js"
import { updateDino, setupDino, getDinoRect, setDinoLose, setDinoInvincible } from "./dino.js"
import { updateCactus, setupCactus, getCactusRects } from "./cactus.js"
import { updatePowerup, setupPowerup, getIsInvincible, activateInvincibility } from "./powerup.js"
import { updateBoss, setupBoss, getBossRect, isBossActive, getBossProjectiles } from "./boss.js"

// ==================== CONSTANTS ====================
const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.000002
const SPEED_BOOST_INTERVAL_MS = 30000
const SPEED_BOOST_SCORE = 500
const SPEED_BOOST_AMOUNT = 0.05
const COMBO_REQUIRE = 3
const COMBO_BONUS = 100
const TIME_ATTACK_DURATION = 30000

// ==================== DOM ELEMENTS ====================
const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)

const elements = {
  world: $("[data-world]"),
  score: $("[data-score]"),
  startScreen: $("[data-start-screen]"),
  highScore: $("[data-high-score]"),
  combo: $("[data-combo]"),
  mainMenu: $("[data-main-menu]"),
  timer: $("[data-timer]"),
  timerValue: $("[data-timer-value]"),
  
  // Buttons
  playBtn: $("[data-play-btn]"),
  instructionsBtn: $("[data-instructions-btn]"),
  leaderboardBtn: $("[data-leaderboard-btn]"),
  settingsBtn: $("[data-settings-btn]"),
  
  // Modals
  instructionsModal: $("[data-instructions-modal]"),
  leaderboardModal: $("[data-leaderboard-modal]"),
  settingsModal: $("[data-settings-modal]"),
  gameoverModal: $("[data-gameover-modal]"),
  pauseMenu: $("[data-pause-menu]"),
  
  // Game over
  finalScore: $("[data-final-score]"),
  finalHighscore: $("[data-final-highscore]"),
  finalCombo: $("[data-final-combo]"),
  gameoverMessage: $("[data-gameover-message]"),
  restartBtn: $("[data-restart-btn]"),
  mainMenuBtn: $("[data-main-menu-btn]"),
  
  // Pause
  pauseBtn: $("[data-pause-btn]"),
  resumeBtn: $("[data-resume-btn]"),
  pauseMainMenuBtn: $("[data-pause-main-menu-btn]"),
  
  // Settings
  soundToggle: $("[data-sound-toggle]"),
  musicToggle: $("[data-music-toggle]"),
  difficultySelect: $("[data-difficulty-select]"),
  themeSelect: $("[data-theme-select]"),
  
  // Loading
  loadingScreen: $("[data-loading-screen]"),
  loadingProgress: $("[data-loading-progress]"),
  
  // Others
  leaderboardList: $("[data-leaderboard-list]"),
  muteBtn: $("[data-mute-btn]"),
  dino: $("[data-dino]"),
  startHighScore: $("[data-start-high-score]"),
}

// ==================== AUDIO ====================
class AudioManager {
  constructor() {
    this.sounds = {
      hit: this.createAudio("imgs/hit.wav"),
      jump: this.createAudio("imgs/jump.wav"),
      powerupInv: this.createAudio("imgs/powerup-inv.wav"),
      powerupScore: this.createAudio("imgs/powerup-score.wav"),
      powerupJump: this.createAudio("imgs/powerup-jump.wav"),
      modeChange: this.createAudio("imgs/mode-change.wav"),
    }
    this.isMuted = false
  }
  
  createAudio(src) {
    const audio = new Audio(src)
    audio.addEventListener('error', () => {
      console.log(`Audio file not found: ${src}`)
    })
    return audio
  }
  
  play(soundName) {
    if (this.isMuted || !gameState.settings.soundEnabled) return
    
    const sound = this.sounds[soundName]
    if (sound) {
      try {
        sound.currentTime = 0
        sound.play()
      } catch (e) {
        console.log('Could not play sound')
      }
    }
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted
    elements.muteBtn.querySelector('span').textContent = this.isMuted ? '🔇' : '🔊'
  }
}

const audioManager = new AudioManager()

// ==================== GAME STATE ====================
const gameState = {
  lastTime: null,
  speedScale: 1,
  speedScaleTarget: 1,
  score: 0,
  highScore: Number(localStorage.getItem("highScore")) || 0,
  maxCombo: 0,
  isPaused: false,
  isRunning: false,
  bossPause: false,
  
  // Speed boost
  lastSpeedBoostTime: 0,
  lastSpeedBoostScore: 0,
  
  // Combo system
  comboCount: 0,
  lastObstaclePassed: null,
  comboTimeout: null,
  
  // Jump power
  jumpPower: 1,
  jumpBoostTimeout: null,
  
  // Game mode
  selectedMode: localStorage.getItem('selectedMode') || 'classic',
  selectedCharacter: localStorage.getItem('selectedCharacter') || 'green',
  
  // Time attack
  timeAttackTime: TIME_ATTACK_DURATION,
  
  // Settings
  settings: {
    soundEnabled: true,
    musicEnabled: false,
    difficulty: 'normal',
    theme: 'default',
  },
  
  reset() {
    this.lastTime = null
    this.speedScale = 1
    this.speedScaleTarget = 1
    this.score = 0
    this.maxCombo = 0
    this.comboCount = 0
    this.lastObstaclePassed = null
    this.bossPause = false
    this.isPaused = false
    this.jumpPower = 1
    this.lastSpeedBoostTime = 0
    this.lastSpeedBoostScore = 0
    this.timeAttackTime = TIME_ATTACK_DURATION
    window.jumpPower = 1
  }
}

// Expose jump power to window for dino.js
window.jumpPower = gameState.jumpPower

// ==================== INITIALIZATION ====================
function init() {
  console.log('🦖 Initializing Dino Runner...')
  loadSettings()
  showLoadingScreen()
  setupEventListeners()
  loadLeaderboard()
  updateHighScoreDisplay()
  
  setTimeout(() => {
    hideLoadingScreen()
    showMainMenu()
    console.log('✅ Game initialized successfully')
  }, 2000)
}

// ==================== LOADING SCREEN ====================
function showLoadingScreen() {
  elements.loadingScreen.style.display = 'flex'
  let progress = 0
  
  const interval = setInterval(() => {
    progress += Math.random() * 25 + 5
    if (progress > 100) progress = 100
    elements.loadingProgress.style.width = `${progress}%`
    
    if (progress >= 100) clearInterval(interval)
  }, 150)
}

function hideLoadingScreen() {
  elements.loadingScreen.style.display = 'none'
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Menu buttons
  elements.playBtn?.addEventListener('click', startGame)
  elements.instructionsBtn?.addEventListener('click', () => showModal(elements.instructionsModal))
  elements.leaderboardBtn?.addEventListener('click', () => showModal(elements.leaderboardModal))
  elements.settingsBtn?.addEventListener('click', () => showModal(elements.settingsModal))
  
  // Close buttons
  $("[data-close-instructions]")?.addEventListener('click', () => hideModal(elements.instructionsModal))
  $("[data-close-leaderboard]")?.addEventListener('click', () => hideModal(elements.leaderboardModal))
  $("[data-close-settings]")?.addEventListener('click', () => hideModal(elements.settingsModal))
  
  // Game over buttons
  elements.restartBtn?.addEventListener('click', restartGame)
  elements.mainMenuBtn?.addEventListener('click', showMainMenu)
  elements.pauseMainMenuBtn?.addEventListener('click', showMainMenu)
  
  // Pause buttons
  elements.pauseBtn?.addEventListener('click', togglePause)
  elements.resumeBtn?.addEventListener('click', togglePause)
  
  // Mute button
  elements.muteBtn?.addEventListener('click', () => audioManager.toggleMute())
  
  // Settings
  elements.soundToggle?.addEventListener('change', updateSettings)
  elements.musicToggle?.addEventListener('change', updateSettings)
  elements.difficultySelect?.addEventListener('change', updateSettings)
  elements.themeSelect?.addEventListener('change', updateSettings)
  
  // Leaderboard
  $("[data-clear-leaderboard]")?.addEventListener('click', clearLeaderboard)
  $("[data-reset-highscore]")?.addEventListener('click', resetHighScore)
  
  // Keyboard events
  document.addEventListener('keydown', handleKeyDown)
  
  // Start screen click
  elements.startScreen?.addEventListener('click', handleStart)
  
  // Character selection
  setupCharacterSelection()
  
  // Mode selection
  setupModeSelection()
  
  // Modal overlay clicks
  $$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        hideModal(overlay.closest('.modal'))
      }
    })
  })
  
  // Powerup events
  window.addEventListener("powerup:score", handleScorePowerup)
  window.addEventListener("powerup:jump", handleJumpPowerup)
  window.addEventListener("powerup:invincibility", handleInvincibilityPowerup)
}

function setupCharacterSelection() {
  const characterBtns = $$('.character-btn')
  
  characterBtns.forEach(btn => {
    if (btn.dataset.character === gameState.selectedCharacter) {
      btn.classList.add('selected')
    }
    
    btn.addEventListener('click', () => {
      characterBtns.forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
      gameState.selectedCharacter = btn.dataset.character
      localStorage.setItem('selectedCharacter', gameState.selectedCharacter)
    })
  })
}

function setupModeSelection() {
  const modeBtns = $$('.mode-btn')
  
  modeBtns.forEach(btn => {
    if (btn.dataset.mode === gameState.selectedMode) {
      btn.classList.add('selected')
    }
    
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
      gameState.selectedMode = btn.dataset.mode
      localStorage.setItem('selectedMode', gameState.selectedMode)
      audioManager.play('modeChange')
    })
  })
}

// ==================== KEYBOARD HANDLING ====================
function handleKeyDown(e) {
  if (e.code === 'Space') {
    e.preventDefault()
    if (!gameState.isRunning) {
      if (elements.mainMenu.style.display !== 'none') {
        startGame()
      } else if (!elements.startScreen.classList.contains('hide')) {
        handleStart()
      }
    }
  } else if (e.code === 'Escape' && gameState.isRunning) {
    e.preventDefault()
    togglePause()
  }
}

// ==================== POWERUP HANDLERS ====================
function handleScorePowerup() {
  gameState.score += 200
  elements.score.textContent = Math.floor(gameState.score)
  audioManager.play('powerupScore')
  showToast('💰 +200 Điểm!', 'success')
}

function handleJumpPowerup() {
  gameState.jumpPower = 1.7
  window.jumpPower = gameState.jumpPower
  
  if (gameState.jumpBoostTimeout) clearTimeout(gameState.jumpBoostTimeout)
  gameState.jumpBoostTimeout = setTimeout(() => {
    gameState.jumpPower = 1
    window.jumpPower = 1
  }, 5000)
  
  audioManager.play('powerupJump')
  showToast('🚀 Nhảy Cao!', 'success')
}

function handleInvincibilityPowerup() {
  audioManager.play('powerupInv')
  showToast('🛡️ Bất Tử!', 'success')
}

// ==================== MENU & MODALS ====================
function showMainMenu() {
  elements.mainMenu.style.display = 'flex'
  elements.world.classList.remove('show')
  gameState.isRunning = false
  gameState.reset()
  hideModal(elements.gameoverModal)
  hideModal(elements.pauseMenu)
  updateHighScoreDisplay()
}

function showModal(modal) {
  modal?.classList.add('show')
}

function hideModal(modal) {
  modal?.classList.remove('show')
}

function showToast(message, type = 'success') {
  const container = $('[data-toast-container]')
  if (!container) return
  
  const toast = document.createElement('div')
  toast.className = `toast ${type}`
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span>
    <span class="toast-message">${message}</span>
  `
  container.appendChild(toast)
  
  setTimeout(() => toast.remove(), 3000)
}

// ==================== GAME CONTROL ====================
function startGame() {
  console.log('🎮 Starting game...')
  elements.mainMenu.style.display = 'none'
  elements.world.classList.add('show')
  gameState.isRunning = true
  gameState.reset()
  
  // Apply mode settings
  applyGameMode()
  
  // Update UI
  updateHighScoreDisplay()
  elements.score.textContent = '0'
  elements.combo.textContent = ''
  
  // Setup game elements
  setupGround()
  setupDino()
  setupCactus()
  setupPowerup()
  setupBoss()
  
  // Reset dino effects
  setDinoInvincible(false)
  
  console.log('✅ Game started!')
}

function applyGameMode() {
  const mode = gameState.selectedMode
  
  // Reset time attack timer
  elements.timer.style.display = 'none'
  
  switch (mode) {
    case 'hard':
      gameState.speedScale = 1.5
      gameState.speedScaleTarget = 1.5
      break
    case 'endless':
      gameState.speedScale = 1
      gameState.speedScaleTarget = 1
      break
    case 'time':
      gameState.speedScale = 1.2
      gameState.speedScaleTarget = 1.2
      gameState.timeAttackTime = TIME_ATTACK_DURATION
      elements.timer.style.display = 'flex'
      updateTimerDisplay()
      break
    default:
      gameState.speedScale = 1
      gameState.speedScaleTarget = 1
  }
}

function handleStart() {
  gameState.lastTime = null
  elements.startScreen.classList.add('hide')
  window.requestAnimationFrame(update)
}

function restartGame() {
  hideModal(elements.gameoverModal)
  startGame()
  handleStart()
}

function togglePause() {
  if (!gameState.isRunning) return
  
  gameState.isPaused = !gameState.isPaused
  elements.pauseMenu.classList.toggle('show', gameState.isPaused)
}

// ==================== GAME LOOP ====================
function update(time) {
  if (gameState.lastTime == null) {
    gameState.lastTime = time
    gameState.lastSpeedBoostTime = time
    window.requestAnimationFrame(update)
    return
  }
  
  if (gameState.isPaused || !gameState.isRunning) {
    window.requestAnimationFrame(update)
    return
  }
  
  const delta = time - gameState.lastTime
  
  // Update game elements
  updateGround(delta, gameState.speedScale)
  updateDino(delta, gameState.speedScale)
  
  if (!gameState.bossPause) {
    updateCactus(delta, gameState.speedScale)
    updatePowerup(delta, gameState.speedScale, handlePowerupCollected)
  }
  
  updateBoss(
    delta,
    gameState.score,
    () => { gameState.bossPause = true },
    () => { gameState.bossPause = false }
  )
  
  // Update game systems
  updateCombo()
  updateSpeedScale(delta, time)
  updateScore(delta)
  updateTimeAttack(delta)
  
  // Check lose condition
  if (checkLose()) {
    handleLose()
    return
  }
  
  gameState.lastTime = time
  window.requestAnimationFrame(update)
}

function handlePowerupCollected() {
  activateInvincibility(() => {
    setDinoInvincible(false)
  })
  setDinoInvincible(true)
}

// ==================== GAME SYSTEMS ====================
function updateScore(delta) {
  gameState.score += delta * 0.01
  elements.score.textContent = Math.floor(gameState.score)
  
  if (gameState.score > gameState.highScore) {
    gameState.highScore = Math.floor(gameState.score)
    updateHighScoreDisplay()
    localStorage.setItem("highScore", gameState.highScore)
  }
}

function updateSpeedScale(delta, time) {
  if (gameState.selectedMode === 'endless') return
  
  // Smooth speed transition
  if (gameState.speedScale < gameState.speedScaleTarget) {
    gameState.speedScale = Math.min(
      gameState.speedScale + 0.01,
      gameState.speedScaleTarget
    )
  } else {
    gameState.speedScale += delta * SPEED_SCALE_INCREASE
  }
  
  // Speed boosts
  if (time - gameState.lastSpeedBoostTime > SPEED_BOOST_INTERVAL_MS) {
    gameState.speedScaleTarget += SPEED_BOOST_AMOUNT
    gameState.lastSpeedBoostTime = time
  }
  
  if (gameState.score - gameState.lastSpeedBoostScore > SPEED_BOOST_SCORE) {
    gameState.speedScaleTarget += SPEED_BOOST_AMOUNT
    gameState.lastSpeedBoostScore = gameState.score
  }
}

function updateTimeAttack(delta) {
  if (gameState.selectedMode !== 'time') return
  
  gameState.timeAttackTime -= delta
  updateTimerDisplay()
  
  if (gameState.timeAttackTime <= 0) {
    gameState.isRunning = false
    showGameOver(true)
  }
}

function updateTimerDisplay() {
  const seconds = Math.max(0, Math.ceil(gameState.timeAttackTime / 1000))
  elements.timerValue.textContent = seconds
}

function updateCombo() {
  const obstacles = [...$$('[data-cactus]')]
  const dinoRect = shrinkRect(getDinoRect(), 5)
  let passed = false
  
  obstacles.forEach(obs => {
    const rect = shrinkRect(obs.getBoundingClientRect(), 5)
    if (rect.right < dinoRect.left && obs !== gameState.lastObstaclePassed) {
      gameState.comboCount++
      gameState.maxCombo = Math.max(gameState.maxCombo, gameState.comboCount)
      gameState.lastObstaclePassed = obs
      passed = true
    }
  })
  
  if (gameState.comboCount > 0 && gameState.comboCount % COMBO_REQUIRE === 0 && passed) {
    gameState.score += COMBO_BONUS
    showComboEffect(gameState.comboCount)
  }
}

function showComboEffect(count) {
  elements.combo.textContent = `🔥 COMBO x${count}! +${COMBO_BONUS}`
  
  if (gameState.comboTimeout) clearTimeout(gameState.comboTimeout)
  gameState.comboTimeout = setTimeout(() => {
    elements.combo.textContent = ''
  }, 1500)
}

// ==================== COLLISION DETECTION ====================
function checkLose() {
  if (getIsInvincible()) return false
  
  const dinoRect = shrinkRect(getDinoRect(), 5)
  
  // Check boss collision
  const bossRect = getBossRect()
  if (bossRect && isBossActive() && isCollision(bossRect, dinoRect)) return true
  
  // Check projectile collision
  if (getBossProjectiles().some(rect => isCollision(rect, dinoRect))) return true
  
  // Check cactus collision
  return getCactusRects().some(rect => isCollision(shrinkRect(rect, 5), dinoRect))
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

// ==================== GAME OVER ====================
function handleLose() {
  audioManager.play('hit')
  setDinoLose()
  gameState.isRunning = false
  showGameOver(false)
}

function showGameOver(isTimeUp = false) {
  const finalScore = Math.floor(gameState.score)
  
  elements.finalScore.textContent = finalScore
  elements.finalHighscore.textContent = gameState.highScore
  elements.finalCombo.textContent = gameState.maxCombo
  
  // Set message based on performance
  const message = getGameOverMessage(finalScore, isTimeUp)
  elements.gameoverMessage.textContent = message
  
  // Add to leaderboard
  addToLeaderboard(finalScore)
  
  showModal(elements.gameoverModal)
}

function getGameOverMessage(score, isTimeUp) {
  if (isTimeUp) {
    return score > gameState.highScore 
      ? '🎉 Kỷ lục mới! Tuyệt vời!' 
      : '⏱️ Hết giờ! Thử lại nhé!'
  }
  
  if (score >= 1000) return '🏆 Tuyệt vời! Bạn là cao thủ!'
  if (score >= 500) return '⭐ Rất giỏi! Tiếp tục phát huy!'
  if (score >= 200) return '👍 Khá tốt! Cố lên!'
  return '💪 Đừng bỏ cuộc! Thử lại nhé!'
}

// ==================== LEADERBOARD ====================
function loadLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]')
  
  if (leaderboard.length === 0) {
    elements.leaderboardList.innerHTML = `
      <div class="empty-leaderboard">
        <span class="empty-icon">🎮</span>
        <p>Chưa có điểm số nào</p>
        <p class="empty-hint">Hãy chơi game để ghi điểm!</p>
      </div>
    `
    return
  }
  
  elements.leaderboardList.innerHTML = leaderboard.map((entry, index) => `
    <div class="leaderboard-item">
      <span class="leaderboard-rank">${index + 1}</span>
      <span class="leaderboard-score">${entry.score}</span>
      <span class="leaderboard-date">${new Date(entry.date).toLocaleDateString('vi-VN')}</span>
    </div>
  `).join('')
}

function addToLeaderboard(score) {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]')
  
  leaderboard.push({
    score,
    date: new Date().toISOString()
  })
  
  leaderboard.sort((a, b) => b.score - a.score)
  leaderboard.splice(10)
  
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard))
  loadLeaderboard()
}

function clearLeaderboard() {
  if (confirm('Bạn có chắc muốn xóa toàn bộ bảng xếp hạng?')) {
    localStorage.removeItem('leaderboard')
    loadLeaderboard()
    showToast('🗑️ Đã xóa bảng xếp hạng!', 'warning')
  }
}

function resetHighScore() {
  if (confirm('Bạn có chắc muốn reset điểm cao nhất?')) {
    localStorage.removeItem('highScore')
    gameState.highScore = 0
    updateHighScoreDisplay()
    showToast('🔄 Đã reset high score!', 'warning')
  }
}

// ==================== SETTINGS ====================
function loadSettings() {
  const saved = localStorage.getItem('gameSettings')
  if (saved) {
    gameState.settings = { ...gameState.settings, ...JSON.parse(saved) }
  }
  
  // Apply to UI
  if (elements.soundToggle) elements.soundToggle.checked = gameState.settings.soundEnabled
  if (elements.musicToggle) elements.musicToggle.checked = gameState.settings.musicEnabled
  if (elements.difficultySelect) elements.difficultySelect.value = gameState.settings.difficulty
  if (elements.themeSelect) elements.themeSelect.value = gameState.settings.theme
  
  // Apply theme
  applyTheme(gameState.settings.theme)
}

function updateSettings() {
  gameState.settings = {
    soundEnabled: elements.soundToggle?.checked ?? true,
    musicEnabled: elements.musicToggle?.checked ?? false,
    difficulty: elements.difficultySelect?.value ?? 'normal',
    theme: elements.themeSelect?.value ?? 'default',
  }
  
  applyTheme(gameState.settings.theme)
  localStorage.setItem('gameSettings', JSON.stringify(gameState.settings))
}

function applyTheme(theme) {
  document.body.className = theme === 'default' ? '' : `theme-${theme}`
}

// ==================== UI HELPERS ====================
function updateHighScoreDisplay() {
  const hsText = `High Score: ${gameState.highScore}`
  
  if (elements.highScore) {
    const textEl = elements.highScore.querySelector('.hs-text')
    if (textEl) textEl.textContent = hsText
  }
  
  if (elements.startHighScore) {
    elements.startHighScore.textContent = gameState.highScore
  }
}

// ==================== WORLD SCALING ====================
function setPixelToWorldScale() {
  const aspectRatio = WORLD_WIDTH / WORLD_HEIGHT
  let worldToPixelScale
  
  if (window.innerWidth / window.innerHeight < aspectRatio) {
    worldToPixelScale = window.innerWidth / WORLD_WIDTH
  } else {
    worldToPixelScale = window.innerHeight / WORLD_HEIGHT
  }
  
  elements.world.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
  elements.world.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`
}

setPixelToWorldScale()
window.addEventListener("resize", setPixelToWorldScale)

// ==================== START GAME ====================
init()
