import { createWorld } from 'koota'
import { Position, Velocity, Enemy, Projectile, Lockable, Active, Pooled, CanShoot } from './traits'

// Create the game world
export const world = createWorld()

// Pool sizes
const ENEMY_POOL_SIZE = 100
const PROJECTILE_POOL_SIZE = 50

// Pre-spawn pooled entities
let poolInitialized = false

export function initializeEntityPools() {
  if (poolInitialized) return
  poolInitialized = true

  // Pre-spawn enemies (inactive by default - no Active trait)
  for (let i = 0; i < ENEMY_POOL_SIZE; i++) {
    world.spawn(
      Position({ x: 0, y: 0, z: -1000 }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Enemy({ type: 'basic', health: 1, maxHealth: 1, spawnTime: 0 }),
      Lockable({ isInRange: false, isLocked: false, lockPriority: 0 }),
      Pooled({ poolId: `enemy-${i}` })
    )
  }

  // Pre-spawn projectiles (inactive by default)
  for (let i = 0; i < PROJECTILE_POOL_SIZE; i++) {
    world.spawn(
      Position({ x: 0, y: 0, z: -1000 }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Projectile({
        targetEntityId: -1,
        progress: 0,
        startX: 0,
        startY: 0,
        startZ: 0,
        targetX: 0,
        targetY: 0,
        targetZ: 0,
        speed: 50,
      }),
      Pooled({ poolId: `projectile-${i}` })
    )
  }

  console.log(`🚀 ~ file: world.ts:48 → initializeEntityPools → Initialized pools: ${ENEMY_POOL_SIZE} enemies, ${PROJECTILE_POOL_SIZE} projectiles`)
}

// Helper to get an inactive enemy from pool
export function getInactiveEnemy() {
  for (const entity of world.query(Enemy, Pooled)) {
    if (!entity.has(Active)) {
      return entity
    }
  }
  return null
}

// Helper to get an inactive projectile from pool
export function getInactiveProjectile() {
  for (const entity of world.query(Projectile, Pooled)) {
    if (!entity.has(Active)) {
      return entity
    }
  }
  return null
}

// Activate an enemy with given parameters
export function activateEnemy(
  type: 'basic' | 'armored' | 'fast',
  x: number,
  y: number,
  z: number,
  vx: number,
  vy: number,
  vz: number
) {
  const entity = getInactiveEnemy()
  if (!entity) return null

  const healthByType = { basic: 1, armored: 3, fast: 1 }

  // Use entity.set() to properly update trait data in Koota
  entity.set(Position, { x, y, z })
  entity.set(Velocity, { x: vx, y: vy, z: vz })
  entity.set(Enemy, {
    type,
    health: healthByType[type],
    maxHealth: healthByType[type],
    spawnTime: performance.now(),
  })
  entity.set(Lockable, {
    isInRange: false,
    isLocked: false,
    lockPriority: 0,
  })

  entity.add(Active)

  // Armored enemies can shoot, some basic enemies too (30% chance)
  const canShoot = type === 'armored' || (type === 'basic' && Math.random() < 0.3)
  if (canShoot) {
    if (!entity.has(CanShoot)) {
      entity.add(CanShoot)
    }
    const shooter = entity.get(CanShoot)
    if (shooter) {
      shooter.lastShotTime = 0
      shooter.shotCooldown = type === 'armored' ? 1.5 : 2.5
      shooter.shotChance = type === 'armored' ? 0.5 : 0.3
    }
  } else {
    // Remove CanShoot if present (from pool reuse)
    if (entity.has(CanShoot)) {
      entity.remove(CanShoot)
    }
  }

  return entity
}

// Deactivate an enemy (return to pool)
export function deactivateEnemy(entity: ReturnType<typeof world.spawn>) {
  if (!entity.has(Active)) return

  // Use entity.set() to properly update trait data
  entity.set(Position, { x: 0, y: 0, z: -1000 })
  entity.set(Lockable, { isInRange: false, isLocked: false, lockPriority: 0 })

  entity.remove(Active)
}

// Activate a projectile
export function activateProjectile(
  startX: number,
  startY: number,
  startZ: number,
  targetX: number,
  targetY: number,
  targetZ: number,
  targetEntityId: number,
  speed = 50
) {
  const entity = getInactiveProjectile()
  if (!entity) return null

  // Use entity.set() to properly update trait data
  entity.set(Position, { x: startX, y: startY, z: startZ })
  entity.set(Projectile, {
    startX,
    startY,
    startZ,
    targetX,
    targetY,
    targetZ,
    targetEntityId,
    progress: 0,
    speed,
  })

  entity.add(Active)

  return entity
}

// Deactivate a projectile (return to pool)
export function deactivateProjectile(entity: ReturnType<typeof world.spawn>) {
  if (!entity.has(Active)) return

  // Use entity.set() to properly update trait data
  entity.set(Position, { x: 0, y: 0, z: -1000 })

  entity.remove(Active)
}

export { ENEMY_POOL_SIZE, PROJECTILE_POOL_SIZE }
