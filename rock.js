import {
  setCustomProperty,
  incrementCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"

const SPEED = 0.05
const ROCK_INTERVAL_MIN = 1200
const ROCK_INTERVAL_MAX = 3000
const worldElem = document.querySelector("[data-world]")

let nextRockTime
export function setupRock() {
  nextRockTime = ROCK_INTERVAL_MIN
  document.querySelectorAll("[data-rock]").forEach(rock => {
    rock.remove()
  })
}

export function updateRock(delta, speedScale) {
  document.querySelectorAll("[data-rock]").forEach(rock => {
    incrementCustomProperty(rock, "--left", delta * speedScale * SPEED * -1)
    if (getCustomProperty(rock, "--left") <= -100) {
      rock.remove()
    }
  })

  if (nextRockTime <= 0) {
    createRock()
    nextRockTime =
      randomNumberBetween(ROCK_INTERVAL_MIN, ROCK_INTERVAL_MAX) / speedScale
  }
  nextRockTime -= delta
}

function createRock() {
  const dino = document.querySelector('[data-dino]')
  const dinoRect = dino.getBoundingClientRect()
  const worldRect = document.querySelector('[data-world]').getBoundingClientRect()
  const minDistance = worldRect.width * 0.35
  // Kiểm tra tất cả vật cản (cactus + bird + rock)
  const tooClose = [
    ...document.querySelectorAll('[data-cactus]'),
    ...document.querySelectorAll('[data-bird]'),
    ...document.querySelectorAll('[data-rock]')
  ].some(obs => {
    const rect = obs.getBoundingClientRect()
    return rect.left - dinoRect.right < minDistance && rect.left > dinoRect.right
  })
  if (tooClose) return // Không spawn nếu quá gần
  const rock = document.createElement("img")
  rock.dataset.rock = true
  rock.src = "imgs/rock.png"
  rock.classList.add("rock")
  setCustomProperty(rock, "--left", 100)
  worldElem.append(rock)
}

export function getRockRects() {
  return [...document.querySelectorAll("[data-rock]")].map(rock =>
    rock.getBoundingClientRect()
  )
}

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
} 