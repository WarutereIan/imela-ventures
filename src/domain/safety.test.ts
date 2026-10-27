import { describe, expect, it } from 'vitest';
import { screenForRisk } from './safety';

describe('screenForRisk', () => {
  it.each([
    'I want to kill myself',
    "honestly I don't want to live anymore",
    'Sometimes I think everyone would be better off without me',
    "I've been cutting myself again",
    'thinking about suicide',
    'nataka kufa',
    'I just want to end it all',
  ])('flags self-harm risk: %s', (text) => {
    expect(screenForRisk(text)?.kind).toBe('self_harm');
  });

  it.each(['My husband hits me when he drinks', "I'm not safe at home", 'he threatened to kill me', 'I am being abused'])(
    'flags harm from others: %s',
    (text) => {
      expect(screenForRisk(text)?.kind).toBe('harm_from_others');
    }
  );

  it('flags harm to others and medical emergencies', () => {
    expect(screenForRisk('I want to hurt him so badly')?.kind).toBe('harm_to_others');
    expect(screenForRisk('I took too many pills')?.kind).toBe('medical');
  });

  it.each([
    "I've been arguing with my partner and I don't know how to fix things",
    'Work is killing me, I am so stressed',
    "I'm grieving my mum",
    'I keep betting and losing money',
    '',
  ])('does not flag ordinary difficulty: %s', (text) => {
    expect(screenForRisk(text)).toBeNull();
  });
});
