import { useGameStore } from '../stores/gameStore'

export function UI() {
  const { score, multiplier, overdrive, gameState, setGameState } = useGameStore()

  const handleStartClick = () => {
    if (gameState === 'title') {
      setGameState('playing')
    }
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      fontFamily: '"Courier New", monospace',
      color: '#fff',
    }}>
      {/* Score */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        textAlign: 'right',
      }}>
        <div style={{
          fontSize: '12px',
          opacity: 0.7,
          letterSpacing: '2px',
        }}>
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
      {gameState === 'playing' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
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
      )}

      {/* Overdrive Bar */}
      {gameState === 'playing' && (
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '250px',
        }}>
          <div style={{
            fontSize: '10px',
            textAlign: 'center',
            marginBottom: '8px',
            letterSpacing: '3px',
            opacity: 0.7,
          }}>
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
              background: `linear-gradient(90deg,
                #ff00ff 0%,
                #00ffff 50%,
                #ff00ff 100%)`,
              backgroundSize: '200% 100%',
              animation: overdrive > 80 ? 'shimmer 1s infinite linear' : 'none',
              borderRadius: '3px',
              transition: 'width 0.1s',
              boxShadow: overdrive > 50 ? '0 0 10px #ff00ff' : 'none',
            }} />
          </div>

          {/* Lock indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '15px',
          }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: '2px solid #00ffff',
                  background: i < 0 ? '#00ffff' : 'transparent',
                  boxShadow: i < 0 ? '0 0 5px #00ffff' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Title Screen */}
      {gameState === 'title' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'auto',
        }}>
          <h1 style={{
            fontSize: '72px',
            fontWeight: 'bold',
            margin: 0,
            letterSpacing: '15px',
            textShadow: `
              0 0 10px #00ffff,
              0 0 20px #00ffff,
              0 0 40px #00ffff,
              0 0 80px #ff00ff
            `,
            color: '#fff',
          }}>
            VERTEX
          </h1>
          <p style={{
            fontSize: '14px',
            letterSpacing: '5px',
            opacity: 0.7,
            marginTop: '20px',
          }}>
            ON-RAILS RHYTHM SHOOTER
          </p>
          <button
            onClick={handleStartClick}
            style={{
              marginTop: '40px',
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
          <div style={{
            fontSize: '11px',
            opacity: 0.5,
            marginTop: '30px',
            lineHeight: '1.8',
          }}>
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
