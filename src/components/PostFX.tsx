import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { useControls } from 'leva'
import { BlendFunction } from 'postprocessing'

export function PostFX() {
  const { bloomIntensity, bloomThreshold, chromaticOffset } = useControls('PostFX', {
    bloomIntensity: { value: 1.5, min: 0, max: 5, step: 0.1 },
    bloomThreshold: { value: 0.2, min: 0, max: 1, step: 0.05 },
    chromaticOffset: { value: 0.002, min: 0, max: 0.01, step: 0.001 },
  })

  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.9}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[chromaticOffset, chromaticOffset]}
      />
    </EffectComposer>
  )
}
