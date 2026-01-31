import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { Leva } from 'leva'
import { Suspense } from 'react'
import { Experience } from './components/Experience'
import { UI } from './components/UI'
import { useSettingsStore } from './stores/settingsStore'
import { GameMachineProvider } from './hooks/useGameMachine'

export default function App() {
  const graphicsSettings = useSettingsStore((state) => state.graphicsSettings)

  return (
    <GameMachineProvider>
      <div data-component-id="app-root" style={{ width: '100%', height: '100%' }}>
        <Leva collapsed />
        <Canvas
          camera={{ position: [0, 2, 10], fov: 75 }}
          dpr={graphicsSettings.dpr}
          gl={{ antialias: graphicsSettings.antialias }}
        >
          <Perf position="top-left" />
          <color attach="background" args={['#000']} />
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </Canvas>
        <UI />
      </div>
    </GameMachineProvider>
  )
}
