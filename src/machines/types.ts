// Game Machine Event Types

export type SettingsTab = 'audio' | 'graphics' | 'controls'

// Menu Events
export type MenuEvent =
  | { type: 'OPEN_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'OPEN_CONTROLS' }
  | { type: 'CLOSE_CONTROLS' }
  | { type: 'OPEN_LEVEL_SELECT' }
  | { type: 'GO_BACK' }
  | { type: 'SET_TAB'; tab: SettingsTab }
  | { type: 'START_REBIND'; action: string; device: 'keyboard' | 'gamepad' }
  | { type: 'CANCEL_REBIND' }
  | { type: 'FINISH_REBIND'; key: string }

// Gameplay Events
export type GameplayEvent =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART' }
  | { type: 'FIRE_START' }
  | { type: 'FIRE_RELEASE'; targetIds: number[] }
  | { type: 'LOCK_TARGET'; entityId: number }
  | { type: 'UNLOCK_TARGET'; entityId: number }
  | { type: 'HIT'; entityId: number; onBeat: boolean }
  | { type: 'MISS' }
  | { type: 'PLAYER_HIT'; damage: number }
  | { type: 'LEVEL_COMPLETE' }
  | { type: 'GAME_OVER' }
  | { type: 'ADD_SCORE'; points: number }
  | { type: 'RESET_MULTIPLIER' }
  | { type: 'ADD_OVERDRIVE'; amount: number }
  | { type: 'ACTIVATE_OVERDRIVE' }

// Combined event type
export type GameEvent = MenuEvent | GameplayEvent

// Machine Context
export interface GameContext {
  // Menu state
  settingsTab: SettingsTab
  rebindingAction: string | null
  rebindingDevice: 'keyboard' | 'gamepad' | null
  navigationStack: string[]

  // Gameplay state
  level: number
  score: number
  multiplier: number
  maxMultiplier: number
  overdrive: number
  lockedTargetIds: number[]
  comboTimer: number
  musicTime: number

  // Player state
  health: number
  maxHealth: number

  // Combat state
  isLocking: boolean
}

// Initial context values
export const initialContext: GameContext = {
  // Menu state
  settingsTab: 'audio',
  rebindingAction: null,
  rebindingDevice: null,
  navigationStack: [],

  // Gameplay state
  level: 1,
  score: 0,
  multiplier: 1,
  maxMultiplier: 100,
  overdrive: 0,
  lockedTargetIds: [],
  comboTimer: 0,
  musicTime: 0,

  // Player state
  health: 100,
  maxHealth: 100,

  // Combat state
  isLocking: false,
}

// State value types for type-safe state checks
export type GameStateValue =
  | 'title'
  | 'title.main'
  | 'title.settings'
  | 'title.controls'
  | 'title.levelSelect'
  | 'playing'
  | 'playing.combat'
  | 'playing.combat.idle'
  | 'playing.combat.locking'
  | 'playing.combat.firing'
  | 'paused'
  | 'paused.overlay'
  | 'paused.settings'
  | 'gameOver'
  | 'levelComplete'
