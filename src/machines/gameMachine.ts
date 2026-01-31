import { setup, assign } from 'xstate'
import { initialContext } from './types'
import type { GameContext, GameEvent, SettingsTab } from './types'

/**
 * Unified Game State Machine
 *
 * Handles ALL app state including:
 * - Title/menu navigation
 * - Settings panel
 * - Gameplay (combat states)
 * - Pause overlay
 * - Game over / level complete
 */
export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  guards: {
    canLock: ({ context }) => context.lockedTargetIds.length < 8,
    hasTargets: ({ context }) => context.lockedTargetIds.length > 0,
    canActivateOverdrive: ({ context }) => context.overdrive >= 100,
    canGoBack: ({ context }) => context.navigationStack.length > 0,
    isDead: ({ context, event }) => {
      if (event.type !== 'PLAYER_HIT') return false
      return context.health - event.damage <= 0
    },
  },
  actions: {
    resetGame: assign({
      score: 0,
      multiplier: 1,
      overdrive: 0,
      lockedTargetIds: [],
      comboTimer: 0,
      isLocking: false,
      health: 100,
    }),
    setSettingsTab: assign({
      settingsTab: ({ event }) => {
        if (event.type === 'SET_TAB') {
          return event.tab
        }
        return 'audio' as SettingsTab
      },
    }),
    pushNavigation: assign({
      navigationStack: ({ context }, params: { screen: string }) => [
        ...context.navigationStack,
        params.screen,
      ],
    }),
    popNavigation: assign({
      navigationStack: ({ context }) => context.navigationStack.slice(0, -1),
    }),
    clearNavigation: assign({
      navigationStack: [],
    }),
    startLocking: assign({
      isLocking: true,
    }),
    stopLocking: assign({
      isLocking: false,
    }),
    clearLocks: assign({
      lockedTargetIds: [],
    }),
    processHit: assign({
      score: ({ context, event }) => {
        if (event.type !== 'HIT') return context.score
        const basePoints = 100
        const beatBonus = event.onBeat ? 2 : 1
        return context.score + basePoints * context.multiplier * beatBonus
      },
      multiplier: ({ context, event }) => {
        if (event.type !== 'HIT') return context.multiplier
        if (event.onBeat) {
          return Math.min(context.multiplier + 1, context.maxMultiplier)
        }
        return context.multiplier
      },
      overdrive: ({ context, event }) => {
        if (event.type !== 'HIT') return context.overdrive
        const overdriveGain = event.onBeat ? 5 : 2
        return Math.min(context.overdrive + overdriveGain, 100)
      },
      comboTimer: 3,
    }),
    processMiss: assign({
      multiplier: 1,
      comboTimer: 0,
    }),
    lockTarget: assign({
      lockedTargetIds: ({ context, event }) => {
        if (event.type !== 'LOCK_TARGET') return context.lockedTargetIds
        if (context.lockedTargetIds.length >= 8) return context.lockedTargetIds
        if (context.lockedTargetIds.includes(event.entityId)) return context.lockedTargetIds
        return [...context.lockedTargetIds, event.entityId]
      },
    }),
    unlockTarget: assign({
      lockedTargetIds: ({ context, event }) => {
        if (event.type !== 'UNLOCK_TARGET') return context.lockedTargetIds
        return context.lockedTargetIds.filter((id) => id !== event.entityId)
      },
    }),
    startRebind: assign({
      rebindingAction: ({ event }) => {
        if (event.type === 'START_REBIND') return event.action
        return null
      },
      rebindingDevice: ({ event }) => {
        if (event.type === 'START_REBIND') return event.device
        return null
      },
    }),
    cancelRebind: assign({
      rebindingAction: null,
      rebindingDevice: null,
    }),
    finishRebind: assign({
      rebindingAction: null,
      rebindingDevice: null,
    }),
    addOverdrive: assign({
      overdrive: ({ context, event }) => {
        if (event.type === 'ADD_OVERDRIVE') {
          return Math.min(context.overdrive + event.amount, 100)
        }
        return context.overdrive
      },
    }),
    activateOverdrive: assign({
      overdrive: 0,
    }),
    processPlayerHit: assign({
      health: ({ context, event }) => {
        if (event.type !== 'PLAYER_HIT') return context.health
        return Math.max(0, context.health - event.damage)
      },
      multiplier: 1, // Reset multiplier on hit
    }),
    nextLevel: assign({
      level: ({ context }) => context.level + 1,
    }),
  },
}).createMachine({
  id: 'game',
  initial: 'title',
  context: initialContext,

  states: {
    // ===================
    // TITLE STATE (MENUS)
    // ===================
    title: {
      initial: 'main',
      states: {
        main: {
          on: {
            START: {
              target: '#game.playing',
              actions: ['resetGame', 'clearNavigation'],
            },
            OPEN_SETTINGS: {
              target: 'settings',
              actions: [{ type: 'pushNavigation', params: { screen: 'main' } }],
            },
            OPEN_LEVEL_SELECT: {
              target: 'levelSelect',
              actions: [{ type: 'pushNavigation', params: { screen: 'main' } }],
            },
          },
        },

        settings: {
          on: {
            CLOSE_SETTINGS: {
              target: 'main',
              actions: 'popNavigation',
            },
            GO_BACK: {
              target: 'main',
              actions: 'popNavigation',
            },
            OPEN_CONTROLS: {
              target: 'controls',
              actions: [{ type: 'pushNavigation', params: { screen: 'settings' } }],
            },
            SET_TAB: {
              actions: 'setSettingsTab',
            },
          },
        },

        controls: {
          on: {
            CLOSE_CONTROLS: {
              target: 'settings',
              actions: 'popNavigation',
            },
            GO_BACK: {
              target: 'settings',
              actions: 'popNavigation',
            },
            START_REBIND: {
              actions: 'startRebind',
            },
            CANCEL_REBIND: {
              actions: 'cancelRebind',
            },
            FINISH_REBIND: {
              actions: 'finishRebind',
            },
          },
        },

        levelSelect: {
          on: {
            START: {
              target: '#game.playing',
              actions: ['resetGame', 'clearNavigation'],
            },
            GO_BACK: {
              target: 'main',
              actions: 'popNavigation',
            },
          },
        },
      },
    },

    // ===================
    // PLAYING STATE
    // ===================
    playing: {
      initial: 'combat',

      on: {
        PAUSE: {
          target: 'paused',
        },
        GAME_OVER: {
          target: 'gameOver',
        },
        LEVEL_COMPLETE: {
          target: 'levelComplete',
        },
        HIT: {
          actions: 'processHit',
        },
        MISS: {
          actions: 'processMiss',
        },
        PLAYER_HIT: [
          {
            guard: 'isDead',
            target: 'gameOver',
            actions: 'processPlayerHit',
          },
          {
            actions: 'processPlayerHit',
          },
        ],
        ADD_OVERDRIVE: {
          actions: 'addOverdrive',
        },
        ACTIVATE_OVERDRIVE: {
          guard: 'canActivateOverdrive',
          actions: 'activateOverdrive',
        },
      },

      states: {
        combat: {
          initial: 'idle',

          states: {
            idle: {
              on: {
                FIRE_START: {
                  target: 'locking',
                  actions: 'startLocking',
                },
              },
            },

            locking: {
              on: {
                FIRE_RELEASE: {
                  target: 'firing',
                  actions: 'stopLocking',
                },
                LOCK_TARGET: {
                  guard: 'canLock',
                  actions: 'lockTarget',
                },
                UNLOCK_TARGET: {
                  actions: 'unlockTarget',
                },
              },
            },

            firing: {
              entry: 'clearLocks',
              after: {
                100: 'idle', // Short delay then return to idle
              },
            },
          },
        },
      },
    },

    // ===================
    // PAUSED STATE
    // ===================
    paused: {
      initial: 'overlay',

      states: {
        overlay: {
          on: {
            RESUME: {
              target: '#game.playing',
            },
            RESTART: {
              target: '#game.playing',
              actions: 'resetGame',
            },
            OPEN_SETTINGS: {
              target: 'settings',
            },
            // Allow returning to title from pause
            GO_BACK: {
              target: '#game.title',
              actions: 'clearNavigation',
            },
          },
        },

        settings: {
          on: {
            CLOSE_SETTINGS: {
              target: 'overlay',
            },
            GO_BACK: {
              target: 'overlay',
            },
            SET_TAB: {
              actions: 'setSettingsTab',
            },
            OPEN_CONTROLS: {
              target: 'controls',
            },
          },
        },

        controls: {
          on: {
            CLOSE_CONTROLS: {
              target: 'settings',
            },
            GO_BACK: {
              target: 'settings',
            },
            START_REBIND: {
              actions: 'startRebind',
            },
            CANCEL_REBIND: {
              actions: 'cancelRebind',
            },
            FINISH_REBIND: {
              actions: 'finishRebind',
            },
          },
        },
      },
    },

    // ===================
    // GAME OVER STATE
    // ===================
    gameOver: {
      on: {
        RESTART: {
          target: 'playing',
          actions: 'resetGame',
        },
        GO_BACK: {
          target: 'title',
          actions: 'clearNavigation',
        },
      },
    },

    // ===================
    // LEVEL COMPLETE STATE
    // ===================
    levelComplete: {
      on: {
        START: {
          target: 'playing',
          actions: ['resetGame', 'nextLevel'],
        },
        GO_BACK: {
          target: 'title',
          actions: 'clearNavigation',
        },
      },
    },
  },
})

export type GameMachine = typeof gameMachine
