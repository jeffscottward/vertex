import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { Leva } from 'leva'
import { Suspense } from 'react'
import { Experience } from './components/Experience'
import { UI } from './components/UI'
import { COMPONENT_IDS } from './constants/componentIds'
import { dataId } from './utils/componentId'
import { useSettingsStore } from './stores/settingsStore'

export default function App() {
  const graphicsSettings = useSettingsStore((state) => state.graphicsSettings)

  return (
    <div {...dataId(COMPONENT_IDS.APP_ROOT)} style={{ width: '100%', height: '100%' }}>
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
  )
}
