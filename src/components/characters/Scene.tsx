import React from 'react';

export type SceneEnvironment = 'sky' | 'meadow' | 'dusk' | 'scribble' | 'room' | 'sunrise';

interface SceneProps {
  environment: SceneEnvironment;
  className?: string;
  children?: React.ReactNode;
  /** Rounded "window" framing used for cards and hero art. */
  framed?: boolean;
}

/**
 * Atmospheric backdrops for companions. Purely decorative SVG, so it is hidden
 * from assistive technology; meaningful content goes in `children`.
 */
const Backdrop: React.FC<{ environment: SceneEnvironment }> = ({ environment }) => {
  const common = { className: 'absolute inset-0 h-full w-full', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': true } as const;

  switch (environment) {
    case 'sky':
      return (
        <svg viewBox="0 0 400 300" {...common}>
          <defs>
            <linearGradient id="sky-g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#9FC0E6" />
              <stop offset="1" stopColor="#E2EBF6" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#sky-g)" />
          <g fill="#fff" opacity="0.85">
            <path d="M40 80c-14 0-22-16-8-24 2-16 26-18 32-6 14-6 30 6 24 20 12 4 8 18-6 18H40z" />
            <path d="M280 52c-12 0-18-12-6-18 2-12 22-14 26-4 12-4 24 4 20 16 10 4 6 14-6 14h-34z" opacity="0.8" />
            <path d="M300 220c-20 0-30-22-10-32 4-22 36-24 44-8 20-8 42 8 34 28 16 6 10 24-8 24h-60z" opacity="0.7" />
          </g>
        </svg>
      );
    case 'meadow':
      return (
        <svg viewBox="0 0 400 300" {...common}>
          <rect width="400" height="300" fill="#ECF2E8" />
          <circle cx="320" cy="70" r="34" fill="#F5DB7A" opacity="0.8" />
          <path d="M0 210 C80 170 160 190 220 200 C290 212 340 180 400 190 V300 H0Z" fill="#B6D1AD" />
          <path d="M0 250 C90 220 200 240 260 246 C320 252 360 236 400 240 V300 H0Z" fill="#9CBF91" />
          <g stroke="#3E563C" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5">
            <path d="M60 236 q2-10 0-16 M66 238 q4-8 8-12" />
            <path d="M330 232 q-2-10 2-16 M336 234 q4-8 8-10" />
          </g>
        </svg>
      );
    case 'dusk':
      return (
        <svg viewBox="0 0 400 300" {...common}>
          <defs>
            <linearGradient id="dusk-g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#4E3D99" />
              <stop offset="1" stopColor="#C9BBF2" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#dusk-g)" />
          <g fill="#fff">
            {[
              [40, 40], [120, 70], [210, 30], [300, 60], [360, 110], [70, 130], [250, 120],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.4 : 1.4} className="cmp-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
            ))}
          </g>
          <circle cx="320" cy="56" r="20" fill="#F5E296" />
          <circle cx="328" cy="50" r="18" fill="#6A57B0" />
        </svg>
      );
    case 'scribble':
      return (
        <svg viewBox="0 0 400 300" {...common}>
          <rect width="400" height="300" fill="#C9BBF2" />
          <g stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.75">
            <path d="M-10 60 c40-40 90 20 60 50 s-60-10-20-40 80-10 100 20" />
            <path d="M300 20 c30 10 40 50 10 60 s-30-40 0-40 60 30 80 10" />
            <path d="M40 240 c20-30 70-30 70 0 s-50 30-40 0 50-40 90-10" />
            <path d="M260 250 l10-30 M290 260 l6-34 M318 256 l2-30" />
            <path d="M200 90 c20 0 30 20 20 30" />
          </g>
        </svg>
      );
    case 'room':
      return (
        <svg viewBox="0 0 400 300" {...common}>
          <rect width="400" height="300" fill="#F3E6DA" />
          <rect x="250" y="40" width="110" height="120" rx="55" fill="#E2EBF6" stroke="#E3B69E" strokeWidth="8" />
          <path d="M305 40v120M250 100h110" stroke="#E3B69E" strokeWidth="6" />
          <rect y="226" width="400" height="74" fill="#E3B69E" />
          <path d="M40 226 v-60 q0-16 16-16 h40 q16 0 16 16 v60" fill="#D6B7A5" />
          <circle cx="76" cy="132" r="22" fill="#B6D1AD" />
        </svg>
      );
    case 'sunrise':
    default:
      return (
        <svg viewBox="0 0 400 300" {...common}>
          <defs>
            <linearGradient id="sun-g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#F8D6DA" />
              <stop offset="1" stopColor="#F6F0E7" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#sun-g)" />
          <circle cx="200" cy="230" r="90" fill="#F5DB7A" opacity="0.65" />
          <path d="M0 240 C100 220 300 220 400 240 V300 H0Z" fill="#E3B69E" opacity="0.55" />
        </svg>
      );
  }
};

const Scene: React.FC<SceneProps> = ({ environment, className = '', children, framed = false }) => (
  <div className={`relative isolate overflow-hidden ${framed ? 'rounded-blob' : ''} ${className}`}>
    <Backdrop environment={environment} />
    <div className="relative">{children}</div>
  </div>
);

export default Scene;
