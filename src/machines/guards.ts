import type { GameContext } from './types'

/**
 * Guards for the game state machine
 * Guards are predicates that determine if a transition should be taken
 *
 * Note: In XState v5, guards are defined inline in the machine setup
 * using the `guards` property. This file documents the guard logic.
 */

// Can the player lock onto more targets?
export function canLock(context: GameContext): boolean {
  return context.lockedTargetIds.length < 8
}

// Does the player have any locked targets?
export function hasTargets(context: GameContext): boolean {
  return context.lockedTargetIds.length > 0
}

// Is overdrive full and ready to activate?
export function canActivateOverdrive(context: GameContext): boolean {
  return context.overdrive >= 100
}

// Can navigate back (has history)?
export function canGoBack(context: GameContext): boolean {
  return context.navigationStack.length > 0
}

// Is currently rebinding a control?
export function isRebinding(context: GameContext): boolean {
  return context.rebindingAction !== null
}

// Export all guards as a single object for documentation
export const guards = {
  canLock,
  hasTargets,
  canActivateOverdrive,
  canGoBack,
  isRebinding,
}
