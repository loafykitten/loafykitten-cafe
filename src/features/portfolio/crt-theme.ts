import type { BgStyle } from '@/types'

type CrtTheme = 'blue' | 'green'

const themes = {
    blue: {
        bg: '#080810',
        glow: 'rgba(15, 25, 50, 0.5)',
        screenGlow: 'rgba(40, 80, 160, 0.12)',
    },
    green: {
        bg: '#040d04',
        glow: 'rgba(0, 40, 0, 0.5)',
        screenGlow: 'rgba(0, 120, 0, 0.10)',
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
