import { world, deactivateProjectile, deactivateEnemy, activateProjectile } from '../world'
import { Position, Projectile, Active, Enemy } from '../traits'

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
    proj.progress = Math.min(proj.progress + progressIncrement, 1)

    // Lerp position
    pos.x = proj.startX + (proj.targetX - proj.startX) * proj.progress
    pos.y = proj.startY + (proj.targetY - proj.startY) * proj.progress
    pos.z = proj.startZ + (proj.targetZ - proj.startZ) * proj.progress

    // Check if projectile reached target
    if (proj.progress >= 1) {
      // Find target entity and deal damage
      if (proj.targetEntityId >= 0) {
        const targetEntity = getEntityById(proj.targetEntityId)
        if (targetEntity && targetEntity.has(Enemy) && targetEntity.has(Active)) {
          const enemy = targetEntity.get(Enemy)
          if (enemy) {
            enemy.health -= 1

            // TODO: Determine onBeat based on beat detection
            const hitResult = { entityId: proj.targetEntityId, onBeat: false }
            hits.push(hitResult)
            onHit?.(hitResult)

            // Destroy enemy if health depleted
            if (enemy.health <= 0) {
              deactivateEnemy(targetEntity)
              unregisterEntity(proj.targetEntityId)
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
  for (const targetId of lockedEntityIds) {
    const targetEntity = getEntityById(targetId)
    if (!targetEntity || !targetEntity.has(Active)) continue

    const targetPos = targetEntity.get(Position)
    if (!targetPos) continue

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
