# React Three Fiber (R3F) Best Practices & Modern Patterns (2024-2026)

A comprehensive guide to the latest React Three Fiber ecosystem, performance patterns, and game development approaches.

---

## 1. Performance Patterns for 60fps Games

### On-Demand Rendering

For scenes with minimal movement, avoid wasteful continuous rendering:

```typescript
import { Canvas } from '@react-three/fiber'

function App() {
  return (
    <Canvas frameloop="demand">
      {/* Your scene */}
    </Canvas>
  )
}
```

When you need to trigger a re-render manually:

```typescript
import { useThree } from '@react-three/fiber'

function MyComponent() {
  const invalidate = useThree((state) => state.invalidate)

  const handleChange = () => {
    // After making changes
    invalidate()
  }
}
```

### Mutation Over State Updates

**Critical**: Never use React state inside `useFrame`. Mutate directly:

```typescript
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

function RotatingBox() {
  const meshRef = useRef<Mesh>(null!)

  useFrame((state, delta) => {
    // GOOD: Direct mutation
    meshRef.current.rotation.x += delta
    meshRef.current.rotation.y += delta * 0.5
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  )
}
```

### Shared Materials and Geometries

Avoid expensive object creation by sharing resources:

```typescript
import { useMemo } from 'react'
import { BoxGeometry, MeshStandardMaterial } from 'three'

function OptimizedBoxes({ count }: { count: number }) {
  const [geometry, material] = useMemo(() => {
    return [
      new BoxGeometry(1, 1, 1),
      new MeshStandardMaterial({ color: 'orange' })
    ]
  }, [])

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={material}
          position={[i * 2, 0, 0]}
        />
      ))}
    </>
  )
}
```

### Performance Monitoring with r3f-perf

```typescript
import { Perf } from 'r3f-perf'

function Scene() {
  return (
    <>
      <Perf position="top-left" />
      {/* Your scene content */}
    </>
  )
}
```

---

## 2. Instancing and Object Pooling

### Native InstancedMesh (Best Performance)

For maximum performance with thousands of objects:

```typescript
import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D } from 'three'

const COUNT = 10000

function InstancedCubes() {
  const meshRef = useRef<InstancedMesh>(null!)
  const tempObject = useMemo(() => new Object3D(), [])

  useEffect(() => {
    for (let i = 0; i < COUNT; i++) {
      tempObject.position.set(
        Math.random() * 100 - 50,
        Math.random() * 100 - 50,
        Math.random() * 100 - 50
      )
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [tempObject])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="hotpink" />
    </instancedMesh>
  )
}
```

### Declarative Instances with Drei

For more declarative approach with moderate object counts:

```typescript
import { Instances, Instance } from '@react-three/drei'

function DeclarativeInstances() {
  return (
    <Instances limit={1000}>
      <boxGeometry />
      <meshStandardMaterial />

      {positions.map((pos, i) => (
        <Instance key={i} position={pos} color="orange" />
      ))}
    </Instances>
  )
}
```

**Note**: Declarative instances have higher CPU overhead. For foliage or particle systems with thousands of instances, use native `InstancedMesh` directly.

---

## 3. TypeScript Patterns for R3F

### Typed Refs

```typescript
import { useRef } from 'react'
import { Mesh, Group, PointLight } from 'three'

function TypedComponent() {
  // Non-null assertion for refs that will definitely be assigned
  const meshRef = useRef<Mesh>(null!)
  const groupRef = useRef<Group>(null!)
  const lightRef = useRef<PointLight>(null!)

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
      <pointLight ref={lightRef} />
    </group>
  )
}
```

### Typed Component Props with ThreeElements

```typescript
import { ThreeElements } from '@react-three/fiber'
import { forwardRef } from 'react'
import { Mesh } from 'three'

type BoxProps = ThreeElements['mesh'] & {
  color?: string
  size?: number
}

const Box = forwardRef<Mesh, BoxProps>(({ color = 'orange', size = 1, ...props }, ref) => {
  return (
    <mesh ref={ref} {...props}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
})
```

### V9 Changes: ThreeElements Interface

In R3F v9, hardcoded exports like `MeshProps` were removed. Access them via `ThreeElements`:

```typescript
import { ThreeElements } from '@react-three/fiber'

type MeshProps = ThreeElements['mesh']
type GroupProps = ThreeElements['group']
type PointLightProps = ThreeElements['pointLight']
```

---

## 4. ECS Approaches

### Koota ECS (pmndrs Official)

```typescript
import { createWorld, trait } from 'koota'
import { useQuery } from 'koota/react'

// Define traits
const Position = trait({ x: 0, y: 0, z: 0 })
const Velocity = trait({ x: 0, y: 0, z: 0 })
const Health = trait({ current: 100, max: 100 })

// Create world
const world = createWorld()

// Spawn entities
const player = world.spawn(Position, Velocity, Health)

// System function
function movementSystem(delta: number) {
  world.query(Position, Velocity).each((entity) => {
    const pos = entity.get(Position)
    const vel = entity.get(Velocity)
    pos.x += vel.x * delta
    pos.y += vel.y * delta
    pos.z += vel.z * delta
  })
}

// React component using queries
function Enemies() {
  const enemies = useQuery(Position, Health)

  return (
    <>
      {enemies.map((entity) => {
        const pos = entity.get(Position)
        return (
          <mesh key={entity.id} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry />
            <meshStandardMaterial color="red" />
          </mesh>
        )
      })}
    </>
  )
}
```

