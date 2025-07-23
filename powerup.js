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
const POWERUP_TYPES = {
  invincibility: {
    icon: "imgs/cactus.png", // Sử dụng hình ảnh có sẵn
    effect: "invincibility"
  },
  score: {
    icon: "imgs/rock.png", // Sử dụng hình ảnh có sẵn
    effect: "score"
  },
  jump: {
    icon: "imgs/dino-run-0.png", // Sử dụng hình ảnh có sẵn
    effect: "jump"
  },
  fly: {
    icon: "", // Sẽ dùng CSS, không có icon
    effect: "fly"
  }
}
const worldElem = document.querySelector("[data-world]")

let nextPowerupTime
let isInvincible = false
let invincibleTimeout = null

// Thiết lập lại trạng thái powerup khi bắt đầu game
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
      const type = pu.dataset.powerup
      pu.remove()
      if (type === "invincibility") {
        onGetPowerup && onGetPowerup()
        window.dispatchEvent(new CustomEvent("powerup:invincibility"))
      } else if (type === "score") {
        // Tăng điểm
        window.dispatchEvent(new CustomEvent("powerup:score"))
      } else if (type === "jump") {
        window.dispatchEvent(new CustomEvent("powerup:jump"))
      } else if (type === "fly") {
        window.dispatchEvent(new CustomEvent("powerup:fly"))
      }
    }
  })
}

export function getIsInvincible() {
  return isInvincible
}

function createPowerup() {
  const types = Object.keys(POWERUP_TYPES)
  const type = types[Math.floor(Math.random() * types.length)]
  let pu
  if (type === 'fly') {
    pu = document.createElement('div')
    pu.classList.add('powerup', 'powerup-fly')
  } else {
    pu = document.createElement('img')
    pu.src = POWERUP_TYPES[type].icon
    pu.classList.add('powerup')
  }
  pu.dataset.powerup = type
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