import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { world, Position, Active } from '../ecs'
import { ExplosionParticle } from '../ecs/traits'

// Shared geometry - wireframe tetrahedron for REZ-style particles
const particleGeometry = new THREE.TetrahedronGeometry(1, 0)

// Pool size matches explosionSystem.ts
const POOL_SIZE = 200

export function ExplosionRenderer() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  // Pre-create color array for instances
  const colorArray = useMemo(() => new Float32Array(POOL_SIZE * 3), [])

  useFrame(() => {
    if (!meshRef.current) return

    const currentTime = performance.now()
    let count = 0

    // Update instances from ECS
    for (const entity of world.query(Position, ExplosionParticle, Active)) {
      if (count >= POOL_SIZE) break

      const pos = entity.get(Position)
      const particle = entity.get(ExplosionParticle)

      if (!pos || !particle) continue

      // Calculate fade progress
      const elapsed = (currentTime - particle.startTime) / 1000
      const progress = elapsed / particle.lifetime
      if (progress >= 1) continue

      const alpha = 1 - progress
      const scale = particle.scale * (1 - progress * 0.5)

      // Update matrix
      tempObject.position.set(pos.x, pos.y, pos.z)
      tempObject.rotation.x = elapsed * 5
      tempObject.rotation.y = elapsed * 3
      tempObject.scale.setScalar(scale)
      tempObject.updateMatrix()

      meshRef.current.setMatrixAt(count, tempObject.matrix)

      // Set color with alpha baked into intensity - boost for bloom
      tempColor.set(particle.color)
      const boost = 2.0 // Emissive boost for bloom
      colorArray[count * 3] = tempColor.r * alpha * boost
      colorArray[count * 3 + 1] = tempColor.g * alpha * boost
      colorArray[count * 3 + 2] = tempColor.b * alpha * boost

      count++
    }

    // Update instance matrices and colors
    meshRef.current.count = count
    meshRef.current.instanceMatrix.needsUpdate = true

    // Update instance colors
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })

  // Create material - use basic material with color for better visibility
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      wireframe: true,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      depthWrite: false, // Prevent z-fighting
      blending: THREE.AdditiveBlending, // Additive for glow effect
    })
  }, [])

  return (
    <group name="explosion-renderer-root">
      <instancedMesh
        ref={meshRef}
        args={[particleGeometry, material, POOL_SIZE]}
        name="explosion-particle-instances"
        frustumCulled={false}
      >
        <instancedBufferAttribute
          attach="instanceColor"
          args={[colorArray, 3]}
        />
      </instancedMesh>
    </group>
  )
}
