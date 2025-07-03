import {
  setCustomProperty,
  incrementCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"

const SPEED = 0.05
const CACTUS_INTERVAL_MIN = 800
const CACTUS_INTERVAL_MAX = 2200
const worldElem = document.querySelector("[data-world]")

let nextCactusTime
export function setupCactus() {
  nextCactusTime = CACTUS_INTERVAL_MIN
  document.querySelectorAll("[data-cactus]").forEach(cactus => {
    cactus.remove()
  })
}

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
  const dino = document.querySelector('[data-dino]')
  const dinoRect = dino.getBoundingClientRect()
  const worldRect = document.querySelector('[data-world]').getBoundingClientRect()
  const minDistance = worldRect.width * 0.35
  // Kiểm tra tất cả vật cản (cactus + bird)
  const tooClose = [
    ...document.querySelectorAll('[data-cactus]'),
    ...document.querySelectorAll('[data-bird]')
  ].some(obs => {
    const rect = obs.getBoundingClientRect()
    return rect.left - dinoRect.right < minDistance && rect.left > dinoRect.right
  })
  if (tooClose) return // Không spawn nếu quá gần
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
