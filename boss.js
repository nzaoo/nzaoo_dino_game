/**
 * DINO RUNNER - Boss Module
 * Handles boss spawning, movement, and projectiles
 */

import {
  setCustomProperty,
  incrementCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"

// ==================== CONSTANTS ====================
const BOSS_SPEED = 0.09
const PROJECTILE_SPEED = 0.18
const BOSS_INTERVAL_SCORE = 2000
const BOSS_DURATION = 6000
const PROJECTILE_INTERVAL = 1200

// ==================== DOM ELEMENTS ====================
const worldElem = document.querySelector("[data-world]")

// ==================== STATE ====================
let bossActive = false
let bossTimeout = null
let projectileIntervalId = null
let projectiles = []

// ==================== PUBLIC FUNCTIONS ====================
export function setupBoss() {
  endBoss()
  clearTimeout(bossTimeout)
  bossTimeout = null
}

export function updateBoss(delta, score, onBossStart, onBossEnd) {
  const floorScore = Math.floor(score)
  
  // Check if boss should spawn
  if (!bossActive && floorScore > 0 && floorScore % BOSS_INTERVAL_SCORE === 0) {
    spawnBoss()
    bossActive = true
    onBossStart?.()
    
    // Set boss end timer
    bossTimeout = setTimeout(() => endBoss(onBossEnd), BOSS_DURATION)
    
    // Start projectile spawning
    projectileIntervalId = setInterval(() => {
      if (bossActive) spawnProjectile()
    }, PROJECTILE_INTERVAL)
  }
  
  // Update boss position
  const boss = getBossElement()
  if (boss) {
    incrementCustomProperty(boss, "--left", -delta * BOSS_SPEED)
    
    if (getCustomProperty(boss, "--left") <= -10) {
      endBoss(onBossEnd)
    }
  }
  
  // Update projectiles
  updateProjectiles(delta)
}

export function getBossRect() {
  const boss = getBossElement()
  return boss?.getBoundingClientRect() ?? null
}

export function isBossActive() {
  return bossActive
}

export function getBossProjectiles() {
  return projectiles
    .filter(p => p.isConnected)
    .map(p => p.getBoundingClientRect())
}

// ==================== PRIVATE FUNCTIONS ====================
function getBossElement() {
  return document.querySelector('[data-boss]')
}

function removeBoss() {
  document.querySelectorAll('[data-boss]').forEach(b => b.remove())
}

function clearProjectiles() {
  projectiles.forEach(p => p.remove())
  projectiles = []
}

function endBoss(onBossEnd) {
  removeBoss()
  bossActive = false
  clearProjectiles()
  clearInterval(projectileIntervalId)
  projectileIntervalId = null
  onBossEnd?.()
}

function spawnBoss() {
  removeBoss()
  
  const boss = document.createElement("img")
  boss.src = "imgs/rock.png"
  boss.dataset.boss = true
  boss.classList.add("boss")
  
  setCustomProperty(boss, "--left", 100)
  setCustomProperty(boss, "--bottom", 18)
  
  worldElem.append(boss)
}

function spawnProjectile() {
  const boss = getBossElement()
  if (!boss) return
  
  const projectile = document.createElement('div')
  projectile.classList.add('boss-projectile')
  
  setCustomProperty(projectile, '--left', getCustomProperty(boss, '--left'))
  setCustomProperty(projectile, '--bottom', 20)
  
  worldElem.append(projectile)
  projectiles.push(projectile)
}

function updateProjectiles(delta) {
  projectiles.forEach(p => {
    incrementCustomProperty(p, "--left", -delta * PROJECTILE_SPEED)
    
    if (getCustomProperty(p, "--left") <= -10) {
      p.remove()
    }
  })
  
  // Clean up removed projectiles
  projectiles = projectiles.filter(p => p.isConnected)
}
