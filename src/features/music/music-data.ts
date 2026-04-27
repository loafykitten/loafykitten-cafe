import albumArtVotV1 from '@/assets/images/album-art/Vibes of the Veil - Vol 1.png'
import albumArtVotV2 from '@/assets/images/album-art/Vibes of the Veil - Vol 2.png'
import type { ImageMetadata } from 'astro'

const VotV1Title = 'Vibes of the Veil, Vol. 1'
const VotV2Title = 'Vibes of the Veil, Vol. 2'

const getAssetHref = (albumName: AlbumName, fileName: string) => {
    switch (albumName) {
        case VotV1Title:
            return `/music/votv-vol-1/${fileName}`
        case VotV2Title:
            return `/music/votv-vol-2/${fileName}`
    }
}

export type AlbumName = typeof VotV1Title | typeof VotV2Title
export type AlbumMetadata = {
    name: AlbumName
    albumArt: ImageMetadata
    odesliHref: string // link to page containing all listen/buy options for the album
}

export type SongData = {
    title: string
    album: AlbumMetadata
    href: string // link to local asset
}

export type ClientSongData = {
    index: number
    title: string
    albumName: string
    albumArtSrc: string
    href: string
    odesliHref: string
}

const albums: Record<AlbumName, AlbumMetadata> = {
    [VotV1Title]: {
        name: VotV1Title,
        albumArt: albumArtVotV1,
        odesliHref: 'https://album.link/us/i/1796989711',
    },
    [VotV2Title]: {
        name: VotV2Title,
        albumArt: albumArtVotV2,
        odesliHref: 'https://album.link/us/i/1802778592',
    },
}

export const cassetteData: SongData[] = [
    {
        title: 'transparency',
        album: albums[VotV1Title],
        href: getAssetHref(VotV1Title, '01-transparency.mp3'),
    },
    {
        title: 'moment',
        album: albums[VotV1Title],
        href: getAssetHref(VotV1Title, '04-moment.mp3'),
    },
    {
        title: 'mirror',
        album: albums[VotV1Title],
        href: getAssetHref(VotV1Title, '06-mirror.mp3'),
    },
    {
        title: 'sprite',
        album: albums[VotV2Title],
        href: getAssetHref(VotV2Title, '02-sprite.mp3'),
    },
    {
        title: 'longing',
        album: albums[VotV2Title],
        href: getAssetHref(VotV2Title, '04-longing.mp3'),
    },
    {
        title: 'spectre',
        album: albums[VotV2Title],
        href: getAssetHref(VotV2Title, '06-spectre.mp3'),
    },
]
