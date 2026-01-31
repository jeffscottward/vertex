import { world } from '../world'
import { Position, Velocity, Active, ExplosionParticle } from '../traits'

// Pool of explosion particles
const PARTICLE_POOL_SIZE = 200
let poolInitialized = false
let particlePool: ReturnType<typeof world.spawn>[] = []

/**
 * Initialize the explosion particle pool
 */
export function initExplosionPool() {
  if (poolInitialized) return

  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
    const entity = world.spawn(
      Position,
      Velocity,
      ExplosionParticle,
    )
    // Start inactive by not adding Active trait
    particlePool.push(entity)
  }
  poolInitialized = true
  console.log(`🚀 ~ file: explosionSystem.ts:22 → initExplosionPool → Initialized ${PARTICLE_POOL_SIZE} explosion particles`)
}

/**
 * Spawn explosion particles at a given position
 */
export function spawnExplosion(
  x: number,
  y: number,
  z: number,
  color: string = '#ff0044',
  particleCount: number = 10
) {
  initExplosionPool()

  let spawned = 0
  for (const entity of particlePool) {
    if (spawned >= particleCount) break
    if (entity.has(Active)) continue

    // Random velocity outward
    const speed = 5 + Math.random() * 10
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    const vx = Math.sin(phi) * Math.cos(theta) * speed
    const vy = Math.sin(phi) * Math.sin(theta) * speed
    const vz = Math.cos(phi) * speed

    entity.set(Position, { x, y, z })
    entity.set(Velocity, { x: vx, y: vy, z: vz })
    entity.set(ExplosionParticle, {
      startTime: performance.now(),
      lifetime: 0.4 + Math.random() * 0.2, // 0.4-0.6 seconds
      velocityX: vx,
      velocityY: vy,
      velocityZ: vz,
      color,
      scale: 0.2 + Math.random() * 0.2,
    })
    entity.add(Active)
    spawned++
  }

  return spawned
}

/**
 * Update explosion particles - fade out and deactivate
 */
export function explosionSystem(delta: number) {
  const currentTime = performance.now()

  for (const entity of world.query(Position, Velocity, ExplosionParticle, Active)) {
    const pos = entity.get(Position)
    const vel = entity.get(Velocity)
    const particle = entity.get(ExplosionParticle)

    if (!pos || !vel || !particle) continue

    // Check if particle has expired
    const elapsed = (currentTime - particle.startTime) / 1000
    if (elapsed >= particle.lifetime) {
      entity.remove(Active)
      continue
    }

    // Apply velocity with damping
    const damping = 0.95
    entity.set(Position, {
      x: pos.x + vel.x * delta,
      y: pos.y + vel.y * delta,
      z: pos.z + vel.z * delta,
    })
    entity.set(Velocity, {
      x: vel.x * damping,
      y: vel.y * damping,
      z: vel.z * damping,
    })
  }
}

/**
 * Get all active explosion particles for rendering
 */
export function getActiveExplosionParticles(): Array<{
  x: number
  y: number
  z: number
  color: string
  scale: number
  alpha: number
}> {
  const particles: Array<{
    x: number
    y: number
    z: number
    color: string
    scale: number
    alpha: number
  }> = []

  const currentTime = performance.now()

  for (const entity of world.query(Position, ExplosionParticle, Active)) {
    const pos = entity.get(Position)
    const particle = entity.get(ExplosionParticle)

    if (!pos || !particle) continue

    const elapsed = (currentTime - particle.startTime) / 1000
    const progress = elapsed / particle.lifetime
    const alpha = 1 - progress // Fade out
    const scale = particle.scale * (1 - progress * 0.5) // Shrink slightly

    particles.push({
      x: pos.x,
      y: pos.y,
      z: pos.z,
      color: particle.color,
      scale,
      alpha,
    })
  }

  return particles
}
