import {
  setCustomProperty,
  incrementCustomProperty,
  getCustomProperty,
  isObstacleTooCloseByLeft,
} from "./updateCustomProperty.js"

const SPEED = 0.07
const BIRD_INTERVAL_MIN = 3500
const BIRD_INTERVAL_MAX = 7000
const BIRD_HEIGHTS = [5, 12, 20] // các độ cao khác nhau
const worldElem = document.querySelector("[data-world]")

let nextBirdTime

export function setupBird() {
  nextBirdTime = BIRD_INTERVAL_MIN
  document.querySelectorAll("[data-bird]").forEach(bird => {
    bird.remove()
  })
}

export function updateBird(delta, speedScale) {
  document.querySelectorAll("[data-bird]").forEach(bird => {
    incrementCustomProperty(bird, "--left", delta * speedScale * SPEED * -1)
    if (getCustomProperty(bird, "--left") <= -10) {
      bird.remove()
    }
  })

  if (nextBirdTime <= 0) {
    createBird()
    nextBirdTime = randomNumberBetween(BIRD_INTERVAL_MIN, BIRD_INTERVAL_MAX) / speedScale
  }
  nextBirdTime -= delta
}

export function getBirdRects() {
  return [...document.querySelectorAll("[data-bird]")].map(bird => {
    return bird.getBoundingClientRect()
  })
}

function createBird() {
  const worldRect = document.querySelector('[data-world]').getBoundingClientRect()
  const minDistance = worldRect.width * 0.35
  const newLeft = worldRect.right
  if (isObstacleTooCloseByLeft(newLeft, minDistance)) return // Không spawn nếu quá gần vật cản khác
  const bird = document.createElement("img")
  bird.dataset.bird = true
  bird.src = "imgs/rock.png" // tạm dùng ảnh rock, sau sẽ thay bằng bird
  bird.classList.add("bird")
  setCustomProperty(bird, "--left", 100)
  // Chọn độ cao ngẫu nhiên
  const height = BIRD_HEIGHTS[Math.floor(Math.random() * BIRD_HEIGHTS.length)]
  setCustomProperty(bird, "--bottom", height)
  worldElem.append(bird)
}

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
} 