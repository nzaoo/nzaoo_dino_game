/**
 * DINO RUNNER - Ground Module
 * Handles infinite scrolling ground
 */

import {
  getCustomProperty,
  incrementCustomProperty,
  setCustomProperty,
} from "./updateCustomProperty.js"

// ==================== CONSTANTS ====================
const SPEED = 0.05

// ==================== DOM ELEMENTS ====================
const groundElems = document.querySelectorAll("[data-ground]")

// ==================== PUBLIC FUNCTIONS ====================
export function setupGround() {
  setCustomProperty(groundElems[0], "--left", 0)
  setCustomProperty(groundElems[1], "--left", 300)
}

export function updateGround(delta, speedScale) {
  groundElems.forEach(ground => {
    incrementCustomProperty(ground, "--left", delta * speedScale * SPEED * -1)
    
    // Loop ground when it goes off screen
    if (getCustomProperty(ground, "--left") <= -300) {
      incrementCustomProperty(ground, "--left", 600)
    }
  })
}
