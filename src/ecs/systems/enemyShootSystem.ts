import { world, Position, Enemy, Active, EnemyProjectile, CanShoot } from '../index'

interface ShootConfig {
  playerX: number
  playerY: number
  playerZ: number
  shootRange: number // Max distance to shoot at player
  projectileSpeed: number
}

// Pool of enemy projectile entities
const PROJECTILE_POOL_SIZE = 50
let projectilePool: ReturnType<typeof world.spawn>[] = []
let poolInitialized = false

/**
 * Initialize the enemy projectile pool
 */
export function initEnemyProjectilePool() {
  if (poolInitialized) return

  for (let i = 0; i < PROJECTILE_POOL_SIZE; i++) {
    const entity = world.spawn(
      Position,
      EnemyProjectile,
    )
    // Start inactive by not adding Active trait
    projectilePool.push(entity)
  }
  poolInitialized = true
}

/**
 * Activate an enemy projectile from the pool
 */
function fireEnemyProjectile(
  startX: number, startY: number, startZ: number,
  targetX: number, targetY: number, targetZ: number,
  speed: number
) {
  // Find inactive projectile
  for (const entity of projectilePool) {
    if (!entity.has(Active)) {
      entity.add(Active)

      const pos = entity.get(Position)
      const proj = entity.get(EnemyProjectile)

      if (pos && proj) {
        pos.x = startX
        pos.y = startY
        pos.z = startZ

        proj.startX = startX
        proj.startY = startY
        proj.startZ = startZ
        proj.targetX = targetX
        proj.targetY = targetY
        proj.targetZ = targetZ
        proj.progress = 0
        proj.speed = speed
      }
      return entity
    }
  }
  return null
}

/**
 * Enemy shooting system - makes enemies shoot at the player
 */
export function enemyShootSystem(
  elapsedTime: number,
  config: ShootConfig
) {
  initEnemyProjectilePool()

  const { playerX, playerY, playerZ, shootRange, projectileSpeed } = config

  // Process enemies that can shoot
  for (const entity of world.query(Position, Enemy, Active, CanShoot)) {
    const pos = entity.get(Position)
    const shooter = entity.get(CanShoot)

    if (!pos || !shooter) continue

    // Check if enemy is in range
    const dx = playerX - pos.x
    const dy = playerY - pos.y
    const dz = playerZ - pos.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    // Only shoot if in range and behind the player (enemy is ahead)
    if (dist > shootRange || pos.z > playerZ) continue

    // Check cooldown
    if (elapsedTime - shooter.lastShotTime < shooter.shotCooldown) continue

    // Random chance to shoot
    if (Math.random() > shooter.shotChance) continue

    // Fire!
    shooter.lastShotTime = elapsedTime

    // Lead the shot slightly based on distance
    const leadFactor = dist * 0.02
    const targetX = playerX + (Math.random() - 0.5) * 2 // slight inaccuracy
    const targetY = playerY + (Math.random() - 0.5) * 2
    const targetZ = playerZ + leadFactor

    fireEnemyProjectile(
      pos.x, pos.y, pos.z,
      targetX, targetY, targetZ,
      projectileSpeed
    )
  }
}

/**
 * Update enemy projectiles and check for player hits
 */
export function enemyProjectileSystem(
  delta: number,
  playerX: number,
  playerY: number,
  playerZ: number,
  hitRadius: number,
  onPlayerHit: (damage: number) => void
) {
  for (const entity of world.query(Position, EnemyProjectile, Active)) {
    const pos = entity.get(Position)
    const proj = entity.get(EnemyProjectile)

    if (!pos || !proj) continue

    // Update progress
    proj.progress += delta * proj.speed * 0.02

    if (proj.progress >= 1) {
      // Projectile reached target, deactivate
      entity.remove(Active)
      continue
    }

    // Interpolate position
    pos.x = proj.startX + (proj.targetX - proj.startX) * proj.progress
    pos.y = proj.startY + (proj.targetY - proj.startY) * proj.progress
    pos.z = proj.startZ + (proj.targetZ - proj.startZ) * proj.progress

    // Check collision with player
    const dx = playerX - pos.x
    const dy = playerY - pos.y
    const dz = playerZ - pos.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (dist < hitRadius) {
      // Hit the player!
      onPlayerHit(proj.damage)
      entity.remove(Active)
    }
  }
}

/**
 * Get all active enemy projectile positions for rendering
 */
export function getActiveEnemyProjectiles(): Array<{ x: number; y: number; z: number; progress: number }> {
  const projectiles: Array<{ x: number; y: number; z: number; progress: number }> = []

  for (const entity of world.query(Position, EnemyProjectile, Active)) {
    const pos = entity.get(Position)
    const proj = entity.get(EnemyProjectile)

    if (pos && proj) {
      projectiles.push({
        x: pos.x,
        y: pos.y,
        z: pos.z,
        progress: proj.progress,
      })
    }
  }

  return projectiles
}
