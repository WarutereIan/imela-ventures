import type { CompanionMood, CompanionVariant } from '../characters/Companion';

const CATEGORY_ART: Record<string, { variant: CompanionVariant; mood: CompanionMood; surface: string }> = {
  anxiety: { variant: 'pebble', mood: 'anxious', surface: 'bg-lavender-soft' },
  stress: { variant: 'sprout', mood: 'tired', surface: 'bg-rose-soft' },
  grief: { variant: 'cloud', mood: 'grieving', surface: 'bg-sky-soft' },
  relationships: { variant: 'heart', mood: 'hopeful', surface: 'bg-rose-soft' },
  family: { variant: 'bloom', mood: 'joyful', surface: 'bg-butter/70' },
  addiction: { variant: 'sprout', mood: 'recovering', surface: 'bg-lime/70' },
  identity: { variant: 'drift', mood: 'curious', surface: 'bg-clay/50' },
  workplace: { variant: 'pebble', mood: 'calm', surface: 'bg-sage' },
  coping: { variant: 'cloud', mood: 'calm', surface: 'bg-lavender-soft' },
};

export function categoryArt(id: string) {
  return CATEGORY_ART[id] ?? CATEGORY_ART.coping;
}
