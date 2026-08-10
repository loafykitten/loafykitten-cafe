// Track data for the singy-songy collection (public/music/singy-songy).
// Files are numbered in intended listening order.

export type Track = {
    index: number
    title: string
    href: string
    /** duration in whole seconds, for static display before audio metadata loads */
    duration: number
}

const file = (name: string) => encodeURI(`/music/singy-songy/${name}`)

export const tracks: Track[] = [
    { index: 0, title: 'Pressure', href: file('01 Pressure.mp3'), duration: 96 },
    { index: 1, title: 'Honey', href: file('02 Honey.mp3'), duration: 101 },
    { index: 2, title: 'The Simple Things', href: file('03 The Simple Things.mp3'), duration: 230 },
    { index: 3, title: 'Whirlwind', href: file('04 Whirlwind.mp3'), duration: 187 },
    { index: 4, title: '615', href: file('05 615.mp3'), duration: 157 },
    { index: 5, title: 'Estranged', href: file('06 Estranged.mp3'), duration: 201 },
    { index: 6, title: 'Enough', href: file('07 Enough.mp3'), duration: 163 },
    { index: 7, title: 'love,', href: file('08 love,.mp3'), duration: 186 },
]

export const musicLinks = {
    bandcamp: 'https://loafykitten.bandcamp.com',
    youtube: 'https://youtube.com/@loafykitten',
} as const

export const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}
