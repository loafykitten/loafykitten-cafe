// Headless audio engine shared by every music page design.
// Each design binds its own DOM to these events; no UI assumptions live here.

export type PlayerTrack = {
    index: number
    title: string
    href: string
    duration: number
}

export type PlayerEventMap = {
    /** current track changed (load, next, prev, select) */
    change: (track: PlayerTrack) => void
    play: (track: PlayerTrack) => void
    pause: (track: PlayerTrack) => void
    /** playback stopped and reset to 0 */
    stop: (track: PlayerTrack) => void
    /** fires on timeupdate; progress is 0..1 */
    time: (currentTime: number, duration: number, progress: number) => void
    error: (track: PlayerTrack) => void
}

type EventName = keyof PlayerEventMap

export class MusicPlayer {
    readonly tracks: PlayerTrack[]
    current: PlayerTrack | null = null
    isPlaying = false

    private audio: HTMLAudioElement
    private listeners: { [K in EventName]: PlayerEventMap[K][] } = {
        change: [],
        play: [],
        pause: [],
        stop: [],
        time: [],
        error: [],
    }

    constructor(tracks: PlayerTrack[]) {
        this.tracks = tracks
        this.audio = new Audio()
        this.audio.preload = 'none'

        this.audio.addEventListener('play', () => {
            this.isPlaying = true
            if (this.current) this.emit('play', this.current)
        })

        this.audio.addEventListener('pause', () => {
            // The 'stop' path resets currentTime first and emits its own event.
            if (!this.isPlaying) return
            this.isPlaying = false
            if (this.current) this.emit('pause', this.current)
        })

        this.audio.addEventListener('ended', () => {
            this.next(true)
        })

        this.audio.addEventListener('timeupdate', () => {
            const duration = this.audio.duration || this.current?.duration || 0
            const progress = duration > 0 ? this.audio.currentTime / duration : 0
            this.emit('time', this.audio.currentTime, duration, progress)
        })

        this.audio.addEventListener('error', () => {
            this.isPlaying = false
            if (this.current) this.emit('error', this.current)
        })
    }

    on<K extends EventName>(event: K, cb: PlayerEventMap[K]): this {
        this.listeners[event].push(cb)
        return this
    }

    private emit<K extends EventName>(event: K, ...args: Parameters<PlayerEventMap[K]>) {
        for (const cb of this.listeners[event]) {
            ;(cb as (...cbArgs: Parameters<PlayerEventMap[K]>) => void)(...args)
        }
    }

    /** load a track without starting playback */
    select(index: number) {
        const track = this.tracks[index]
        if (!track || track === this.current) return
        this.isPlaying = false
        this.current = track
        this.audio.src = track.href
        this.audio.load()
        this.emit('change', track)
    }

    play(index?: number) {
        if (index !== undefined && this.tracks[index] !== this.current) {
            this.select(index)
        }
        if (!this.current) {
            this.select(0)
        }
        this.audio.play().catch(() => {})
    }

    pause() {
        this.audio.pause()
    }

    /** play if paused/stopped, pause if playing; with an index, switches track first */
    toggle(index?: number) {
        if (index !== undefined && this.tracks[index] !== this.current) {
            this.play(index)
            return
        }
        if (this.isPlaying) {
            this.pause()
        } else {
            this.play()
        }
    }

    stop() {
        if (!this.current) return
        this.isPlaying = false
        this.audio.pause()
        this.audio.currentTime = 0
        this.emit('stop', this.current)
        this.emit('time', 0, this.audio.duration || this.current.duration, 0)
    }

    /** wraps around; keeps playing if currently playing (always plays when auto-advancing) */
    next(autoplay?: boolean) {
        if (this.tracks.length === 0) return
        const i = this.current ? (this.current.index + 1) % this.tracks.length : 0
        const shouldPlay = autoplay || this.isPlaying
        this.select(i)
        if (shouldPlay) this.play()
    }

    /** restarts the track if >3s in, otherwise goes to the previous track (wrapping) */
    prev() {
        if (this.tracks.length === 0) return
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0
            return
        }
        const len = this.tracks.length
        const i = this.current ? (this.current.index - 1 + len) % len : 0
        const wasPlaying = this.isPlaying
        this.select(i)
        if (wasPlaying) this.play()
    }

    /** fraction is 0..1 */
    seek(fraction: number) {
        if (!this.audio.duration) return
        this.audio.currentTime = Math.min(Math.max(fraction, 0), 1) * this.audio.duration
    }
}
