import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { world, Position, Enemy, Active, Lockable } from '../ecs'
import { useSettingsStore } from '../stores/settingsStore'

// Enemy visual configurations
const ENEMY_CONFIGS = {
  basic: { color: '#ff0044', scale: 0.5 },
  armored: { color: '#ffaa00', scale: 0.8 },
  fast: { color: '#00ffaa', scale: 0.3 },
}

// Shared geometries
const basicGeometry = new THREE.TetrahedronGeometry(1, 0)
const armoredGeometry = new THREE.OctahedronGeometry(1, 0)
const fastGeometry = new THREE.DodecahedronGeometry(1, 0)

// Shared materials
const basicMaterial = new THREE.MeshBasicMaterial({
  color: ENEMY_CONFIGS.basic.color,
  wireframe: true,
})
const armoredMaterial = new THREE.MeshBasicMaterial({
  color: ENEMY_CONFIGS.armored.color,
  wireframe: true,
})
const fastMaterial = new THREE.MeshBasicMaterial({
  color: ENEMY_CONFIGS.fast.color,
  wireframe: true,
})

// Lock indicator material
const lockMaterial = new THREE.MeshBasicMaterial({
  color: '#ff00ff',
  wireframe: true,
  transparent: true,
  opacity: 0.8,
})

const POOL_SIZE = 100

export function EnemyRenderer() {
  const graphicsSettings = useSettingsStore((state) => state.graphicsSettings)

  // Refs for instanced meshes
  const basicMeshRef = useRef<THREE.InstancedMesh>(null!)
  const armoredMeshRef = useRef<THREE.InstancedMesh>(null!)
  const fastMeshRef = useRef<THREE.InstancedMesh>(null!)

  // Temp objects for matrix updates
  const tempObject = useMemo(() => new THREE.Object3D(), [])

  // Track active counts for each type
  const countsRef = useRef({ basic: 0, armored: 0, fast: 0 })

  // Track locked positions for indicators
  const lockedPositionsRef = useRef<Array<{ x: number; y: number; z: number }>>([])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Reset counts
    countsRef.current.basic = 0
    countsRef.current.armored = 0
    countsRef.current.fast = 0
    lockedPositionsRef.current = []

    // Update instances from ECS
    for (const entity of world.query(Position, Enemy, Active)) {
      const pos = entity.get(Position)
      const enemy = entity.get(Enemy)

      if (!pos || !enemy) continue

      // Get appropriate mesh ref and config
      let meshRef: React.RefObject<THREE.InstancedMesh>
      let config: { scale: number }
      let index: number

      switch (enemy.type) {
        case 'basic':
          meshRef = basicMeshRef
          config = ENEMY_CONFIGS.basic
          index = countsRef.current.basic++
          break
        case 'armored':
          meshRef = armoredMeshRef
          config = ENEMY_CONFIGS.armored
          index = countsRef.current.armored++
          break
        case 'fast':
          meshRef = fastMeshRef
          config = ENEMY_CONFIGS.fast
          index = countsRef.current.fast++
          break
        default:
          continue
      }

      if (!meshRef.current) continue

      // Update matrix
      tempObject.position.set(pos.x, pos.y, pos.z)
      tempObject.rotation.x = time * 2 + index
      tempObject.rotation.y = time * 1.5 + index * 0.5
      tempObject.scale.setScalar(config.scale)
      tempObject.updateMatrix()

      meshRef.current.setMatrixAt(index, tempObject.matrix)

      // Track locked enemies for indicators
      if (entity.has(Lockable)) {
        const lockable = entity.get(Lockable)
        if (lockable && lockable.isLocked) {
          lockedPositionsRef.current.push({ x: pos.x, y: pos.y, z: pos.z })
        }
      }
    }

    // Update instance counts and matrices
    if (basicMeshRef.current) {
      basicMeshRef.current.count = countsRef.current.basic
      basicMeshRef.current.instanceMatrix.needsUpdate = true
    }
    if (armoredMeshRef.current) {
      armoredMeshRef.current.count = countsRef.current.armored
      armoredMeshRef.current.instanceMatrix.needsUpdate = true
    }
    if (fastMeshRef.current) {
      fastMeshRef.current.count = countsRef.current.fast
      fastMeshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  // Get locked positions for rendering indicators
  const lockedPositions = lockedPositionsRef.current

  return (
    <group name="enemy-renderer-root">
      {/* Basic enemies */}
      <instancedMesh
        ref={basicMeshRef}
        args={[basicGeometry, basicMaterial, POOL_SIZE]}
        name="enemy-basic-instances"
        frustumCulled={false}
      />

      {/* Armored enemies */}
      <instancedMesh
        ref={armoredMeshRef}
        args={[armoredGeometry, armoredMaterial, POOL_SIZE]}
        name="enemy-armored-instances"
        frustumCulled={false}
      />

      {/* Fast enemies */}
      <instancedMesh
        ref={fastMeshRef}
        args={[fastGeometry, fastMaterial, POOL_SIZE]}
        name="enemy-fast-instances"
        frustumCulled={false}
      />

      {/* Lock indicators - render on top of locked enemies */}
      {lockedPositions.map((pos, i) => (
        <mesh
          key={`lock-${i}`}
          position={[pos.x, pos.y, pos.z]}
          material={lockMaterial}
          name="enemy-lock-indicator"
        >
          <ringGeometry args={[0.8, 1, 6]} />
        </mesh>
      ))}

      {/* Point lights for enemies (limited by graphics settings) */}
      {graphicsSettings.enemyLights > 0 && lockedPositions.slice(0, graphicsSettings.enemyLights).map((pos, i) => (
        <pointLight
          key={`light-${i}`}
          position={[pos.x, pos.y, pos.z]}
          color="#ff00ff"
          intensity={0.5}
          distance={5}
        />
      ))}
    </group>
  )
}
