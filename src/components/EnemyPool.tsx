import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useGameStore } from '../stores/gameStore'
import { useSettingsStore } from '../stores/settingsStore'

export interface Enemy {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  health: number
  type: 'basic' | 'armored' | 'fast'
  active: boolean
  spawnTime: number
}

interface EnemyPoolProps {
  playerPosition: THREE.Vector3
  onUnregisterTarget?: (id: string) => void
}

const POOL_SIZE = 100

const ENEMY_CONFIGS = {
  basic: { health: 1, speed: 15, color: '#ff0044', scale: 0.5 },
  armored: { health: 3, speed: 8, color: '#ffaa00', scale: 0.8 },
  fast: { health: 1, speed: 25, color: '#00ffaa', scale: 0.3 },
}

export function EnemyPool({ playerPosition, onUnregisterTarget }: EnemyPoolProps) {
  const enemies = useRef<Enemy[]>([])
  const tempObject = useMemo(() => new THREE.Object3D(), [])

  const difficultySettings = useSettingsStore((state) => state.difficultySettings)
  const graphicsSettings = useSettingsStore((state) => state.graphicsSettings)

  const { spawnDistance, despawnDistance } = useControls('Enemies', {
    spawnDistance: { value: 80, min: 30, max: 150, step: 10 },
    despawnDistance: { value: 20, min: 5, max: 50, step: 5 },
  })

  const lastSpawnTime = useRef(0)
  const gameState = useGameStore((state) => state.gameState)

  useEffect(() => {
    enemies.current = Array.from({ length: POOL_SIZE }, (_, i) => ({
      id: `enemy-${i}`,
      position: new THREE.Vector3(0, 0, -1000),
      velocity: new THREE.Vector3(0, 0, 1),
      health: 1,
      type: 'basic',
      active: false,
      spawnTime: 0,
    }))
  }, [])

  const getInactiveEnemy = () => enemies.current.find(e => !e.active)

  const spawnEnemy = (type: 'basic' | 'armored' | 'fast' = 'basic') => {
    const enemy = getInactiveEnemy()
    if (!enemy) return null

    const config = ENEMY_CONFIGS[type]

    const spawnPos = playerPosition.clone()
    spawnPos.z -= spawnDistance
    spawnPos.x += (Math.random() - 0.5) * 30
    spawnPos.y += (Math.random() - 0.5) * 15 + 3

    enemy.position.copy(spawnPos)
    enemy.velocity.set(
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 2,
      config.speed * difficultySettings.enemySpeed
    )
    enemy.health = config.health
    enemy.type = type
    enemy.active = true
    enemy.spawnTime = performance.now()

    return enemy
  }

  const despawnEnemy = (enemy: Enemy) => {
    enemy.active = false
    enemy.position.set(0, 0, -1000)
    onUnregisterTarget?.(enemy.id)
  }

  useFrame((state, delta) => {
    if (gameState !== 'playing') return

    const time = state.clock.elapsedTime

    if (time - lastSpawnTime.current > 1 / difficultySettings.enemySpawnRate) {
      lastSpawnTime.current = time

      const rand = Math.random()
      let type: 'basic' | 'armored' | 'fast' = 'basic'
      if (rand > 0.85) type = 'armored'
      else if (rand > 0.7) type = 'fast'

      spawnEnemy(type)
    }

    enemies.current.forEach((enemy, index) => {
      if (!enemy.active) return

      enemy.position.addScaledVector(enemy.velocity, delta)

      if (enemy.position.z > playerPosition.z + despawnDistance) {
        despawnEnemy(enemy)
        return
      }

      tempObject.position.copy(enemy.position)
      tempObject.rotation.x = time * 2 + index
      tempObject.rotation.y = time * 1.5 + index * 0.5

      const config = ENEMY_CONFIGS[enemy.type]
      tempObject.scale.setScalar(config.scale)
      tempObject.updateMatrix()
    })
  })

  const activeEnemies = enemies.current.filter(e => e.active)
  const basicEnemies = activeEnemies.filter(e => e.type === 'basic')
  const armoredEnemies = activeEnemies.filter(e => e.type === 'armored')
  const fastEnemies = activeEnemies.filter(e => e.type === 'fast')

  return (
    <group name="enemy-pool-root">
      <Instances name="enemy-basic-instances" limit={POOL_SIZE}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={ENEMY_CONFIGS.basic.color} wireframe />
        {basicEnemies.map((enemy) => (
          <Instance key={enemy.id} position={enemy.position.toArray()} scale={ENEMY_CONFIGS.basic.scale} />
        ))}
      </Instances>

      <Instances name="enemy-armored-instances" limit={POOL_SIZE}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={ENEMY_CONFIGS.armored.color} wireframe />
        {armoredEnemies.map((enemy) => (
          <Instance key={enemy.id} position={enemy.position.toArray()} scale={ENEMY_CONFIGS.armored.scale} />
        ))}
      </Instances>

      <Instances name="enemy-fast-instances" limit={POOL_SIZE}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={ENEMY_CONFIGS.fast.color} wireframe />
        {fastEnemies.map((enemy) => (
          <Instance key={enemy.id} position={enemy.position.toArray()} scale={ENEMY_CONFIGS.fast.scale} />
        ))}
      </Instances>

      {activeEnemies.slice(0, graphicsSettings.enemyLights).map((enemy) => (
        <pointLight
          key={`light-${enemy.id}`}
          position={enemy.position.toArray()}
          color={ENEMY_CONFIGS[enemy.type].color}
          intensity={0.5}
          distance={5}
        />
      ))}
    </group>
  )
}
