import type { ConcernGroupId } from '../../data/types';

/**
 * Per-area presentation so speciality pages feel tailored rather than one
 * template with a new colour. Each area chooses its own hero arrangement,
 * the way "it can feel like" quotes are shown, how support steps read and
 * the order sections appear in.
 */
export type HeroLayout = 'split-right' | 'split-left' | 'banner' | 'quiet';
export type FeelsStyle = 'bubbles' | 'stickers' | 'notes';
export type HelpsStyle = 'list' | 'steps';
export type SectionKey = 'feels' | 'helps' | 'checkin' | 'services';
export type StickerTone = 'lime' | 'lavender' | 'rose' | 'butter' | 'sky' | 'paper' | 'ink';

export interface GroupStyle {
  /** Bold bento tile classes for the directory. */
  tile: string;
  /** Muted text inside the tile. */
  tileSoft: string;
  /** Link chip classes inside the tile. */
  tileChip: string;
  /** Grid placement on large screens. */
  span: string;
  /** Accent background for highlight panels on detail pages. */
  accent: string;
  hero: HeroLayout;
  feels: FeelsStyle;
  helps: HelpsStyle;
  order: SectionKey[];
  sticker: { text: string; tone: StickerTone };
  /** Handwritten eyebrow above the page title. */
  eyebrow: string;
  /** Whether the private check-in starts collapsed (gentler for heavier areas). */
  checkinCollapsed?: boolean;
}

export const GROUP_STYLE: Record<ConcernGroupId, GroupStyle> = {
  'emotional-wellbeing': {
    tile: 'bg-lavender text-ink-strong',
    tileSoft: 'text-ink-strong/90',
    tileChip: 'bg-paper/70 hover:bg-paper text-ink-strong',
    span: 'lg:col-span-3',
    accent: 'bg-lavender-soft',
    hero: 'split-right',
    feels: 'bubbles',
    helps: 'list',
    order: ['feels', 'helps', 'checkin', 'services'],
    sticker: { text: 'one breath at a time', tone: 'lime' },
    eyebrow: 'Emotional wellbeing',
  },
  'relationships-family': {
    tile: 'bg-[#F29BA8] text-ink-strong',
    tileSoft: 'text-ink-strong/90',
    tileChip: 'bg-paper/70 hover:bg-paper text-ink-strong',
    span: 'lg:col-span-3',
    accent: 'bg-rose-soft',
    hero: 'split-left',
    feels: 'stickers',
    helps: 'list',
    order: ['feels', 'checkin', 'helps', 'services'],
    sticker: { text: 'both sides heard', tone: 'butter' },
    eyebrow: 'Relationships & family',
  },
  'grief-loss': {
    tile: 'bg-sky text-ink-strong',
    tileSoft: 'text-ink-strong/90',
    tileChip: 'bg-paper/70 hover:bg-paper text-ink-strong',
    span: 'lg:col-span-2',
    accent: 'bg-sky-soft',
    hero: 'banner',
    feels: 'notes',
    helps: 'list',
    order: ['feels', 'helps', 'services', 'checkin'],
    sticker: { text: 'no right timeline', tone: 'paper' },
    eyebrow: 'Grief & loss',
    checkinCollapsed: true,
  },
  'trauma-history': {
    tile: 'bg-sage-deep text-ink-strong',
    tileSoft: 'text-ink-strong/90',
    tileChip: 'bg-paper/70 hover:bg-paper text-ink-strong',
    span: 'lg:col-span-2',
    accent: 'bg-sage',
    hero: 'quiet',
    feels: 'notes',
    helps: 'steps',
    order: ['helps', 'feels', 'services', 'checkin'],
    sticker: { text: 'you set the pace', tone: 'paper' },
    eyebrow: 'Trauma & personal history',
    checkinCollapsed: true,
  },
  'addiction-patterns': {
    tile: 'bg-lime text-ink-strong',
    tileSoft: 'text-ink-strong/90',
    tileChip: 'bg-paper/70 hover:bg-paper text-ink-strong',
    span: 'lg:col-span-2',
    accent: 'bg-lime/40',
    hero: 'split-right',
    feels: 'stickers',
    helps: 'steps',
    order: ['feels', 'helps', 'checkin', 'services'],
    sticker: { text: 'change starts small', tone: 'lime' },
    eyebrow: 'Addiction & patterns',
  },
  'identity-growth': {
    tile: 'bg-butter text-ink-strong',
    tileSoft: 'text-ink-strong/90',
    tileChip: 'bg-paper/70 hover:bg-paper text-ink-strong',
    span: 'lg:col-span-3',
    accent: 'bg-butter/50',
    hero: 'split-left',
    feels: 'bubbles',
    helps: 'list',
    order: ['checkin', 'feels', 'helps', 'services'],
    sticker: { text: 'becoming you', tone: 'lavender' },
    eyebrow: 'Identity & growth',
  },
  'young-people-families': {
    tile: 'bg-paper text-ink-strong border-[2.5px] border-ink-strong',
    tileSoft: 'text-ink-soft',
    tileChip: 'bg-sky-soft hover:bg-sky text-ink-strong',
    span: 'lg:col-span-3',
    accent: 'bg-sky-soft',
    hero: 'banner',
    feels: 'stickers',
    helps: 'list',
    order: ['feels', 'helps', 'checkin', 'services'],
    sticker: { text: 'growing up is a lot', tone: 'sky' },
    eyebrow: 'Young people & families',
  },
  workplace: {
    tile: 'bg-ink-strong text-ivory',
    tileSoft: 'text-ivory/75',
    tileChip: 'bg-ivory/10 hover:bg-ivory/20 text-ivory',
    span: 'lg:col-span-4',
    accent: 'bg-clay/40',
    hero: 'split-right',
    feels: 'bubbles',
    helps: 'steps',
    order: ['feels', 'services', 'helps', 'checkin'],
    sticker: { text: 'people first', tone: 'lime' },
    eyebrow: 'Workplace wellbeing',
  },
  specialist: {
    tile: 'bg-clay text-ink-strong',
    tileSoft: 'text-ink-strong/90',
    tileChip: 'bg-paper/70 hover:bg-paper text-ink-strong',
    span: 'lg:col-span-2',
    accent: 'bg-lavender-soft',
    hero: 'quiet',
    feels: 'notes',
    helps: 'list',
    order: ['services', 'feels', 'helps', 'checkin'],
    sticker: { text: 'honest guidance', tone: 'paper' },
    eyebrow: 'Specialist pathways',
  },
};
