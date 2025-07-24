// Commit 3: Thêm comment nhỏ để tăng số lượng commit
import {
  setCustomProperty,
  incrementCustomProperty,
  getCustomProperty,
  isObstacleTooCloseByLeft,
} from "./updateCustomProperty.js"

const SPEED = 0.05
const CACTUS_INTERVAL_MIN = 800
const CACTUS_INTERVAL_MAX = 2200
const worldElem = document.querySelector("[data-world]")

let nextCactusTime
// Thiết lập lại trạng thái chướng ngại vật (cactus) khi bắt đầu game
export function setupCactus() {
  nextCactusTime = CACTUS_INTERVAL_MIN
  document.querySelectorAll("[data-cactus]").forEach(cactus => {
    cactus.remove()
  })
}

// Cập nhật vị trí và sinh mới chướng ngại vật (cactus) theo thời gian
export function updateCactus(delta, speedScale) {
  document.querySelectorAll("[data-cactus]").forEach(cactus => {
    incrementCustomProperty(cactus, "--left", delta * speedScale * SPEED * -1)
    if (getCustomProperty(cactus, "--left") <= -100) {
      cactus.remove()
    }
  })

  if (nextCactusTime <= 0) {
    createCactus()
    nextCactusTime =
      randomNumberBetween(CACTUS_INTERVAL_MIN, CACTUS_INTERVAL_MAX) / speedScale
  }
  nextCactusTime -= delta
}

export function getCactusRects() {
  return [...document.querySelectorAll("[data-cactus]")].map(cactus => {
    return cactus.getBoundingClientRect()
  })
}

function createCactus() {
  const worldRect = document.querySelector('[data-world]').getBoundingClientRect()
  const minDistance = worldRect.width * 0.35
  // Lấy vị trí left (px) muốn spawn
  const newLeft = worldRect.right
  if (isObstacleTooCloseByLeft(newLeft, minDistance)) return // Không spawn nếu quá gần vật cản khác
  const cactus = document.createElement("img")
  cactus.dataset.cactus = true
  cactus.src = "imgs/cactus.png"
  cactus.classList.add("cactus")
  setCustomProperty(cactus, "--left", 100)
  worldElem.append(cactus)
}

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
