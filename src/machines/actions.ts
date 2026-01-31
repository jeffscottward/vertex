/**
 * Action implementations for the game state machine
 *
 * Note: In XState v5, actions are defined inline in the machine setup
 * using the `actions` property. This file documents the action logic
 * but the actual implementations are in gameMachine.ts.
 *
 * This file is kept for reference and potential future use.
 */

// Score calculation helpers
export function calculateHitScore(
  basePoints: number,
  multiplier: number,
  onBeat: boolean
): number {
  const beatBonus = onBeat ? 2 : 1
  return basePoints * multiplier * beatBonus
}

// Overdrive calculation
export function calculateOverdriveGain(onBeat: boolean): number {
  return onBeat ? 5 : 2
}

// Multiplier limits
export const MAX_MULTIPLIER_DEFAULT = 100
export const COMBO_TIMER_DURATION = 3 // seconds
