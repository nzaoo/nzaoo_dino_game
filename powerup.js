/**
 * DINO RUNNER - Powerup Module
 * Handles powerup spawning, collection, and effects
 */

import {
  setCustomProperty,
  incrementCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"

// ==================== CONSTANTS ====================
const SPEED = 0.05
const POWERUP_INTERVAL_MIN = 8000
const POWERUP_INTERVAL_MAX = 15000
const INVINCIBILITY_DURATION = 4000
const POWERUP_HEIGHTS = [5, 12, 20]

const POWERUP_TYPES = {
  invincibility: { icon: "imgs/cactus.png", effect: "invincibility" },
  score: { icon: "imgs/rock.png", effect: "score" },
  jump: { icon: "imgs/dino-run-0.png", effect: "jump" },
}

// ==================== DOM ELEMENTS ====================
const worldElem = document.querySelector("[data-world]")

// ==================== STATE ====================
let nextPowerupTime = 0
let isInvincible = false
let invincibleTimeout = null

// ==================== PUBLIC FUNCTIONS ====================
export function setupPowerup() {
  nextPowerupTime = POWERUP_INTERVAL_MIN
  isInvincible = false
  
  if (invincibleTimeout) {
    clearTimeout(invincibleTimeout)
    invincibleTimeout = null
  }
  
  // Remove existing powerups
  document.querySelectorAll("[data-powerup]").forEach(pu => pu.remove())
}

export function updatePowerup(delta, speedScale, onGetInvincibility) {
  // Move existing powerups
  document.querySelectorAll("[data-powerup]").forEach(pu => {
    incrementCustomProperty(pu, "--left", delta * speedScale * SPEED * -1)
    
    if (getCustomProperty(pu, "--left") <= -10) {
      pu.remove()
    }
  })
  
  // Spawn new powerups
  if (nextPowerupTime <= 0) {
    createPowerup()
    nextPowerupTime = randomNumberBetween(POWERUP_INTERVAL_MIN, POWERUP_INTERVAL_MAX) / speedScale
  }
  nextPowerupTime -= delta
  
  // Check collision with dino
  checkPowerupCollision(onGetInvincibility)
}

export function getIsInvincible() {
  return isInvincible
}

export function activateInvincibility(onEnd) {
  isInvincible = true
  
  if (invincibleTimeout) clearTimeout(invincibleTimeout)
  
  invincibleTimeout = setTimeout(() => {
    isInvincible = false
    onEnd?.()
  }, INVINCIBILITY_DURATION)
}

// ==================== PRIVATE FUNCTIONS ====================
function createPowerup() {
  const types = Object.keys(POWERUP_TYPES)
  const type = types[Math.floor(Math.random() * types.length)]
  const powerupData = POWERUP_TYPES[type]
  
  const powerup = document.createElement('img')
  powerup.src = powerupData.icon
  powerup.classList.add('powerup')
  powerup.dataset.powerup = type
  
  setCustomProperty(powerup, "--left", 100)
  
  const height = POWERUP_HEIGHTS[Math.floor(Math.random() * POWERUP_HEIGHTS.length)]
  setCustomProperty(powerup, "--bottom", height)
  
  worldElem.append(powerup)
}

function checkPowerupCollision(onGetInvincibility) {
  const dino = document.querySelector("[data-dino]")
  if (!dino) return
  
  const dinoRect = dino.getBoundingClientRect()
  
  document.querySelectorAll("[data-powerup]").forEach(powerup => {
    if (isCollision(powerup.getBoundingClientRect(), dinoRect)) {
      const type = powerup.dataset.powerup
      powerup.remove()
      
      handlePowerupEffect(type, onGetInvincibility)
    }
  })
}

function handlePowerupEffect(type, onGetInvincibility) {
  switch (type) {
    case "invincibility":
      onGetInvincibility?.()
      window.dispatchEvent(new CustomEvent("powerup:invincibility"))
      break
    case "score":
      window.dispatchEvent(new CustomEvent("powerup:score"))
      break
    case "jump":
      window.dispatchEvent(new CustomEvent("powerup:jump"))
      break
  }
}

function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  )
}

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
