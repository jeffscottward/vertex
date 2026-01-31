import { activateEnemy } from '../world'

// Enemy configuration
const ENEMY_CONFIGS = {
  basic: { speed: 15, color: '#ff0044', scale: 0.5 },
  armored: { speed: 8, color: '#ffaa00', scale: 0.8 },
  fast: { speed: 25, color: '#00ffaa', scale: 0.3 },
}

interface SpawnConfig {
  spawnRate: number // enemies per second
  enemySpeed: number // speed multiplier
  spawnDistance: number // how far ahead to spawn
}

let lastSpawnTime = 0

/**
 * Enemy spawn system - spawns enemies at regular intervals
 */
export function enemySpawnSystem(
  elapsedTime: number,
  playerZ: number,
  config: SpawnConfig
) {
  const spawnInterval = 1 / config.spawnRate

  if (elapsedTime - lastSpawnTime < spawnInterval) {
    return
  }

  lastSpawnTime = elapsedTime

  // Determine enemy type based on random distribution
  const rand = Math.random()
  let type: 'basic' | 'armored' | 'fast' = 'basic'
  if (rand > 0.85) type = 'armored'
  else if (rand > 0.7) type = 'fast'

  const enemyConfig = ENEMY_CONFIGS[type]

  // Calculate spawn position ahead of player
  const spawnZ = playerZ - config.spawnDistance
  const spawnX = (Math.random() - 0.5) * 30
  const spawnY = (Math.random() - 0.5) * 15 + 3

  // Calculate velocity (moving towards player)
  const vx = (Math.random() - 0.5) * 5
  const vy = (Math.random() - 0.5) * 2
  const vz = enemyConfig.speed * config.enemySpeed

  activateEnemy(type, spawnX, spawnY, spawnZ, vx, vy, vz)
}

/**
 * Reset spawn timer (call when game restarts)
 */
export function resetSpawnTimer() {
  lastSpawnTime = 0
}

export { ENEMY_CONFIGS }
