import { useRef, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

export interface BeatDetectorConfig {
  threshold?: number       // Energy threshold for beat detection
  decayRate?: number       // How fast the threshold decays
  minInterval?: number     // Minimum time between beats (ms)
  frequencyBands?: {
    bass: [number, number]
    mid: [number, number]
    high: [number, number]
  }
}

const DEFAULT_CONFIG: Required<BeatDetectorConfig> = {
  threshold: 1.2,
  decayRate: 0.95,
  minInterval: 100,
  frequencyBands: {
    bass: [20, 150],
    mid: [150, 2000],
    high: [2000, 20000],
  }
}

export function useBeatDetector(audioContext: AudioContext | null, analyser: AnalyserNode | null, config: BeatDetectorConfig = {}) {
  const settings = { ...DEFAULT_CONFIG, ...config }

  const energyHistory = useRef<number[]>([])
  const lastBeatTime = useRef(0)
  const dynamicThreshold = useRef(settings.threshold)
  const frequencyData = useRef<Uint8Array | null>(null)

  const onBeat = useRef<((intensity: number, band: 'bass' | 'mid' | 'high' | 'all') => void) | null>(null)

  useEffect(() => {
    if (analyser) {
      const buffer = new ArrayBuffer(analyser.frequencyBinCount)
      frequencyData.current = new Uint8Array(buffer)
    }
  }, [analyser])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFrequencyEnergy = useCallback((data: any, sampleRate: number, minFreq: number, maxFreq: number) => {
    const nyquist = sampleRate / 2
    const binSize = nyquist / data.length

    const startBin = Math.floor(minFreq / binSize)
    const endBin = Math.min(Math.floor(maxFreq / binSize), data.length - 1)

    let sum = 0
    for (let i = startBin; i <= endBin; i++) {
      sum += data[i]
    }

    return sum / (endBin - startBin + 1) / 255 // Normalize to 0-1
  }, [])

  const detectBeat = useCallback(() => {
    if (!analyser || !audioContext || !frequencyData.current) return null

    const data = frequencyData.current
    // Web Audio API type assertion for TypeScript 5.x compatibility
    analyser.getByteFrequencyData(data as unknown as Uint8Array<ArrayBuffer>)
    const sampleRate = audioContext.sampleRate

    const bassEnergy = getFrequencyEnergy(
      data,
      sampleRate,
      settings.frequencyBands.bass[0],
      settings.frequencyBands.bass[1]
    )

    const midEnergy = getFrequencyEnergy(
      data,
      sampleRate,
      settings.frequencyBands.mid[0],
      settings.frequencyBands.mid[1]
    )

    const highEnergy = getFrequencyEnergy(
      data,
      sampleRate,
      settings.frequencyBands.high[0],
      settings.frequencyBands.high[1]
    )

    const totalEnergy = (bassEnergy * 2 + midEnergy + highEnergy * 0.5) / 3.5 // Weight bass more

    // Update energy history for adaptive threshold
    energyHistory.current.push(totalEnergy)
    if (energyHistory.current.length > 43) { // ~1 second at 60fps
      energyHistory.current.shift()
    }

    const avgEnergy = energyHistory.current.reduce((a, b) => a + b, 0) / energyHistory.current.length
    const now = performance.now()

    // Check for beat
    if (
      totalEnergy > avgEnergy * dynamicThreshold.current &&
      now - lastBeatTime.current > settings.minInterval
    ) {
      lastBeatTime.current = now
      dynamicThreshold.current = settings.threshold * 1.1 // Increase threshold after beat

      // Determine which band triggered the beat
      let dominantBand: 'bass' | 'mid' | 'high' | 'all' = 'all'
      if (bassEnergy > midEnergy && bassEnergy > highEnergy) dominantBand = 'bass'
      else if (midEnergy > bassEnergy && midEnergy > highEnergy) dominantBand = 'mid'
      else if (highEnergy > bassEnergy && highEnergy > midEnergy) dominantBand = 'high'

      return {
        intensity: totalEnergy / avgEnergy,
        band: dominantBand,
        bass: bassEnergy,
        mid: midEnergy,
        high: highEnergy,
      }
    }

    // Decay threshold
    dynamicThreshold.current = Math.max(
      settings.threshold,
      dynamicThreshold.current * settings.decayRate
    )

    return null
  }, [analyser, audioContext, getFrequencyEnergy, settings])

  // Set callback
  const setOnBeat = useCallback((callback: (intensity: number, band: 'bass' | 'mid' | 'high' | 'all') => void) => {
    onBeat.current = callback
  }, [])

  useFrame(() => {
    const beat = detectBeat()
    if (beat && onBeat.current) {
      onBeat.current(beat.intensity, beat.band)
    }
  })

  return {
    detectBeat,
    setOnBeat,
    getFrequencyData: () => frequencyData.current,
  }
}
