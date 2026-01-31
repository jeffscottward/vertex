import { useState, useCallback, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'
import { Player } from './Player'
import { RailTrack } from './RailTrack'
import { EnemyRenderer } from './EnemyRenderer'
import { ProjectileRenderer } from './ProjectileRenderer'
import { EnemyProjectileRenderer } from './EnemyProjectileRenderer'
import { ExplosionRenderer } from './ExplosionRenderer'
import { PowerUpRenderer } from './PowerUpRenderer'
import { PostFX } from './PostFX'
import { useSettingsStore } from '../stores/settingsStore'
import { useIsPlaying, sendGameEvent, getGameContext } from '../hooks/useGameMachine'
import {
  initializeEntityPools,
  movementSystem,
  enemySpawnSystem,
  projectileSystem,
  despawnSystem,
  autoLockTargets,
  clearAllLocks,
  fireProjectiles,
  getLockedEntityIds,
  enemyShootSystem,
  enemyProjectileSystem,
  initEnemyProjectilePool,
  resetSpawnTimer,
  explosionSystem,
  initExplosionPool,
  powerUpSystem,
  initPowerUpPool,
  resetPowerUpSpawnTimer,
} from '../ecs'

export function Experience() {
  const { showOrbitControls, showStars } = useControls('Debug', {
    showOrbitControls: false,
    showStars: true,
  })

  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 2, 0))
  const [playerQuaternion, setPlayerQuaternion] = useState(new THREE.Quaternion())

  const isPlaying = useIsPlaying()
  const graphicsSettings = useSettingsStore((state) => state.graphicsSettings)
  const difficultySettings = useSettingsStore((state) => state.difficultySettings)

  // ECS state
  const initialized = useRef(false)
  const isLocking = useRef(false)
  const wasLocking = useRef(false)
  const wasPlaying = useRef(false)
  const aimPosition = useRef({ x: 0, y: 0 })
  const lockedTargets = useRef<number[]>([])
  const lastAutoFireTime = useRef(0)

  // Initialize entity pools
  if (!initialized.current) {
    initializeEntityPools()
    initEnemyProjectilePool()
    initExplosionPool()
    initPowerUpPool()
    initialized.current = true
  }

  // Track if we need to reset on next frame (when game starts)
  const needsSpawnReset = useRef(false)

  // Set flag when game starts
  useEffect(() => {
    if (isPlaying && !wasPlaying.current) {
      needsSpawnReset.current = true
    }
    wasPlaying.current = isPlaying
  }, [isPlaying])

  const handleProgressUpdate = useCallback((
    _progress: number,
    position: THREE.Vector3,
    quaternion: THREE.Quaternion
  ) => {
    setPlayerPosition(position.clone())
    setPlayerQuaternion(quaternion.clone())
  }, [])

  const handleFireStart = useCallback(() => {
    console.log('🔫 ~ Experience → Fire START (locking)')
    isLocking.current = true
    sendGameEvent({ type: 'FIRE_START' })
  }, [])

  const handleFireRelease = useCallback(() => {
    if (!isLocking.current) return

    isLocking.current = false
    const targets = getLockedEntityIds()

    console.log(`🔫 ~ Experience → Fire RELEASE with ${targets.length} targets locked`)

    // Fire projectiles at locked targets
    if (targets.length > 0) {
      fireProjectiles(
        playerPosition.x,
        playerPosition.y,
        playerPosition.z,
        targets,
        50
      )
    } else {
      console.log('🔫 ~ Experience → No targets locked!')
    }

    sendGameEvent({ type: 'FIRE_RELEASE', targetIds: targets })
    clearAllLocks()
    lockedTargets.current = []
  }, [playerPosition])

  const handleAimUpdate = useCallback((x: number, y: number) => {
    aimPosition.current = { x, y }
  }, [])

  // Main ECS game loop
  useFrame((state, delta) => {
    if (!isPlaying) return

    const elapsedTime = state.clock.elapsedTime

    // Reset spawn timer with current time when game starts
    if (needsSpawnReset.current) {
      resetSpawnTimer(elapsedTime)
      resetPowerUpSpawnTimer(elapsedTime)
      needsSpawnReset.current = false
    }

    // Movement system
    movementSystem(delta)

    // Enemy spawn system
    enemySpawnSystem(elapsedTime, playerPosition.z, {
      spawnRate: difficultySettings.enemySpawnRate,
      enemySpeed: difficultySettings.enemySpeed,
      spawnDistance: 80,
    })

    // Despawn system
    despawnSystem(playerPosition.z, 20)

    // Lock-on system - only when player is holding fire
    if (isLocking.current) {
      const previousLocks = lockedTargets.current
      lockedTargets.current = autoLockTargets(
        playerPosition.x,
        playerPosition.y,
        playerPosition.z,
        aimPosition.current.x,
        aimPosition.current.y,
        lockedTargets.current,
        { maxLocks: 8, lockRange: 80, lockAngle: Math.PI / 4, lockBoxSize: 0.15 }
      )

      // Sync new locks to game machine for UI display
      for (const id of lockedTargets.current) {
        if (!previousLocks.includes(id)) {
          sendGameEvent({ type: 'LOCK_TARGET', entityId: id })
        }
      }
      // Sync unlocks
      for (const id of previousLocks) {
        if (!lockedTargets.current.includes(id)) {
          sendGameEvent({ type: 'UNLOCK_TARGET', entityId: id })
        }
      }
    }

    // Projectile system with hit detection
    projectileSystem(delta, (result) => {
      sendGameEvent({ type: 'HIT', entityId: result.entityId, onBeat: result.onBeat })
    })

    // Enemy shooting system - enemies fire at player
    enemyShootSystem(elapsedTime, {
      playerX: playerPosition.x,
      playerY: playerPosition.y,
      playerZ: playerPosition.z,
      shootRange: 60,
      projectileSpeed: 8 * difficultySettings.enemySpeed, // Slowed down for dodging
    })

    // Enemy projectile system - update bullets and check hits
    enemyProjectileSystem(
      delta,
      playerPosition.x,
      playerPosition.y,
      playerPosition.z,
      2.0, // hit radius
      (damage) => {
        sendGameEvent({ type: 'PLAYER_HIT', damage })
      }
    )

    // Explosion particle system
    explosionSystem(delta)

    // Power-up system
    powerUpSystem(
      delta,
      elapsedTime,
      playerPosition.x,
      playerPosition.y,
      playerPosition.z,
      {
        onCollectShield: () => sendGameEvent({ type: 'COLLECT_SHIELD' }),
        onCollectOverdrive: () => sendGameEvent({ type: 'COLLECT_OVERDRIVE' }),
        onCollectMultiLock: () => sendGameEvent({ type: 'COLLECT_MULTILOCK' }),
      }
    )

    // Check shield expiration
    const context = getGameContext()
    if (context.shieldActive && Date.now() >= context.shieldEndTime) {
      sendGameEvent({ type: 'SHIELD_EXPIRED' })
    }

    // Check overdrive expiration
    if (context.overdriveActive && Date.now() >= context.overdriveEndTime) {
      sendGameEvent({ type: 'OVERDRIVE_EXPIRED' })
    }

    // Overdrive auto-fire mode - automatically lock and fire at enemies
    const now = Date.now()
    const autoFireCooldown = 200 // Fire every 200ms during overdrive
    if (context.overdriveActive && !isLocking.current && now - lastAutoFireTime.current >= autoFireCooldown) {
      // Auto-lock enemies in range (using wide area during overdrive)
      const autoTargets = autoLockTargets(
        playerPosition.x,
        playerPosition.y,
        playerPosition.z,
        0, // Center aim
        0,
        [],
        { maxLocks: 8, lockRange: 60, lockAngle: Math.PI, lockBoxSize: 2.0 } // Wide area lock
      )

      // Auto-fire at any enemies found
      if (autoTargets.length > 0) {
        fireProjectiles(
          playerPosition.x,
          playerPosition.y,
          playerPosition.z,
          autoTargets,
          60 // Faster projectiles during overdrive
        )
        clearAllLocks()
        lastAutoFireTime.current = now
      }
    }

    wasLocking.current = isLocking.current
  })

  return (
    <group name="experience-root">
      {showOrbitControls && <OrbitControls makeDefault />}

      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 20, 10]} intensity={0.5} color="#ffffff" />

      {showStars && (
        <Stars
          radius={200}
          depth={100}
          count={graphicsSettings.starCount}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      )}

      {isPlaying && (
        <RailTrack onProgressUpdate={handleProgressUpdate} />
      )}

      <Player
        railPosition={isPlaying ? playerPosition : undefined}
        railQuaternion={isPlaying ? playerQuaternion : undefined}
        onFireStart={handleFireStart}
        onFireRelease={handleFireRelease}
        onAimUpdate={handleAimUpdate}
      />

      {isPlaying && (
        <>
          <EnemyRenderer />
          <ProjectileRenderer />
          <EnemyProjectileRenderer />
          <ExplosionRenderer />
          <PowerUpRenderer />
        </>
      )}

      <fog attach="fog" args={['#000000', 50, 200]} />

      {graphicsSettings.postProcessing && <PostFX />}
    </group>
  )
}
