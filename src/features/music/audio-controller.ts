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
    /** volume changed; volume is 0..1 */
    volume: (volume: number) => void
    error: (track: PlayerTrack) => void
}

type EventName = keyof PlayerEventMap

export class MusicPlayer {
    /** iOS Safari ignores the volume setter (hardware buttons only) — probe by write-back */
    static canControlVolume(): boolean {
        const probe = new Audio()
        probe.volume = 0.5
        return probe.volume === 0.5
    }

    readonly tracks: PlayerTrack[]
    current: PlayerTrack | null = null
    isPlaying = false

    private audio: HTMLAudioElement
    /** mid-stream failure recoveries used on the current track */
    private retries = 0
    private listeners: { [K in EventName]: PlayerEventMap[K][] } = {
        change: [],
        play: [],
        pause: [],
        stop: [],
        time: [],
        volume: [],
        error: [],
    }

    constructor(tracks: PlayerTrack[]) {
        this.tracks = tracks
        this.audio = new Audio()
        this.audio.preload = 'none'
        this.audio.volume = 0.5

        this.audio.addEventListener('volumechange', () => {
            this.emit('volume', this.audio.volume)
        })

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
            // A mid-stream network failure (e.g. a failed Range resume) makes the
            // browser truncate the track and fire 'ended' early. Compare against
            // the track's known duration and retry from the same spot before
            // treating it as a real end-of-track.
            const t = this.current
            const early = t !== null && (this.audio.error !== null || this.audio.currentTime < t.duration - 2)
            if (!early) {
                this.next(true)
                return
            }
            if (this.tryRecover(this.audio.currentTime)) return
            // out of retries: a persistent failure would make every track skip
            // mid-song too, so report it instead of advancing
            this.isPlaying = false
            if (t) this.emit('error', t)
        })

        this.audio.addEventListener('timeupdate', () => {
            const duration = this.audio.duration || this.current?.duration || 0
            const progress = duration > 0 ? this.audio.currentTime / duration : 0
            this.emit('time', this.audio.currentTime, duration, progress)
        })

        this.audio.addEventListener('error', () => {
            // A failed background fetch fires 'error' while buffered audio keeps
            // playing — surfacing it immediately would show a failure over
            // audible music. Only report when playback never started.
            if (this.audio.paused || this.audio.ended) {
                this.isPlaying = false
                if (this.current) this.emit('error', this.current)
                return
            }
            // Still "playing": either the buffer carries on (the early-'ended'
            // path recovers later) or a fatal decode error froze the clock —
            // detect the frozen case by checking for progress shortly after.
            const track = this.current
            const at = this.audio.currentTime
            setTimeout(() => {
                if (this.current !== track) return
                if (this.audio.paused || this.audio.ended || this.audio.currentTime > at) return
                if (this.tryRecover(at)) return
                this.isPlaying = false
                if (track) this.emit('error', track)
            }, 1500)
        })
    }

    /** reload the current track and continue from `position`; false once the
     *  per-track retry budget is spent */
    private tryRecover(position: number): boolean {
        if (!this.current || this.retries >= 2) return false
        this.retries++
        this.audio.src = this.current.href
        this.audio.load()
        this.audio.addEventListener(
            'loadedmetadata',
            () => {
                this.audio.currentTime = position
            },
            { once: true },
        )
        this.audio.play().catch(() => {})
        return true
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
        this.retries = 0
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

    get volume(): number {
        return this.audio.volume
    }

    /** fraction is 0..1 */
    setVolume(fraction: number) {
        this.audio.volume = Math.min(Math.max(fraction, 0), 1)
    }

    /** fraction is 0..1 */
    seek(fraction: number) {
        if (!this.audio.duration) return
        this.audio.currentTime = Math.min(Math.max(fraction, 0), 1) * this.audio.duration
    }
}
