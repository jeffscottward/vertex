/**
 * Component ID utilities
 * Helper for applying data attributes with static IDs
 *
 * NOTE: All IDs must be defined in src/constants/componentIds.ts
 * Never generate IDs dynamically!
 */

import { ComponentId } from '../constants/componentIds'

/**
 * Create data attributes for a DOM element
 * Use with static IDs from COMPONENT_IDS
 *
 * @example
 * import { COMPONENT_IDS } from '@/constants/componentIds'
 * <div {...dataId(COMPONENT_IDS.UI_SCORE)}>
 */
export function dataId(componentId: ComponentId, additionalData?: Record<string, string>): Record<string, string> {
  return {
    'data-component-id': componentId,
    ...additionalData,
  }
}

/**
 * Debug helper - logs component tree from DOM
 */
export function logComponentTree(): void {
  const elements = document.querySelectorAll('[data-component-id]')
  console.group('🌳 Component Tree (DOM)')
  elements.forEach(el => {
    const id = el.getAttribute('data-component-id')
    const depth = getElementDepth(el)
    console.log(`${'  '.repeat(depth)}📦 ${id}`)
  })
  console.groupEnd()
}

function getElementDepth(el: Element): number {
  let depth = 0
  let current = el.parentElement
  while (current) {
    if (current.hasAttribute('data-component-id')) depth++
    current = current.parentElement
  }
  return depth
}

// Export for window access in dev tools
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__VERTEX_DEBUG__ = {
    logTree: logComponentTree,
  }
}

export default dataId
