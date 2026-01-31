# VERTEX - Project Rules for Claude

@docs/REZ-HD-BEST-PRACTICES.md
@docs/R3F-MODERN-BEST-PRACTICES-2024-2026.md

## Component IDs

**RULE: All component IDs must be hardcoded as literal strings in the markup.**

Never use constants, variables, or dynamic ID generation. IDs must be searchable in the codebase.

```tsx
// GOOD - Literal hardcoded string
<div data-component-id="ui-score">
<group name="player-root">

// BAD - Reference to constant or variable
<div data-component-id={COMPONENT_IDS.UI_SCORE}>
<group name={componentId}>
```

Component ID registry is in `src/constants/componentIds.ts` for documentation only.

## Console Logging (Turbo Console Log)

Use this syntax for all debug logging:
```ts
console.log("🚀 ~ file: filename.tsx:42 → functionName → variableName:", variable);
```

Or use the `tcl` helper:
```ts
import { tcl } from '@/utils/debug'
tcl('variableName', value, 'functionName', 'filename.tsx', 42)
```

## Performance Rules

- Never use React state in `useFrame` - mutate refs directly
- Use object pooling for enemies, projectiles, particles
- Share geometries and materials across instances
- Use `InstancedMesh` for large numbers of similar objects
- Target 60fps - profile with r3f-perf

## Settings/Presets

Difficulty and graphics presets are defined in `src/stores/settingsStore.ts`:
- Difficulty: easy, medium, hard
- Graphics: low, medium, high

## File Structure

```
src/
├── components/     # React/R3F components
├── hooks/          # Custom hooks
├── stores/         # Zustand stores
├── constants/      # Static values, component IDs (documentation)
├── utils/          # Utilities (debug, etc.)
├── shaders/        # GLSL/TSL shaders
└── levels/         # Level data

docs/
├── REZ-HD-BEST-PRACTICES.md         # Game design rules
└── R3F-MODERN-BEST-PRACTICES-2024-2026.md  # R3F patterns
```
