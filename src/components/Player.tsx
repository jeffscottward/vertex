import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useSettingsStore } from '../stores/settingsStore'
import { useInput } from '../hooks/useInput'
import { useIsPlaying, useIsTitle, sendGameEvent } from '../hooks/useGameMachine'

interface PlayerProps {
  railPosition?: THREE.Vector3
  railQuaternion?: THREE.Quaternion
  onFireStart?: () => void
  onFireRelease?: () => void
  onAimUpdate?: (x: number, y: number) => void
}

export function Player({ railPosition, railQuaternion, onFireStart, onFireRelease, onAimUpdate }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  const currentOffset = useRef(new THREE.Vector2(0, 0))
  const isLocking = useRef(false)

  const { camera } = useThree()
  const { getInput } = useInput()

  const difficultySettings = useSettingsStore((state) => state.difficultySettings)
  const isPlaying = useIsPlaying()
  const isTitle = useIsTitle()

  const { playerColor, moveRange, cameraFollow, cameraDistance } = useControls('Player', {
    playerColor: '#00ffff',
    moveRange: { value: 6, min: 2, max: 15, step: 0.5 },
    cameraFollow: true,
    cameraDistance: { value: 12, min: 5, max: 25, step: 1 },
  })

  // Handle click to start from title
  useEffect(() => {
    const handleClick = () => {
      if (isTitle) {
        sendGameEvent({ type: 'START' })
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [isTitle])

  // Handle ESC to pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPlaying) {
        sendGameEvent({ type: 'PAUSE' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying])

  useFrame((_, delta) => {
    if (!meshRef.current || !groupRef.current) return

    const input = getInput()

    // Handle title screen - start game on fire input
    if (isTitle) {
      if (input.fire || input.firePressed) {
        sendGameEvent({ type: 'START' })
      }
      return
    }

    // Only process gameplay when playing
    if (!isPlaying) return

    // Fire start detection
    if (input.firePressed && !isLocking.current) {
      isLocking.current = true
      onFireStart?.()
    }

    // Fire release detection
    if (input.fireReleased && isLocking.current) {
      isLocking.current = false
      onFireRelease?.()
    }

    // Update aim position for lock-on system
    onAimUpdate?.(input.aimX, input.aimY)

    // Calculate target position from input
    const targetX = input.moveX * moveRange
    const targetY = input.moveY * moveRange * 0.6 + 2

    // Smooth movement with damping
    currentOffset.current.x = THREE.MathUtils.damp(
      currentOffset.current.x,
      targetX,
      difficultySettings.playerSpeed,
      delta
    )
    currentOffset.current.y = THREE.MathUtils.damp(
      currentOffset.current.y,
      targetY,
      difficultySettings.playerSpeed,
      delta
    )

    // Apply position relative to rail
    if (railPosition && railQuaternion) {
      groupRef.current.position.copy(railPosition)

      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(railQuaternion)
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(railQuaternion)

      groupRef.current.position.addScaledVector(right, currentOffset.current.x)
      groupRef.current.position.addScaledVector(up, currentOffset.current.y)

      // Camera follow
      if (cameraFollow) {
        const cameraOffset = new THREE.Vector3(0, 3, cameraDistance).applyQuaternion(railQuaternion)
        const targetCamPos = groupRef.current.position.clone().add(cameraOffset)

        camera.position.lerp(targetCamPos, delta * 3)
        camera.lookAt(groupRef.current.position)
      }
    } else {
      groupRef.current.position.x = currentOffset.current.x
      groupRef.current.position.y = currentOffset.current.y
    }

    // Mesh rotation animation
    meshRef.current.rotation.x += delta * 0.5
    meshRef.current.rotation.y += delta * 0.8

    // Tilt based on velocity
    const velocityX = targetX - currentOffset.current.x
    const velocityY = targetY - currentOffset.current.y
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, velocityY * 0.1, delta * 5)
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -velocityX * 0.1, delta * 5)

    // Pulse effect when locking
    if (isLocking.current) {
      const pulse = Math.sin(performance.now() * 0.01) * 0.1 + 1
      meshRef.current.scale.setScalar(pulse)
    } else {
      meshRef.current.scale.setScalar(1)
    }

    // Check for overdrive activation (E key or Y button)
    if (input.overdrive) {
      sendGameEvent({ type: 'ACTIVATE_OVERDRIVE' })
    }

    // Check for pause (Start button on gamepad)
    if (input.pause) {
      sendGameEvent({ type: 'PAUSE' })
    }
  })

  return (
    <group ref={groupRef} name="player-root">
      <mesh ref={meshRef} name="player-mesh">
        <icosahedronGeometry args={[0.5, 0]} />
        <meshBasicMaterial color={playerColor} wireframe />
      </mesh>

      <mesh name="player-glow" scale={0.35}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={playerColor} transparent opacity={0.3} />
      </mesh>

      <pointLight color={playerColor} intensity={2} distance={5} />

      <mesh name="player-shell" scale={0.7} rotation={[0.5, 0.5, 0]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={playerColor} wireframe transparent opacity={0.3} />
      </mesh>

      {/* Lock indicator particles */}
      {isLocking.current && (
        <group name="player-lock-indicators">
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2 + performance.now() * 0.003
            return (
              <mesh key={i} position={[Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, 0]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color="#ff00ff" />
              </mesh>
            )
          })}
        </group>
      )}
    </group>
  )
}

export { type PlayerProps }
