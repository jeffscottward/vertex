import { world, deactivateEnemy } from '../world'
import { Position, Enemy, Active, Lockable } from '../traits'

/**
 * Despawn system - removes enemies that have passed the player
 */
export function despawnSystem(playerZ: number, despawnDistance: number) {
  for (const entity of world.query(Position, Enemy, Active)) {
    const pos = entity.get(Position)
    if (!pos) continue

    // Despawn if enemy is behind player by despawnDistance
    if (pos.z > playerZ + despawnDistance) {
      // Clear lock state before despawning
      if (entity.has(Lockable)) {
        const lockable = entity.get(Lockable)
        if (lockable) {
          lockable.isLocked = false
          lockable.isInRange = false
        }
      }

      deactivateEnemy(entity)
    }
  }
}
