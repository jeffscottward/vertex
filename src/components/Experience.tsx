import { useState, useCallback } from 'react'
import { OrbitControls, Stars } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'
import { Player } from './Player'
import { RailTrack } from './RailTrack'
import { EnemyPool } from './EnemyPool'
import { PostFX } from './PostFX'
import { useGameStore } from '../stores/gameStore'
import { useSettingsStore } from '../stores/settingsStore'
import { tcl } from '../utils/debug'

export function Experience() {
  const { showOrbitControls, showStars } = useControls('Debug', {
    showOrbitControls: false,
    showStars: true,
  })

  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 2, 0))
  const [playerQuaternion, setPlayerQuaternion] = useState(new THREE.Quaternion())

  const gameState = useGameStore((state) => state.gameState)
  const graphicsSettings = useSettingsStore((state) => state.graphicsSettings)

  const handleProgressUpdate = useCallback((
    _progress: number,
    position: THREE.Vector3,
    quaternion: THREE.Quaternion
  ) => {
    setPlayerPosition(position.clone())
    setPlayerQuaternion(quaternion.clone())
  }, [])

  const handleFireStart = useCallback(() => {
    tcl('fireStart', { gameState }, 'handleFireStart', 'Experience.tsx', 35)
  }, [gameState])

  const handleFireRelease = useCallback((targets: string[]) => {
    tcl('fireRelease', { targets, count: targets.length }, 'handleFireRelease', 'Experience.tsx', 39)
  }, [])

  return (
    <group name="experience-root">
      {showOrbitControls && <OrbitControls makeDefault />}

      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 20, 10]} intensity={0.5} color="#ffffff" />

      {showStars && (
        <Stars
          radius={200}
          depth={100}
          count={graphicsSettings.starCount}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      )}

      {gameState === 'playing' && (
        <RailTrack onProgressUpdate={handleProgressUpdate} />
      )}

      <Player
        railPosition={gameState === 'playing' ? playerPosition : undefined}
        railQuaternion={gameState === 'playing' ? playerQuaternion : undefined}
        onFireStart={handleFireStart}
        onFireRelease={handleFireRelease}
      />

      {gameState === 'playing' && (
        <EnemyPool playerPosition={playerPosition} />
      )}

      <fog attach="fog" args={['#000000', 50, 200]} />

      {graphicsSettings.postProcessing && <PostFX />}
    </group>
  )
}
