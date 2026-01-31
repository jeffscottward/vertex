import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export type GameState = 'title' | 'playing' | 'paused' | 'gameOver' | 'levelComplete'

interface GameStore {
  // Game State
  gameState: GameState
  setGameState: (state: GameState) => void

  // Score
  score: number
  addScore: (points: number) => void
  resetScore: () => void

  // Multiplier
  multiplier: number
  increaseMultiplier: () => void
  resetMultiplier: () => void

  // Overdrive
  overdrive: number
  addOverdrive: (amount: number) => void
  activateOverdrive: () => void

  // Level
  currentLevel: number
  setLevel: (level: number) => void

  // Music Time (for rhythm sync)
  musicTime: number
  setMusicTime: (time: number) => void

  // Lock-on targets
  lockedTargets: string[]
  lockTarget: (id: string) => void
  clearLocks: () => void
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Game State
    gameState: 'title',
    setGameState: (gameState) => set({ gameState }),

    // Score
    score: 0,
    addScore: (points) => set((state) => ({
      score: state.score + points * state.multiplier
    })),
    resetScore: () => set({ score: 0 }),

    // Multiplier
    multiplier: 1,
    increaseMultiplier: () => set((state) => ({
      multiplier: Math.min(state.multiplier + 1, 100)
    })),
    resetMultiplier: () => set({ multiplier: 1 }),

    // Overdrive
    overdrive: 0,
    addOverdrive: (amount) => set((state) => ({
      overdrive: Math.min(state.overdrive + amount, 100)
    })),
    activateOverdrive: () => {
      const current = get().overdrive
      if (current >= 100) {
        set({ overdrive: 0 })
        // TODO: Activate overdrive effects
      }
    },

    // Level
    currentLevel: 1,
    setLevel: (level) => set({ currentLevel: level }),

    // Music Time
    musicTime: 0,
    setMusicTime: (time) => set({ musicTime: time }),

    // Lock-on targets
    lockedTargets: [],
    lockTarget: (id) => set((state) => {
      if (state.lockedTargets.length >= 8) return state
      if (state.lockedTargets.includes(id)) return state
      return { lockedTargets: [...state.lockedTargets, id] }
    }),
    clearLocks: () => set({ lockedTargets: [] }),
  }))
)
