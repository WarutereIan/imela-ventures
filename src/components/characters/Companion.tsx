import React, { useId } from 'react';

/**
 * Imela companions — an original family of illustrated characters.
 *
 * Every companion shares one visual grammar: a soft flat-colour body, a thick
 * charcoal outline, dot eyes and simple line arms. Mood changes the face and
 * adds a small symbolic "extra" (a scribble for a busy mind, a leaf for
 * recovery); pose changes the arms. All motion is CSS-driven, opt-in via
 * `animate`, and disabled automatically under prefers-reduced-motion.
 */

export type CompanionVariant = 'pebble' | 'cloud' | 'sprout' | 'heart' | 'bloom' | 'drift';
export type CompanionMood =
  | 'calm'
  | 'anxious'
  | 'grieving'
  | 'frustrated'
  | 'lonely'
  | 'tired'
  | 'recovering'
  | 'hopeful'
  | 'curious'
  | 'uncertain'
  | 'joyful';
export type CompanionPose = 'idle' | 'wave' | 'reach' | 'hug' | 'hold';
export type CompanionTone = 'lavender' | 'sage' | 'butter' | 'sky' | 'rose' | 'clay' | 'lime' | 'coral';
export type CompanionHold = 'heart' | 'lantern' | 'leaf';

export interface CompanionProps {
  variant?: CompanionVariant;
  mood?: CompanionMood;
  pose?: CompanionPose;
  tone?: CompanionTone;
  hold?: CompanionHold;
  /** Rendered width in px. Omit to size with className. */
  size?: number;
  animate?: 'ambient' | 'none';
  /** Accessible description. When omitted the illustration is decorative. */
  title?: string;
  className?: string;
}

export const TONES: Record<CompanionTone, string> = {
  lavender: '#C9BBF2',
  sage: '#B6D1AD',
  butter: '#F5DB7A',
  sky: '#9FC0E6',
  rose: '#F29BA8',
  clay: '#E3B69E',
  lime: '#DCEB7A',
  coral: '#F28C6B',
};

const INK = '#2A2623';
const BLUSH = '#F07C8E';
const STROKE = 5;

interface Anatomy {
  body: string;
  face: { x: number; y: number; spread: number };
  shoulders: [[number, number], [number, number]];
  feet?: [number, number];
  top: number;
}

function scallopPath(cx: number, cy: number, r: number, bumps: number, depth: number): string {
  const step = (Math.PI * 2) / bumps;
  const pt = (a: number, rad: number) => [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad].map((n) => n.toFixed(1));
  let d = `M ${pt(-Math.PI / 2, r).join(' ')}`;
  for (let i = 0; i < bumps; i += 1) {
    const a0 = -Math.PI / 2 + i * step;
    const ctrl = pt(a0 + step / 2, r + depth);
    const end = pt(a0 + step, r);
    d += ` Q ${ctrl.join(' ')} ${end.join(' ')}`;
  }
  return `${d} Z`;
}

