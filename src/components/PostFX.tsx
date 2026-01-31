import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useSettingsStore } from '../stores/settingsStore'

export function PostFX() {
  const graphicsSettings = useSettingsStore((state) => state.graphicsSettings)

  if (!graphicsSettings.postProcessing) {
    return null
  }

  // Render with or without chromatic aberration based on settings
  if (graphicsSettings.chromaticAberration) {
    return (
      <EffectComposer>
        <Bloom
          intensity={graphicsSettings.bloom ? graphicsSettings.bloomIntensity : 0}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[graphicsSettings.chromaticOffset, graphicsSettings.chromaticOffset]}
        />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer>
      <Bloom
        intensity={graphicsSettings.bloom ? graphicsSettings.bloomIntensity : 0}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
      />
    </EffectComposer>
  )
}
