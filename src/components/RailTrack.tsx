import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useRailTrack, LEVEL_1_TRACK } from '../hooks/useRailTrack'

interface RailTrackProps {
  onProgressUpdate?: (progress: number, position: THREE.Vector3, quaternion: THREE.Quaternion) => void
}

export function RailTrack({ onProgressUpdate }: RailTrackProps) {
  const { trackSpeed, showTrackPath, trackColor, gridOpacity } = useControls('Rail Track', {
    trackSpeed: { value: 0.002, min: 0.001, max: 0.05, step: 0.001 },
    showTrackPath: true,
    trackColor: '#ff00ff',
    gridOpacity: { value: 0.3, min: 0, max: 1, step: 0.1 },
  })

  const trackGroupRef = useRef<THREE.Group>(null!)

  const { curve, progress, getOrientationAtProgress } = useRailTrack({
    points: LEVEL_1_TRACK,
    tension: 0.5,
  })

  const trackPoints = useMemo(() => {
    const points: [number, number, number][] = []
    for (let i = 0; i <= 100; i++) {
      const t = i / 100
      const point = curve.getPointAt(t)
      points.push([point.x, point.y, point.z])
    }
    return points
  }, [curve])

  const tunnelLines = useMemo(() => {
    const lines: [number, number, number][][] = []
    const segments = 50
    const radius = 15
    const sides = 8

    for (let s = 0; s < sides; s++) {
      const angle = (s / sides) * Math.PI * 2
      const linePoints: [number, number, number][] = []

      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const point = curve.getPointAt(t)
        const tangent = curve.getTangentAt(t)

        const up = new THREE.Vector3(0, 1, 0)
        const right = new THREE.Vector3().crossVectors(up, tangent).normalize()
        const realUp = new THREE.Vector3().crossVectors(tangent, right).normalize()

        const offsetX = Math.cos(angle) * radius
        const offsetY = Math.sin(angle) * radius

        const finalPos = point.clone()
          .add(right.multiplyScalar(offsetX))
          .add(realUp.multiplyScalar(offsetY))

        linePoints.push([finalPos.x, finalPos.y, finalPos.z])
      }
      lines.push(linePoints)
    }

    for (let i = 0; i <= segments; i += 5) {
      const t = i / segments
      const point = curve.getPointAt(t)
      const tangent = curve.getTangentAt(t)

      const up = new THREE.Vector3(0, 1, 0)
      const right = new THREE.Vector3().crossVectors(up, tangent).normalize()
      const realUp = new THREE.Vector3().crossVectors(tangent, right).normalize()

      const ringPoints: [number, number, number][] = []
      for (let s = 0; s <= sides; s++) {
        const angle = (s / sides) * Math.PI * 2
        const offsetX = Math.cos(angle) * radius
        const offsetY = Math.sin(angle) * radius

        const finalPos = point.clone()
          .add(right.clone().multiplyScalar(offsetX))
          .add(realUp.clone().multiplyScalar(offsetY))

        ringPoints.push([finalPos.x, finalPos.y, finalPos.z])
      }
      lines.push(ringPoints)
    }

    return lines
  }, [curve])

  useFrame((_, delta) => {
    progress.current += trackSpeed * delta

    if (progress.current >= 1) {
      progress.current = 0
    }

    const { point, quaternion } = getOrientationAtProgress(progress.current)
    onProgressUpdate?.(progress.current, point, quaternion)
  })

  return (
    <group ref={trackGroupRef} name="rail-track-root">
      {showTrackPath && (
        <Line
          name="rail-track-path"
          points={trackPoints}
          color={trackColor}
          lineWidth={2}
          transparent
          opacity={0.8}
        />
      )}

      <group name="rail-track-tunnel">
        {tunnelLines.map((points, i) => (
          <Line
            key={`tunnel-${i}`}
            points={points}
            color={trackColor}
            lineWidth={1}
            transparent
            opacity={gridOpacity}
          />
        ))}
      </group>
    </group>
  )
}
