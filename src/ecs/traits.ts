import { trait } from 'koota'

// Position in 3D space
export const Position = trait({ x: 0, y: 0, z: 0 })

// Velocity for movement
export const Velocity = trait({ x: 0, y: 0, z: 0 })

// Enemy component with type and state
export const Enemy = trait(() => ({
  type: 'basic' as 'basic' | 'armored' | 'fast',
  health: 1,
  maxHealth: 1,
  spawnTime: 0,
}))

// Projectile tracking its target and progress
export const Projectile = trait(() => ({
  targetEntityId: -1,
  progress: 0,
  startX: 0,
  startY: 0,
  startZ: 0,
  targetX: 0,
  targetY: 0,
  targetZ: 0,
  speed: 50,
}))

// Lockable entities can be targeted by the player
export const Lockable = trait(() => ({
  isInRange: false,
  isLocked: false,
  lockPriority: 0, // Lower = higher priority for auto-lock
}))

// Active tag for object pooling - only process active entities
export const Active = trait()

// Player-specific marker
export const IsPlayer = trait()

// Pool metadata for tracking entity origin
export const Pooled = trait(() => ({
  poolId: '',
}))

// Enemy projectile - bullets fired by enemies at the player
export const EnemyProjectile = trait(() => ({
  startX: 0,
  startY: 0,
  startZ: 0,
  targetX: 0,
  targetY: 0,
  targetZ: 0,
  progress: 0,
  speed: 30,
  damage: 10,
}))

// CanShoot tag - enemies that can fire projectiles
export const CanShoot = trait(() => ({
  lastShotTime: 0,
  shotCooldown: 2, // seconds between shots
  shotChance: 0.3, // probability of shooting when in range
}))
