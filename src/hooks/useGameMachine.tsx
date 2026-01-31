import { createContext, useContext, type ReactNode } from 'react'
import { createActor, type ActorRefFrom } from 'xstate'
import { useSelector } from '@xstate/react'
import { gameMachine } from '../machines/gameMachine'
import type { GameContext, GameEvent } from '../machines/types'

// Create the actor (singleton for the app)
export const gameActor = createActor(gameMachine)

// Start the actor
gameActor.start()

// Type for the game actor
export type GameActor = ActorRefFrom<typeof gameMachine>

// Context for providing the actor to React tree
const GameMachineContext = createContext<GameActor | null>(null)

// Provider component
interface GameMachineProviderProps {
  children: ReactNode
}

export function GameMachineProvider({ children }: GameMachineProviderProps) {
  return (
    <GameMachineContext.Provider value={gameActor}>
      {children}
    </GameMachineContext.Provider>
  )
}

// Hook to access the game actor
export function useGameActor(): GameActor {
  const actor = useContext(GameMachineContext)
  if (!actor) {
    throw new Error('useGameActor must be used within GameMachineProvider')
  }
  return actor
}

// Hook to send events to the game machine
export function useSend() {
  const actor = useGameActor()
  return actor.send
}

// Hook to select specific state values (optimized re-renders)
export function useGameState<T>(selector: (state: ReturnType<typeof gameActor.getSnapshot>) => T): T {
  const actor = useGameActor()
  return useSelector(actor, selector)
}

// Convenience selectors

// Get current state value as string
export function useCurrentState(): string {
  return useGameState((state) => {
    const value = state.value
    if (typeof value === 'string') return value
    // Handle nested states
    return JSON.stringify(value)
  })
}

// Get context values with selective subscription
export function useScore(): number {
  return useGameState((state) => state.context.score)
}

export function useMultiplier(): number {
  return useGameState((state) => state.context.multiplier)
}

export function useOverdrive(): number {
  return useGameState((state) => state.context.overdrive)
}

export function useLevel(): number {
  return useGameState((state) => state.context.level)
}

export function useIsLocking(): boolean {
  return useGameState((state) => state.context.isLocking)
}

export function useLockedTargets(): number[] {
  return useGameState((state) => state.context.lockedTargetIds)
}

export function useHealth(): { current: number; max: number } {
  return useGameState((state) => ({
    current: state.context.health,
    max: state.context.maxHealth,
  }))
}

export function useShieldState(): { active: boolean; stored: boolean; endTime: number } {
  return useGameState((state) => ({
    active: state.context.shieldActive,
    stored: state.context.hasStoredShield,
    endTime: state.context.shieldEndTime,
  }))
}

export function usePowerUpState(): { hasShield: boolean; hasOverdrive: boolean; maxLocks: number } {
  return useGameState((state) => ({
    hasShield: state.context.hasStoredShield,
    hasOverdrive: state.context.hasStoredOverdrive,
    maxLocks: state.context.maxLockSlots,
  }))
}

export function useOverdriveState(): { active: boolean; gauge: number; endTime: number } {
  return useGameState((state) => ({
    active: state.context.overdriveActive,
    gauge: state.context.overdrive,
    endTime: state.context.overdriveEndTime,
  }))
}

export function useSettingsTab() {
  return useGameState((state) => state.context.settingsTab)
}

export function useRebindingState() {
  return useGameState((state) => ({
    action: state.context.rebindingAction,
    device: state.context.rebindingDevice,
  }))
}

// Game state checks - using direct matches for type safety
export function useIsPlaying(): boolean {
  return useGameState((state) => state.matches('playing'))
}

export function useIsPaused(): boolean {
  return useGameState((state) => state.matches('paused'))
}

export function useIsTitle(): boolean {
  return useGameState((state) => state.matches('title'))
}

export function useIsGameOver(): boolean {
  return useGameState((state) => state.matches('gameOver'))
}

export function useIsLevelComplete(): boolean {
  return useGameState((state) => state.matches('levelComplete'))
}

// Direct access to snapshot (use sparingly - causes re-renders on any change)
export function useGameSnapshot() {
  const actor = useGameActor()
  return useSelector(actor, (state) => state)
}

// Helper to get context directly (for useFrame without re-renders)
export function getGameContext(): GameContext {
  return gameActor.getSnapshot().context
}

// Helper to check state directly (for useFrame without re-renders)
export function getIsPlaying(): boolean {
  return gameActor.getSnapshot().matches('playing')
}

// Helper to send events directly (for useFrame)
export function sendGameEvent(event: GameEvent) {
  gameActor.send(event)
}
