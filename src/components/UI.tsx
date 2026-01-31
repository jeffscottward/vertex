import { useEffect, useCallback } from 'react'
import { useGameStore } from '../stores/gameStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useMenuStore } from '../stores/menuStore'
import { PauseOverlay, SettingsPanel, ControlRebindPanel } from './menus'

export function UI() {
  const { score, multiplier, overdrive, gameState, setGameState, lockedTargets } = useGameStore()
  const { difficulty, graphicsQuality, setDifficulty, setGraphicsQuality } = useSettingsStore()
  const { currentScreen, openPause, closePause, openSettings, openControls } = useMenuStore()

  // Handle pause input
  const handlePauseToggle = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused')
      openPause()
    } else if (gameState === 'paused' && currentScreen === 'pause') {
      setGameState('playing')
      closePause()
    }
  }, [gameState, currentScreen, setGameState, openPause, closePause])

  // Listen for escape key for pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        // Don't handle if we're in a sub-menu (settings/controls)
        if (currentScreen === 'settings' || currentScreen === 'controls') {
          return // Let the menu handle its own back navigation
        }
        handlePauseToggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePauseToggle, currentScreen])

  // Sync menu state with game state
  useEffect(() => {
    if (gameState === 'title') {
      // Menu store shows main when at title
    }
  }, [gameState])

  const handleStartClick = () => {
    if (gameState === 'title') {
      setGameState('playing')
    }
  }

  // Render appropriate menu overlay
  const renderMenuOverlay = () => {
    if (gameState === 'paused' || currentScreen !== 'none') {
      switch (currentScreen) {
        case 'pause':
          return <PauseOverlay />
        case 'settings':
          return <SettingsPanel />
        case 'controls':
          return <ControlRebindPanel />
        default:
          return null
      }
    }
    return null
  }

  return (
    <div
      data-component-id="ui-root"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        fontFamily: '"Courier New", monospace',
        color: '#fff',
      }}
    >
      {/* Menu Overlays */}
      {renderMenuOverlay()}

      {/* HUD - Only show during gameplay */}
      {gameState === 'playing' && (
        <>
          {/* Score */}
          <div
            data-component-id="ui-score"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '12px', opacity: 0.7, letterSpacing: '2px' }}>
              SCORE
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff',
              color: '#00ffff',
            }}>
              {score.toLocaleString().padStart(8, '0')}
            </div>
          </div>

          {/* Multiplier */}
          <div
            data-component-id="ui-multiplier"
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: multiplier > 1 ? '#ff00ff' : '#444',
              textShadow: multiplier > 1 ? '0 0 20px #ff00ff' : 'none',
              transition: 'all 0.1s ease',
            }}>
              x{multiplier}
            </div>
          </div>

          {/* Overdrive Bar */}
          <div
            data-component-id="ui-overdrive"
            style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '250px',
            }}
          >
            <div style={{ fontSize: '10px', textAlign: 'center', marginBottom: '8px', letterSpacing: '3px', opacity: 0.7 }}>
              OVERDRIVE
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <div style={{
                width: `${overdrive}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ff00ff 0%, #00ffff 50%, #ff00ff 100%)',
                backgroundSize: '200% 100%',
                animation: overdrive > 80 ? 'shimmer 1s infinite linear' : 'none',
                borderRadius: '3px',
                transition: 'width 0.1s',
                boxShadow: overdrive > 50 ? '0 0 10px #ff00ff' : 'none',
              }} />
            </div>

            {/* Lock indicators */}
            <div data-component-id="ui-lock-indicators" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '15px' }}>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: '2px solid #00ffff',
                  background: i < lockedTargets.length ? '#00ffff' : 'transparent',
                  boxShadow: i < lockedTargets.length ? '0 0 8px #00ffff' : 'none',
                  transition: 'all 0.1s ease',
                }} />
              ))}
            </div>
          </div>

          {/* Pause hint */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              fontSize: '10px',
              opacity: 0.3,
              letterSpacing: '1px',
            }}
          >
            ESC TO PAUSE
          </div>
        </>
      )}

      {/* Title Screen */}
      {gameState === 'title' && (
        <div
          data-component-id="ui-title-screen"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'auto',
          }}
        >
          <h1 style={{
            fontSize: '72px',
            fontWeight: 'bold',
            margin: 0,
            letterSpacing: '15px',
            textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 80px #ff00ff',
            color: '#fff',
          }}>
            VERTEX
          </h1>
          <p style={{ fontSize: '14px', letterSpacing: '5px', opacity: 0.7, marginTop: '20px' }}>
            ON-RAILS RHYTHM SHOOTER
          </p>

          {/* Quick Settings */}
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '30px' }}>
            {/* Difficulty */}
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '2px', marginBottom: '8px', opacity: 0.7 }}>DIFFICULTY</div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      background: difficulty === d ? '#00ffff' : 'transparent',
                      border: `1px solid ${difficulty === d ? '#00ffff' : '#444'}`,
                      color: difficulty === d ? '#000' : '#666',
                      cursor: 'pointer',
                      fontFamily: '"Courier New", monospace',
                      textTransform: 'uppercase',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Graphics */}
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '2px', marginBottom: '8px', opacity: 0.7 }}>GRAPHICS</div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {(['low', 'medium', 'high'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGraphicsQuality(g)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      background: graphicsQuality === g ? '#ff00ff' : 'transparent',
                      border: `1px solid ${graphicsQuality === g ? '#ff00ff' : '#444'}`,
                      color: graphicsQuality === g ? '#000' : '#666',
                      cursor: 'pointer',
                      fontFamily: '"Courier New", monospace',
                      textTransform: 'uppercase',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Buttons */}
          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <button
              data-component-id="ui-start-button"
              onClick={handleStartClick}
              style={{
                padding: '15px 50px',
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
              START
            </button>

            <button
              data-component-id="ui-settings-button"
              onClick={openSettings}
              style={{
                padding: '10px 30px',
                fontSize: '12px',
                letterSpacing: '2px',
                background: 'transparent',
                border: '1px solid #666',
                color: '#888',
                cursor: 'pointer',
                fontFamily: '"Courier New", monospace',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#888'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#666'
                e.currentTarget.style.color = '#888'
              }}
            >
              SETTINGS
            </button>

            <button
              data-component-id="ui-controls-button"
              onClick={openControls}
              style={{
                padding: '10px 30px',
                fontSize: '12px',
                letterSpacing: '2px',
                background: 'transparent',
                border: '1px solid #666',
                color: '#888',
                cursor: 'pointer',
                fontFamily: '"Courier New", monospace',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#888'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#666'
                e.currentTarget.style.color = '#888'
              }}
            >
              CONTROLS
            </button>
          </div>

          <div data-component-id="ui-controls-help" style={{ fontSize: '11px', opacity: 0.5, marginTop: '40px', lineHeight: '1.8' }}>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#00ffff' }}>KEYBOARD/MOUSE</span>
              <br />
              MOUSE = AIM • WASD = MOVE • SPACE/CLICK = FIRE • E = OVERDRIVE
            </div>
            <div>
              <span style={{ color: '#ff00ff' }}>GAMEPAD</span>
              <br />
              LEFT STICK = MOVE • RIGHT STICK = AIM • RT/A = FIRE • Y = OVERDRIVE
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <div
          data-component-id="ui-game-over"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'auto',
          }}
        >
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            margin: 0,
            letterSpacing: '10px',
            color: '#ff4444',
            textShadow: '0 0 20px #ff4444',
          }}>
            GAME OVER
          </h1>

          <div style={{ marginTop: '30px' }}>
            <div style={{ fontSize: '12px', opacity: 0.7, letterSpacing: '2px' }}>FINAL SCORE</div>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#00ffff',
              textShadow: '0 0 15px #00ffff',
            }}>
              {score.toLocaleString()}
            </div>
          </div>

          <button
            onClick={() => setGameState('title')}
            style={{
              marginTop: '40px',
              padding: '12px 40px',
              fontSize: '14px',
              letterSpacing: '2px',
              background: 'transparent',
              border: '1px solid #00ffff',
              color: '#00ffff',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
            }}
          >
            RETURN TO MENU
          </button>
        </div>
      )}

      {/* Level Complete Screen */}
      {gameState === 'levelComplete' && (
        <div
          data-component-id="ui-level-complete"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'auto',
          }}
        >
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            margin: 0,
            letterSpacing: '10px',
            color: '#00ff88',
            textShadow: '0 0 20px #00ff88',
          }}>
            LEVEL COMPLETE
          </h1>

          <div style={{ marginTop: '30px' }}>
            <div style={{ fontSize: '12px', opacity: 0.7, letterSpacing: '2px' }}>SCORE</div>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#00ffff',
              textShadow: '0 0 15px #00ffff',
            }}>
              {score.toLocaleString()}
            </div>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              onClick={() => setGameState('playing')}
              style={{
                padding: '12px 30px',
                fontSize: '14px',
                letterSpacing: '2px',
                background: '#00ffff',
                border: 'none',
                color: '#000',
                cursor: 'pointer',
                fontFamily: '"Courier New", monospace',
              }}
            >
              NEXT LEVEL
            </button>
            <button
              onClick={() => setGameState('title')}
              style={{
                padding: '12px 30px',
                fontSize: '14px',
                letterSpacing: '2px',
                background: 'transparent',
                border: '1px solid #666',
                color: '#888',
                cursor: 'pointer',
                fontFamily: '"Courier New", monospace',
              }}
            >
              MENU
            </button>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
