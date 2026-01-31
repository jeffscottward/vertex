import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from 'leva'

export function Player() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const targetPosition = useRef(new THREE.Vector3(0, 1, 0))

  const { playerSpeed, playerColor } = useControls('Player', {
    playerSpeed: { value: 5, min: 1, max: 20, step: 0.5 },
    playerColor: '#00ffff',
  })

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Get keyboard input (will be handled by KeyboardControls wrapper in main app)
    // For now, simple mouse follow
    const { pointer } = state

    // Map pointer to game space
    targetPosition.current.x = THREE.MathUtils.clamp(pointer.x * 8, -6, 6)
    targetPosition.current.y = THREE.MathUtils.clamp(pointer.y * 4 + 2, 0.5, 5)

    // Smooth movement using damp
    meshRef.current.position.x = THREE.MathUtils.damp(
      meshRef.current.position.x,
      targetPosition.current.x,
      playerSpeed,
      delta
    )
    meshRef.current.position.y = THREE.MathUtils.damp(
      meshRef.current.position.y,
      targetPosition.current.y,
      playerSpeed,
      delta
    )

    // Rotate the player mesh
    meshRef.current.rotation.x += delta * 0.5
    meshRef.current.rotation.y += delta * 0.8
  })

  return (
    <mesh ref={meshRef} position={[0, 1, 0]}>
      <icosahedronGeometry args={[0.5, 0]} />
      <meshBasicMaterial
        color={playerColor}
        wireframe
      />
      {/* Inner glow */}
      <pointLight color={playerColor} intensity={2} distance={3} />
    </mesh>
  )
}
