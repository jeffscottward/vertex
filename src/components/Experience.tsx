import { OrbitControls, Grid } from '@react-three/drei'
import { useControls } from 'leva'
import { Player } from './Player'
import { Track } from './Track'
import { PostFX } from './PostFX'

export function Experience() {
  const { showGrid, showOrbitControls } = useControls('Debug', {
    showGrid: true,
    showOrbitControls: true,
  })

  return (
    <>
      {showOrbitControls && <OrbitControls makeDefault />}

      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <Track />
      <Player />

      {showGrid && (
        <Grid
          args={[100, 100]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#1a1a2e"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#16213e"
          fadeDistance={50}
          infiniteGrid
        />
      )}

      <PostFX />
    </>
  )
}
