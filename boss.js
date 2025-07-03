import {
  setCustomProperty,
  incrementCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"

const SPEED = 0.09
const BOSS_INTERVAL_SCORE = 2000 // xuất hiện mỗi 2000 điểm
const BOSS_DURATION = 6000 // ms boss ở lại
const worldElem = document.querySelector("[data-world]")

let bossActive = false
let bossTimeout = null

export function setupBoss() {
  removeBoss()
  bossActive = false
  if (bossTimeout) clearTimeout(bossTimeout)
}

export function updateBoss(delta, score, onBossStart, onBossEnd) {
  if (!bossActive && Math.floor(score) > 0 && Math.floor(score) % BOSS_INTERVAL_SCORE === 0) {
    spawnBoss()
    bossActive = true
    onBossStart && onBossStart()
    bossTimeout = setTimeout(() => {
      removeBoss()
      bossActive = false
      onBossEnd && onBossEnd()
    }, BOSS_DURATION)
  }
  // Di chuyển boss nếu đang active
  const boss = document.querySelector('[data-boss]')
  if (boss) {
    incrementCustomProperty(boss, "--left", delta * SPEED * -1)
    if (getCustomProperty(boss, "--left") <= -10) {
      removeBoss()
      bossActive = false
      onBossEnd && onBossEnd()
    }
  }
}

export function getBossRect() {
  const boss = document.querySelector('[data-boss]')
  return boss ? boss.getBoundingClientRect() : null
}

export function isBossActive() {
  return bossActive
}

function spawnBoss() {
  removeBoss()
  const boss = document.createElement("img")
  boss.dataset.boss = true
  boss.src = "imgs/rock.png" // tạm dùng ảnh rock, sau sẽ thay bằng boss
  boss.classList.add("boss")
  setCustomProperty(boss, "--left", 100)
  setCustomProperty(boss, "--bottom", 18)
  worldElem.append(boss)
}

function removeBoss() {
  document.querySelectorAll('[data-boss]').forEach(boss => boss.remove())
} 