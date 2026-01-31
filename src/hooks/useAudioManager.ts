import { useRef, useCallback, useEffect, useState } from 'react'
import { Howl, Howler } from 'howler'

export interface AudioTrack {
  id: string
  url: string
  bpm?: number
  loop?: boolean
  volume?: number
}

export interface AudioManagerConfig {
  masterVolume?: number
}

export function useAudioManager(config: AudioManagerConfig = {}) {
  const { masterVolume = 1 } = config

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const tracks = useRef<Map<string, Howl>>(new Map())
  const currentTrack = useRef<string | null>(null)

  // Initialize Web Audio API for analysis
  useEffect(() => {
    const ctx = Howler.ctx
    if (ctx) {
      setAudioContext(ctx)

      const analyserNode = ctx.createAnalyser()
      analyserNode.fftSize = 2048
      analyserNode.smoothingTimeConstant = 0.8

      // Connect Howler's master gain to our analyser
      Howler.masterGain.connect(analyserNode)
      analyserNode.connect(ctx.destination)

      setAnalyser(analyserNode)
    }
  }, [])

  // Set master volume
  useEffect(() => {
    Howler.volume(masterVolume)
  }, [masterVolume])

  // Load a track
  const loadTrack = useCallback((track: AudioTrack): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (tracks.current.has(track.id)) {
        resolve()
        return
      }

      const howl = new Howl({
        src: [track.url],
        loop: track.loop ?? false,
        volume: track.volume ?? 1,
        onload: () => resolve(),
        onloaderror: (_, error) => reject(error),
      })

      tracks.current.set(track.id, howl)
    })
  }, [])

  // Play a track
  const playTrack = useCallback((id: string, fadeIn = 0) => {
    const track = tracks.current.get(id)
    if (!track) {
      console.warn(`Track "${id}" not found`)
      return
    }

    // Stop current track if different
    if (currentTrack.current && currentTrack.current !== id) {
      const current = tracks.current.get(currentTrack.current)
      current?.stop()
    }

    currentTrack.current = id

    if (fadeIn > 0) {
      track.volume(0)
      track.play()
      track.fade(0, 1, fadeIn * 1000)
    } else {
      track.play()
    }

    setIsPlaying(true)
  }, [])

  // Stop current track
  const stopTrack = useCallback((fadeOut = 0) => {
    if (!currentTrack.current) return

    const track = tracks.current.get(currentTrack.current)
    if (!track) return

    if (fadeOut > 0) {
      track.fade(track.volume(), 0, fadeOut * 1000)
      setTimeout(() => {
        track.stop()
        setIsPlaying(false)
      }, fadeOut * 1000)
    } else {
      track.stop()
      setIsPlaying(false)
    }
  }, [])

  // Pause current track
  const pauseTrack = useCallback(() => {
    if (!currentTrack.current) return
    const track = tracks.current.get(currentTrack.current)
    track?.pause()
    setIsPlaying(false)
  }, [])

  // Resume current track
  const resumeTrack = useCallback(() => {
    if (!currentTrack.current) return
    const track = tracks.current.get(currentTrack.current)
    track?.play()
    setIsPlaying(true)
  }, [])

  // Get current playback time
  const getCurrentTime = useCallback(() => {
    if (!currentTrack.current) return 0
    const track = tracks.current.get(currentTrack.current)
    return track?.seek() as number || 0
  }, [])

  // Get track duration
  const getDuration = useCallback((id?: string) => {
    const trackId = id || currentTrack.current
    if (!trackId) return 0
    const track = tracks.current.get(trackId)
    return track?.duration() || 0
  }, [])

  // Play a one-shot sound effect
  const playSFX = useCallback((url: string, volume = 1) => {
    const sfx = new Howl({
      src: [url],
      volume,
    })
    sfx.play()
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      tracks.current.forEach((track) => track.unload())
      tracks.current.clear()
    }
  }, [])

  return {
    audioContext,
    analyser,
    isPlaying,
    loadTrack,
    playTrack,
    stopTrack,
    pauseTrack,
    resumeTrack,
    getCurrentTime,
    getDuration,
    playSFX,
  }
}
