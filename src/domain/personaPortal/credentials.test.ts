import { describe, expect, it } from 'vitest';
import {
  ALPHABET,
  formatRecoverySecret,
  generatePersonaCode,
  generateRecoverySecret,
  isPersonaCode,
  normalisePersonaCode,
  normaliseRecoverySecret,
  personaLoginEmail,
} from '../../../supabase/functions/_shared/personaCredentials';

describe('Persona credentials', () => {
  it('generates well-formed, unique Persona IDs', () => {
    const codes = new Set(Array.from({ length: 2000 }, generatePersonaCode));
    expect(codes.size).toBe(2000);
    for (const c of codes) expect(isPersonaCode(c)).toBe(true);
  });

  it('generates 30-character recovery secrets from the unambiguous alphabet (150 bits)', () => {
    const secrets = Array.from({ length: 500 }, generateRecoverySecret);
    expect(new Set(secrets).size).toBe(500);
    for (const s of secrets) {
      expect(s).toHaveLength(30);
      for (const ch of s) expect(ALPHABET).toContain(ch);
    }
    expect(30 * Math.log2(ALPHABET.length)).toBe(150);
  });

  it('uses every alphabet character roughly evenly (no modulo bias)', () => {
    const counts = new Map<string, number>();
    const sample = Array.from({ length: 400 }, generateRecoverySecret).join('');
    for (const ch of sample) counts.set(ch, (counts.get(ch) ?? 0) + 1);
    const expected = sample.length / 32;
    expect(counts.size).toBe(32);
    for (const n of counts.values()) expect(Math.abs(n - expected) / expected).toBeLessThan(0.3);
  });

  it('accepts Persona IDs typed loosely, and rejects malformed ones', () => {
    expect(normalisePersonaCode('imp-7k3q-9xwd-2mra')).toBe('IMP-7K3Q-9XWD-2MRA');
    expect(normalisePersonaCode(' IMP 7K3Q 9XWD 2MRA ')).toBe('IMP-7K3Q-9XWD-2MRA');
    expect(normalisePersonaCode('7K3Q9XWD2MRA')).toBe('IMP-7K3Q-9XWD-2MRA');
    // O→0 and I/L→1 are common misreadings
    expect(normalisePersonaCode('IMP-7K3Q-9XWD-2MRO')).toBe('IMP-7K3Q-9XWD-2MR0');
    expect(normalisePersonaCode('IMP-7K3Q-9XWD')).toBeNull();
    expect(normalisePersonaCode('IMP-7K3Q-9XWD-2MRU')).toBeNull();
  });

  it('round-trips the displayed recovery secret', () => {
    const secret = generateRecoverySecret();
    const shown = formatRecoverySecret(secret);
    expect(shown.split('-')).toHaveLength(6);
    expect(normaliseRecoverySecret(shown)).toBe(secret);
    expect(normaliseRecoverySecret(shown.toLowerCase().replace(/-/g, ' '))).toBe(secret);
    expect(normaliseRecoverySecret('too-short')).toBeNull();
  });

  it('builds a synthetic login that contains nothing but the Persona ID', () => {
    expect(personaLoginEmail('IMP-7K3Q-9XWD-2MRA', 'persona.imelaventures.invalid')).toBe('imp-7k3q-9xwd-2mra@persona.imelaventures.invalid');
  });
});
