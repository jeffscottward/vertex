import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Action names
export type GameAction =
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'fire'
  | 'overdrive'
  | 'pause'

// Keyboard key codes (using e.code values)
export type KeyCode = string

// Gamepad button indices (standard mapping)
export type GamepadButton = number
export type GamepadAxis = {
  axis: number
  direction: 1 | -1
}

// Binding types
export interface KeyboardBinding {
  primary: KeyCode
  secondary?: KeyCode
}

export interface GamepadBinding {
  button?: GamepadButton
  axis?: GamepadAxis
  trigger?: number // For analog triggers (LT=6, RT=7)
}

// Default keyboard bindings
const DEFAULT_KEYBOARD_BINDINGS: Record<GameAction, KeyboardBinding> = {
  moveUp: { primary: 'KeyW', secondary: 'ArrowUp' },
  moveDown: { primary: 'KeyS', secondary: 'ArrowDown' },
  moveLeft: { primary: 'KeyA', secondary: 'ArrowLeft' },
  moveRight: { primary: 'KeyD', secondary: 'ArrowRight' },
  fire: { primary: 'Space' },
  overdrive: { primary: 'KeyE', secondary: 'ShiftLeft' },
  pause: { primary: 'Escape' },
}

// Default gamepad bindings (standard mapping)
// Buttons: 0=A, 1=B, 2=X, 3=Y, 4=LB, 5=RB, 6=LT, 7=RT, 8=Back, 9=Start
// Axes: 0=leftX, 1=leftY, 2=rightX, 3=rightY
const DEFAULT_GAMEPAD_BINDINGS: Record<GameAction, GamepadBinding> = {
  moveUp: { axis: { axis: 1, direction: -1 } },    // Left stick up
  moveDown: { axis: { axis: 1, direction: 1 } },   // Left stick down
  moveLeft: { axis: { axis: 0, direction: -1 } },  // Left stick left
  moveRight: { axis: { axis: 0, direction: 1 } },  // Left stick right
  fire: { button: 0, trigger: 7 },                  // A or RT
  overdrive: { button: 3 },                         // Y
  pause: { button: 9 },                             // Start
}

// Human-readable labels for keys
export const KEY_LABELS: Record<string, string> = {
  KeyW: 'W',
  KeyA: 'A',
  KeyS: 'S',
  KeyD: 'D',
  KeyE: 'E',
  KeyQ: 'Q',
  KeyR: 'R',
  KeyF: 'F',
  Space: 'SPACE',
  ShiftLeft: 'L-SHIFT',
  ShiftRight: 'R-SHIFT',
  ControlLeft: 'L-CTRL',
  ControlRight: 'R-CTRL',
  AltLeft: 'L-ALT',
  AltRight: 'R-ALT',
  Escape: 'ESC',
  Enter: 'ENTER',
  Tab: 'TAB',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Backspace: 'BKSP',
  Delete: 'DEL',
}

// Human-readable labels for gamepad buttons
export const GAMEPAD_LABELS: Record<number, string> = {
  0: 'A',
  1: 'B',
  2: 'X',
  3: 'Y',
  4: 'LB',
  5: 'RB',
  6: 'LT',
  7: 'RT',
  8: 'BACK',
  9: 'START',
  10: 'L3',
  11: 'R3',
  12: 'D-UP',
  13: 'D-DOWN',
  14: 'D-LEFT',
  15: 'D-RIGHT',
}

// Human-readable labels for actions
export const ACTION_LABELS: Record<GameAction, string> = {
  moveUp: 'Move Up',
  moveDown: 'Move Down',
  moveLeft: 'Move Left',
  moveRight: 'Move Right',
  fire: 'Fire / Lock-On',
  overdrive: 'Overdrive',
  pause: 'Pause',
}

// Store interface
interface InputBindingsState {
  keyboardBindings: Record<GameAction, KeyboardBinding>
  gamepadBindings: Record<GameAction, GamepadBinding>

  // Actions
  setKeyboardBinding: (action: GameAction, binding: KeyboardBinding) => void
  setKeyboardPrimary: (action: GameAction, key: KeyCode) => void
  setKeyboardSecondary: (action: GameAction, key: KeyCode | undefined) => void

  setGamepadBinding: (action: GameAction, binding: GamepadBinding) => void
  setGamepadButton: (action: GameAction, button: GamepadButton) => void

  resetKeyboardDefaults: () => void
  resetGamepadDefaults: () => void
  resetAllDefaults: () => void

  // Helpers
  getKeyLabel: (code: KeyCode) => string
  getGamepadLabel: (button: GamepadButton) => string
  isKeyBound: (code: KeyCode) => GameAction | null
  isGamepadButtonBound: (button: GamepadButton) => GameAction | null
}

export const useInputBindingsStore = create<InputBindingsState>()(
  persist(
    (set, get) => ({
      keyboardBindings: { ...DEFAULT_KEYBOARD_BINDINGS },
      gamepadBindings: { ...DEFAULT_GAMEPAD_BINDINGS },

      setKeyboardBinding: (action, binding) => set((state) => ({
        keyboardBindings: {
          ...state.keyboardBindings,
          [action]: binding,
        },
      })),

      setKeyboardPrimary: (action, key) => set((state) => ({
        keyboardBindings: {
          ...state.keyboardBindings,
          [action]: {
            ...state.keyboardBindings[action],
            primary: key,
          },
        },
      })),

      setKeyboardSecondary: (action, key) => set((state) => ({
        keyboardBindings: {
          ...state.keyboardBindings,
          [action]: {
            ...state.keyboardBindings[action],
            secondary: key,
          },
        },
      })),

      setGamepadBinding: (action, binding) => set((state) => ({
        gamepadBindings: {
          ...state.gamepadBindings,
          [action]: binding,
        },
      })),

      setGamepadButton: (action, button) => set((state) => ({
        gamepadBindings: {
          ...state.gamepadBindings,
          [action]: {
            ...state.gamepadBindings[action],
            button,
          },
        },
      })),

      resetKeyboardDefaults: () => set({
        keyboardBindings: { ...DEFAULT_KEYBOARD_BINDINGS },
      }),

      resetGamepadDefaults: () => set({
        gamepadBindings: { ...DEFAULT_GAMEPAD_BINDINGS },
      }),

      resetAllDefaults: () => set({
        keyboardBindings: { ...DEFAULT_KEYBOARD_BINDINGS },
        gamepadBindings: { ...DEFAULT_GAMEPAD_BINDINGS },
      }),

      getKeyLabel: (code) => {
        return KEY_LABELS[code] || code.replace('Key', '').replace('Digit', '')
      },

      getGamepadLabel: (button) => {
        return GAMEPAD_LABELS[button] || `BTN ${button}`
      },

      isKeyBound: (code) => {
        const bindings = get().keyboardBindings
        for (const [action, binding] of Object.entries(bindings)) {
          if (binding.primary === code || binding.secondary === code) {
            return action as GameAction
          }
        }
        return null
      },

      isGamepadButtonBound: (button) => {
        const bindings = get().gamepadBindings
        for (const [action, binding] of Object.entries(bindings)) {
          if (binding.button === button) {
            return action as GameAction
          }
        }
        return null
      },
    }),
    {
      name: 'vertex-input-bindings',
    }
  )
)

// Utility to get all game actions
export const GAME_ACTIONS: GameAction[] = [
  'moveUp',
  'moveDown',
  'moveLeft',
  'moveRight',
  'fire',
  'overdrive',
  'pause',
]
