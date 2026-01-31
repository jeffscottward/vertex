import { useRef, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export interface LockOnTarget {
  id: string
  position: THREE.Vector3
  mesh: THREE.Mesh
}

export interface LockOnConfig {
  maxLocks?: number
  lockRange?: number
  lockAngle?: number // Max angle from center to lock (radians)
  autoTargetNearest?: boolean
}

const DEFAULT_CONFIG: Required<LockOnConfig> = {
  maxLocks: 8,
  lockRange: 50,
  lockAngle: Math.PI / 4, // 45 degrees
  autoTargetNearest: true,
}

export function useLockOn(config: LockOnConfig = {}) {
  const settings = { ...DEFAULT_CONFIG, ...config }
  const { camera } = useThree()

  const lockedTargets = useRef<Map<string, LockOnTarget>>(new Map())
  const availableTargets = useRef<Map<string, LockOnTarget>>(new Map())
  const isLocking = useRef(false)
  const lockChargeTime = useRef(0)

  // Register a target that can be locked
  const registerTarget = useCallback((target: LockOnTarget) => {
    availableTargets.current.set(target.id, target)
  }, [])

  // Unregister a target
  const unregisterTarget = useCallback((id: string) => {
    availableTargets.current.delete(id)
    lockedTargets.current.delete(id)
  }, [])

  // Start locking (hold button)
  const startLocking = useCallback(() => {
    isLocking.current = true
    lockChargeTime.current = 0
  }, [])

  // Stop locking and fire
  const stopLocking = useCallback(() => {
    isLocking.current = false
    const targets = Array.from(lockedTargets.current.values())
    lockedTargets.current.clear()
    lockChargeTime.current = 0
    return targets
  }, [])

  // Check if a target is in lockable range/angle
  const isTargetLockable = useCallback((target: LockOnTarget, playerPosition: THREE.Vector3) => {
    const distance = target.position.distanceTo(playerPosition)
    if (distance > settings.lockRange) return false

    // Check if target is in front of player (within lock angle)
    const toTarget = target.position.clone().sub(playerPosition).normalize()
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const angle = toTarget.angleTo(forward)

    return angle <= settings.lockAngle
  }, [camera, settings.lockAngle, settings.lockRange])

  // Find nearest lockable targets
  const findLockableTargets = useCallback((playerPosition: THREE.Vector3) => {
    const lockable: Array<{ target: LockOnTarget; distance: number }> = []

    availableTargets.current.forEach((target) => {
      if (isTargetLockable(target, playerPosition) && !lockedTargets.current.has(target.id)) {
        lockable.push({
          target,
          distance: target.position.distanceTo(playerPosition),
        })
      }
    })

    // Sort by distance
    lockable.sort((a, b) => a.distance - b.distance)

    return lockable.map(l => l.target)
  }, [isTargetLockable])

  // Auto-lock nearest target (called each frame while locking)
  const autoLockNearest = useCallback((playerPosition: THREE.Vector3, delta: number) => {
    if (!isLocking.current) return

    lockChargeTime.current += delta

    // Lock one target every 0.1 seconds while holding
    const locksToAdd = Math.floor(lockChargeTime.current / 0.1) - lockedTargets.current.size

    if (locksToAdd > 0 && lockedTargets.current.size < settings.maxLocks) {
      const lockable = findLockableTargets(playerPosition)

      for (let i = 0; i < Math.min(locksToAdd, lockable.length); i++) {
        if (lockedTargets.current.size >= settings.maxLocks) break
        const target = lockable[i]
        lockedTargets.current.set(target.id, target)
      }
    }
  }, [findLockableTargets, settings.maxLocks])

  // Get current lock count
  const getLockCount = useCallback(() => {
    return lockedTargets.current.size
  }, [])

  // Get all locked target IDs
  const getLockedTargetIds = useCallback(() => {
    return Array.from(lockedTargets.current.keys())
  }, [])

  // Check if specific target is locked
  const isTargetLocked = useCallback((id: string) => {
    return lockedTargets.current.has(id)
  }, [])

  return {
    registerTarget,
    unregisterTarget,
    startLocking,
    stopLocking,
    autoLockNearest,
    findLockableTargets,
    getLockCount,
    getLockedTargetIds,
    isTargetLocked,
    isLocking: () => isLocking.current,
    maxLocks: settings.maxLocks,
  }
}
