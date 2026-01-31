import { useState, useCallback, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'
import { Player } from './Player'
import { RailTrack } from './RailTrack'
import { EnemyRenderer } from './EnemyRenderer'
import { ProjectileRenderer } from './ProjectileRenderer'
import { EnemyProjectileRenderer } from './EnemyProjectileRenderer'
import { PostFX } from './PostFX'
import { useSettingsStore } from '../stores/settingsStore'
import { useIsPlaying, sendGameEvent } from '../hooks/useGameMachine'
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
  const aimPosition = useRef({ x: 0, y: 0 })
  const lockedTargets = useRef<number[]>([])

  // Initialize entity pools
  if (!initialized.current) {
    initializeEntityPools()
    initEnemyProjectilePool()
    initialized.current = true
  }

  const handleProgressUpdate = useCallback((
    _progress: number,
    position: THREE.Vector3,
    quaternion: THREE.Quaternion
  ) => {
    setPlayerPosition(position.clone())
    setPlayerQuaternion(quaternion.clone())
  }, [])

  const handleFireStart = useCallback(() => {
    isLocking.current = true
    sendGameEvent({ type: 'FIRE_START' })
  }, [])

  const handleFireRelease = useCallback(() => {
    if (!isLocking.current) return

    isLocking.current = false
    const targets = getLockedEntityIds()

    // Fire projectiles at locked targets
    if (targets.length > 0) {
      fireProjectiles(
        playerPosition.x,
        playerPosition.y,
        playerPosition.z,
        targets,
        50
      )
    }

    sendGameEvent({ type: 'FIRE_RELEASE', targetIds: targets })
    clearAllLocks()
    lockedTargets.current = []
  }, [playerPosition])

  const handleAimUpdate = useCallback((x: number, y: number) => {
    aimPosition.current = { x, y }
  }, [])

  // Main ECS game loop
  useFrame((state) => {
    if (!isPlaying) return

    const delta = state.clock.getDelta()
    const elapsedTime = state.clock.elapsedTime

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
      lockedTargets.current = autoLockTargets(
        playerPosition.x,
        playerPosition.y,
        playerPosition.z,
        aimPosition.current.x,
        aimPosition.current.y,
        lockedTargets.current,
        { maxLocks: 8, lockRange: 60, lockAngle: Math.PI / 4 }
      )
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
      projectileSpeed: 25 * difficultySettings.enemySpeed,
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
        </>
      )}

      <fog attach="fog" args={['#000000', 50, 200]} />

      {graphicsSettings.postProcessing && <PostFX />}
    </group>
  )
}
