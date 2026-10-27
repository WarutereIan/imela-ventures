import { describe, expect, it } from 'vitest';
import { matchConcerns, recommend } from './matching';
import { SERVICES } from '../data/services';
import { CONCERNS } from '../data/concerns';

const available = new Set(SERVICES.filter((s) => s.status === 'available').map((s) => s.id));

describe('matching engine', () => {
  it('connects relationship language to relationship concerns and couples counselling', () => {
    const result = recommend("I've been arguing with my partner and I don't know how to fix things", { prefer: { together: true } });
    expect(result.concerns[0].concern.group).toBe('relationships-family');
    expect(result.recommendations[0].service.id).toBe('couples-therapy');
    expect(result.recommendations[0].reason).toMatch(/You mentioned/);
  });

  it('connects grief language to grief concerns', () => {
    const top = matchConcerns('My father passed away last month and I cannot stop crying')[0];
    expect(top.concern.group).toBe('grief-loss');
  });

  it('connects work exhaustion to burnout or work stress', () => {
    const slugs = matchConcerns("I'm exhausted by work, my boss keeps piling it on").map((m) => m.concern.slug);
    expect(slugs.some((s) => ['burnout', 'work-stress'].includes(s))).toBe(true);
  });

  it('only recommends services that are verified as available', () => {
    const inputs = [
      'I drink too much and I want to stop',
      'I think I might have ADHD',
      'I want a psychological assessment',
      'we are getting married next year',
      'my teenager is struggling with exams',
      'random words with no meaning',
    ];
    for (const text of inputs) {
      for (const rec of recommend(text).recommendations) {
        expect(available.has(rec.service.id)).toBe(true);
      }
    }
  });

  it('keeps referral-only services out of bookable recommendations', () => {
    const result = recommend('I think I might have ADHD and need an assessment');
    expect(result.recommendations.some((r) => r.service.status !== 'available')).toBe(false);
  });

  it('falls back to a consultation when nothing matches', () => {
    const result = recommend('qwerty');
    expect(result.fallback).toBe(true);
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].service.id).toBe('consultation');
  });

  it('respects explicit selections even without text', () => {
    const result = recommend('', { selectedConcerns: ['parenting'] });
    expect(result.concerns[0].concern.slug).toBe('parenting');
  });

  it('respects the organisation audience', () => {
    const result = recommend('our team is burnt out and there is conflict', { audience: 'organisation' });
    expect(result.recommendations.every((r) => r.service.audience === 'organisation')).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('every concern references real services', () => {
    const ids = new Set(SERVICES.map((s) => s.id));
    for (const c of CONCERNS) for (const id of c.serviceIds) expect(ids.has(id)).toBe(true);
  });
});
