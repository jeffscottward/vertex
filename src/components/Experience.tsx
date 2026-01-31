import { useState, useCallback } from 'react'
import { OrbitControls, Stars } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'
import { Player } from './Player'
import { RailTrack } from './RailTrack'
import { EnemyPool } from './EnemyPool'
import { PostFX } from './PostFX'
import { useGameStore } from '../stores/gameStore'

export function Experience() {
  const { showOrbitControls, showStars } = useControls('Debug', {
    showOrbitControls: false,
    showStars: true,
  })

  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 2, 0))
  const [playerQuaternion, setPlayerQuaternion] = useState(new THREE.Quaternion())

  const gameState = useGameStore((state) => state.gameState)

  // Handle rail track progress updates
  const handleProgressUpdate = useCallback((
    _progress: number,
    position: THREE.Vector3,
    quaternion: THREE.Quaternion
  ) => {
    setPlayerPosition(position.clone())
    setPlayerQuaternion(quaternion.clone())
  }, [])

  return (
    <>
      {showOrbitControls && <OrbitControls makeDefault />}

      {/* Ambient lighting */}
      <ambientLight intensity={0.1} />

      {/* Directional light */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.5}
        color="#ffffff"
      />

      {/* Background stars */}
      {showStars && (
        <Stars
          radius={200}
          depth={100}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      )}

      {/* Rail Track System */}
      {gameState === 'playing' && (
        <RailTrack onProgressUpdate={handleProgressUpdate} />
      )}

      {/* Player */}
      <Player
        railPosition={gameState === 'playing' ? playerPosition : undefined}
        railQuaternion={gameState === 'playing' ? playerQuaternion : undefined}
      />

      {/* Enemy Pool */}
      {gameState === 'playing' && (
        <EnemyPool playerPosition={playerPosition} />
      )}

      {/* Fog for depth */}
      <fog attach="fog" args={['#000000', 50, 200]} />

      {/* Post-processing */}
      <PostFX />
    </>
  )
}
