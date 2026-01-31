import { create } from 'zustand'

// Menu screen types
export type MenuScreen =
  | 'none'           // No menu (in-game)
  | 'main'           // Main title menu
  | 'settings'       // Settings panel
  | 'controls'       // Control rebinding
  | 'levelSelect'    // Level selection
  | 'pause'          // Pause overlay

// Settings tabs
export type SettingsTab = 'audio' | 'graphics' | 'controls'

interface MenuState {
  // Current screen
  currentScreen: MenuScreen
  previousScreen: MenuScreen

  // Settings tab
  settingsTab: SettingsTab

  // Control rebinding state
  rebindingAction: string | null  // Which action is being rebound
  rebindingDevice: 'keyboard' | 'gamepad' | null

  // Navigation stack for back button support
  navigationStack: MenuScreen[]

  // Actions
  openScreen: (screen: MenuScreen) => void
  closeScreen: () => void
  goBack: () => void

  setSettingsTab: (tab: SettingsTab) => void

  startRebinding: (action: string, device: 'keyboard' | 'gamepad') => void
  cancelRebinding: () => void
  finishRebinding: () => void

  // Quick actions
  openPause: () => void
  closePause: () => void
  openSettings: () => void
  openControls: () => void
}

export const useMenuStore = create<MenuState>()((set, get) => ({
  currentScreen: 'main',
  previousScreen: 'none',
  settingsTab: 'audio',
  rebindingAction: null,
  rebindingDevice: null,
  navigationStack: [],

  openScreen: (screen) => {
    const current = get().currentScreen
    set({
      currentScreen: screen,
      previousScreen: current,
      navigationStack: current !== 'none' ? [...get().navigationStack, current] : get().navigationStack,
    })
  },

  closeScreen: () => {
    set({
      currentScreen: 'none',
      previousScreen: get().currentScreen,
      navigationStack: [],
      rebindingAction: null,
      rebindingDevice: null,
    })
  },

  goBack: () => {
    const stack = get().navigationStack
    if (stack.length > 0) {
      const prevScreen = stack[stack.length - 1]
      set({
        currentScreen: prevScreen,
        navigationStack: stack.slice(0, -1),
        rebindingAction: null,
        rebindingDevice: null,
      })
    } else {
      // If no history, close to game or go to main
      const current = get().currentScreen
      if (current === 'pause') {
        set({ currentScreen: 'none' })
      } else {
        set({ currentScreen: 'main' })
      }
    }
  },

  setSettingsTab: (tab) => set({ settingsTab: tab }),

  startRebinding: (action, device) => set({
    rebindingAction: action,
    rebindingDevice: device,
  }),

  cancelRebinding: () => set({
    rebindingAction: null,
    rebindingDevice: null,
  }),

  finishRebinding: () => set({
    rebindingAction: null,
    rebindingDevice: null,
  }),

  // Quick actions
  openPause: () => {
    set({
      currentScreen: 'pause',
      previousScreen: 'none',
      navigationStack: [],
    })
  },

  closePause: () => {
    set({
      currentScreen: 'none',
      previousScreen: 'pause',
    })
  },

  openSettings: () => {
    const current = get().currentScreen
    set({
      currentScreen: 'settings',
      previousScreen: current,
      navigationStack: current !== 'none' ? [...get().navigationStack, current] : get().navigationStack,
    })
  },

  openControls: () => {
    const current = get().currentScreen
    set({
      currentScreen: 'controls',
      previousScreen: current,
      navigationStack: current !== 'none' ? [...get().navigationStack, current] : get().navigationStack,
    })
  },
}))
