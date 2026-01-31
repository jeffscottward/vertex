import { world } from '../world'
import { Position, Velocity, Active } from '../traits'

/**
 * Movement system - updates positions based on velocities
 * Run in useFrame for all active entities with Position and Velocity
 */
export function movementSystem(delta: number) {
  for (const entity of world.query(Position, Velocity, Active)) {
    const pos = entity.get(Position)
    const vel = entity.get(Velocity)

    if (!pos || !vel) continue

    // Use entity.set() to properly update trait data
    entity.set(Position, {
      x: pos.x + vel.x * delta,
      y: pos.y + vel.y * delta,
      z: pos.z + vel.z * delta,
    })
  }
}
