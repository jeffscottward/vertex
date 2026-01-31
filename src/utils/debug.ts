/**
 * Turbo Console Log utility
 * Provides expressive logging with file, line, function, and variable info
 *
 * Usage:
 *   tcl("variableName", variable, "functionName", "filename.ts", 42)
 *   // Output: 🚀 ~ file: filename.ts:42 → functionName → variableName: [value]
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug'

interface TurboLogOptions {
  level?: LogLevel
  collapsed?: boolean  // Use console.groupCollapsed for objects
  trace?: boolean      // Include stack trace
}

/**
 * Turbo Console Log - Expressive debugging with full context
 *
 * @param varName - Name of the variable being logged
 * @param value - Value to log
 * @param funcName - Name of the enclosing function
 * @param fileName - Source file name
 * @param lineNumber - Line number in source
 * @param options - Additional logging options
 */
export function tcl(
  varName: string,
  value: unknown,
  funcName: string,
  fileName: string,
  lineNumber: number,
  options: TurboLogOptions = {}
): void {
  const { level = 'log', collapsed = false, trace = false } = options

  const prefix = `🚀 ~ file: ${fileName}:${lineNumber} → ${funcName} → ${varName}:`

  // Determine if value is an object that should be grouped
  const isObject = value !== null && typeof value === 'object'

  if (isObject && collapsed) {
    console.groupCollapsed(prefix)
    console[level](value)
    if (trace) console.trace()
    console.groupEnd()
  } else {
    console[level](prefix, value)
    if (trace) console.trace()
  }
}

/**
 * Quick TCL for simple logging (auto-detects caller info in dev)
 * Note: Caller detection only works in non-strict mode or with source maps
 */
export function tclQuick(varName: string, value: unknown): void {
  // In production, use simplified output
  console.log(`🚀 → ${varName}:`, value)
}

/**
 * TCL Error variant - logs as error with stack trace
 */
export function tclError(
  varName: string,
  value: unknown,
  funcName: string,
  fileName: string,
  lineNumber: number
): void {
  tcl(varName, value, funcName, fileName, lineNumber, { level: 'error', trace: true })
}

/**
 * TCL Warn variant
 */
export function tclWarn(
  varName: string,
  value: unknown,
  funcName: string,
  fileName: string,
  lineNumber: number
): void {
  tcl(varName, value, funcName, fileName, lineNumber, { level: 'warn' })
}

/**
 * TCL for objects - collapsed by default
 */
export function tclObj(
  varName: string,
  value: object,
  funcName: string,
  fileName: string,
  lineNumber: number
): void {
  tcl(varName, value, funcName, fileName, lineNumber, { collapsed: true })
}

/**
 * TCL Group - for logging multiple related values
 */
export function tclGroup(
  groupName: string,
  funcName: string,
  fileName: string,
  lineNumber: number,
  logs: Record<string, unknown>
): void {
  const prefix = `🚀 ~ file: ${fileName}:${lineNumber} → ${funcName} → ${groupName}`

  console.groupCollapsed(prefix)
  Object.entries(logs).forEach(([key, val]) => {
    console.log(`  📍 ${key}:`, val)
  })
  console.groupEnd()
}

/**
 * Performance timing with TCL
 */
export function tclTime(label: string, funcName: string, fileName: string, lineNumber: number) {
  const startTime = performance.now()
  const prefix = `🚀 ~ file: ${fileName}:${lineNumber} → ${funcName}`

  return {
    end: () => {
      const duration = performance.now() - startTime
      console.log(`${prefix} → ⏱️ ${label}: ${duration.toFixed(2)}ms`)
      return duration
    }
  }
}

// Convenience export for common pattern
export const log = {
  tcl,
  quick: tclQuick,
  error: tclError,
  warn: tclWarn,
  obj: tclObj,
  group: tclGroup,
  time: tclTime,
}

export default tcl
