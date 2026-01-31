import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'

export function Track() {
  const trackRef = useRef<THREE.Group>(null!)
  const scrollOffset = useRef(0)

  const { trackSpeed, trackLength, trackColor } = useControls('Track', {
    trackSpeed: { value: 10, min: 1, max: 50, step: 1 },
    trackLength: { value: 100, min: 50, max: 200, step: 10 },
    trackColor: '#ff00ff',
  })

  // Generate track lines
  const trackLines = useMemo(() => {
    const lines: [number, number, number][][] = []
    const numLines = 20
    const spacing = 2

    // Create parallel lines along Z axis
    for (let i = 0; i < numLines; i++) {
      const x = (i - numLines / 2) * spacing
      lines.push([
        [x, 0, -trackLength],
        [x, 0, trackLength],
      ])
    }

    // Create perpendicular lines
    for (let z = -trackLength; z <= trackLength; z += 5) {
      lines.push([
        [-numLines * spacing / 2, 0, z],
        [numLines * spacing / 2, 0, z],
      ])
    }

    return lines
  }, [trackLength])

  useFrame((_, delta) => {
    // Scroll the track forward
    scrollOffset.current += trackSpeed * delta

    // Reset scroll to prevent floating point issues
    if (scrollOffset.current > 10) {
      scrollOffset.current = 0
    }

    if (trackRef.current) {
      trackRef.current.position.z = scrollOffset.current % 5
    }
  })

  return (
    <group ref={trackRef}>
      {trackLines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={trackColor}
          lineWidth={1}
          transparent
          opacity={0.5}
        />
      ))}
    </group>
  )
}
