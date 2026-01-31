import { activateEnemy } from '../world'

// Enemy configuration
const ENEMY_CONFIGS = {
  basic: { speed: 8, color: '#ff0044', scale: 0.5 },
  armored: { speed: 5, color: '#ffaa00', scale: 0.8 },
  fast: { speed: 15, color: '#00ffaa', scale: 0.3 },
}

interface SpawnConfig {
  spawnRate: number // enemies per second
  enemySpeed: number // speed multiplier
  spawnDistance: number // how far ahead to spawn
}

// Wave system state
interface WaveState {
  currentWave: number
  enemiesInWave: number
  enemiesSpawned: number
  waveStartTime: number
  betweenWaves: boolean
  waveDelay: number
}

const waveState: WaveState = {
  currentWave: 0,
  enemiesInWave: 0,
  enemiesSpawned: 0,
  waveStartTime: 0,
  betweenWaves: true,
  waveDelay: 2, // seconds between waves
}

let lastSpawnTime = 0

// Wave definitions - progressive difficulty
function getWaveConfig(waveNumber: number) {
  const baseEnemies = 5
  const enemiesPerWave = baseEnemies + Math.floor(waveNumber * 1.5)

  // Increase enemy type variety as waves progress
  const armoredChance = Math.min(0.1 + waveNumber * 0.05, 0.4)
  const fastChance = Math.min(0.05 + waveNumber * 0.03, 0.3)

  return {
    enemyCount: enemiesPerWave,
    spawnInterval: Math.max(0.3, 1.0 - waveNumber * 0.05), // Spawn faster each wave
    armoredChance,
    fastChance,
  }
}

/**
 * Enemy spawn system - spawns enemies in waves with progressive difficulty
 */
export function enemySpawnSystem(
  elapsedTime: number,
  playerZ: number,
  config: SpawnConfig
) {
  // Handle wave transitions
  if (waveState.betweenWaves) {
    if (elapsedTime - waveState.waveStartTime >= waveState.waveDelay) {
      // Start new wave
      waveState.currentWave++
      waveState.betweenWaves = false
      waveState.enemiesSpawned = 0

      const waveConfig = getWaveConfig(waveState.currentWave)
      waveState.enemiesInWave = waveConfig.enemyCount
      waveState.waveStartTime = elapsedTime
    }
    return
  }

  // Check if wave is complete
  if (waveState.enemiesSpawned >= waveState.enemiesInWave) {
    waveState.betweenWaves = true
    waveState.waveStartTime = elapsedTime
    return
  }

  // Spawn enemies based on wave config
  const waveConfig = getWaveConfig(waveState.currentWave)
  const spawnInterval = waveConfig.spawnInterval / config.spawnRate

  if (elapsedTime - lastSpawnTime < spawnInterval) {
    return
  }

  lastSpawnTime = elapsedTime

  // Determine enemy type based on wave difficulty
  const rand = Math.random()
  let type: 'basic' | 'armored' | 'fast' = 'basic'
  if (rand < waveConfig.armoredChance) {
    type = 'armored'
  } else if (rand < waveConfig.armoredChance + waveConfig.fastChance) {
    type = 'fast'
  }

  const enemyConfig = ENEMY_CONFIGS[type]

  // Calculate spawn position ahead of player (in negative Z direction)
  // Spawn closer so enemies are visible (30-50 units ahead)
  const spawnZ = playerZ - (30 + Math.random() * 20)

  // Spawn in a spread pattern for variety
  const spreadX = 12 + waveState.currentWave * 0.5 // Wider spread in later waves
  const spreadY = 8 + waveState.currentWave * 0.3
  const spawnX = (Math.random() - 0.5) * spreadX
  const spawnY = (Math.random() - 0.5) * spreadY + 3 // Offset up from track center

  // Calculate velocity - enemies move towards player (positive Z)
  const vx = (Math.random() - 0.5) * 3
  const vy = (Math.random() - 0.5) * 1.5
  const vz = enemyConfig.speed * config.enemySpeed

  const entity = activateEnemy(type, spawnX, spawnY, spawnZ, vx, vy, vz)
  if (entity) {
    waveState.enemiesSpawned++
  }
}

/**
 * Reset spawn timer and wave state (call when game restarts)
 * Pass current elapsedTime to properly sync timers
 */
export function resetSpawnTimer(currentTime: number = 0) {
  lastSpawnTime = currentTime
  waveState.currentWave = 0
  waveState.enemiesInWave = 0
  waveState.enemiesSpawned = 0
  waveState.waveStartTime = currentTime
  waveState.betweenWaves = true
  waveState.waveDelay = 2
}

/**
 * Get current wave number
 */
export function getCurrentWave(): number {
  return waveState.currentWave
}

export { ENEMY_CONFIGS }