### Miniplex ECS Alternative

```typescript
import { World } from 'miniplex'
import { createReactAPI } from 'miniplex-react'
import { Vector3 } from 'three'

type Entity = {
  position: Vector3
  velocity?: Vector3
  health?: { current: number; max: number }
  isPlayer?: true
}

const world = new World<Entity>()
const ECS = createReactAPI(world)

const moving = world.with('velocity')

function MovementSystem() {
  useFrame((_, delta) => {
    for (const entity of moving) {
      entity.position.addScaledVector(entity.velocity!, delta)
    }
  })
  return null
}
```

---

## 5. Physics with react-three-rapier

### Basic Setup

```typescript
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'

function Game() {
  return (
    <Physics gravity={[0, -9.81, 0]} debug>
      <RigidBody type="fixed">
        <mesh position={[0, -1, 0]}>
          <boxGeometry args={[20, 1, 20]} />
          <meshStandardMaterial color="green" />
        </mesh>
      </RigidBody>

      <RigidBody colliders="ball" restitution={0.8}>
        <mesh position={[0, 5, 0]}>
          <sphereGeometry args={[0.5]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </RigidBody>
    </Physics>
  )
}
```

### Rapier vs Cannon Comparison

| Feature | Rapier | Cannon |
|---------|--------|--------|
| Language | Rust (WASM) | JavaScript |
| Performance | Higher (near-native) | Good |
| Determinism | Built-in | Not guaranteed |
| R3F Package | @react-three/rapier v2 | @react-three/cannon |

---

## 6. Character Controllers with Ecctrl

```typescript
import { KeyboardControls } from '@react-three/drei'
import Ecctrl, { EcctrlAnimation } from 'ecctrl'

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['ShiftLeft'] },
]

const animationSet = {
  idle: 'Idle',
  walk: 'Walk',
  run: 'Run',
  jump: 'Jump',
}

function Game() {
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas>
        <Physics>
          <Ecctrl animated capsuleHalfHeight={0.35} capsuleRadius={0.3}>
            <EcctrlAnimation animationSet={animationSet}>
              <CharacterModel />
            </EcctrlAnimation>
          </Ecctrl>
        </Physics>
      </Canvas>
    </KeyboardControls>
  )
}
```

### Mobile Joystick Support

```typescript
import { EcctrlJoystick } from 'ecctrl'

function App() {
  return (
    <>
      <EcctrlJoystick />  {/* Outside Canvas */}
      <Canvas>
        <Physics>
          <Ecctrl>{/* ... */}</Ecctrl>
        </Physics>
      </Canvas>
    </>
  )
}
```

---

## 7. TSL (Three Shading Language) for WebGPU

### Basic TSL Setup

```typescript
import { Canvas } from '@react-three/fiber'
import { WebGPURenderer } from 'three/webgpu'
import { MeshBasicNodeMaterial, color, uv, sin, time } from 'three/tsl'

function TSLMaterial() {
  const material = new MeshBasicNodeMaterial()

  material.colorNode = color(
    sin(uv().x.mul(10).add(time)),
    sin(uv().y.mul(10).add(time.mul(0.5))),
    0.5
  )

  return material
}

function App() {
  return (
    <Canvas
      gl={async (canvas) => {
        const renderer = new WebGPURenderer({ canvas })
        await renderer.init()
        return renderer
      }}
    >
      <mesh>
        <boxGeometry />
        <primitive object={TSLMaterial()} attach="material" />
      </mesh>
    </Canvas>
  )
}
```

### TSL Benefits

- **Renderer agnostic**: Compiles to both GLSL (WebGL) and WGSL (WebGPU)
- **Type safety**: JavaScript-based with proper IDE support
- **Better debugging**: JavaScript stack traces instead of shader errors
- **Automatic optimization**: Dead code elimination, uniform reuse

---

## 8. State Management with Zustand

### Game Store Pattern

```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface GameState {
  phase: 'menu' | 'playing' | 'paused' | 'gameover'
  score: number
  health: number

  startGame: () => void
  pauseGame: () => void
  addScore: (points: number) => void
  takeDamage: (amount: number) => void
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: 'menu',
    score: 0,
    health: 100,

    startGame: () => set({ phase: 'playing', score: 0, health: 100 }),
    pauseGame: () => set({ phase: 'paused' }),

    addScore: (points) => set((state) => ({ score: state.score + points })),

    takeDamage: (amount) => {
      const newHealth = Math.max(0, get().health - amount)
      set({ health: newHealth })
      if (newHealth <= 0) set({ phase: 'gameover' })
    },
  }))
)
```

### Selective Subscriptions (Performance Critical)

