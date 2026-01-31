import { useEffect, useCallback, useState } from 'react'
import { useMenuStore } from '../../stores/menuStore'
import {
  useInputBindingsStore,
  GAME_ACTIONS,
  ACTION_LABELS,
  GameAction,
} from '../../stores/inputBindingsStore'

function BindingButton({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        minWidth: '80px',
        padding: '8px 12px',
        fontSize: '11px',
        fontFamily: '"Courier New", monospace',
        background: isActive ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
        border: isActive ? '1px solid #00ffff' : '1px solid #444',
        color: isActive ? '#00ffff' : '#888',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        transition: 'all 0.15s ease',
        animation: isActive ? 'pulse 1s infinite' : 'none',
      }}
    >
      {isActive ? 'PRESS KEY...' : label}
    </button>
  )
}

function BindingRow({
  action,
  activeRebind,
  onStartRebind,
}: {
  action: GameAction
  activeRebind: { action: string; slot: 'primary' | 'secondary' } | null
  onStartRebind: (action: GameAction, slot: 'primary' | 'secondary') => void
}) {
  const { keyboardBindings, getKeyLabel } = useInputBindingsStore()
  const binding = keyboardBindings[action]

  const isPrimaryActive = activeRebind?.action === action && activeRebind?.slot === 'primary'
  const isSecondaryActive = activeRebind?.action === action && activeRebind?.slot === 'secondary'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <span style={{ fontSize: '12px', letterSpacing: '1px', opacity: 0.9, width: '120px' }}>
        {ACTION_LABELS[action]}
      </span>

      <div style={{ display: 'flex', gap: '10px' }}>
        <BindingButton
          label={getKeyLabel(binding.primary)}
          isActive={isPrimaryActive}
          onClick={() => onStartRebind(action, 'primary')}
        />
        <BindingButton
          label={binding.secondary ? getKeyLabel(binding.secondary) : '—'}
          isActive={isSecondaryActive}
          onClick={() => onStartRebind(action, 'secondary')}
        />
      </div>
    </div>
  )
}

export function ControlRebindPanel() {
  const { goBack } = useMenuStore()
  const {
    setKeyboardPrimary,
    setKeyboardSecondary,
    resetKeyboardDefaults,
    resetGamepadDefaults,
    isKeyBound,
  } = useInputBindingsStore()

  const [activeRebind, setActiveRebind] = useState<{
    action: GameAction
    slot: 'primary' | 'secondary'
  } | null>(null)

  const [conflict, setConflict] = useState<{
    key: string
    existingAction: GameAction
  } | null>(null)

  const handleStartRebind = useCallback((action: GameAction, slot: 'primary' | 'secondary') => {
    setActiveRebind({ action, slot })
    setConflict(null)
  }, [])

  const handleCancelRebind = useCallback(() => {
    setActiveRebind(null)
    setConflict(null)
  }, [])

  // Listen for key presses when rebinding
  useEffect(() => {
    if (!activeRebind) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Cancel on Escape
      if (e.code === 'Escape') {
        handleCancelRebind()
        return
      }

      // Check for conflicts
      const existingAction = isKeyBound(e.code)
      if (existingAction && existingAction !== activeRebind.action) {
        setConflict({ key: e.code, existingAction })
        // Still bind but show warning
      }

      // Apply the binding
      if (activeRebind.slot === 'primary') {
        setKeyboardPrimary(activeRebind.action, e.code)
      } else {
        setKeyboardSecondary(activeRebind.action, e.code)
      }

      setActiveRebind(null)
      setTimeout(() => setConflict(null), 2000)
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [activeRebind, handleCancelRebind, isKeyBound, setKeyboardPrimary, setKeyboardSecondary])

  // Handle clicking outside to cancel
  useEffect(() => {
    if (!activeRebind) return

    const handleClick = () => {
      handleCancelRebind()
    }

    // Delay to prevent immediate cancel
    const timeout = setTimeout(() => {
      window.addEventListener('click', handleClick)
    }, 100)

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('click', handleClick)
    }
  }, [activeRebind, handleCancelRebind])

  return (
    <div
      data-component-id="ui-control-rebind-panel"
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
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            letterSpacing: '8px',
            margin: 0,
          }}
        >
          CONTROLS
        </h1>
        <p style={{ fontSize: '11px', opacity: 0.5, marginTop: '10px', letterSpacing: '2px' }}>
          CLICK A BINDING TO CHANGE IT
        </p>
      </div>

      {/* Column Headers */}
      <div
        style={{
          width: '380px',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderBottom: '2px solid rgba(0, 255, 255, 0.3)',
          marginBottom: '10px',
        }}
      >
        <span style={{ fontSize: '10px', letterSpacing: '2px', opacity: 0.6, width: '120px' }}>
          ACTION
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ width: '80px', textAlign: 'center', fontSize: '10px', letterSpacing: '2px', opacity: 0.6 }}>
            PRIMARY
          </span>
          <span style={{ width: '80px', textAlign: 'center', fontSize: '10px', letterSpacing: '2px', opacity: 0.6 }}>
            SECONDARY
          </span>
        </div>
      </div>

      {/* Bindings List */}
      <div style={{ width: '380px', maxHeight: '300px', overflowY: 'auto' }}>
        {GAME_ACTIONS.map((action) => (
          <BindingRow
            key={action}
            action={action}
            activeRebind={activeRebind}
            onStartRebind={handleStartRebind}
          />
        ))}
      </div>

      {/* Conflict Warning */}
      {conflict && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: 'rgba(255, 100, 0, 0.2)',
            border: '1px solid #ff6400',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#ff6400',
          }}
        >
          Note: This key was already bound to "{ACTION_LABELS[conflict.existingAction]}"
        </div>
      )}

      {/* Active Rebind Overlay */}
      {activeRebind && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '30px 50px',
            background: 'rgba(0, 0, 0, 0.95)',
            border: '2px solid #00ffff',
            borderRadius: '8px',
            textAlign: 'center',
            zIndex: 200,
            boxShadow: '0 0 50px rgba(0, 255, 255, 0.3)',
          }}
        >
          <div style={{ fontSize: '14px', letterSpacing: '3px', marginBottom: '15px' }}>
            PRESS A KEY FOR
          </div>
          <div style={{ fontSize: '20px', color: '#00ffff', letterSpacing: '2px' }}>
            {ACTION_LABELS[activeRebind.action]}
          </div>
          <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '20px' }}>
            PRESS ESC TO CANCEL
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
        <button
          onClick={() => {
            resetKeyboardDefaults()
            resetGamepadDefaults()
          }}
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

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
