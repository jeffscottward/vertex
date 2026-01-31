import { useSend, useSettingsTab, useGameState } from '../../hooks/useGameMachine'
import { useSettingsStore } from '../../stores/settingsStore'
import type { SettingsTab } from '../../machines/types'

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'audio', label: 'AUDIO' },
  { id: 'graphics', label: 'GRAPHICS' },
  { id: 'controls', label: 'CONTROLS' },
]

export function SettingsPanel() {
  const send = useSend()
  const currentTab = useSettingsTab()
  const isPaused = useGameState((state) => state.matches('paused'))

  const {
    masterVolume,
    musicVolume,
    sfxVolume,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    graphicsQuality,
    setGraphicsQuality,
    mouseSensitivity,
    setMouseSensitivity,
    gamepadDeadzone,
    setGamepadDeadzone,
    invertY,
    setInvertY,
  } = useSettingsStore()

  const handleClose = () => {
    if (isPaused) {
      send({ type: 'CLOSE_SETTINGS' })
    } else {
      send({ type: 'CLOSE_SETTINGS' })
    }
  }

  return (
    <div
      data-component-id="settings-panel-root"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        fontFamily: '"Courier New", monospace',
      }}
    >
      <div
        data-component-id="settings-panel-container"
        style={{
          width: '500px',
          background: 'rgba(20, 20, 30, 0.95)',
          border: '1px solid #333',
          padding: '30px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '24px',
              letterSpacing: '5px',
              color: '#00ffff',
            }}
          >
            SETTINGS
          </h2>
          <button
            data-component-id="settings-panel-close"
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: '1px solid #666',
              color: '#666',
              padding: '8px 16px',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
              fontSize: '12px',
            }}
          >
            CLOSE
          </button>
        </div>

        {/* Tabs */}
        <div
          data-component-id="settings-panel-tabs"
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '30px',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => send({ type: 'SET_TAB', tab: tab.id })}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '12px',
                letterSpacing: '2px',
                background: currentTab === tab.id ? '#00ffff' : 'transparent',
                border: `1px solid ${currentTab === tab.id ? '#00ffff' : '#444'}`,
                color: currentTab === tab.id ? '#000' : '#666',
                cursor: 'pointer',
                fontFamily: '"Courier New", monospace',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div data-component-id="settings-panel-content" style={{ minHeight: '250px' }}>
          {currentTab === 'audio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <SliderSetting
                label="MASTER VOLUME"
                value={masterVolume}
                onChange={setMasterVolume}
              />
              <SliderSetting
                label="MUSIC VOLUME"
                value={musicVolume}
                onChange={setMusicVolume}
              />
              <SliderSetting
                label="SFX VOLUME"
                value={sfxVolume}
                onChange={setSfxVolume}
              />
            </div>
          )}

          {currentTab === 'graphics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '10px',
                    letterSpacing: '2px',
                  }}
                >
                  QUALITY PRESET
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {(['low', 'medium', 'high'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setGraphicsQuality(q)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '12px',
                        background: graphicsQuality === q ? '#ff00ff' : 'transparent',
                        border: `1px solid ${graphicsQuality === q ? '#ff00ff' : '#444'}`,
                        color: graphicsQuality === q ? '#000' : '#666',
                        cursor: 'pointer',
                        fontFamily: '"Courier New", monospace',
                        textTransform: 'uppercase',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#444', lineHeight: 1.8 }}>
                LOW: 60fps on older hardware
                <br />
                MEDIUM: Balanced quality and performance
                <br />
                HIGH: Full visual effects (bloom, shadows)
              </div>
            </div>
          )}

          {currentTab === 'controls' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <SliderSetting
                label="MOUSE SENSITIVITY"
                value={mouseSensitivity}
                min={0.1}
                max={2}
                onChange={setMouseSensitivity}
              />
              <SliderSetting
                label="GAMEPAD DEADZONE"
                value={gamepadDeadzone}
                min={0.05}
                max={0.5}
                onChange={setGamepadDeadzone}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '12px', color: '#666', letterSpacing: '2px' }}>
                  INVERT Y AXIS
                </span>
                <button
                  onClick={() => setInvertY(!invertY)}
                  style={{
                    padding: '8px 20px',
                    fontSize: '12px',
                    background: invertY ? '#ff00ff' : 'transparent',
                    border: `1px solid ${invertY ? '#ff00ff' : '#444'}`,
                    color: invertY ? '#000' : '#666',
                    cursor: 'pointer',
                    fontFamily: '"Courier New", monospace',
                  }}
                >
                  {invertY ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Slider component for volume/sensitivity settings
function SliderSetting({
  label,
  value,
  min = 0,
  max = 1,
  onChange,
}: {
  label: string
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <span style={{ fontSize: '12px', color: '#666', letterSpacing: '2px' }}>
          {label}
        </span>
        <span style={{ fontSize: '12px', color: '#00ffff' }}>
          {Math.round(percentage)}%
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: '6px',
          background: `linear-gradient(to right, #00ffff ${percentage}%, #333 ${percentage}%)`,
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      />
    </div>
  )
}
