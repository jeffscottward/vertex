import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getActiveEnemyProjectiles } from '../ecs'

const POOL_SIZE = 50

// Shared geometry and material
const projectileGeometry = new THREE.SphereGeometry(0.15, 8, 8)
const projectileMaterial = new THREE.MeshBasicMaterial({
  color: '#ff4400',
  transparent: true,
  opacity: 0.9,
})

// Trail material
const trailMaterial = new THREE.MeshBasicMaterial({
  color: '#ff2200',
  transparent: true,
  opacity: 0.5,
})

export function EnemyProjectileRenderer() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const trailMeshRef = useRef<THREE.InstancedMesh>(null!)
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const countRef = useRef(0)

  useFrame(() => {
    const projectiles = getActiveEnemyProjectiles()
    countRef.current = projectiles.length

    if (!meshRef.current || !trailMeshRef.current) return

    for (let i = 0; i < projectiles.length; i++) {
      const proj = projectiles[i]

      // Main projectile
      tempObject.position.set(proj.x, proj.y, proj.z)
      tempObject.scale.setScalar(1 + proj.progress * 0.5)
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)

      // Trail (slightly behind)
      const trailOffset = 0.5
      tempObject.position.set(
        proj.x,
        proj.y,
        proj.z + trailOffset
      )
      tempObject.scale.setScalar(0.5 + proj.progress * 0.3)
      tempObject.updateMatrix()
      trailMeshRef.current.setMatrixAt(i, tempObject.matrix)
    }

    // Update counts and matrices
    meshRef.current.count = countRef.current
    meshRef.current.instanceMatrix.needsUpdate = true
    trailMeshRef.current.count = countRef.current
    trailMeshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group name="enemy-projectile-renderer-root">
      {/* Main projectiles */}
      <instancedMesh
        ref={meshRef}
        args={[projectileGeometry, projectileMaterial, POOL_SIZE]}
        name="enemy-projectile-instances"
        frustumCulled={false}
      />

      {/* Trails */}
      <instancedMesh
        ref={trailMeshRef}
        args={[projectileGeometry, trailMaterial, POOL_SIZE]}
        name="enemy-projectile-trail-instances"
        frustumCulled={false}
      />
    </group>
  )
}
