import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export interface RailTrackConfig {
  points: THREE.Vector3[]
  closed?: boolean
  tension?: number
}

export function useRailTrack(config: RailTrackConfig) {
  const { points, closed = false, tension = 0.5 } = config

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(points, closed, 'catmullrom', tension)
  }, [points, closed, tension])

  const progress = useRef(0)

  const getPointAtProgress = (t: number) => {
    return curve.getPointAt(t % 1)
  }

  const getTangentAtProgress = (t: number) => {
    return curve.getTangentAt(t % 1)
  }

  const getOrientationAtProgress = (t: number) => {
    const point = curve.getPointAt(t % 1)
    const tangent = curve.getTangentAt(t % 1)

    // Create a quaternion that looks in the direction of travel
    const up = new THREE.Vector3(0, 1, 0)
    const quaternion = new THREE.Quaternion()

    // Create rotation matrix from tangent
    const matrix = new THREE.Matrix4()
    matrix.lookAt(point, point.clone().add(tangent), up)
    quaternion.setFromRotationMatrix(matrix)

    return { point, tangent, quaternion }
  }

  return {
    curve,
    progress,
    getPointAtProgress,
    getTangentAtProgress,
    getOrientationAtProgress,
    totalLength: curve.getLength(),
  }
}

// Default level 1 track - a dramatic forward path with sweeping curves (4x extended)
export const LEVEL_1_TRACK: THREE.Vector3[] = [
  // Section 1 - Opening
  new THREE.Vector3(0, 2, 0),
  new THREE.Vector3(0, 2, -50),
  new THREE.Vector3(10, 5, -100),
  new THREE.Vector3(-10, 3, -150),
  new THREE.Vector3(0, 8, -200),
  new THREE.Vector3(15, 4, -250),
  new THREE.Vector3(-15, 6, -300),
  new THREE.Vector3(0, 2, -350),
  new THREE.Vector3(0, 10, -400),
  new THREE.Vector3(20, 5, -450),
  new THREE.Vector3(-20, 8, -500),
  new THREE.Vector3(0, 3, -550),
  new THREE.Vector3(0, 2, -600),
  // Section 2 - Descent
  new THREE.Vector3(5, -5, -650),
  new THREE.Vector3(-5, -10, -700),
  new THREE.Vector3(15, -8, -750),
  new THREE.Vector3(-15, -3, -800),
  new THREE.Vector3(0, 0, -850),
  new THREE.Vector3(25, 5, -900),
  new THREE.Vector3(-25, 10, -950),
  new THREE.Vector3(0, 15, -1000),
  new THREE.Vector3(10, 8, -1050),
  new THREE.Vector3(-10, 5, -1100),
  new THREE.Vector3(0, 2, -1150),
  new THREE.Vector3(0, 2, -1200),
  // Section 3 - Spiral ascent
  new THREE.Vector3(20, 5, -1250),
  new THREE.Vector3(30, 15, -1300),
  new THREE.Vector3(20, 25, -1350),
  new THREE.Vector3(0, 30, -1400),
  new THREE.Vector3(-20, 25, -1450),
  new THREE.Vector3(-30, 15, -1500),
  new THREE.Vector3(-20, 5, -1550),
  new THREE.Vector3(0, 2, -1600),
  new THREE.Vector3(15, 8, -1650),
  new THREE.Vector3(-15, 12, -1700),
  new THREE.Vector3(0, 5, -1750),
  new THREE.Vector3(0, 2, -1800),
  // Section 4 - Final approach
  new THREE.Vector3(10, 3, -1850),
  new THREE.Vector3(-10, 6, -1900),
  new THREE.Vector3(20, 10, -1950),
  new THREE.Vector3(-20, 15, -2000),
  new THREE.Vector3(0, 20, -2050),
  new THREE.Vector3(15, 12, -2100),
  new THREE.Vector3(-15, 8, -2150),
  new THREE.Vector3(0, 5, -2200),
  new THREE.Vector3(5, 3, -2250),
  new THREE.Vector3(-5, 2, -2300),
  new THREE.Vector3(0, 2, -2350),
  new THREE.Vector3(0, 2, -2400),
]
