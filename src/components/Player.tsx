import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useGameStore } from '../stores/gameStore'

interface PlayerProps {
  railPosition?: THREE.Vector3
  railQuaternion?: THREE.Quaternion
}

export function Player({ railPosition, railQuaternion }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  const targetOffset = useRef(new THREE.Vector2(0, 0))
  const currentOffset = useRef(new THREE.Vector2(0, 0))

  const { camera } = useThree()

  const { playerSpeed, playerColor, moveRange, cameraFollow } = useControls('Player', {
    playerSpeed: { value: 8, min: 1, max: 20, step: 0.5 },
    playerColor: '#00ffff',
    moveRange: { value: 6, min: 2, max: 15, step: 0.5 },
    cameraFollow: true,
  })

  const gameState = useGameStore((state) => state.gameState)
  const setGameState = useGameStore((state) => state.setGameState)

  // Handle mouse movement for lateral control
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameState !== 'playing') return

      // Normalize mouse position to -1 to 1
      targetOffset.current.x = (e.clientX / window.innerWidth) * 2 - 1
      targetOffset.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }

    const handleClick = () => {
      if (gameState === 'title') {
        setGameState('playing')
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [gameState, setGameState])

  useFrame((_, delta) => {
    if (!meshRef.current || !groupRef.current) return

    // Smooth offset movement
    currentOffset.current.x = THREE.MathUtils.damp(
      currentOffset.current.x,
      targetOffset.current.x * moveRange,
      playerSpeed,
      delta
    )
    currentOffset.current.y = THREE.MathUtils.damp(
      currentOffset.current.y,
      targetOffset.current.y * moveRange * 0.6 + 2,
      playerSpeed,
      delta
    )

    // Apply rail position if provided
    if (railPosition && railQuaternion) {
      // Base position from rail
      groupRef.current.position.copy(railPosition)

      // Apply local offset perpendicular to rail direction
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(railQuaternion)
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(railQuaternion)

      groupRef.current.position.addScaledVector(right, currentOffset.current.x)
      groupRef.current.position.addScaledVector(up, currentOffset.current.y)

      // Camera follows player
      if (cameraFollow) {
        const cameraOffset = new THREE.Vector3(0, 3, 12).applyQuaternion(railQuaternion)
        const targetCamPos = groupRef.current.position.clone().add(cameraOffset)

        camera.position.lerp(targetCamPos, delta * 3)
        camera.lookAt(groupRef.current.position)
      }
    } else {
      // Fallback: simple mouse-follow when no rail
      groupRef.current.position.x = currentOffset.current.x
      groupRef.current.position.y = currentOffset.current.y
    }

    // Rotate the player mesh
    meshRef.current.rotation.x += delta * 0.5
    meshRef.current.rotation.y += delta * 0.8

    // Tilt based on movement
    const tiltX = (targetOffset.current.y - currentOffset.current.y / moveRange) * 0.5
    const tiltZ = (targetOffset.current.x - currentOffset.current.x / moveRange) * -0.5
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tiltX, delta * 5)
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, tiltZ, delta * 5)
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshBasicMaterial color={playerColor} wireframe />
      </mesh>

      {/* Inner glow sphere */}
      <mesh scale={0.35}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={playerColor} transparent opacity={0.3} />
      </mesh>

      {/* Point light for glow effect */}
      <pointLight color={playerColor} intensity={2} distance={5} />

      {/* Outer wireframe shell */}
      <mesh scale={0.7} rotation={[0.5, 0.5, 0]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={playerColor} wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export { type PlayerProps }
