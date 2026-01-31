/**
 * Static Component IDs
 * Hardcoded for easy debugging - search codebase to find component by ID
 *
 * Format: SECTION_COMPONENT_ELEMENT
 */

export const COMPONENT_IDS = {
  // Root
  APP_ROOT: 'app-root',
  APP_CANVAS: 'app-canvas',

  // 3D Scene
  EXPERIENCE_ROOT: 'experience-root',

  // Player
  PLAYER_ROOT: 'player-root',
  PLAYER_MESH: 'player-mesh',
  PLAYER_GLOW: 'player-glow',
  PLAYER_SHELL: 'player-shell',
  PLAYER_LOCK_INDICATORS: 'player-lock-indicators',

  // Rail Track
  RAIL_TRACK_ROOT: 'rail-track-root',
  RAIL_TRACK_PATH: 'rail-track-path',
  RAIL_TRACK_TUNNEL: 'rail-track-tunnel',

  // Enemies
  ENEMY_POOL_ROOT: 'enemy-pool-root',
  ENEMY_BASIC_INSTANCES: 'enemy-basic-instances',
  ENEMY_ARMORED_INSTANCES: 'enemy-armored-instances',
  ENEMY_FAST_INSTANCES: 'enemy-fast-instances',

  // Effects
  POST_FX_ROOT: 'post-fx-root',

  // UI
  UI_ROOT: 'ui-root',
  UI_SCORE: 'ui-score',
  UI_MULTIPLIER: 'ui-multiplier',
  UI_OVERDRIVE: 'ui-overdrive',
  UI_LOCK_INDICATORS: 'ui-lock-indicators',
  UI_TITLE_SCREEN: 'ui-title-screen',
  UI_START_BUTTON: 'ui-start-button',
  UI_CONTROLS_HELP: 'ui-controls-help',
  UI_INPUT_INDICATOR: 'ui-input-indicator',

  // Projectiles
  PROJECTILE_POOL: 'projectile-pool',

  // Lock-on Display
  LOCKON_DISPLAY_ROOT: 'lockon-display-root',

  // Audio
  AUDIO_MANAGER: 'audio-manager',
} as const

export type ComponentId = typeof COMPONENT_IDS[keyof typeof COMPONENT_IDS]
