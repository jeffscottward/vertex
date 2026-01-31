import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { world, Position, Projectile, Active } from '../ecs'

// Shared geometry and material for projectiles
const projectileGeometry = new THREE.SphereGeometry(0.15, 8, 8)
const projectileMaterial = new THREE.MeshBasicMaterial({
  color: '#00ffff',
  transparent: true,
  opacity: 0.9,
})

const POOL_SIZE = 50

export function ProjectileRenderer() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const countRef = useRef(0)

  // Track active projectile positions for trails
  const positionsRef = useRef<Array<{ x: number; y: number; z: number; progress: number }>>([])

  useFrame(() => {
    let count = 0
    positionsRef.current = []

    // Update instances from ECS
    for (const entity of world.query(Position, Projectile, Active)) {
      const pos = entity.get(Position)
      const proj = entity.get(Projectile)

      if (!pos || !proj) continue
      if (!meshRef.current) continue

      // Update matrix
      tempObject.position.set(pos.x, pos.y, pos.z)

      // Scale based on progress (shrink as it travels)
      const scale = 1 - proj.progress * 0.5
      tempObject.scale.setScalar(scale)
      tempObject.updateMatrix()

      meshRef.current.setMatrixAt(count, tempObject.matrix)

      // Track for trails
      positionsRef.current.push({
        x: pos.x,
        y: pos.y,
        z: pos.z,
        progress: proj.progress,
      })

      count++
    }

    countRef.current = count

    // Update instance count and matrix
    if (meshRef.current) {
      meshRef.current.count = count
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group name="projectile-renderer-root">
      {/* Main projectile instances */}
      <instancedMesh
        ref={meshRef}
        args={[projectileGeometry, projectileMaterial, POOL_SIZE]}
        name="projectile-instances"
        frustumCulled={false}
      />

      {/* Glow effect for projectiles */}
      {positionsRef.current.map((pos, i) => (
        <pointLight
          key={`proj-light-${i}`}
          position={[pos.x, pos.y, pos.z]}
          color="#00ffff"
          intensity={0.8}
          distance={3}
        />
      ))}
    </group>
  )
}
