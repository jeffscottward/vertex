import { useRef, useEffect, useState } from 'react'
import { useIsPlaying, useLockedTargets } from '../hooks/useGameMachine'

export function Crosshair() {
  const isPlaying = useIsPlaying()
  const lockedTargets = useLockedTargets()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHoldingFire, setIsHoldingFire] = useState(false)
  const animationRef = useRef(0)

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) setIsHoldingFire(true)
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) setIsHoldingFire(false)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsHoldingFire(true)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsHoldingFire(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Animation frame for pulsing effect
  useEffect(() => {
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [])

  if (!isPlaying) return null

  const lockCount = lockedTargets.length
  const boxSize = isHoldingFire ? 100 + lockCount * 5 : 80
  const pulseScale = isHoldingFire ? 1 + Math.sin(Date.now() * 0.01) * 0.05 : 1
  const crosshairColor = isHoldingFire ? '#ff00ff' : '#00ffff'
  const boxColor = lockCount > 0 ? '#ff00ff' : '#00ffff'

  return (
    <div
      data-component-id="ui-crosshair"
      style={{
        position: 'fixed',
        left: mousePos.x,
        top: mousePos.y,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {/* Lock-on bounding box (Rez style) */}
      <div
        data-component-id="ui-lock-box"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${pulseScale}) rotate(${isHoldingFire ? 45 : 0}deg)`,
          width: `${boxSize}px`,
          height: `${boxSize}px`,
          border: `2px solid ${boxColor}`,
          borderRadius: isHoldingFire ? '0' : '4px',
          opacity: isHoldingFire ? 0.9 : 0.5,
          boxShadow: isHoldingFire ? `0 0 20px ${boxColor}, inset 0 0 10px ${boxColor}33` : 'none',
          transition: 'all 0.15s ease-out',
        }}
      >
        {/* Corner brackets */}
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          width: '15px',
          height: '15px',
          borderTop: `3px solid ${crosshairColor}`,
          borderLeft: `3px solid ${crosshairColor}`,
        }} />
        <div style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '15px',
          height: '15px',
          borderTop: `3px solid ${crosshairColor}`,
          borderRight: `3px solid ${crosshairColor}`,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          left: '-2px',
          width: '15px',
          height: '15px',
          borderBottom: `3px solid ${crosshairColor}`,
          borderLeft: `3px solid ${crosshairColor}`,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          right: '-2px',
          width: '15px',
          height: '15px',
          borderBottom: `3px solid ${crosshairColor}`,
          borderRight: `3px solid ${crosshairColor}`,
        }} />
      </div>

      {/* Center crosshair */}
      <div
        data-component-id="ui-crosshair-center"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Horizontal line */}
        <div style={{
          position: 'absolute',
          left: '-12px',
          top: '-1px',
          width: '8px',
          height: '2px',
          background: crosshairColor,
          boxShadow: `0 0 5px ${crosshairColor}`,
        }} />
        <div style={{
          position: 'absolute',
          right: '-12px',
          top: '-1px',
          width: '8px',
          height: '2px',
          background: crosshairColor,
          boxShadow: `0 0 5px ${crosshairColor}`,
        }} />

        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '-1px',
          width: '2px',
          height: '8px',
          background: crosshairColor,
          boxShadow: `0 0 5px ${crosshairColor}`,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-12px',
          left: '-1px',
          width: '2px',
          height: '8px',
          background: crosshairColor,
          boxShadow: `0 0 5px ${crosshairColor}`,
        }} />

        {/* Center dot */}
        <div style={{
          position: 'absolute',
          left: '-3px',
          top: '-3px',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: crosshairColor,
          boxShadow: `0 0 8px ${crosshairColor}`,
        }} />
      </div>

      {/* Lock count indicator */}
      {lockCount > 0 && (
        <div
          data-component-id="ui-lock-count"
          style={{
            position: 'absolute',
            left: '50%',
            top: `${boxSize / 2 + 15}px`,
            transform: 'translateX(-50%)',
            fontFamily: '"Courier New", monospace',
            fontSize: '12px',
            color: '#ff00ff',
            textShadow: '0 0 5px #ff00ff',
            letterSpacing: '2px',
          }}
        >
          LOCK x{lockCount}
        </div>
      )}

      {/* Lock orbs around crosshair when locking */}
      {isHoldingFire && (
        <div data-component-id="ui-lock-orbs">
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2 + Date.now() * 0.002
            const radius = 50
            const isActive = i < lockCount
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${Math.cos(angle) * radius}px`,
                  top: `${Math.sin(angle) * radius}px`,
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isActive ? '#ff00ff' : 'transparent',
                  border: `2px solid ${isActive ? '#ff00ff' : '#00ffff'}`,
                  boxShadow: isActive ? '0 0 10px #ff00ff' : 'none',
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.1s ease',
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
