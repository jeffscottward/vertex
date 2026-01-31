import { useState, useEffect } from 'react'

interface InputIndicatorProps {
  inputSource: 'keyboard' | 'gamepad'
  isGamepadConnected: boolean
}

export function InputIndicator({ inputSource, isGamepadConnected }: InputIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(true)

  // Hide indicator after 3 seconds of no input change
  useEffect(() => {
    setShowIndicator(true)
    const timer = setTimeout(() => setShowIndicator(false), 3000)
    return () => clearTimeout(timer)
  }, [inputSource])

  if (!showIndicator) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: '100px',
      right: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      opacity: 0.7,
      transition: 'opacity 0.3s',
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: '#fff',
    }}>
      {/* Keyboard icon */}
      <div style={{
        padding: '8px 12px',
        border: `2px solid ${inputSource === 'keyboard' ? '#00ffff' : '#333'}`,
        borderRadius: '4px',
        color: inputSource === 'keyboard' ? '#00ffff' : '#666',
        transition: 'all 0.2s',
      }}>
        <span style={{ marginRight: '5px' }}>⌨</span>
        KB/M
      </div>

      {/* Gamepad icon */}
      <div style={{
        padding: '8px 12px',
        border: `2px solid ${inputSource === 'gamepad' ? '#ff00ff' : isGamepadConnected ? '#333' : '#222'}`,
        borderRadius: '4px',
        color: inputSource === 'gamepad' ? '#ff00ff' : isGamepadConnected ? '#666' : '#333',
        transition: 'all 0.2s',
        opacity: isGamepadConnected ? 1 : 0.3,
      }}>
        <span style={{ marginRight: '5px' }}>🎮</span>
        {isGamepadConnected ? 'PAD' : 'N/A'}
      </div>
    </div>
  )
}
