import type { BgStyle } from '@/types'

type CrtTheme = 'blue' | 'green' | 'pink'

interface CrtPalette {
    bg: string
    glow: string
    screenGlow: string
    fgBright: string
    fgLabel: string
    fgDim: string
    fgSection: string
    borderDivider: string
    borderSection: string
    tagBg: string
    tagBgHover: string
    tagFg: string
    tagFgHover: string
}

const themes: Record<CrtTheme, CrtPalette> = {
    blue: {
        bg: '#080810',
        glow: 'rgba(15, 25, 50, 0.5)',
        screenGlow: 'rgba(40, 80, 160, 0.12)',
        fgBright: '#7fc8ff',
        fgLabel: '#5a8abf',
        fgDim: '#4a6a8a',
        fgSection: '#6a9ac8',
        borderDivider: '#1a3a5a',
        borderSection: '#10243a',
        tagBg: '#000810',
        tagBgHover: '#001020',
        tagFg: '#88a8c8',
        tagFgHover: '#bccce0',
    },
    green: {
        bg: '#040d04',
        glow: 'rgba(0, 40, 0, 0.5)',
        screenGlow: 'rgba(0, 120, 0, 0.10)',
        fgBright: '#0f0',
        fgLabel: '#6b6',
        fgDim: '#494',
        fgSection: '#5a5',
        borderDivider: '#2a5a2a',
        borderSection: '#1a3a1a',
        tagBg: '#0f02',
        tagBgHover: '#0f04',
        tagFg: '#8b8',
        tagFgHover: '#bfb',
    },
    pink: {
        bg: '#100408',
        glow: 'rgba(50, 0, 25, 0.5)',
        screenGlow: 'rgba(200, 80, 130, 0.12)',
        fgBright: '#ffc8d8',
        fgLabel: '#e8a0b4',
        fgDim: '#b06a7e',
        fgSection: '#dc8aa0',
        borderDivider: '#5a2a3a',
        borderSection: '#3a1a26',
        tagBg: '#1a0410',
        tagBgHover: '#2a0818',
        tagFg: '#d8a',
        tagFgHover: '#fcd',
    },
}

export function getCrtBgStyle(theme: CrtTheme = 'green', enableGlow = true): BgStyle {
    const t = themes[theme]

    return {
        varProps: {
            'crt-bg': t.bg,
            'crt-glow': t.glow,
            'crt-vignette': 'rgba(0, 0, 0, 0.8)',
            'crt-scanline-alpha': '0.18',
            'crt-screen-glow': enableGlow ? t.screenGlow : 'transparent',
            'crt-fg-bright': t.fgBright,
            'crt-fg-label': t.fgLabel,
            'crt-fg-dim': t.fgDim,
            'crt-fg-section': t.fgSection,
            'crt-border-divider': t.borderDivider,
            'crt-border-section': t.borderSection,
            'crt-tag-bg': t.tagBg,
            'crt-tag-bg-hover': t.tagBgHover,
            'crt-tag-fg': t.tagFg,
            'crt-tag-fg-hover': t.tagFgHover,
            'footer-bg': '#000',
        },
        style: `
            body {
                background-color: var(--crt-bg);
                background-image:
                    linear-gradient(
                        135deg,
                        transparent 38%,
                        rgba(255, 255, 255, 0.03) 42%,
                        transparent 46%
                    ),
                    radial-gradient(
                        ellipse at 50% 50%,
                        var(--crt-glow) 0%,
                        transparent 40%,
                        var(--crt-vignette) 100%
                    ),
                    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='4' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23noise)' opacity='0.15' /%3E%3C/svg%3E");
                background-size: 100% 100%, 100% 100%, 180px 180px;
                background-position: center, center, top left;
                background-repeat: no-repeat, no-repeat, repeat;
                text-align: center;
            }

            body::after {
                content: '';
                position: fixed;
                inset: 0;
                background:
                    repeating-linear-gradient(
                        to bottom,
                        transparent 0px,
                        transparent 2px,
                        rgb(0 0 0 / var(--crt-scanline-alpha)) 2px,
                        rgb(0 0 0 / var(--crt-scanline-alpha)) 4px
                    ),
                    radial-gradient(
                        ellipse at 50% 50%,
                        var(--crt-screen-glow) 0%,
                        transparent 70%
                    );
                pointer-events: none;
                z-index: 2;
                animation: crt-flicker 3s linear infinite;
            }

            @keyframes crt-flicker {
                0% { opacity: 0.88; }
                8% { opacity: 0.96; }
                18% { opacity: 0.85; }
                30% { opacity: 1; }
                42% { opacity: 0.90; }
                55% { opacity: 0.97; }
                68% { opacity: 0.84; }
                78% { opacity: 0.93; }
                88% { opacity: 0.87; }
                100% { opacity: 0.88; }
            }

            @media (prefers-reduced-motion: reduce) {
                body::after {
                    animation: none;
                }
            }
        `,
    }
}
