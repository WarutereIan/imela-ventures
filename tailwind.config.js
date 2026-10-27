/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        ivory: { DEFAULT: token('ivory'), deep: token('ivory-deep') },
        paper: token('paper'),
        ink: { DEFAULT: token('ink'), soft: token('ink-soft'), strong: token('ink-strong') },
        sage: { DEFAULT: token('sage'), deep: token('sage-deep'), ink: token('sage-ink') },
        clay: { DEFAULT: token('clay'), deep: token('clay-deep'), ink: token('clay-ink') },
        lavender: { DEFAULT: token('lavender'), soft: token('lavender-soft'), ink: token('lavender-ink') },
        butter: { DEFAULT: token('butter'), ink: token('butter-ink') },
        lime: token('lime'),
        sky: { DEFAULT: token('sky'), soft: token('sky-soft'), ink: token('sky-ink') },
        rose: { DEFAULT: token('rose'), soft: token('rose-soft'), ink: token('rose-ink') },
        line: token('line'),
        success: token('success'),
        warning: token('warning'),
        danger: token('danger'),
        info: token('info'),
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        hand: ['Caveat', '"Comic Sans MS"', 'cursive'],
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 6vw + 0.5rem, 5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.025em' }],
        'display-lg': ['clamp(2.25rem, 4vw + 0.5rem, 4rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.75rem, 2.5vw + 0.5rem, 2.75rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        'display-sm': ['clamp(1.375rem, 1.2vw + 0.75rem, 1.75rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      maxWidth: {
        prose: '68ch',
        shell: '1240px',
      },
      borderRadius: {
        blob: '2.5rem',
        card: '1.75rem',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--c-ink) / 0.04), 0 8px 24px -12px rgb(var(--c-ink) / 0.18)',
        lift: '0 2px 4px rgb(var(--c-ink) / 0.05), 0 24px 48px -24px rgb(var(--c-ink) / 0.28)',
        sticker: '3px 4px 0 rgb(var(--c-ink) / 0.9)',
      },
      transitionTimingFunction: {
        gentle: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        quick: '160ms',
        calm: '420ms',
      },
    },
  },
  plugins: [],
};
