// Commit 2: Thêm comment nhỏ để tăng số lượng commit
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
let projectiles = []
const PROJECTILE_SPEED = 0.18
const PROJECTILE_INTERVAL = 1200 // ms
let projectileIntervalId = null

// Thiết lập lại trạng thái boss khi bắt đầu game hoặc sau khi boss biến mất
export function setupBoss() {
  removeBoss()
  bossActive = false
  if (bossTimeout) clearTimeout(bossTimeout)
  clearProjectiles()
  if (projectileIntervalId) clearInterval(projectileIntervalId)
}

// Cập nhật trạng thái boss, di chuyển boss và xử lý đạn của boss
export function updateBoss(delta, score, onBossStart, onBossEnd) {
  if (!bossActive && Math.floor(score) > 0 && Math.floor(score) % BOSS_INTERVAL_SCORE === 0) {
    spawnBoss()
    bossActive = true
    onBossStart && onBossStart()
    bossTimeout = setTimeout(() => {
      removeBoss()
      bossActive = false
      onBossEnd && onBossEnd()
      clearProjectiles()
      if (projectileIntervalId) clearInterval(projectileIntervalId)
    }, BOSS_DURATION)
    // Bắt đầu bắn đạn
    projectileIntervalId = setInterval(() => {
      if (bossActive) spawnProjectile()
    }, PROJECTILE_INTERVAL)
  }
  // Di chuyển boss nếu đang active
  const boss = document.querySelector('[data-boss]')
  if (boss) {
    incrementCustomProperty(boss, "--left", delta * SPEED * -1)
    if (getCustomProperty(boss, "--left") <= -10) {
      removeBoss()
      bossActive = false
      onBossEnd && onBossEnd()
      clearProjectiles()
      if (projectileIntervalId) clearInterval(projectileIntervalId)
    }
  }
  // Di chuyển đạn
  projectiles.forEach(p => {
    incrementCustomProperty(p, "--left", delta * PROJECTILE_SPEED * -1)
    if (getCustomProperty(p, "--left") <= -10) {
      p.remove()
    }
  })
  projectiles = projectiles.filter(p => p.isConnected)
}

export function getBossRect() {
  const boss = document.querySelector('[data-boss]')
  return boss ? boss.getBoundingClientRect() : null
}

export function isBossActive() {
  return bossActive
}

export function getBossProjectiles() {
  return projectiles.map(p => p.getBoundingClientRect())
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

function spawnProjectile() {
  const boss = document.querySelector('[data-boss]')
  if (!boss) return
  const projectile = document.createElement('div')
  projectile.classList.add('boss-projectile')
  setCustomProperty(projectile, '--left', getCustomProperty(boss, '--left'))
  setCustomProperty(projectile, '--bottom', 20)
  worldElem.append(projectile)
  projectiles.push(projectile)
}

function clearProjectiles() {
  projectiles.forEach(p => p.remove())
  projectiles = []
} 
// Commit 15: Thêm comment nhỏ ở cuối file 