import { useGameStore } from '../stores/gameStore'

export function UI() {
  const { score, multiplier, overdrive, gameState } = useGameStore()

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      fontFamily: 'monospace',
      color: '#fff',
    }}>
      {/* Score */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        textAlign: 'right',
      }}>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>SCORE</div>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          textShadow: '0 0 10px #00ffff',
        }}>
          {score.toLocaleString()}
        </div>
      </div>

      {/* Multiplier */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '24px',
          color: multiplier > 1 ? '#ff00ff' : '#666',
          textShadow: multiplier > 1 ? '0 0 10px #ff00ff' : 'none',
        }}>
          x{multiplier}
        </div>
      </div>

      {/* Overdrive Bar */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
      }}>
        <div style={{ fontSize: '10px', textAlign: 'center', marginBottom: '5px', opacity: 0.7 }}>
          OVERDRIVE
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${overdrive}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
            borderRadius: '4px',
            transition: 'width 0.1s',
            boxShadow: overdrive > 50 ? '0 0 10px #ff00ff' : 'none',
          }} />
        </div>
      </div>

      {/* Game State Overlay */}
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
            fontSize: '64px',
            fontWeight: 'bold',
            textShadow: '0 0 20px #00ffff',
            marginBottom: '20px',
          }}>
            VERTEX
          </h1>
          <p style={{ opacity: 0.7 }}>Move mouse to control ship</p>
          <p style={{ opacity: 0.5, fontSize: '12px', marginTop: '10px' }}>
            Click to start
          </p>
        </div>
      )}
    </div>
  )
}
