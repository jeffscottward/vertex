import { world } from '../world'
import { Position, Enemy, Active, Lockable } from '../traits'
import { registerEntity } from './projectileSystem'

interface LockOnConfig {
  maxLocks: number
  lockRange: number
  lockAngle: number // in radians, half-angle of cone
  lockBoxSize: number // Size of the 2D lock box (in screen-space units)
}

const DEFAULT_CONFIG: LockOnConfig = {
  maxLocks: 8,
  lockRange: 80,  // Increased for bigger tunnel
  lockAngle: Math.PI / 4, // 45 degrees
  lockBoxSize: 0.3, // Smaller box for precise targeting
}

/**
 * Lock-on system - updates which enemies are in lock-on range
 * and can be targeted by the player
 *
 * Uses a simpler approach: enemies within lock range and in front
 * of the player can be locked. The aim position biases which
 * enemies get priority (closer to aim = higher priority).
 */
export function lockOnSystem(
  playerX: number,
  playerY: number,
  playerZ: number,
  aimX: number,
  aimY: number,
  config: LockOnConfig = DEFAULT_CONFIG
) {
  const inRangeEntities: Array<{
    entity: ReturnType<typeof world.spawn>
    distance: number
    entityId: number
    aimScore: number // Lower = closer to aim, higher priority
  }> = []

  // First pass: determine which enemies are in range
  for (const entity of world.query(Position, Enemy, Active, Lockable)) {
    const pos = entity.get(Position)
    const lockable = entity.get(Lockable)

    if (!pos || !lockable) continue

    // Register entity for ID lookup
    registerEntity(entity)

    // Calculate distance to player
    const dx = pos.x - playerX
    const dy = pos.y - playerY
    const dz = pos.z - playerZ
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

    // Check if in range
    if (distance > config.lockRange) {
      entity.set(Lockable, { ...lockable, isInRange: false })
      continue
    }

    // Check if enemy is in front of player (negative z is forward)
    if (dz > 0) {
      entity.set(Lockable, { ...lockable, isInRange: false })
      continue
    }

    // Calculate screen-space position of enemy relative to player
    // Project onto XY plane, normalize by Z depth for perspective
    const depthFactor = Math.max(10, Math.abs(dz))
    const screenX = (dx / depthFactor) // Normalized screen position
    const screenY = (dy / depthFactor)

    // Calculate how close enemy is to the aim point
    // aimX and aimY are in -1 to 1 range (screen space)
    const aimDiffX = Math.abs(screenX - aimX)
    const aimDiffY = Math.abs(screenY - aimY)

    // ONLY lock enemies inside the lock box around the cursor
    const halfBox = config.lockBoxSize / 2
    if (aimDiffX > halfBox || aimDiffY > halfBox) {
      entity.set(Lockable, { ...lockable, isInRange: false })
      continue
    }

    const aimScore = Math.sqrt(aimDiffX * aimDiffX + aimDiffY * aimDiffY)

    // Enemy is in range AND inside lock box - mark as lockable
    entity.set(Lockable, { ...lockable, isInRange: true, lockPriority: distance })

    inRangeEntities.push({
      entity,
      distance,
      entityId: entity.id(),
      aimScore,
    })
  }

  return inRangeEntities
}

/**
 * Auto-lock nearest enemies up to max locks
 *
 * Priority: closest enemies that are near the aim direction
 */
export function autoLockTargets(
  playerX: number,
  playerY: number,
  playerZ: number,
  aimX: number,
  aimY: number,
  currentLocks: number[],
  config: LockOnConfig = DEFAULT_CONFIG
): number[] {
  const inRangeEntities = lockOnSystem(playerX, playerY, playerZ, aimX, aimY, config)

  // Sort by combination of distance and aim proximity
  // Weight distance more heavily, but prioritize enemies closer to aim
  inRangeEntities.sort((a, b) => {
    const scoreA = a.distance * 0.7 + a.aimScore * 0.3
    const scoreB = b.distance * 0.7 + b.aimScore * 0.3
    return scoreA - scoreB
  })

  // Build lock list
  const newLocks: number[] = []

  for (const { entity, entityId } of inRangeEntities) {
    if (newLocks.length >= config.maxLocks) break

    const lockable = entity.get(Lockable)
    if (!lockable) continue

    // Keep existing locks
    if (currentLocks.includes(entityId)) {
      newLocks.push(entityId)
      entity.set(Lockable, { ...lockable, isLocked: true })
      continue
    }

    // Add new lock if space available
    if (newLocks.length < config.maxLocks) {
      newLocks.push(entityId)
      entity.set(Lockable, { ...lockable, isLocked: true })
    }
  }

  // Clear locks on entities no longer in newLocks
  for (const entity of world.query(Lockable, Active)) {
    const lockable = entity.get(Lockable)
    if (!lockable) continue
    if (!newLocks.includes(entity.id())) {
      entity.set(Lockable, { ...lockable, isLocked: false })
    }
  }

  return newLocks
}

/**
 * Clear all locks
 */
export function clearAllLocks() {
  for (const entity of world.query(Lockable, Active)) {
    const lockable = entity.get(Lockable)
    if (lockable) {
      entity.set(Lockable, { ...lockable, isLocked: false })
    }
  }
}

/**
 * Get all currently locked entity IDs
 */
export function getLockedEntityIds(): number[] {
  const locked: number[] = []

  for (const entity of world.query(Lockable, Active)) {
    const lockable = entity.get(Lockable)
    if (lockable && lockable.isLocked) {
      locked.push(entity.id())
    }
  }

  return locked
}

/**
 * Get positions of locked entities (for rendering lock indicators)
 */
export function getLockedPositions(): Array<{ x: number; y: number; z: number; entityId: number }> {
  const positions: Array<{ x: number; y: number; z: number; entityId: number }> = []

  for (const entity of world.query(Position, Lockable, Active)) {
    const lockable = entity.get(Lockable)
    const pos = entity.get(Position)
    if (lockable && lockable.isLocked && pos) {
      positions.push({
        x: pos.x,
        y: pos.y,
        z: pos.z,
        entityId: entity.id(),
      })
    }
  }

  return positions
}

export { DEFAULT_CONFIG as LOCK_ON_CONFIG }
