import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Projectile {
  id: string
  start: THREE.Vector3
  target: THREE.Vector3
  progress: number
  active: boolean
}

interface ProjectilesProps {
  projectiles: Array<{ start: THREE.Vector3; target: THREE.Vector3; id: string }>
  speed?: number
}

const POOL_SIZE = 50

export function Projectiles({ projectiles: newProjectiles, speed = 80 }: ProjectilesProps) {
  const pool = useRef<Projectile[]>([])

  // Initialize pool
  useEffect(() => {
    pool.current = Array.from({ length: POOL_SIZE }, (_, i) => ({
      id: `proj-${i}`,
      start: new THREE.Vector3(),
      target: new THREE.Vector3(),
      progress: 0,
      active: false,
    }))
  }, [])

  // Spawn new projectiles
  useEffect(() => {
    newProjectiles.forEach((proj) => {
      const inactive = pool.current.find(p => !p.active)
      if (inactive) {
        inactive.start.copy(proj.start)
        inactive.target.copy(proj.target)
        inactive.progress = 0
        inactive.active = true
      }
    })
  }, [newProjectiles])

  useFrame((_, delta) => {
    pool.current.forEach((proj) => {
      if (!proj.active) return

      // Move projectile
      const distance = proj.start.distanceTo(proj.target)
      proj.progress += (speed * delta) / distance

      if (proj.progress >= 1) {
        // Hit target
        proj.active = false
        // Note: onHit would be called with target ID in a real implementation
      }
    })
  })

  const activeProjectiles = pool.current.filter(p => p.active)

  return (
    <group>
      {activeProjectiles.map((proj) => {
        const currentPos = new THREE.Vector3().lerpVectors(
          proj.start,
          proj.target,
          proj.progress
        )

        return (
          <group key={proj.id} position={currentPos.toArray()}>
            {/* Projectile core */}
            <mesh>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color="#00ffff" />
            </mesh>

            {/* Glow */}
            <pointLight color="#00ffff" intensity={2} distance={5} />

            {/* Trail effect - simple stretched sphere */}
            <mesh
              rotation={[0, 0, 0]}
              scale={[0.1, 0.1, 0.5]}
              position={[0, 0, 0.3]}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
