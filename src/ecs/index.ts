// World and entity management
export * from './world'

// Traits
export * from './traits'

// Systems
export { movementSystem } from './systems/movementSystem'
export { enemySpawnSystem, resetSpawnTimer, ENEMY_CONFIGS } from './systems/enemySpawnSystem'
export { projectileSystem, fireProjectiles, registerEntity, unregisterEntity, getEntityById } from './systems/projectileSystem'
export { despawnSystem } from './systems/despawnSystem'
export {
  lockOnSystem,
  autoLockTargets,
  clearAllLocks,
  getLockedEntityIds,
  getLockedPositions,
  LOCK_ON_CONFIG,
} from './systems/lockOnSystem'
export {
  enemyShootSystem,
  enemyProjectileSystem,
  getActiveEnemyProjectiles,
  initEnemyProjectilePool,
} from './systems/enemyShootSystem'
