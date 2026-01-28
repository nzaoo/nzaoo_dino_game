/**
 * DINO RUNNER - Cactus Obstacle Module
 * Handles obstacle spawning and movement
 */

import {
  setCustomProperty,
  incrementCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"

// ==================== CONSTANTS ====================
const SPEED = 0.05
const CACTUS_INTERVAL_MIN = 800
const CACTUS_INTERVAL_MAX = 2200
const MIN_SPAWN_DISTANCE = 0.35 // 35% of world width

// ==================== DOM ELEMENTS ====================
const worldElem = document.querySelector("[data-world]")

// ==================== STATE ====================
let nextCactusTime = 0

// ==================== PUBLIC FUNCTIONS ====================
export function setupCactus() {
  nextCactusTime = CACTUS_INTERVAL_MIN
  
  // Remove all existing cacti
  document.querySelectorAll("[data-cactus]").forEach(cactus => cactus.remove())
}

export function updateCactus(delta, speedScale) {
  // Move existing cacti
  document.querySelectorAll("[data-cactus]").forEach(cactus => {
    incrementCustomProperty(cactus, "--left", delta * speedScale * SPEED * -1)
    
    // Remove cacti that are off screen
    if (getCustomProperty(cactus, "--left") <= -100) {
      cactus.remove()
    }
  })
  
  // Spawn new cacti
  if (nextCactusTime <= 0) {
    if (canSpawnCactus()) {
      createCactus()
    }
    nextCactusTime = randomNumberBetween(CACTUS_INTERVAL_MIN, CACTUS_INTERVAL_MAX) / speedScale
  }
  
  nextCactusTime -= delta
}

export function getCactusRects() {
  return [...document.querySelectorAll("[data-cactus]")].map(cactus => {
    return cactus.getBoundingClientRect()
  })
}

// ==================== PRIVATE FUNCTIONS ====================
function createCactus() {
  const cactus = document.createElement("img")
  cactus.dataset.cactus = true
  cactus.src = "imgs/cactus.png"
  cactus.classList.add("cactus")
  setCustomProperty(cactus, "--left", 100)
  worldElem.append(cactus)
}

function canSpawnCactus() {
  const worldRect = worldElem.getBoundingClientRect()
  const minDistance = worldRect.width * MIN_SPAWN_DISTANCE
  
  // Check distance from existing obstacles
  const obstacles = document.querySelectorAll('[data-cactus]')
  
  for (const obs of obstacles) {
    const obsRect = obs.getBoundingClientRect()
    const distanceFromRight = worldRect.right - obsRect.left
    
    if (distanceFromRight < minDistance) {
      return false
    }
  }
  
  return true
}

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
