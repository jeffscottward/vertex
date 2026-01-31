import { useGameStore } from '../../stores/gameStore'
import { useMenuStore } from '../../stores/menuStore'

interface MenuButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}

function MenuButton({ children, onClick, variant = 'secondary' }: MenuButtonProps) {
  const colors = {
    primary: { border: '#00ffff', text: '#00ffff', hoverBg: '#00ffff' },
    secondary: { border: '#666', text: '#888', hoverBg: '#444' },
    danger: { border: '#ff4444', text: '#ff4444', hoverBg: '#ff4444' },
  }

  const color = colors[variant]

  return (
    <button
      onClick={onClick}
      style={{
        width: '200px',
        padding: '12px 24px',
        fontSize: '14px',
        letterSpacing: '2px',
        background: 'transparent',
        border: `1px solid ${color.border}`,
        color: color.text,
        cursor: 'pointer',
        fontFamily: '"Courier New", monospace',
        textTransform: 'uppercase',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = color.hoverBg
        e.currentTarget.style.color = variant === 'secondary' ? '#fff' : '#000'
        e.currentTarget.style.boxShadow = `0 0 15px ${color.border}`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = color.text
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </button>
  )
}

export function PauseOverlay() {
  const { setGameState, resetScore, resetMultiplier } = useGameStore()
  const { closePause, openSettings, openControls } = useMenuStore()

  const handleResume = () => {
    closePause()
    setGameState('playing')
  }

  const handleSettings = () => {
    openSettings()
  }

  const handleControls = () => {
    openControls()
  }

  const handleQuitToMenu = () => {
    closePause()
    resetScore()
    resetMultiplier()
    setGameState('title')
  }

  return (
    <div
      data-component-id="ui-pause-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        fontFamily: '"Courier New", monospace',
        color: '#fff',
        zIndex: 100,
      }}
    >
      {/* Pause Title */}
      <h1
        style={{
          fontSize: '48px',
          fontWeight: 'bold',
          letterSpacing: '10px',
          margin: 0,
          marginBottom: '50px',
          textShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
        }}
      >
        PAUSED
      </h1>

      {/* Menu Options */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          alignItems: 'center',
        }}
      >
        <MenuButton onClick={handleResume} variant="primary">
          Resume
        </MenuButton>

        <MenuButton onClick={handleSettings}>
          Settings
        </MenuButton>

        <MenuButton onClick={handleControls}>
          Controls
        </MenuButton>

        <div style={{ height: '20px' }} />

        <MenuButton onClick={handleQuitToMenu} variant="danger">
          Quit to Menu
        </MenuButton>
      </div>

      {/* Input hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          fontSize: '11px',
          opacity: 0.5,
          letterSpacing: '2px',
        }}
      >
        PRESS ESC OR START TO RESUME
      </div>
    </div>
  )
}
