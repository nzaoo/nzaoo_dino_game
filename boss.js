import { setCustomProperty, incrementCustomProperty, getCustomProperty } from "./updateCustomProperty.js"

const SPEED = 0.09, PROJECTILE_SPEED = 0.18
const BOSS_INTERVAL_SCORE = 2000, BOSS_DURATION = 6000, PROJECTILE_INTERVAL = 1200
const worldElem = document.querySelector("[data-world]")

let bossActive = false, bossTimeout = null, projectileIntervalId = null, projectiles = []

const getBoss = () => document.querySelector('[data-boss]')
const removeBoss = () => document.querySelectorAll('[data-boss]').forEach(b => b.remove())
const clearProjectiles = () => { projectiles.forEach(p => p.remove()); projectiles = [] }

function endBoss(onBossEnd) {
  removeBoss()
  bossActive = false
  onBossEnd?.()
  clearProjectiles()
  clearInterval(projectileIntervalId)
}

function spawnBoss() {
  removeBoss()
  const boss = Object.assign(document.createElement("img"), { src: "imgs/rock.png" })
  boss.dataset.boss = true
  boss.classList.add("boss")
  setCustomProperty(boss, "--left", 100)
  setCustomProperty(boss, "--bottom", 18)
  worldElem.append(boss)
}

function spawnProjectile() {
  const boss = getBoss()
  if (!boss) return
  const p = document.createElement('div')
  p.classList.add('boss-projectile')
  setCustomProperty(p, '--left', getCustomProperty(boss, '--left'))
  setCustomProperty(p, '--bottom', 20)
  worldElem.append(p)
  projectiles.push(p)
}

export function setupBoss() {
  endBoss()
  clearTimeout(bossTimeout)
}

export function updateBoss(delta, score, onBossStart, onBossEnd) {
  const floorScore = Math.floor(score)
  if (!bossActive && floorScore > 0 && floorScore % BOSS_INTERVAL_SCORE === 0) {
    spawnBoss()
    bossActive = true
    onBossStart?.()
    bossTimeout = setTimeout(() => endBoss(onBossEnd), BOSS_DURATION)
    projectileIntervalId = setInterval(() => bossActive && spawnProjectile(), PROJECTILE_INTERVAL)
  }

  const boss = getBoss()
  if (boss) {
    incrementCustomProperty(boss, "--left", -delta * SPEED)
    if (getCustomProperty(boss, "--left") <= -10) endBoss(onBossEnd)
  }

  projectiles.forEach(p => {
    incrementCustomProperty(p, "--left", -delta * PROJECTILE_SPEED)
    if (getCustomProperty(p, "--left") <= -10) p.remove()
  })
  projectiles = projectiles.filter(p => p.isConnected)
}

export const getBossRect = () => getBoss()?.getBoundingClientRect() ?? null
export const isBossActive = () => bossActive
export const getBossProjectiles = () => projectiles.map(p => p.getBoundingClientRect())