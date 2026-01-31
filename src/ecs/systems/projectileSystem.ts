import { world, deactivateProjectile, deactivateEnemy, activateProjectile } from '../world'
import { Position, Projectile, Active, Enemy } from '../traits'
import { spawnExplosion } from './explosionSystem'

// Enemy colors for explosions (match EnemyRenderer)
const ENEMY_COLORS = {
  basic: '#ff00ff',   // Bright magenta
  armored: '#ff66ff', // Light pink
  fast: '#cc00ff',    // Purple-magenta
}

interface HitResult {
  entityId: number
  onBeat: boolean
}

// Track entity IDs for target lookup
const entityIdMap = new Map<number, ReturnType<typeof world.spawn>>()

export function registerEntity(entity: ReturnType<typeof world.spawn>) {
  entityIdMap.set(entity.id(), entity)
}

export function unregisterEntity(entityId: number) {
  entityIdMap.delete(entityId)
}

export function getEntityById(entityId: number) {
  return entityIdMap.get(entityId)
}

/**
 * Projectile system - moves projectiles toward targets and detects hits
 * Returns array of hit results for score processing
 */
export function projectileSystem(
  delta: number,
  onHit?: (result: HitResult) => void
): HitResult[] {
  const hits: HitResult[] = []

  for (const entity of world.query(Position, Projectile, Active)) {
    const pos = entity.get(Position)
    const proj = entity.get(Projectile)

    if (!pos || !proj) continue

    // Update progress (0 to 1)
    const distance = Math.sqrt(
      Math.pow(proj.targetX - proj.startX, 2) +
      Math.pow(proj.targetY - proj.startY, 2) +
      Math.pow(proj.targetZ - proj.startZ, 2)
    )

    const progressIncrement = (proj.speed * delta) / Math.max(distance, 0.1)
    const newProgress = Math.min(proj.progress + progressIncrement, 1)

    // Update progress using entity.set()
    entity.set(Projectile, { ...proj, progress: newProgress })

    // Lerp position and update using entity.set()
    const newX = proj.startX + (proj.targetX - proj.startX) * newProgress
    const newY = proj.startY + (proj.targetY - proj.startY) * newProgress
    const newZ = proj.startZ + (proj.targetZ - proj.startZ) * newProgress
    entity.set(Position, { x: newX, y: newY, z: newZ })

    // Check if projectile reached target
    if (newProgress >= 1) {
      // Find target entity and deal damage
      if (proj.targetEntityId >= 0) {
        const targetEntity = getEntityById(proj.targetEntityId)
        if (targetEntity && targetEntity.has(Enemy) && targetEntity.has(Active)) {
          const enemy = targetEntity.get(Enemy)
          if (enemy) {
            const newHealth = enemy.health - 1
            targetEntity.set(Enemy, { ...enemy, health: newHealth })

            // TODO: Determine onBeat based on beat detection
            const hitResult = { entityId: proj.targetEntityId, onBeat: false }
            hits.push(hitResult)
            onHit?.(hitResult)

            // Destroy enemy if health depleted
            if (newHealth <= 0) {
              console.log(`💥 ~ projectileSystem → Enemy ${proj.targetEntityId} destroyed!`)
              // Spawn explosion at enemy position
              const enemyPos = targetEntity.get(Position)
              if (enemyPos) {
                const color = ENEMY_COLORS[enemy.type] || '#ff0044'
                spawnExplosion(enemyPos.x, enemyPos.y, enemyPos.z, color, 10)
              }

              deactivateEnemy(targetEntity)
              unregisterEntity(proj.targetEntityId)
            } else {
              console.log(`🎯 ~ projectileSystem → Hit enemy ${proj.targetEntityId}, health: ${newHealth}`)
            }
          }
        }
      }

      // Deactivate projectile
      deactivateProjectile(entity)
    }
  }

  return hits
}

/**
 * Fire projectiles at locked targets
 */
export function fireProjectiles(
  playerX: number,
  playerY: number,
  playerZ: number,
  lockedEntityIds: number[],
  projectileSpeed = 50
) {
  console.log(`🚀 ~ fireProjectiles → Firing at ${lockedEntityIds.length} targets from [${playerX.toFixed(1)}, ${playerY.toFixed(1)}, ${playerZ.toFixed(1)}]`)

  for (const targetId of lockedEntityIds) {
    const targetEntity = getEntityById(targetId)
    if (!targetEntity || !targetEntity.has(Active)) {
      console.log(`🚀 ~ fireProjectiles → Target ${targetId} not found or inactive`)
      continue
    }

    const targetPos = targetEntity.get(Position)
    if (!targetPos) {
      console.log(`🚀 ~ fireProjectiles → Target ${targetId} has no position`)
      continue
    }

    console.log(`🚀 ~ fireProjectiles → Launching projectile to [${targetPos.x.toFixed(1)}, ${targetPos.y.toFixed(1)}, ${targetPos.z.toFixed(1)}]`)

    activateProjectile(
      playerX,
      playerY,
      playerZ,
      targetPos.x,
      targetPos.y,
      targetPos.z,
      targetId,
      projectileSpeed
    )
  }
}
