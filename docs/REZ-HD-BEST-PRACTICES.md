# REZ HD Clone - Best Practices & System Prompt

> Building a faithful REZ HD-style on-rails rhythm shooter in React Three Fiber

## Tech Stack

- **Framework**: Next.js 15+ or Vite
- **3D**: @react-three/fiber, @react-three/drei, three.js
- **Physics**: @react-three/rapier (light usage)
- **ECS**: Koota
- **State**: Zustand
- **Debug**: Leva, r3f-perf
- **Target**: 60fps on mid-range hardware

---

## 🎮 Core Gameplay Rules (REZ HD Faithful)

### 1. Player Ship
- Glowing wireframe polyhedron sphere/cube
- Auto-moves forward along spline track (`CatmullRomCurve3`)
- Player controls: mouse/keyboard/gamepad for lateral + vertical movement (no full 6DOF)

### 2. Lock-On System
- Hold SPACE/LEFT_MOUSE → charge 8 lock spheres (visualize as orbiting particles)
- Auto-target nearest enemies/viruses (raycast or distance sort, max 8)
- Release → simultaneous shot, destroys locked targets

### 3. Rhythm Sync
- Use WebAudio `AnalyserNode` for beat detection (music-driven spawns/shots)
- Shots fired PERFECTLY on-beat (within 100ms window) → score multiplier ramp (1x → 100x)
- Visualize with color flashes, vibration

### 4. Scoring
- Base points per enemy + multiplier chain
- Combo breaks on miss/off-beat
- Overdrive gauge fills on sync shots
- Release for temporary power-up: morph to advanced form (bigger ship, more locks, AOE)

### 5. Enemies/Viruses
- Geometric wireframe polyhedra (tetrahedrons, cubes)
- Spawn in waves synced to music beats
- Fly towards player on bezier paths
- Types: basic (1-hit), armored (multi-lock), boss segments

### 6. Levels
- 5 areas, each ~2-3min track (spline-exported from Blender/GLTF)
- Escalating speed/density
- Procedural elements: random enemy flocks, pickups (score boosts)

### 7. Audio-Visual Synesthesia
- EVERY action (shot, hit, spawn) triggers particles, bloom, color pulses synced to music
- Wireframe shaders (`THREE.WireframeGeometry`)
- PostFX: bloom, godrays, distortion on overdrive

### 8. Game States
- Title → Level Select (1-5) → Play → Score Screen
- Highscore persist via localStorage
- Trance electronic OST (free assets or procedural)

---

## ⚡ Performance Rules (ABSOLUTE)

**60FPS MANDATORY**. Profile constantly with r3f-perf, Spector.js, Chrome DevTools.
Target: <1ms JS, <16ms GPU/frame.

| Category | Rules |
|----------|-------|
| **React Tree** | ❌ NO state/props in useFrame/hot paths. Mutate refs DIRECTLY (`ref.current.position.lerp(...)`). React = setup only. Use Zustand with minimal subscriptions. |
| **useFrame** | ✅ Mutate EVERYTHING here: rail progress, enemy positions, particles, camera shake. Use `THREE.MathUtils.damp` for smoothing. ❌ NEVER setState(). |
| **Object Reuse** | ✅ Pool ALL: 500+ enemies/bullets/lasers via class arrays. `InstancedMesh` for flocks/particles (`<Instances>`). Share geometries/materials globally. ❌ No create/destroy in loop. |
| **Rendering** | `<Canvas frameloop="always" dpr={[1,2]}>` for gameplay. LOD for distant meshes. On-demand for menus. |
| **Physics/Collisions** | Light: distance checks or raycast forward. Rapier ONLY for player rail. Custom AABB for locks. |
| **Assets** | GLTF compressed (Draco). 1 shared atlas for textures. Procedural geometries for enemies. |

---

## 🏗️ Architecture

```
src/
├── stores/      # Zustand: useGameStore({ musicTime, score, multiplier, overdrive })
├── hooks/       # useRailProgress, useBeatDetector, useLockOn, useParticlePool
├── components/  # <Canvas>, <Player />, <EnemyPool />, <Track />, <PostFX />
├── shaders/     # Wireframe.frag, Glow.vert (TSL if WebGPU)
├── levels/      # level1.json (spline points, spawn events)
└── utils/       # poolManager.ts, audioManager.ts
```

### State Management
- Zustand slices: game, audio, ui
- NO React Context for performance

### Audio
- Howler.js or native WebAudio
- `AnalyserNode.getFloatFrequencyData()` → beat peaks → spawn/shoot feedback

### Controls
- `@react-three/drei` useKeyboardControls + PointerLock
- Gamepad API support

### Debug
- Leva panel (toggleable)
- r3f-perf in corner

---

## 🎨 Visual Style Rules

### Art Direction
- Low-poly wireframe (`BasicMaterial` + Wireframe)
- Neon glow (unlit shader + bloom)
- Frutiger Aero / Tron aesthetic

### Effects
- Particles (`THREE.Points` + GPUCompute if needed)
- Trails (drei `<Trail>`)
- Camera shake/dolly on hits

### Post-Processing
- EffectComposer → BloomPass, FXAA, ColorCorrection
- WebGPU/TSL for future-proof

### UI
- Minimal HTML overlay (score, multiplier)
- Glassmorphism / holographic elements

---

## 🚀 Development Rules

1. **Iterate**: Build ONE level first → perf test → add mechanics → polish
2. **Code Style**: TypeScript strict. `useLayoutEffect` for sync. Memo EVERY component
3. **Assets**: Free resources from Kenney.nl, OpenGameArt. Blender for splines
4. **Output**: Commit-ready PRs. Live Vercel demo each step
5. **Edge Cases**: Pause/resume, low FPS fallback (reduce particles), PWA install

---

## 📚 References

- [R3F Performance Pitfalls](https://docs.pmnd.rs/react-three-fiber/advanced/pitfalls)
- [pmndrs Scaling Guide](https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance)
- [Mario Kart 3.js](https://github.com/Lunakepio/Mario-Kart-3.js) - Performance reference
- [Drei Documentation](https://github.com/pmndrs/drei)
- [Koota ECS](https://github.com/pmndrs/koota)

---

## 🎯 Build Order

1. Rail track + player movement
2. Basic enemy spawning
3. Lock-on targeting system
4. Audio integration + beat detection
5. Scoring + multiplier system
6. Visual effects (particles, bloom)
7. Overdrive mechanic
8. Level progression
9. Polish + optimization
