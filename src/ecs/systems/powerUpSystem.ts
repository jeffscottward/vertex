import { world } from '../world'
import { Position, Velocity, Active, PowerUp, type PowerUpType } from '../traits'

// Pool of power-up entities
const POWERUP_POOL_SIZE = 10
let poolInitialized = false
let powerUpPool: ReturnType<typeof world.spawn>[] = []

// Power-up spawn configuration
const SPAWN_INTERVAL_MIN = 15 // seconds (faster for testing)
const SPAWN_INTERVAL_MAX = 30 // seconds
const MAGNET_RANGE = 8 // units (larger magnet range)
const MAGNET_SPEED = 20 // units per second
const COLLECTION_RANGE = 3.0 // units (larger collection range)

// Power-up visual configuration (REZ-style: blue=overdrive, red=evolution/shield)
export const POWERUP_CONFIGS = {
  shield: { color: '#00ffff', scale: 0.8, label: 'SHIELD', description: 'A - Activate' },
  overdrive: { color: '#ff00ff', scale: 0.8, label: 'OVERDRIVE', description: 'S - Activate' },
  multilock: { color: '#ffff00', scale: 0.8, label: 'MULTI-LOCK', description: '16 Targets' },
}

// Spawn state
let lastSpawnTime = 0
let nextSpawnInterval = SPAWN_INTERVAL_MIN

/**
 * Initialize the power-up pool
 */
export function initPowerUpPool() {
  if (poolInitialized) return

  for (let i = 0; i < POWERUP_POOL_SIZE; i++) {
    const entity = world.spawn(
      Position,
      Velocity,
      PowerUp,
    )
    // Start inactive
    powerUpPool.push(entity)
  }
  poolInitialized = true
  console.log(`🚀 ~ file: powerUpSystem.ts:39 → initPowerUpPool → Initialized ${POWERUP_POOL_SIZE} power-ups`)
}

/**
 * Reset power-up spawn timer
 */
export function resetPowerUpSpawnTimer(currentTime: number = 0) {
  lastSpawnTime = currentTime
  nextSpawnInterval = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN)
}

/**
 * Get an inactive power-up from the pool
 */
function getInactivePowerUp() {
  for (const entity of powerUpPool) {
    if (!entity.has(Active)) {
      return entity
    }
  }
  return null
}

/**
 * Spawn a power-up at a given position
 */
export function spawnPowerUp(
  x: number,
  y: number,
  z: number,
  type: PowerUpType
) {
  initPowerUpPool()

  const entity = getInactivePowerUp()
  if (!entity) return null

  entity.set(Position, { x, y, z })
  entity.set(Velocity, { x: 0, y: 0, z: 0 })
  entity.set(PowerUp, {
    type,
    spawnTime: performance.now(),
    collected: false,
    magnetizing: false,
  })
  entity.add(Active)

  return entity
}

/**
 * Deactivate a power-up
 */
function deactivatePowerUp(entity: ReturnType<typeof world.spawn>) {
  if (!entity.has(Active)) return
  entity.set(Position, { x: 0, y: 0, z: -1000 })
  entity.remove(Active)
}

interface PowerUpCallbacks {
  onCollectShield: () => void
  onCollectOverdrive: () => void
  onCollectMultiLock: () => void
}

/**
 * Power-up system - handles spawning, magnetizing, and collecting
 */
export function powerUpSystem(
  delta: number,
  elapsedTime: number,
  playerX: number,
  playerY: number,
  playerZ: number,
  callbacks: PowerUpCallbacks
) {
  initPowerUpPool()

  // Check if it's time to spawn a new power-up
  if (elapsedTime - lastSpawnTime >= nextSpawnInterval) {
    lastSpawnTime = elapsedTime
    nextSpawnInterval = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN)

    // Spawn ahead of player
    const spawnZ = playerZ - (40 + Math.random() * 30)
    const spawnX = (Math.random() - 0.5) * 15
    const spawnY = 2 + Math.random() * 6

    // Random type weighted towards variety
    const rand = Math.random()
    let type: PowerUpType
    if (rand < 0.4) {
      type = 'shield'
    } else if (rand < 0.7) {
      type = 'overdrive'
    } else {
      type = 'multilock'
    }

    const spawned = spawnPowerUp(spawnX, spawnY, spawnZ, type)
    if (spawned) {
      console.log(`⭐ ~ powerUpSystem → Spawned ${type} at [${spawnX.toFixed(1)}, ${spawnY.toFixed(1)}, ${spawnZ.toFixed(1)}]`)
    }
  }

  // Update active power-ups
  for (const entity of world.query(Position, Velocity, PowerUp, Active)) {
    const pos = entity.get(Position)
    const vel = entity.get(Velocity)
    const powerUp = entity.get(PowerUp)

    if (!pos || !vel || !powerUp) continue

    // Calculate distance to player
    const dx = playerX - pos.x
    const dy = playerY - pos.y
    const dz = playerZ - pos.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    // Check for collection
    if (dist < COLLECTION_RANGE) {
      // Collected!
      console.log(`⭐ ~ powerUpSystem → Collected ${powerUp.type}! Distance was ${dist.toFixed(2)}`)
      switch (powerUp.type) {
        case 'shield':
          callbacks.onCollectShield()
          break
        case 'overdrive':
          callbacks.onCollectOverdrive()
          break
        case 'multilock':
          callbacks.onCollectMultiLock()
          break
      }
      deactivatePowerUp(entity)
      continue
    }

    // Magnetize if close enough
    if (dist < MAGNET_RANGE) {
      entity.set(PowerUp, { ...powerUp, magnetizing: true })

      // Move towards player
      const dirX = dx / dist
      const dirY = dy / dist
      const dirZ = dz / dist

      const speed = MAGNET_SPEED * (1 - dist / MAGNET_RANGE) + 5 // Faster when closer

      entity.set(Position, {
        x: pos.x + dirX * speed * delta,
        y: pos.y + dirY * speed * delta,
        z: pos.z + dirZ * speed * delta,
      })
    } else {
      // Gentle floating motion when not magnetizing
      if (powerUp.magnetizing) {
        entity.set(PowerUp, { ...powerUp, magnetizing: false })
      }

      // Small hover animation
      const hoverOffset = Math.sin(elapsedTime * 2 + pos.x) * 0.5
      entity.set(Position, {
        x: pos.x,
        y: pos.y + hoverOffset * delta,
        z: pos.z,
      })
    }

    // Despawn if too far behind player
    if (pos.z > playerZ + 30) {
      deactivatePowerUp(entity)
    }
  }
}

/**
 * Get all active power-ups for rendering
 */
export function getActivePowerUps(): Array<{
  x: number
  y: number
  z: number
  type: PowerUpType
  magnetizing: boolean
}> {
  const powerUps: Array<{
    x: number
    y: number
    z: number
    type: PowerUpType
    magnetizing: boolean
  }> = []

  for (const entity of world.query(Position, PowerUp, Active)) {
    const pos = entity.get(Position)
    const powerUp = entity.get(PowerUp)

    if (pos && powerUp) {
      powerUps.push({
        x: pos.x,
        y: pos.y,
        z: pos.z,
        type: powerUp.type,
        magnetizing: powerUp.magnetizing,
      })
    }
  }

  return powerUps
}
