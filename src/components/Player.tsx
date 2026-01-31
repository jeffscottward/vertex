import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useGameStore } from '../stores/gameStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useInput } from '../hooks/useInput'
import { tcl } from '../utils/debug'

interface PlayerProps {
  railPosition?: THREE.Vector3
  railQuaternion?: THREE.Quaternion
  onFireStart?: () => void
  onFireRelease?: (lockedTargets: string[]) => void
}

export function Player({ railPosition, railQuaternion, onFireStart, onFireRelease }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  const currentOffset = useRef(new THREE.Vector2(0, 0))
  const isLocking = useRef(false)

  const { camera } = useThree()
  const { getInput } = useInput()

  const difficultySettings = useSettingsStore((state) => state.difficultySettings)

  const { playerColor, moveRange, cameraFollow, cameraDistance } = useControls('Player', {
    playerColor: '#00ffff',
    moveRange: { value: 6, min: 2, max: 15, step: 0.5 },
    cameraFollow: true,
    cameraDistance: { value: 12, min: 5, max: 25, step: 1 },
  })

  const gameState = useGameStore((state) => state.gameState)
  const setGameState = useGameStore((state) => state.setGameState)

  useEffect(() => {
    const handleClick = () => {
      if (gameState === 'title') {
        tcl('gameStart', { from: 'click' }, 'handleClick', 'Player.tsx', 41)
        setGameState('playing')
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [gameState, setGameState])

  useFrame((_, delta) => {
    if (!meshRef.current || !groupRef.current) return

    const input = getInput()

    if (gameState === 'title') {
      if (input.fire || input.firePressed) {
        tcl('gameStart', { from: 'gamepad', inputSource: input.inputSource }, 'useFrame', 'Player.tsx', 54)
        setGameState('playing')
      }
      return
    }

    if (gameState !== 'playing') return

    if (input.firePressed && !isLocking.current) {
      isLocking.current = true
      tcl('lockStart', {}, 'useFrame', 'Player.tsx', 64)
      onFireStart?.()
    }

    if (input.fireReleased && isLocking.current) {
      isLocking.current = false
      tcl('lockRelease', {}, 'useFrame', 'Player.tsx', 70)
      onFireRelease?.([])
    }

    const targetX = input.moveX * moveRange
    const targetY = input.moveY * moveRange * 0.6 + 2

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

    if (railPosition && railQuaternion) {
      groupRef.current.position.copy(railPosition)

      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(railQuaternion)
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(railQuaternion)

      groupRef.current.position.addScaledVector(right, currentOffset.current.x)
      groupRef.current.position.addScaledVector(up, currentOffset.current.y)

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

    meshRef.current.rotation.x += delta * 0.5
    meshRef.current.rotation.y += delta * 0.8

    const velocityX = targetX - currentOffset.current.x
    const velocityY = targetY - currentOffset.current.y
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, velocityY * 0.1, delta * 5)
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -velocityX * 0.1, delta * 5)

    if (isLocking.current) {
      const pulse = Math.sin(performance.now() * 0.01) * 0.1 + 1
      meshRef.current.scale.setScalar(pulse)
    } else {
      meshRef.current.scale.setScalar(1)
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
