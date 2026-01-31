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

// Default level 1 track - a dramatic forward path with sweeping curves
export const LEVEL_1_TRACK: THREE.Vector3[] = [
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
]
