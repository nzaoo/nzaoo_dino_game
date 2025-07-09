import {
  incrementCustomProperty,
  setCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"

const dinoElem = document.querySelector("[data-dino]")
const JUMP_SPEED = 0.38
const GRAVITY = 0.0015
const DINO_FRAME_COUNT = 2
const FRAME_TIME = 100
const jumpSound = new Audio("imgs/jump.wav")

let isJumping
let isHoldingJump
let dinoFrame
let currentFrameTime
let yVelocity
const MAX_JUMP_HOLD_TIME = 220
let jumpHoldTime = 0

export function setupDino() {
  const dino = document.querySelector('[data-dino]')
  const selectedCharacter = localStorage.getItem('selectedCharacter') || 'green'
  // Sử dụng hình ảnh có sẵn thay vì những file không tồn tại
  if (selectedCharacter === 'red') {
    dino.src = 'imgs/dino-run-0.png' // Sử dụng dino-run-0.png thay vì dino-red.png
  } else if (selectedCharacter === 'yellow') {
    dino.src = 'imgs/dino-run-1.png' // Sử dụng dino-run-1.png thay vì dino-yellow.png
  } else {
    dino.src = 'imgs/dino-run-0.png'
  }
  isJumping = false
  isHoldingJump = false
  dinoFrame = 0
  currentFrameTime = 0
  yVelocity = 0
  jumpHoldTime = 0
  setCustomProperty(dinoElem, "--bottom", 0)
  document.removeEventListener("keydown", onJump)
  document.removeEventListener("keyup", onJumpRelease)
  document.addEventListener("keydown", onJump)
  document.addEventListener("keyup", onJumpRelease)
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
}

function handleRun(delta, speedScale) {
  if (isJumping) {
    dinoElem.src = `imgs/dino-stationary.png`
    return
  }

  if (currentFrameTime >= FRAME_TIME) {
    dinoFrame = (dinoFrame + 1) % DINO_FRAME_COUNT
    dinoElem.src = `imgs/dino-run-${dinoFrame}.png`
    currentFrameTime -= FRAME_TIME
  }
  currentFrameTime += delta * speedScale
}

function handleJump(delta) {
  if (!isJumping) return
  if (dinoFrame === 0) {
    try {
      jumpSound.currentTime = 0, jumpSound.play()
    } catch (e) {
      console.log('Could not play jump sound')
    }
  }

  incrementCustomProperty(dinoElem, "--bottom", yVelocity * delta)

  if (getCustomProperty(dinoElem, "--bottom") <= 0) {
    setCustomProperty(dinoElem, "--bottom", 0)
    isJumping = false
    isHoldingJump = false
    jumpHoldTime = 0
  }

  if (isHoldingJump && jumpHoldTime < MAX_JUMP_HOLD_TIME) {
    yVelocity -= (GRAVITY * 0.7) * delta
    jumpHoldTime += delta
  } else {
    yVelocity -= GRAVITY * delta
  }
}

function onJump(e) {
  if (e.code !== "Space" || isJumping) return
  yVelocity = JUMP_SPEED * (window.jumpPower || 1)
  isJumping = true
  isHoldingJump = true
  jumpHoldTime = 0
}

function onJumpRelease(e) {
  if (e.code !== "Space") return
  isHoldingJump = false
}