```typescript
// BAD: Re-renders on ANY state change
function BadComponent() {
  const state = useGameStore()
  return <div>{state.score}</div>
}

// GOOD: Only re-renders when score changes
function GoodComponent() {
  const score = useGameStore((state) => state.score)
  return <div>{score}</div>
}

// For useFrame: Use getState() to avoid re-renders
function GameLoop() {
  useFrame(() => {
    const { phase, score } = useGameStore.getState()
    if (phase === 'playing') {
      // Update game logic
    }
  })
  return null
}
```

---

## 9. Post-Processing Effects

### Basic Setup

```typescript
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'

function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.5}
        luminanceThreshold={1}
        luminanceSmoothing={0.9}
        mipmapBlur
        kernelSize={KernelSize.LARGE}
      />
      <Vignette offset={0.5} darkness={0.5} />
      <ChromaticAberration offset={[0.002, 0.002]} />
    </EffectComposer>
  )
}
```

### Selective Bloom (Emissive Materials)

```typescript
function GlowingObject() {
  return (
    <mesh>
      <sphereGeometry />
      <meshStandardMaterial
        color="white"
        emissive="cyan"
        emissiveIntensity={2}  // Values > 1 will glow with bloom
      />
    </mesh>
  )
}
```

---

## 10. Offscreen Rendering with Web Workers

### Basic Setup

```typescript
// App.tsx - Main thread
import { Canvas } from '@react-three/offscreen'

const worker = new Worker(new URL('./worker.tsx', import.meta.url), { type: 'module' })

function App() {
  return (
    <Canvas
      worker={worker}
      fallback={<Scene />}
      dpr={[1, 2]}
      shadows
    />
  )
}

// worker.tsx - Worker thread
import { render } from '@react-three/offscreen'

render(<Scene />)
```

### Key Benefits

- **Unblocks main thread**: Heavy rendering doesn't affect UI responsiveness
- **Automatic fallback**: Falls back to main thread if OffscreenCanvas unsupported
- **Event forwarding**: DOM events are automatically forwarded to worker

---

## 11. Gamepad / Controller Support

### Browser Gamepad API

```typescript
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

interface GamepadState {
  axes: number[]
  buttons: boolean[]
}

function useGamepad() {
  const state = useRef<GamepadState>({ axes: [], buttons: [] })

  useFrame(() => {
    const gamepads = navigator.getGamepads()
    const gp = gamepads[0]

    if (gp) {
      state.current.axes = [...gp.axes]
      state.current.buttons = gp.buttons.map(b => b.pressed)
    }
  })

  return state
}

function PlayerController() {
  const gamepad = useGamepad()
  const playerRef = useRef<Mesh>(null!)

  useFrame((_, delta) => {
    const { axes } = gamepad.current
    if (axes.length >= 2) {
      playerRef.current.position.x += axes[0] * delta * 5
      playerRef.current.position.z += axes[1] * delta * 5
    }
  })

  return <mesh ref={playerRef}>{/* ... */}</mesh>
}
```

---

## 12. Model Loading with GLTFJSX

### CLI Usage

```bash
# Basic conversion
npx gltfjsx model.glb

# With TypeScript types
npx gltfjsx model.glb --types

# With compression (up to 70-90% size reduction)
npx gltfjsx model.glb -T
```

### Generated Component Example

```typescript
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { Mesh, MeshStandardMaterial } from 'three'

type GLTFResult = GLTF & {
  nodes: { Body: Mesh; Head: Mesh }
  materials: { skin: MeshStandardMaterial }
}

export function Character(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/character.glb') as GLTFResult

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Body.geometry} material={materials.skin} />
      <mesh geometry={nodes.Head.geometry} material={materials.skin} />
    </group>
  )
}

useGLTF.preload('/character.glb')
```

---

## Summary of Key Recommendations

1. **Performance**: Use `frameloop="demand"` for static scenes, mutate in `useFrame`, share materials/geometries
2. **Physics**: Use `@react-three/rapier` v2 for best performance (WASM-based)
3. **Character Controllers**: Use `ecctrl` for quick setup with keyboard/joystick support
4. **ECS**: Use `koota` (pmndrs official) or `miniplex` for data-oriented game architecture
5. **State Management**: Use Zustand with selective subscriptions, `getState()` in useFrame
6. **Shaders**: Learn TSL for future-proof WebGPU compatibility
7. **Models**: Use `gltfjsx` with compression for optimized loading
8. **Instancing**: Use native `InstancedMesh` for thousands of objects
9. **Post-Processing**: Use `@react-three/postprocessing` with selective bloom via emissive materials
10. **R3F v10**: Prepare for WebGPU support and new scheduler features

---

## References

- [R3F Documentation](https://r3f.docs.pmnd.rs/)
- [Drei Documentation](https://drei.docs.pmnd.rs/)
- [Koota GitHub](https://github.com/pmndrs/koota)
- [Ecctrl GitHub](https://github.com/pmndrs/ecctrl)
- [react-three-rapier GitHub](https://github.com/pmndrs/react-three-rapier)
- [GLTFJSX GitHub](https://github.com/pmndrs/gltfjsx)
