import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { world, Position, Active } from '../ecs'
import { PowerUp } from '../ecs/traits'
import { POWERUP_CONFIGS } from '../ecs/systems/powerUpSystem'

// Different geometries for each power-up type
const shieldGeometry = new THREE.OctahedronGeometry(1, 0)
const overdriveGeometry = new THREE.IcosahedronGeometry(1, 0)
const multilockGeometry = new THREE.DodecahedronGeometry(1, 0)

// Materials with emissive for glow
const shieldMaterial = new THREE.MeshBasicMaterial({
  color: POWERUP_CONFIGS.shield.color,
  wireframe: true,
})
const overdriveMaterial = new THREE.MeshBasicMaterial({
  color: POWERUP_CONFIGS.overdrive.color,
  wireframe: true,
})
const multilockMaterial = new THREE.MeshBasicMaterial({
  color: POWERUP_CONFIGS.multilock.color,
  wireframe: true,
})

// Pool sizes
const POOL_SIZE = 10

export function PowerUpRenderer() {
  // Refs for instanced meshes
  const shieldMeshRef = useRef<THREE.InstancedMesh>(null!)
  const overdriveMeshRef = useRef<THREE.InstancedMesh>(null!)
  const multilockMeshRef = useRef<THREE.InstancedMesh>(null!)

  const tempObject = useMemo(() => new THREE.Object3D(), [])

  // Track counts for each type
  const countsRef = useRef({ shield: 0, overdrive: 0, multilock: 0 })

  // Track positions for glow effects
  const positionsRef = useRef<Array<{ x: number; y: number; z: number; type: string; magnetizing: boolean }>>([])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Reset counts
    countsRef.current.shield = 0
    countsRef.current.overdrive = 0
    countsRef.current.multilock = 0
    positionsRef.current = []

    // Update instances from ECS
    for (const entity of world.query(Position, PowerUp, Active)) {
      const pos = entity.get(Position)
      const powerUp = entity.get(PowerUp)

      if (!pos || !powerUp) continue

      // Get appropriate mesh ref and config
      let meshRef: React.RefObject<THREE.InstancedMesh>
      let config: { scale: number }
      let index: number

      switch (powerUp.type) {
        case 'shield':
          meshRef = shieldMeshRef
          config = POWERUP_CONFIGS.shield
          index = countsRef.current.shield++
          break
        case 'overdrive':
          meshRef = overdriveMeshRef
          config = POWERUP_CONFIGS.overdrive
          index = countsRef.current.overdrive++
          break
        case 'multilock':
          meshRef = multilockMeshRef
          config = POWERUP_CONFIGS.multilock
          index = countsRef.current.multilock++
          break
        default:
          continue
      }

      if (!meshRef.current) continue

      // Pulsing scale when magnetizing
      let scale = config.scale
      if (powerUp.magnetizing) {
        scale *= 1 + Math.sin(time * 10) * 0.2
      } else {
        scale *= 1 + Math.sin(time * 3) * 0.1
      }

      // Update matrix
      tempObject.position.set(pos.x, pos.y, pos.z)
      tempObject.rotation.x = time * 2
      tempObject.rotation.y = time * 1.5
      tempObject.rotation.z = time * 0.5
      tempObject.scale.setScalar(scale)
      tempObject.updateMatrix()

      meshRef.current.setMatrixAt(index, tempObject.matrix)

      // Track position for lights
      positionsRef.current.push({
        x: pos.x,
        y: pos.y,
        z: pos.z,
        type: powerUp.type,
        magnetizing: powerUp.magnetizing,
      })
    }

    // Update instance counts and matrices
    if (shieldMeshRef.current) {
      shieldMeshRef.current.count = countsRef.current.shield
      shieldMeshRef.current.instanceMatrix.needsUpdate = true
    }
    if (overdriveMeshRef.current) {
      overdriveMeshRef.current.count = countsRef.current.overdrive
      overdriveMeshRef.current.instanceMatrix.needsUpdate = true
    }
    if (multilockMeshRef.current) {
      multilockMeshRef.current.count = countsRef.current.multilock
      multilockMeshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  const positions = positionsRef.current

  return (
    <group name="powerup-renderer-root">
      {/* Shield power-ups */}
      <instancedMesh
        ref={shieldMeshRef}
        args={[shieldGeometry, shieldMaterial, POOL_SIZE]}
        name="powerup-shield-instances"
        frustumCulled={false}
      />

      {/* Overdrive power-ups */}
      <instancedMesh
        ref={overdriveMeshRef}
        args={[overdriveGeometry, overdriveMaterial, POOL_SIZE]}
        name="powerup-overdrive-instances"
        frustumCulled={false}
      />

      {/* Multi-lock power-ups */}
      <instancedMesh
        ref={multilockMeshRef}
        args={[multilockGeometry, multilockMaterial, POOL_SIZE]}
        name="powerup-multilock-instances"
        frustumCulled={false}
      />

      {/* Glow lights for power-ups */}
      {positions.map((pos, i) => {
        const config = POWERUP_CONFIGS[pos.type as keyof typeof POWERUP_CONFIGS]
        const intensity = pos.magnetizing ? 2 : 1

        return (
          <pointLight
            key={`powerup-light-${i}`}
            position={[pos.x, pos.y, pos.z]}
            color={config.color}
            intensity={intensity}
            distance={6}
          />
        )
      })}
    </group>
  )
}
