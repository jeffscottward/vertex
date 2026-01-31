import { world } from '../world'
import { Position, Enemy, Active, Lockable } from '../traits'
import { registerEntity } from './projectileSystem'

interface LockOnConfig {
  maxLocks: number
  lockRange: number
  lockAngle: number // in radians, half-angle of cone
}

const DEFAULT_CONFIG: LockOnConfig = {
  maxLocks: 8,
  lockRange: 60,
  lockAngle: Math.PI / 4, // 45 degrees
}

/**
 * Lock-on system - updates which enemies are in lock-on range
 * and can be targeted by the player
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
      lockable.isInRange = false
      continue
    }

    // Check if enemy is in front of player (negative z is forward)
    if (dz > 0) {
      lockable.isInRange = false
      continue
    }

    // Calculate angle from aim direction
    // Normalize direction to enemy
    const dirX = dx / distance
    const dirY = dy / distance

    // Simple 2D angle check from crosshair position
    const angleToEnemy = Math.atan2(
      Math.abs(dirX - aimX),
      Math.abs(dirY - aimY)
    )

    if (angleToEnemy > config.lockAngle) {
      lockable.isInRange = false
      continue
    }

    // Enemy is in range
    lockable.isInRange = true
    lockable.lockPriority = distance // Closer = higher priority

    inRangeEntities.push({
      entity,
      distance,
      entityId: entity.id(),
    })
  }

  return inRangeEntities
}

/**
 * Auto-lock nearest enemies up to max locks
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

  // Sort by distance (closest first)
  inRangeEntities.sort((a, b) => a.distance - b.distance)

  // Build lock list
  const newLocks: number[] = []

  for (const { entity, entityId } of inRangeEntities) {
    if (newLocks.length >= config.maxLocks) break

    const lockable = entity.get(Lockable)
    if (!lockable) continue

    // Skip if already locked
    if (currentLocks.includes(entityId)) {
      newLocks.push(entityId)
      lockable.isLocked = true
      continue
    }

    // Add new lock if space available
    if (newLocks.length < config.maxLocks) {
      newLocks.push(entityId)
      lockable.isLocked = true
    }
  }

  // Clear locks on entities no longer in newLocks
  for (const entity of world.query(Lockable, Active)) {
    const lockable = entity.get(Lockable)
    if (!lockable) continue
    if (!newLocks.includes(entity.id())) {
      lockable.isLocked = false
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
      lockable.isLocked = false
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