const ANATOMY: Record<CompanionVariant, Anatomy> = {
  pebble: {
    body: 'M100 48 C150 46 172 84 170 124 C168 166 140 190 100 190 C58 190 30 166 30 122 C30 80 52 50 100 48 Z',
    face: { x: 100, y: 110, spread: 20 },
    shoulders: [[34, 130], [166, 130]],
    feet: [80, 120],
    top: 48,
  },
  cloud: {
    body: 'M58 94 C50 66 80 48 100 62 C110 40 148 42 152 72 C176 72 184 104 168 118 C184 138 168 172 140 166 C128 192 90 192 80 174 C54 184 28 162 40 138 C20 128 28 96 58 94 Z',
    face: { x: 104, y: 114, spread: 20 },
    shoulders: [[40, 134], [168, 128]],
    feet: [86, 124],
    top: 46,
  },
  sprout: {
    body: 'M78 190 C72 150 70 110 74 80 C77 56 88 40 102 40 C118 40 128 56 128 82 C130 114 128 150 124 190 Z',
    face: { x: 101, y: 80, spread: 13 },
    shoulders: [[75, 112], [127, 112]],
    feet: [90, 114],
    top: 40,
  },
  heart: {
    body: 'M100 188 C58 162 30 132 32 96 C34 70 54 54 76 56 C88 57 96 64 100 76 C104 64 112 57 124 56 C146 54 166 70 168 96 C170 132 142 162 100 188 Z',
    face: { x: 100, y: 108, spread: 20 },
    shoulders: [[38, 116], [162, 116]],
    top: 54,
  },
  bloom: {
    body: scallopPath(100, 120, 60, 11, 18),
    face: { x: 100, y: 118, spread: 19 },
    shoulders: [[44, 134], [156, 134]],
    feet: [82, 118],
    top: 44,
  },
  drift: {
    body: 'M44 186 C40 140 40 100 54 76 C68 54 84 46 100 46 C118 46 134 54 146 76 C160 100 160 140 156 186 C146 176 138 176 130 186 C122 196 112 196 104 186 C96 176 86 176 78 186 C70 196 54 196 44 186 Z',
    face: { x: 100, y: 102, spread: 20 },
    shoulders: [[46, 120], [154, 120]],
    top: 46,
  },
};

const DEFAULT_TONE: Record<CompanionVariant, CompanionTone> = {
  pebble: 'coral',
  cloud: 'sky',
  sprout: 'lavender',
  heart: 'rose',
  bloom: 'butter',
  drift: 'sage',
};

