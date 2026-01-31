# VERTEX

A REZ HD-style on-rails rhythm shooter built with React Three Fiber.

## Tech Stack

- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **@react-three/postprocessing** - Post-processing effects
- **@react-three/rapier** - Physics engine
- **Koota** - Entity Component System
- **Zustand** - State management
- **Leva** - Debug controls
- **r3f-perf** - Performance monitoring
- **Howler.js** - Audio management

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run gltf [file.gltf]` - Convert GLTF to React component

## Architecture

```
src/
├── components/    # R3F components (Player, Track, PostFX, etc.)
├── stores/        # Zustand state stores
├── hooks/         # Custom React hooks
├── shaders/       # GLSL shaders
├── levels/        # Level data (splines, spawn events)
└── utils/         # Utility functions
```

## Gameplay

- **On-rails movement** - Auto-forward along spline track
- **Lock-on targeting** - Hold to charge, release to fire
- **Rhythm sync** - Beat-perfect shots increase multiplier
- **Overdrive** - Fill gauge for power-up mode

## Documentation

See `docs/REZ-HD-BEST-PRACTICES.md` for detailed development guidelines.
