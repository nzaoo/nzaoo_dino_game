import {
  setCustomProperty,
  incrementCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"

const SPEED = 0.05
const POWERUP_INTERVAL_MIN = 8000
const POWERUP_INTERVAL_MAX = 15000
const INVINCIBILITY_DURATION = 4000 // ms
const POWERUP_HEIGHTS = [5, 12, 20]
const worldElem = document.querySelector("[data-world]")

let nextPowerupTime
let isInvincible = false
let invincibleTimeout = null

export function setupPowerup() {
  nextPowerupTime = POWERUP_INTERVAL_MIN
  isInvincible = false
  if (invincibleTimeout) clearTimeout(invincibleTimeout)
  document.querySelectorAll("[data-powerup]").forEach(pu => pu.remove())
}

export function updatePowerup(delta, speedScale, onGetPowerup) {
  document.querySelectorAll("[data-powerup]").forEach(pu => {
    incrementCustomProperty(pu, "--left", delta * speedScale * SPEED * -1)
    if (getCustomProperty(pu, "--left") <= -10) {
      pu.remove()
    }
  })

  if (nextPowerupTime <= 0) {
    createPowerup()
    nextPowerupTime = randomNumberBetween(POWERUP_INTERVAL_MIN, POWERUP_INTERVAL_MAX) / speedScale
  }
  nextPowerupTime -= delta

  // Kiểm tra va chạm với dino
  const dino = document.querySelector("[data-dino]")
  const dinoRect = dino.getBoundingClientRect()
  document.querySelectorAll("[data-powerup]").forEach(pu => {
    if (isCollision(pu.getBoundingClientRect(), dinoRect)) {
      pu.remove()
      onGetPowerup && onGetPowerup()
    }
  })
}

export function getIsInvincible() {
  return isInvincible
}

function createPowerup() {
  const pu = document.createElement("img")
  pu.dataset.powerup = true
  pu.src = "imgs/dino-run-0.png" // tạm dùng ảnh dino, sau sẽ thay bằng icon powerup
  pu.classList.add("powerup")
  setCustomProperty(pu, "--left", 100)
  const height = POWERUP_HEIGHTS[Math.floor(Math.random() * POWERUP_HEIGHTS.length)]
  setCustomProperty(pu, "--bottom", height)
  worldElem.append(pu)
}

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  )
}

export function activateInvincibility(onEnd) {
  isInvincible = true
  if (invincibleTimeout) clearTimeout(invincibleTimeout)
  invincibleTimeout = setTimeout(() => {
    isInvincible = false
    onEnd && onEnd()
  }, INVINCIBILITY_DURATION)
} 