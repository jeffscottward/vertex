import { useSend, useGameState } from '../../hooks/useGameMachine'
import { SettingsPanel } from './SettingsPanel'

export function PauseOverlay() {
  const send = useSend()
  const isInSettings = useGameState((state) => state.matches({ paused: 'settings' }))
  const isInControls = useGameState((state) => state.matches({ paused: 'controls' }))

  // Show settings or controls panel if in those substates
  if (isInSettings || isInControls) {
    return <SettingsPanel />
  }

  return (
    <div
      data-component-id="pause-overlay-root"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        fontFamily: '"Courier New", monospace',
      }}
    >
      <div
        data-component-id="pause-overlay-menu"
        style={{
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            letterSpacing: '10px',
            textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff',
            color: '#00ffff',
            margin: 0,
            marginBottom: '40px',
          }}
        >
          PAUSED
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button
            data-component-id="pause-overlay-resume"
            onClick={() => send({ type: 'RESUME' })}
            style={{
              padding: '15px 60px',
              fontSize: '18px',
              letterSpacing: '3px',
              background: 'transparent',
              border: '2px solid #00ffff',
              color: '#00ffff',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#00ffff'
              e.currentTarget.style.color = '#000'
              e.currentTarget.style.boxShadow = '0 0 20px #00ffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#00ffff'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            RESUME
          </button>

          <button
            data-component-id="pause-overlay-settings"
            onClick={() => send({ type: 'OPEN_SETTINGS' })}
            style={{
              padding: '15px 60px',
              fontSize: '18px',
              letterSpacing: '3px',
              background: 'transparent',
              border: '2px solid #666',
              color: '#666',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#999'
              e.currentTarget.style.color = '#999'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#666'
              e.currentTarget.style.color = '#666'
            }}
          >
            SETTINGS
          </button>

          <button
            data-component-id="pause-overlay-restart"
            onClick={() => send({ type: 'RESTART' })}
            style={{
              padding: '15px 60px',
              fontSize: '18px',
              letterSpacing: '3px',
              background: 'transparent',
              border: '2px solid #ff00ff',
              color: '#ff00ff',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff00ff'
              e.currentTarget.style.color = '#000'
              e.currentTarget.style.boxShadow = '0 0 20px #ff00ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#ff00ff'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            RESTART
          </button>

          <button
            data-component-id="pause-overlay-quit"
            onClick={() => send({ type: 'GO_BACK' })}
            style={{
              padding: '15px 60px',
              fontSize: '18px',
              letterSpacing: '3px',
              background: 'transparent',
              border: '2px solid #ff0044',
              color: '#ff0044',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff0044'
              e.currentTarget.style.color = '#000'
              e.currentTarget.style.boxShadow = '0 0 20px #ff0044'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#ff0044'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            QUIT TO TITLE
          </button>
        </div>

        <div
          style={{
            marginTop: '40px',
            fontSize: '12px',
            color: '#666',
            letterSpacing: '2px',
          }}
        >
          PRESS ESC TO RESUME
        </div>
      </div>
    </div>
  )
}
