import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { Leva } from 'leva'
import { Suspense } from 'react'
import { Experience } from './components/Experience'
import { UI } from './components/UI'

export default function App() {
  return (
    <>
      <Leva collapsed />
      <Canvas
        camera={{ position: [0, 2, 10], fov: 75 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <Perf position="top-left" />
        <color attach="background" args={['#000']} />
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <UI />
    </>
  )
}
