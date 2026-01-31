import { world } from '../world'
import { Position, Velocity, Active, MovementPattern, Enemy } from '../traits'

// Track elapsed time for pattern calculations
let elapsedTime = 0

/**
 * Movement system - updates positions based on velocities and movement patterns
 * Run in useFrame for all active entities with Position and Velocity
 */
export function movementSystem(delta: number) {
  elapsedTime += delta

  for (const entity of world.query(Position, Velocity, Active)) {
    const pos = entity.get(Position)
    const vel = entity.get(Velocity)

    if (!pos || !vel) continue

    // Base movement from velocity
    let newX = pos.x + vel.x * delta
    let newY = pos.y + vel.y * delta
    const newZ = pos.z + vel.z * delta

    // Apply movement pattern if entity has one
    if (entity.has(MovementPattern) && entity.has(Enemy)) {
      const pattern = entity.get(MovementPattern)
      if (pattern) {
        const t = elapsedTime * pattern.frequency + pattern.phase

        switch (pattern.type) {
          case 'sine':
            // Horizontal sine wave
            newX += Math.sin(t) * pattern.amplitude * delta * 2
            break

          case 'zigzag':
            // Sharp zigzag movement
            newX += Math.sign(Math.sin(t * 2)) * pattern.amplitude * delta * 3
            break

          case 'circular':
            // Circular orbit around base position
            newX += Math.cos(t) * pattern.amplitude * delta
            newY += Math.sin(t) * pattern.amplitude * delta
            break

          case 'spiral':
            // Spiral inward/outward
            const spiralPhase = t * 0.5
            newX += Math.cos(spiralPhase) * pattern.amplitude * delta * Math.sin(t * 0.3)
            newY += Math.sin(spiralPhase) * pattern.amplitude * delta * Math.sin(t * 0.3)
            break

          case 'linear':
          default:
            // No pattern modification
            break
        }
      }
    }

    // Update position
    entity.set(Position, { x: newX, y: newY, z: newZ })
  }
}

/**
 * Reset elapsed time (call when game restarts)
 */
export function resetMovementTime() {
  elapsedTime = 0
}