function Eyes({ mood, x, y, spread }: { mood: CompanionMood; x: number; y: number; spread: number }) {
  const l = x - spread;
  const r = x + spread;
  const line = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round' as const, fill: 'none' };

  switch (mood) {
    case 'calm':
      return (
        <g>
          <path d={`M${l - 7} ${y} q 7 6 14 0`} {...line} />
          <path d={`M${r - 7} ${y} q 7 6 14 0`} {...line} />
        </g>
      );
    case 'joyful':
      return (
        <g>
          <path d={`M${l - 7} ${y + 3} q 7 -9 14 0`} {...line} />
          <path d={`M${r - 7} ${y + 3} q 7 -9 14 0`} {...line} />
        </g>
      );
    case 'grieving':
      return (
        <g>
          <path d={`M${l - 7} ${y - 2} q 7 7 14 3`} {...line} />
          <path d={`M${r - 7} ${y + 1} q 7 4 14 -3`} {...line} />
          <path d={`M${r + 6} ${y + 8} q -4 7 0 10 q 4 -3 0 -10 Z`} fill="#8FB4E0" stroke={INK} strokeWidth={2} />
        </g>
      );
    case 'tired':
      return (
        <g>
          <path d={`M${l - 7} ${y} h 14`} {...line} />
          <path d={`M${r - 7} ${y} h 14`} {...line} />
          <path d={`M${l - 6} ${y + 4} q 6 3 12 0`} stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d={`M${r - 6} ${y + 4} q 6 3 12 0`} stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'anxious':
      return (
        <g>
          <circle cx={l} cy={y} r={8} fill="#fff" stroke={INK} strokeWidth={3} />
          <circle cx={r} cy={y} r={8} fill="#fff" stroke={INK} strokeWidth={3} />
          <circle cx={l + 1} cy={y + 1} r={3.6} fill={INK} />
          <circle cx={r + 1} cy={y + 1} r={3.6} fill={INK} />
          <path d={`M${l - 8} ${y - 15} q 6 -6 13 -2`} {...line} strokeWidth={3} />
          <path d={`M${r + 8} ${y - 15} q -6 -6 -13 -2`} {...line} strokeWidth={3} />
        </g>
      );
    case 'frustrated':
      return (
        <g>
          <circle cx={l} cy={y + 1} r={5} fill={INK} />
          <circle cx={r} cy={y + 1} r={5} fill={INK} />
          <path d={`M${l - 9} ${y - 12} l 15 6`} {...line} strokeWidth={3.5} />
          <path d={`M${r + 9} ${y - 12} l -15 6`} {...line} strokeWidth={3.5} />
        </g>
      );
    case 'lonely':
      return (
        <g>
          <circle cx={l} cy={y + 3} r={5} fill={INK} />
          <circle cx={r} cy={y + 3} r={5} fill={INK} />
          <path d={`M${l - 8} ${y - 9} q 8 -4 14 2`} {...line} strokeWidth={3} />
          <path d={`M${r + 8} ${y - 9} q -8 -4 -14 2`} {...line} strokeWidth={3} />
        </g>
      );
    case 'curious':
      return (
        <g>
          <circle cx={l} cy={y} r={5} fill={INK} />
          <circle cx={r} cy={y - 1} r={7} fill={INK} />
          <circle cx={l + 1.6} cy={y - 1.8} r={1.6} fill="#fff" />
          <circle cx={r + 2.2} cy={y - 3.2} r={2.2} fill="#fff" />
        </g>
      );
    default:
      return (
        <g>
          <circle cx={l} cy={y} r={5.5} fill={INK} />
          <circle cx={r} cy={y} r={5.5} fill={INK} />
          <circle cx={l + 1.8} cy={y - 1.8} r={1.6} fill="#fff" />
          <circle cx={r + 1.8} cy={y - 1.8} r={1.6} fill="#fff" />
        </g>
      );
  }
}

function Mouth({ mood, x, y }: { mood: CompanionMood; x: number; y: number }) {
  const line = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round' as const, fill: 'none' };
  switch (mood) {
    case 'joyful':
      return <path d={`M${x - 11} ${y - 2} q 11 15 22 0 Z`} fill="#B4233A" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />;
    case 'hopeful':
    case 'recovering':
    case 'calm':
      return <path d={`M${x - 9} ${y} q 9 8 18 0`} {...line} />;
    case 'grieving':
    case 'lonely':
      return <path d={`M${x - 7} ${y + 4} q 7 -6 14 0`} {...line} />;
    case 'frustrated':
      return <path d={`M${x - 8} ${y + 2} h 16`} {...line} />;
    case 'anxious':
    case 'uncertain':
      return <path d={`M${x - 10} ${y + 1} q 3.3 -4 6.6 0 t 6.6 0 t 6.6 0`} {...line} strokeWidth={3.5} />;
    case 'tired':
    case 'curious':
      return <ellipse cx={x} cy={y + 2} rx={4} ry={4.5} fill={INK} />;
    default:
      return <path d={`M${x - 7} ${y} q 7 5 14 0`} {...line} />;
  }
}

function Extra({ mood, x, top }: { mood: CompanionMood; x: number; top: number }) {
  const y = top - 14;
  const line = { stroke: INK, strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  switch (mood) {
    case 'anxious':
      return (
        <g className="cmp-extra">
          <path
            d={`M${x - 26} ${y + 4} c -8 -16 18 -24 18 -8 c 0 12 -20 6 -10 -6 c 10 -12 30 -6 24 8 c -4 10 -18 2 -8 -8 c 10 -10 28 -2 22 10`}
            {...line}
          />
        </g>
      );
    case 'frustrated':
      return (
        <g className="cmp-extra">
          <path d={`M${x - 46} ${y + 26} l 6 -9 l 5 7 l 6 -10`} {...line} />
          <path d={`M${x + 34} ${y + 24} l 6 -9 l 5 7 l 6 -10`} {...line} />
        </g>
      );
    case 'tired':
      return (
        <g className="cmp-extra" fill={INK} fontFamily="Caveat, cursive" fontWeight={600}>
          <text x={x + 30} y={y + 10} fontSize={22}>z</text>
          <text x={x + 44} y={y - 4} fontSize={16}>z</text>
        </g>
      );
    case 'hopeful':
      return (
        <g className="cmp-extra">
          <path
            d={`M${x + 40} ${y + 16} c -8 -6 -12 -10 -12 -15 c 0 -4 3 -6 6 -6 c 3 0 5 2 6 4 c 1 -2 3 -4 6 -4 c 3 0 6 2 6 6 c 0 5 -4 9 -12 15 Z`}
            fill={BLUSH}
            stroke={INK}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        </g>
      );
    case 'curious':
    case 'joyful':
      return (
        <g>
          <path className="cmp-twinkle" d={`M${x + 42} ${y - 2} l 3 9 l 9 3 l -9 3 l -3 9 l -3 -9 l -9 -3 l 9 -3 Z`} fill="#F5DB7A" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          {mood === 'joyful' && (
            <path className="cmp-twinkle" style={{ animationDelay: '1.1s' }} d={`M${x - 46} ${y + 10} l 2 6 l 6 2 l -6 2 l -2 6 l -2 -6 l -6 -2 l 6 -2 Z`} fill="#fff" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          )}
        </g>
      );
    case 'recovering':
      return (
        <g className="cmp-extra">
          <path d={`M${x} ${top + 2} q -2 -12 4 -20`} {...line} stroke="#3E563C" />
          <path d={`M${x + 4} ${top - 16} c 6 -10 18 -10 22 -6 c -4 8 -14 12 -22 6 Z`} fill="#8DBF7F" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
        </g>
      );
    case 'uncertain':
      return (
        <g className="cmp-extra" fill={INK} fontFamily="Caveat, cursive" fontWeight={600}>
          <text x={x + 34} y={y + 14} fontSize={30}>?</text>
        </g>
      );
    case 'grieving':
      return (
        <g className="cmp-extra">
          <path d={`M${x - 20} ${y + 2} c -10 0 -12 -14 -2 -16 c 2 -10 18 -10 20 -2 c 10 -2 14 12 4 16 Z`} fill="#D9E3EE" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
          <path d={`M${x - 12} ${y + 8} v 6 M${x - 2} ${y + 8} v 9`} {...line} strokeWidth={2.5} stroke="#6E8FB8" />
        </g>
      );
    default:
      return null;
  }
}

function HeldItem({ item, x, y }: { item: CompanionHold; x: number; y: number }) {
  if (item === 'lantern') {
    return (
      <g>
        <path d={`M${x} ${y - 16} v -6`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        <rect x={x - 10} y={y - 16} width={20} height={24} rx={6} fill="#F5DB7A" stroke={INK} strokeWidth={3} />
        <circle className="cmp-twinkle" cx={x} cy={y - 4} r={4} fill="#fff" />
      </g>
    );
  }
  if (item === 'leaf') {
    return (
      <path d={`M${x - 12} ${y + 2} c 4 -16 20 -22 26 -18 c -2 12 -12 22 -26 18 Z`} fill="#8DBF7F" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    );
  }
  return (
    <path
      d={`M${x} ${y + 10} c -12 -8 -17 -14 -17 -21 c 0 -6 4 -9 9 -9 c 4 0 7 3 8 6 c 1 -3 4 -6 8 -6 c 5 0 9 3 9 9 c 0 7 -5 13 -17 21 Z`}
      fill={BLUSH}
      stroke={INK}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  );
}

function Arms({ pose, anatomy, holdY }: { pose: CompanionPose; anatomy: Anatomy; holdY: number }) {
  const [[lx, ly], [rx, ry]] = anatomy.shoulders;
  const cx = anatomy.face.x;
  const arm = { stroke: INK, strokeWidth: STROKE, strokeLinecap: 'round' as const, fill: 'none' };

  switch (pose) {
    case 'wave':
      return (
        <g>
          <path d={`M${lx} ${ly} q -16 18 -10 38`} {...arm} />
          <path className="cmp-wave-arm" style={{ transformOrigin: `${rx}px ${ry}px` }} d={`M${rx} ${ry} q 24 -8 24 -42`} {...arm} />
        </g>
      );
    case 'reach':
      return (
        <g>
          <path d={`M${lx} ${ly} q -22 -14 -20 -48`} {...arm} />
          <path d={`M${rx} ${ry} q 22 -14 20 -48`} {...arm} />
        </g>
      );
    case 'hug':
      return (
        <g>
          <path d={`M${lx} ${ly} Q ${cx - 30} ${ly + 44} ${cx + 22} ${ly + 22}`} {...arm} />
          <path d={`M${rx} ${ry} Q ${cx + 30} ${ry + 44} ${cx - 22} ${ry + 22}`} {...arm} />
        </g>
      );
    case 'hold':
      return (
        <g>
          <path d={`M${lx} ${ly} Q ${lx + 6} ${holdY + 14} ${cx - 12} ${holdY + 2}`} {...arm} />
          <path d={`M${rx} ${ry} Q ${rx - 6} ${holdY + 14} ${cx + 12} ${holdY + 2}`} {...arm} />
        </g>
      );
    default:
      return (
        <g>
          <path d={`M${lx} ${ly} q -16 18 -10 38`} {...arm} />
          <path d={`M${rx} ${ry} q 16 18 10 38`} {...arm} />
        </g>
      );
  }
}

const Companion: React.FC<CompanionProps> = ({
  variant = 'pebble',
  mood = 'calm',
  pose = 'idle',
  tone,
  hold = 'heart',
  size,
  animate = 'ambient',
  title,
  className = '',
}) => {
  const titleId = useId();
  const anatomy = ANATOMY[variant];
  const fill = TONES[tone ?? DEFAULT_TONE[variant]];
  const { x: fx, y: fy, spread } = anatomy.face;
  const holdY = fy + (variant === 'sprout' ? 46 : 50);
  const showBlush = mood === 'hopeful' || mood === 'joyful' || mood === 'calm' || mood === 'recovering';

  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size ? (size * 220) / 200 : undefined}
      className={`${animate === 'ambient' ? 'cmp-animated' : ''} overflow-visible ${className}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-labelledby={title ? titleId : undefined}
      focusable="false"
    >
      {title && <title id={titleId}>{title}</title>}
      <ellipse cx={100} cy={206} rx={52} ry={7} fill={INK} opacity={0.08} />
      <g className="cmp-float">
        {anatomy.feet && (
          <g stroke={INK} strokeWidth={STROKE} strokeLinecap="round">
            <path d={`M${anatomy.feet[0]} 184 v 16 h -8`} fill="none" />
            <path d={`M${anatomy.feet[1]} 184 v 16 h 8`} fill="none" />
          </g>
        )}
        {pose !== 'hug' && pose !== 'hold' && <Arms pose={pose} anatomy={anatomy} holdY={holdY} />}
        <g className="cmp-body">
          <path d={anatomy.body} fill={fill} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          {/* soft highlight gives the flat shape a little volume */}
          <path d={anatomy.body} fill="#fff" opacity={0.18} transform={`translate(${fx} ${fy}) scale(0.55) translate(${-fx - 18} ${-fy - 30})`} />
          {showBlush && (
            <g fill={BLUSH} opacity={0.55}>
              <ellipse cx={fx - spread - 11} cy={fy + 11} rx={6} ry={3.5} />
              <ellipse cx={fx + spread + 11} cy={fy + 11} rx={6} ry={3.5} />
            </g>
          )}
          <g className="cmp-eyes">
            <Eyes mood={mood} x={fx} y={fy} spread={spread} />
          </g>
          <Mouth mood={mood} x={fx} y={fy + 17} />
        </g>
        {pose === 'hold' && <HeldItem item={hold} x={fx} y={holdY} />}
        {(pose === 'hug' || pose === 'hold') && <Arms pose={pose} anatomy={anatomy} holdY={holdY} />}
        <Extra mood={mood} x={fx} top={anatomy.top} />
      </g>
    </svg>
  );
};

export default Companion;
