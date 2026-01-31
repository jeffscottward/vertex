# VERTEX - Project Rules for Claude

## Component IDs

**RULE: All component IDs must be hardcoded in `src/constants/componentIds.ts`**

Never generate dynamic IDs at runtime. Use static string constants so developers can:
1. Search the codebase to find a component by its ID instantly
2. See the ID in source code without running the app
3. Debug DOM/Three.js scene graph without runtime inspection

Example:
```tsx
// GOOD - Static ID from constants
import { COMPONENT_IDS } from '@/constants/componentIds'
<div data-component-id={COMPONENT_IDS.UI_SCORE}>

// BAD - Dynamic ID
const id = useComponentId('UI')  // Don't do this
```

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
├── constants/      # Static values, component IDs
├── utils/          # Utilities (debug, etc.)
├── shaders/        # GLSL/TSL shaders
└── levels/         # Level data
```
