import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LockOnDisplayProps {
  targetPositions: THREE.Vector3[]
  maxLocks: number
  isLocking: boolean
}

export function LockOnDisplay({ targetPositions, maxLocks, isLocking }: LockOnDisplayProps) {
  const ringsRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (!ringsRef.current) return

    const time = state.clock.elapsedTime

    // Animate rings
    ringsRef.current.children.forEach((ring, i) => {
      ring.rotation.z = time * 2 + i * 0.5
      ring.rotation.x = Math.sin(time + i) * 0.2
    })
  })

  return (
    <group ref={ringsRef}>
      {targetPositions.map((pos, i) => (
        <group key={i} position={pos.toArray()}>
          {/* Outer ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1, 6]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Inner ring */}
          <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]}>
            <ringGeometry args={[0.4, 0.6, 6]} />
            <meshBasicMaterial
              color="#ff00ff"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Lock indicator point light */}
          <pointLight color="#00ffff" intensity={1} distance={3} />
        </group>
      ))}

      {/* Charging indicator */}
      {isLocking && (
        <group>
          {Array.from({ length: maxLocks }, (_, i) => {
            const angle = (i / maxLocks) * Math.PI * 2
            const radius = 2
            const filled = i < targetPositions.length

            return (
              <mesh
                key={`charge-${i}`}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(angle) * radius,
                  0
                ]}
              >
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial
                  color={filled ? '#00ffff' : '#333333'}
                  transparent
                  opacity={filled ? 1 : 0.3}
                />
              </mesh>
            )
          })}
        </group>
      )}
    </group>
  )
}
