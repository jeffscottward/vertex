import { useRef, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

export interface InputState {
  // Movement (normalized -1 to 1)
  moveX: number
  moveY: number

  // Camera/Aim (normalized -1 to 1)
  aimX: number
  aimY: number

  // Actions
  fire: boolean
  firePressed: boolean  // Just pressed this frame
  fireReleased: boolean // Just released this frame

  overdrive: boolean
  overdrivePressed: boolean // Just pressed this frame

  shield: boolean
  shieldPressed: boolean // Just pressed this frame

  pause: boolean

  // Input source
  inputSource: 'keyboard' | 'gamepad'
}

export interface InputConfig {
  deadzone?: number
  mouseSensitivity?: number
}

const DEFAULT_CONFIG: Required<InputConfig> = {
  deadzone: 0.15,
  mouseSensitivity: 1,
}

// Keyboard key states
interface KeyState {
  w: boolean
  a: boolean
  s: boolean
  d: boolean
  arrowUp: boolean
  arrowDown: boolean
  arrowLeft: boolean
  arrowRight: boolean
  space: boolean
  shift: boolean
  escape: boolean
  e: boolean
}

export function useInput(config: InputConfig = {}) {
  const settings = { ...DEFAULT_CONFIG, ...config }

  const inputState = useRef<InputState>({
    moveX: 0,
    moveY: 0,
    aimX: 0,
    aimY: 0,
    fire: false,
    firePressed: false,
    fireReleased: false,
    overdrive: false,
    overdrivePressed: false,
    shield: false,
    shieldPressed: false,
    pause: false,
    inputSource: 'keyboard',
  })

  const keyState = useRef<KeyState>({
    w: false,
    a: false,
    s: false,
    d: false,
    arrowUp: false,
    arrowDown: false,
    arrowLeft: false,
    arrowRight: false,
    space: false,
    shift: false,
    escape: false,
    e: false,
  })

  const mouseState = useRef({
    x: 0,
    y: 0,
    leftButton: false,
    rightButton: false,
    prevLeftButton: false,
  })

  const gamepadState = useRef({
    connected: false,
    index: -1,
    lastInputTime: 0,
  })

  const lastInputSource = useRef<'keyboard' | 'gamepad'>('keyboard')

  // Apply deadzone to axis value
  const applyDeadzone = useCallback((value: number): number => {
    if (Math.abs(value) < settings.deadzone) return 0
    // Rescale value after deadzone
    const sign = value > 0 ? 1 : -1
    return sign * (Math.abs(value) - settings.deadzone) / (1 - settings.deadzone)
  }, [settings.deadzone])

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      lastInputSource.current = 'keyboard'

      switch (e.code) {
        case 'KeyW': keyState.current.w = true; break
        case 'KeyA': keyState.current.a = true; break
        case 'KeyS': keyState.current.s = true; break
        case 'KeyD': keyState.current.d = true; break
        case 'ArrowUp': keyState.current.arrowUp = true; break
        case 'ArrowDown': keyState.current.arrowDown = true; break
        case 'ArrowLeft': keyState.current.arrowLeft = true; break
        case 'ArrowRight': keyState.current.arrowRight = true; break
        case 'Space': keyState.current.space = true; e.preventDefault(); break
        case 'ShiftLeft':
        case 'ShiftRight': keyState.current.shift = true; break
        case 'Escape': keyState.current.escape = true; break
        case 'KeyE': keyState.current.e = true; break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': keyState.current.w = false; break
        case 'KeyA': keyState.current.a = false; break
        case 'KeyS': keyState.current.s = false; break
        case 'KeyD': keyState.current.d = false; break
        case 'ArrowUp': keyState.current.arrowUp = false; break
        case 'ArrowDown': keyState.current.arrowDown = false; break
        case 'ArrowLeft': keyState.current.arrowLeft = false; break
        case 'ArrowRight': keyState.current.arrowRight = false; break
        case 'Space': keyState.current.space = false; break
        case 'ShiftLeft':
        case 'ShiftRight': keyState.current.shift = false; break
        case 'Escape': keyState.current.escape = false; break
        case 'KeyE': keyState.current.e = false; break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Mouse event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastInputSource.current = 'keyboard' // Mouse counts as keyboard input
      // Normalize to -1 to 1
      mouseState.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseState.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }

    const handleMouseDown = (e: MouseEvent) => {
      lastInputSource.current = 'keyboard'
      if (e.button === 0) mouseState.current.leftButton = true
      if (e.button === 2) mouseState.current.rightButton = true
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) mouseState.current.leftButton = false
      if (e.button === 2) mouseState.current.rightButton = false
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault() // Prevent right-click menu
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('contextmenu', handleContextMenu)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  // Gamepad connection handlers
  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log('Gamepad connected:', e.gamepad.id)
      gamepadState.current.connected = true
      gamepadState.current.index = e.gamepad.index
    }

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      console.log('Gamepad disconnected:', e.gamepad.id)
      if (e.gamepad.index === gamepadState.current.index) {
        gamepadState.current.connected = false
        gamepadState.current.index = -1
        lastInputSource.current = 'keyboard'
      }
    }

    window.addEventListener('gamepadconnected', handleGamepadConnected)
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected)

    // Check for already-connected gamepads
    const gamepads = navigator.getGamepads()
    for (const gp of gamepads) {
      if (gp) {
        gamepadState.current.connected = true
        gamepadState.current.index = gp.index
        break
      }
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected)
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected)
    }
  }, [])

  // Poll gamepad state
  const pollGamepad = useCallback(() => {
    if (!gamepadState.current.connected) return null

    const gamepads = navigator.getGamepads()
    const gp = gamepads[gamepadState.current.index]
    if (!gp) return null

    // Standard gamepad mapping:
    // Axes: 0=left stick X, 1=left stick Y, 2=right stick X, 3=right stick Y
    // Buttons: 0=A, 1=B, 2=X, 3=Y, 4=LB, 5=RB, 6=LT, 7=RT, 8=Back, 9=Start, etc.

    const leftX = applyDeadzone(gp.axes[0] || 0)
    const leftY = applyDeadzone(gp.axes[1] || 0)
    const rightX = applyDeadzone(gp.axes[2] || 0)
    const rightY = applyDeadzone(gp.axes[3] || 0)

    // Check if gamepad is being used
    const isActive = Math.abs(leftX) > 0 || Math.abs(leftY) > 0 ||
                     Math.abs(rightX) > 0 || Math.abs(rightY) > 0 ||
                     gp.buttons.some(b => b.pressed)

    if (isActive) {
      lastInputSource.current = 'gamepad'
      gamepadState.current.lastInputTime = performance.now()
    }

    return {
      leftX,
      leftY: -leftY, // Invert Y
      rightX,
      rightY: -rightY, // Invert Y
      a: gp.buttons[0]?.pressed || false,
      b: gp.buttons[1]?.pressed || false,
      x: gp.buttons[2]?.pressed || false,
      y: gp.buttons[3]?.pressed || false,
      lb: gp.buttons[4]?.pressed || false,
      rb: gp.buttons[5]?.pressed || false,
      lt: gp.buttons[6]?.value || 0,
      rt: gp.buttons[7]?.value || 0,
      back: gp.buttons[8]?.pressed || false,
      start: gp.buttons[9]?.pressed || false,
    }
  }, [applyDeadzone])

  // Update input state each frame
  useFrame(() => {
    const keys = keyState.current
    const mouse = mouseState.current
    const gamepad = pollGamepad()

    const prevFire = inputState.current.fire

    // Store previous states for press detection
    const prevOverdrive = inputState.current.overdrive
    const prevShield = inputState.current.shield

    // Determine input source and gather input
    if (lastInputSource.current === 'gamepad' && gamepad) {
      // Gamepad input
      inputState.current.moveX = gamepad.leftX
      inputState.current.moveY = gamepad.leftY
      inputState.current.aimX = gamepad.rightX
      inputState.current.aimY = gamepad.rightY

      // A button to fire (REZ-style: hold to lock, release to fire)
      inputState.current.fire = gamepad.a

      // B button for overdrive
      inputState.current.overdrive = gamepad.b

      // Y button for shield
      inputState.current.shield = gamepad.y

      // Start for pause
      inputState.current.pause = gamepad.start

      inputState.current.inputSource = 'gamepad'
    } else {
      // Keyboard/Mouse input
      // Movement: WASD moves the player, arrows also work
      // Note: A is now shield, so movement is W/S for forward/back, arrow keys for lateral
      let keyMoveX = 0
      let keyMoveY = 0
      if (keys.arrowLeft) keyMoveX -= 1
      if (keys.arrowRight) keyMoveX += 1
      if (keys.w || keys.arrowUp) keyMoveY += 1
      if (keys.arrowDown) keyMoveY -= 1

      // Mouse position for aiming (primary)
      inputState.current.aimX = mouse.x * settings.mouseSensitivity
      inputState.current.aimY = mouse.y * settings.mouseSensitivity

      // Movement follows mouse aim, with keyboard offset
      inputState.current.moveX = mouse.x + keyMoveX * 0.3
      inputState.current.moveY = mouse.y + keyMoveY * 0.3

      // Clamp values
      inputState.current.moveX = Math.max(-1, Math.min(1, inputState.current.moveX))
      inputState.current.moveY = Math.max(-1, Math.min(1, inputState.current.moveY))

      // D key or left click to fire (hold to lock, release to fire)
      inputState.current.fire = keys.d || mouse.leftButton

      // S key for overdrive activation
      inputState.current.overdrive = keys.s

      // A key for shield activation
      inputState.current.shield = keys.a

      // Escape for pause
      inputState.current.pause = keys.escape

      inputState.current.inputSource = 'keyboard'
    }

    // Detect overdrive/shield press
    inputState.current.overdrivePressed = inputState.current.overdrive && !prevOverdrive
    inputState.current.shieldPressed = inputState.current.shield && !prevShield

    // Detect fire press/release
    inputState.current.firePressed = inputState.current.fire && !prevFire
    inputState.current.fireReleased = !inputState.current.fire && prevFire

    // Update prev state for next frame
    mouse.prevLeftButton = mouse.leftButton
  })

  // Return current state getter
  const getInput = useCallback(() => inputState.current, [])

  // Check if gamepad is connected
  const isGamepadConnected = useCallback(() => gamepadState.current.connected, [])

  return {
    getInput,
    isGamepadConnected,
    inputState: inputState.current,
  }
}
