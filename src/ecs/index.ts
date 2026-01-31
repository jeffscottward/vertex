// World and entity management
export * from './world'

// Traits
export * from './traits'

// Systems
export { movementSystem } from './systems/movementSystem'
export { enemySpawnSystem, resetSpawnTimer, getCurrentWave, ENEMY_CONFIGS } from './systems/enemySpawnSystem'
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
export {
  explosionSystem,
  spawnExplosion,
  initExplosionPool,
  getActiveExplosionParticles,
} from './systems/explosionSystem'
export {
  powerUpSystem,
  spawnPowerUp,
  initPowerUpPool,
  getActivePowerUps,
  resetPowerUpSpawnTimer,
  POWERUP_CONFIGS,
} from './systems/powerUpSystem'
