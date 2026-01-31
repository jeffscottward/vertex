import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Difficulty Presets
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultySettings {
  enemySpawnRate: number      // enemies per second
  enemySpeed: number          // base speed multiplier
  playerSpeed: number         // player movement speed
  lockOnTime: number          // time to lock per target (seconds)
  maxMultiplier: number       // max score multiplier
  beatWindow: number          // milliseconds for perfect beat timing
}

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultySettings> = {
  easy: {
    enemySpawnRate: 1,
    enemySpeed: 0.7,
    playerSpeed: 10,
    lockOnTime: 0.15,
    maxMultiplier: 50,
    beatWindow: 150,
  },
  medium: {
    enemySpawnRate: 2,
    enemySpeed: 1.0,
    playerSpeed: 8,
    lockOnTime: 0.1,
    maxMultiplier: 100,
    beatWindow: 100,
  },
  hard: {
    enemySpawnRate: 4,
    enemySpeed: 1.5,
    playerSpeed: 6,
    lockOnTime: 0.07,
    maxMultiplier: 200,
    beatWindow: 50,
  },
}

// Graphics Quality Presets
export type GraphicsQuality = 'low' | 'medium' | 'high'

export interface GraphicsSettings {
  dpr: [number, number]       // device pixel ratio range
  shadows: boolean
  bloom: boolean
  bloomIntensity: number
  chromaticAberration: boolean
  chromaticOffset: number
  particleCount: number       // max particles
  enemyLights: number         // max enemy point lights
  starCount: number           // background stars
  postProcessing: boolean
  antialias: boolean
}

export const GRAPHICS_PRESETS: Record<GraphicsQuality, GraphicsSettings> = {
  low: {
    dpr: [1, 1],
    shadows: false,
    bloom: false,
    bloomIntensity: 0,
    chromaticAberration: false,
    chromaticOffset: 0,
    particleCount: 50,
    enemyLights: 0,
    starCount: 1000,
    postProcessing: false,
    antialias: false,
  },
  medium: {
    dpr: [1, 1.5],
    shadows: false,
    bloom: true,
    bloomIntensity: 1.0,
    chromaticAberration: false,
    chromaticOffset: 0,
    particleCount: 200,
    enemyLights: 5,
    starCount: 3000,
    postProcessing: true,
    antialias: true,
  },
  high: {
    dpr: [1, 2],
    shadows: true,
    bloom: true,
    bloomIntensity: 1.5,
    chromaticAberration: true,
    chromaticOffset: 0.002,
    particleCount: 500,
    enemyLights: 10,
    starCount: 5000,
    postProcessing: true,
    antialias: true,
  },
}

// Settings Store
interface SettingsState {
  // Presets
  difficulty: Difficulty
  graphicsQuality: GraphicsQuality

  // Computed settings (from presets)
  difficultySettings: DifficultySettings
  graphicsSettings: GraphicsSettings

  // Audio
  masterVolume: number
  musicVolume: number
  sfxVolume: number

  // Controls
  mouseSensitivity: number
  gamepadDeadzone: number
  invertY: boolean

  // Actions
  setDifficulty: (difficulty: Difficulty) => void
  setGraphicsQuality: (quality: GraphicsQuality) => void
  setMasterVolume: (volume: number) => void
  setMusicVolume: (volume: number) => void
  setSfxVolume: (volume: number) => void
  setMouseSensitivity: (sensitivity: number) => void
  setGamepadDeadzone: (deadzone: number) => void
  setInvertY: (invert: boolean) => void
  resetToDefaults: () => void
}

const DEFAULT_SETTINGS = {
  difficulty: 'medium' as Difficulty,
  graphicsQuality: 'high' as GraphicsQuality,
  masterVolume: 1,
  musicVolume: 0.8,
  sfxVolume: 1,
  mouseSensitivity: 1,
  gamepadDeadzone: 0.15,
  invertY: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial values
      ...DEFAULT_SETTINGS,
      difficultySettings: DIFFICULTY_PRESETS[DEFAULT_SETTINGS.difficulty],
      graphicsSettings: GRAPHICS_PRESETS[DEFAULT_SETTINGS.graphicsQuality],

      // Actions
      setDifficulty: (difficulty) => set({
        difficulty,
        difficultySettings: DIFFICULTY_PRESETS[difficulty],
      }),

      setGraphicsQuality: (quality) => set({
        graphicsQuality: quality,
        graphicsSettings: GRAPHICS_PRESETS[quality],
      }),

      setMasterVolume: (masterVolume) => set({ masterVolume }),
      setMusicVolume: (musicVolume) => set({ musicVolume }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume }),
      setMouseSensitivity: (mouseSensitivity) => set({ mouseSensitivity }),
      setGamepadDeadzone: (gamepadDeadzone) => set({ gamepadDeadzone }),
      setInvertY: (invertY) => set({ invertY }),

      resetToDefaults: () => set({
        ...DEFAULT_SETTINGS,
        difficultySettings: DIFFICULTY_PRESETS[DEFAULT_SETTINGS.difficulty],
        graphicsSettings: GRAPHICS_PRESETS[DEFAULT_SETTINGS.graphicsQuality],
      }),
    }),
    {
      name: 'vertex-settings',
    }
  )
)

// Selectors for optimized subscriptions
export const selectDifficultySettings = (state: SettingsState) => state.difficultySettings
export const selectGraphicsSettings = (state: SettingsState) => state.graphicsSettings
