/**
 * DINO RUNNER - Dino Character Module
 * Handles dino movement, jumping, and animations
 */

import {
  incrementCustomProperty,
  setCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"

// ==================== CONSTANTS ====================
const JUMP_SPEED = 0.38
const GRAVITY = 0.0015
const DINO_FRAME_COUNT = 2
const FRAME_TIME = 100
const MAX_JUMP_HOLD_TIME = 220

// ==================== DOM ELEMENTS ====================
const dinoElem = document.querySelector("[data-dino]")

// ==================== STATE ====================
let isJumping = false
let isHoldingJump = false
let dinoFrame = 0
let currentFrameTime = 0
let yVelocity = 0
let jumpHoldTime = 0

// ==================== AUDIO ====================
const jumpSound = new Audio("imgs/jump.wav")
jumpSound.addEventListener('error', () => console.log('Jump sound not found'))

// ==================== PUBLIC FUNCTIONS ====================
export function setupDino() {
  // Apply character selection
  applyCharacterSkin()
  
  // Reset state
  isJumping = false
  isHoldingJump = false
  dinoFrame = 0
  currentFrameTime = 0
  yVelocity = 0
  jumpHoldTime = 0
  
  // Reset position
  setCustomProperty(dinoElem, "--bottom", 0)
  
  // Reset effects
  dinoElem.classList.remove('jumping', 'invincible')
  dinoElem.style.filter = ''
  
  // Setup event listeners
  document.removeEventListener("keydown", onJump)
  document.removeEventListener("keyup", onJumpRelease)
  document.removeEventListener("touchstart", onTouchJump)
  document.removeEventListener("mousedown", onTouchJump)
  
  document.addEventListener("keydown", onJump)
  document.addEventListener("keyup", onJumpRelease)
  document.addEventListener("touchstart", onTouchJump, { passive: true })
  document.addEventListener("mousedown", onTouchJump)
}

export function updateDino(delta, speedScale) {
  handleRun(delta, speedScale)
  handleJump(delta)
}

export function getDinoRect() {
  return dinoElem.getBoundingClientRect()
}

export function setDinoLose() {
  dinoElem.src = "imgs/dino-lose.png"
  dinoElem.classList.remove('jumping', 'invincible')
}

export function setDinoInvincible(isInvincible) {
  if (isInvincible) {
    dinoElem.classList.add('invincible')
  } else {
    dinoElem.classList.remove('invincible')
    dinoElem.style.filter = ''
  }
}

// ==================== PRIVATE FUNCTIONS ====================
function applyCharacterSkin() {
  const selectedCharacter = localStorage.getItem('selectedCharacter') || 'green'
  
  switch (selectedCharacter) {
    case 'red':
      dinoElem.src = 'imgs/dino-red.png'
      break
    case 'yellow':
      dinoElem.src = 'imgs/dino-yellow.png'
      break
    default:
      dinoElem.src = 'imgs/dino-run-0.png'
  }
}

function handleRun(delta, speedScale) {
  if (isJumping) {
    dinoElem.src = `imgs/dino-stationary.png`
    return
  }
  
  if (currentFrameTime >= FRAME_TIME) {
    dinoFrame = (dinoFrame + 1) % DINO_FRAME_COUNT
    
    const selectedCharacter = localStorage.getItem('selectedCharacter') || 'green'
    if (selectedCharacter === 'green') {
      dinoElem.src = `imgs/dino-run-${dinoFrame}.png`
    }
    
    currentFrameTime -= FRAME_TIME
  }
  
  currentFrameTime += delta * speedScale
}

function handleJump(delta) {
  if (!isJumping) return
  
  // Update position
  incrementCustomProperty(dinoElem, "--bottom", yVelocity * delta)
  
  // Check if landed
  if (getCustomProperty(dinoElem, "--bottom") <= 0) {
    setCustomProperty(dinoElem, "--bottom", 0)
    isJumping = false
    isHoldingJump = false
    jumpHoldTime = 0
    dinoElem.classList.remove('jumping')
    return
  }
  
  // Apply gravity (with jump hold for higher jumps)
  if (isHoldingJump && jumpHoldTime < MAX_JUMP_HOLD_TIME) {
    yVelocity -= (GRAVITY * 0.7) * delta
    jumpHoldTime += delta
  } else {
    yVelocity -= GRAVITY * delta
  }
}

function performJump() {
  if (isJumping) return
  
  const jumpPower = window.jumpPower || 1
  yVelocity = JUMP_SPEED * jumpPower
  isJumping = true
  isHoldingJump = true
  jumpHoldTime = 0
  
  dinoElem.classList.add('jumping')
  
  // Play jump sound
  try {
    jumpSound.currentTime = 0
    jumpSound.play()
  } catch (e) {
    // Sound failed, continue silently
  }
}

// ==================== EVENT HANDLERS ====================
function onJump(e) {
  if (e.code !== "Space") return
  e.preventDefault()
  performJump()
}

function onJumpRelease(e) {
  if (e.code !== "Space") return
  isHoldingJump = false
}

function onTouchJump(e) {
  // Don't trigger jump on UI elements
  if (e.target.closest('.game-controls, .game-header, .start-screen, .menu-btn, button')) return
  performJump()
}
