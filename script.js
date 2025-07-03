import { updateGround, setupGround } from "./ground.js"
import { updateDino, setupDino, getDinoRect, setDinoLose } from "./dino.js"
import { updateCactus, setupCactus, getCactusRects } from "./cactus.js"
import { updateBird, setupBird, getBirdRects } from "./bird.js"
import { updatePowerup, setupPowerup, getIsInvincible, activateInvincibility } from "./powerup.js"
import { updateBoss, setupBoss, getBossRect, isBossActive, getBossProjectiles } from "./boss.js"

const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.00001

const worldElem = document.querySelector("[data-world]")
const scoreElem = document.querySelector("[data-score]")
const startScreenElem = document.querySelector("[data-start-screen]")
const highScoreElem = document.querySelector("[data-high-score]")
const comboElem = document.querySelector('[data-combo]')

const hitSound = new Audio("imgs/hit.wav")

setPixelToWorldScale()
window.addEventListener("resize", setPixelToWorldScale)
document.addEventListener("keydown", handleStart, { once: true })

let lastTime
let speedScale
let score
let highScore = Number(localStorage.getItem("highScore")) || 0
highScoreElem.textContent = `High Score: ${highScore}`

// Thêm các mốc tăng tốc
const SPEED_BOOST_INTERVAL_MS = 30000 // 30 giây
const SPEED_BOOST_SCORE = 500
const SPEED_BOOST_AMOUNT = 0.2
let lastSpeedBoostTime = 0
let lastSpeedBoostScore = 0

let comboCount = 0
let lastObstaclePassed = null
let comboTimeout = null
const COMBO_REQUIRE = 3
const COMBO_BONUS = 100
let bossPause = false

function update(time) {
  if (lastTime == null) {
    lastTime = time
    lastSpeedBoostTime = time // reset mốc tăng tốc
    window.requestAnimationFrame(update)
    return
  }
  const delta = time - lastTime

  updateGround(delta, speedScale)
  updateDino(delta, speedScale)
  if (!bossPause) {
    updateCactus(delta, speedScale)
    updateBird(delta, speedScale)
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
    getCactusRects().some(rect => isCollision(shrinkRect(rect, 5), dinoRect)) ||
    getBirdRects().some(rect => isCollision(shrinkRect(rect, 5), dinoRect))
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
  speedScale += delta * SPEED_SCALE_INCREASE
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
  // Tăng tốc mỗi 30 giây
  if (time - lastSpeedBoostTime > SPEED_BOOST_INTERVAL_MS) {
    speedScale += SPEED_BOOST_AMOUNT
    lastSpeedBoostTime = time
  }
  // Tăng tốc mỗi 500 điểm
  if (score - lastSpeedBoostScore > SPEED_BOOST_SCORE) {
    speedScale += SPEED_BOOST_AMOUNT
    lastSpeedBoostScore = score
  }
}

function updateCombo() {
  // Lấy tất cả chướng ngại vật
  const obstacles = [
    ...document.querySelectorAll('[data-cactus]'),
    ...document.querySelectorAll('[data-bird]')
  ]
  const dinoRect = shrinkRect(getDinoRect(), 5)
  let passed = false
  obstacles.forEach(obs => {
    const rect = shrinkRect(obs.getBoundingClientRect(), 5)
    // Nếu vật cản đã đi qua dino mà chưa tính combo
    if (rect.right < dinoRect.left && obs !== lastObstaclePassed) {
      comboCount++
      lastObstaclePassed = obs
      passed = true
    }
  })
  // Nếu va chạm thì reset combo
  if (checkLose()) {
    comboCount = 0
    comboElem.textContent = ''
    lastObstaclePassed = null
    return
  }
  // Nếu đạt combo, thưởng điểm và hiện hiệu ứng
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
  score = 0
  highScoreElem.textContent = `High Score: ${highScore}`
  lastSpeedBoostTime = 0
  lastSpeedBoostScore = 0
  setupGround()
  setupDino()
  setupCactus()
  setupBird()
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
  hitSound.currentTime = 0
  hitSound.play()
  setDinoLose()
  setTimeout(() => {
    document.addEventListener("keydown", handleStart, { once: true })
    startScreenElem.classList.remove("hide")
  }, 100)
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
