import { useSettingsStore, Difficulty, GraphicsQuality } from '../../stores/settingsStore'
import { useMenuStore, SettingsTab } from '../../stores/menuStore'

// Shared UI Components
function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  displayValue,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  displayValue?: string
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', letterSpacing: '1px', opacity: 0.8 }}>{label}</span>
        <span style={{ fontSize: '12px', color: '#00ffff' }}>
          {displayValue ?? Math.round(value * 100) + '%'}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: '4px',
          appearance: 'none',
          background: `linear-gradient(to right, #00ffff ${((value - min) / (max - min)) * 100}%, #333 ${((value - min) / (max - min)) * 100}%)`,
          borderRadius: '2px',
          cursor: 'pointer',
        }}
      />
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
      }}
    >
      <span style={{ fontSize: '12px', letterSpacing: '1px', opacity: 0.8 }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: '50px',
          height: '24px',
          borderRadius: '12px',
          background: checked ? '#00ffff' : '#333',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s ease',
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: '3px',
            left: checked ? '29px' : '3px',
            transition: 'left 0.2s ease',
          }}
        />
      </button>
    </div>
  )
}

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  color = '#00ffff',
}: {
  label: string
  value: T
  options: T[]
  onChange: (value: T) => void
  color?: string
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '12px', letterSpacing: '1px', marginBottom: '10px', opacity: 0.8 }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: '5px' }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '11px',
              background: value === opt ? color : 'transparent',
              border: `1px solid ${value === opt ? color : '#444'}`,
              color: value === opt ? '#000' : '#666',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.15s ease',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// Tab content components
function AudioTab() {
  const {
    masterVolume,
    musicVolume,
    sfxVolume,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
  } = useSettingsStore()

  return (
    <div data-component-id="settings-audio-tab">
      <Slider label="MASTER VOLUME" value={masterVolume} onChange={setMasterVolume} />
      <Slider label="MUSIC VOLUME" value={musicVolume} onChange={setMusicVolume} />
      <Slider label="SFX VOLUME" value={sfxVolume} onChange={setSfxVolume} />
    </div>
  )
}

function GraphicsTab() {
  const {
    graphicsQuality,
    difficulty,
    graphicsSettings,
    setGraphicsQuality,
    setDifficulty,
  } = useSettingsStore()

  return (
    <div data-component-id="settings-graphics-tab">
      <OptionGroup<GraphicsQuality>
        label="GRAPHICS QUALITY"
        value={graphicsQuality}
        options={['low', 'medium', 'high']}
        onChange={setGraphicsQuality}
        color="#ff00ff"
      />

      <OptionGroup<Difficulty>
        label="DIFFICULTY"
        value={difficulty}
        options={['easy', 'medium', 'hard']}
        onChange={setDifficulty}
        color="#00ffff"
      />

      {/* Current settings display */}
      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
        }}
      >
        <div style={{ fontSize: '10px', letterSpacing: '2px', opacity: 0.5, marginBottom: '10px' }}>
          CURRENT SETTINGS
        </div>
        <div style={{ fontSize: '11px', lineHeight: '1.8', opacity: 0.7 }}>
          <div>Bloom: {graphicsSettings.bloom ? 'ON' : 'OFF'}</div>
          <div>Shadows: {graphicsSettings.shadows ? 'ON' : 'OFF'}</div>
          <div>Particles: {graphicsSettings.particleCount}</div>
          <div>Post-Processing: {graphicsSettings.postProcessing ? 'ON' : 'OFF'}</div>
        </div>
      </div>
    </div>
  )
}

function ControlsTab() {
  const {
    mouseSensitivity,
    gamepadDeadzone,
    invertY,
    setMouseSensitivity,
    setGamepadDeadzone,
    setInvertY,
  } = useSettingsStore()

  const { openControls } = useMenuStore()

  return (
    <div data-component-id="settings-controls-tab">
      <Slider
        label="MOUSE SENSITIVITY"
        value={mouseSensitivity}
        onChange={setMouseSensitivity}
        min={0.1}
        max={3}
        step={0.1}
        displayValue={mouseSensitivity.toFixed(1) + 'x'}
      />

      <Slider
        label="GAMEPAD DEADZONE"
        value={gamepadDeadzone}
        onChange={setGamepadDeadzone}
        min={0.05}
        max={0.4}
        step={0.01}
        displayValue={Math.round(gamepadDeadzone * 100) + '%'}
      />

      <Toggle label="INVERT Y-AXIS" checked={invertY} onChange={setInvertY} />

      <button
        onClick={openControls}
        style={{
          width: '100%',
          marginTop: '20px',
          padding: '12px',
          fontSize: '12px',
          letterSpacing: '2px',
          background: 'transparent',
          border: '1px solid #666',
          color: '#888',
          cursor: 'pointer',
          fontFamily: '"Courier New", monospace',
          textTransform: 'uppercase',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#00ffff'
          e.currentTarget.style.color = '#00ffff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#666'
          e.currentTarget.style.color = '#888'
        }}
      >
        Rebind Controls
      </button>
    </div>
  )
}

export function SettingsPanel() {
  const { settingsTab, setSettingsTab, goBack } = useMenuStore()
  const { resetToDefaults } = useSettingsStore()

  const tabs: SettingsTab[] = ['audio', 'graphics', 'controls']

  return (
    <div
      data-component-id="ui-settings-panel"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(15px)',
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
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            letterSpacing: '8px',
            margin: 0,
          }}
        >
          SETTINGS
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '30px' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSettingsTab(tab)}
            style={{
              padding: '10px 30px',
              fontSize: '12px',
              letterSpacing: '2px',
              background: settingsTab === tab ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: settingsTab === tab ? '2px solid #00ffff' : '2px solid transparent',
              color: settingsTab === tab ? '#00ffff' : '#666',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
              textTransform: 'uppercase',
              transition: 'all 0.15s ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          width: '350px',
          minHeight: '250px',
        }}
      >
        {settingsTab === 'audio' && <AudioTab />}
        {settingsTab === 'graphics' && <GraphicsTab />}
        {settingsTab === 'controls' && <ControlsTab />}
      </div>

      {/* Footer Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '15px',
          marginTop: '40px',
        }}
      >
        <button
          onClick={resetToDefaults}
          style={{
            padding: '10px 25px',
            fontSize: '12px',
            letterSpacing: '1px',
            background: 'transparent',
            border: '1px solid #666',
            color: '#888',
            cursor: 'pointer',
            fontFamily: '"Courier New", monospace',
            textTransform: 'uppercase',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ff4444'
            e.currentTarget.style.color = '#ff4444'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#666'
            e.currentTarget.style.color = '#888'
          }}
        >
          Reset Defaults
        </button>

        <button
          onClick={goBack}
          style={{
            padding: '10px 40px',
            fontSize: '12px',
            letterSpacing: '2px',
            background: 'transparent',
            border: '1px solid #00ffff',
            color: '#00ffff',
            cursor: 'pointer',
            fontFamily: '"Courier New", monospace',
            textTransform: 'uppercase',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#00ffff'
            e.currentTarget.style.color = '#000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#00ffff'
          }}
        >
          Back
        </button>
      </div>
    </div>
  )
}
