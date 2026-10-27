// Persona credential format — shared by the `persona-register` Edge Function
// (which generates credentials) and the website (which normalises what people
// type when they come back). Pure TypeScript + Web Crypto, so it runs in Deno,
// browsers and Vitest alike.
//
// Persona ID       IMP-XXXX-XXXX-XXXX   12 Crockford base32 chars (60 bits).
//                  Identifies a counselling space. It never grants access.
// Recovery secret  XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX   30 chars (150 bits).
//                  The only thing that proves access. Stored by Supabase Auth
//                  as a one-way hash; Imela staff can never see it.

/** Crockford base32: no I, L, O or U, so it is hard to misread or mistype. */
export const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export const CODE_GROUPS = 3;
export const CODE_GROUP_LEN = 4;
export const SECRET_GROUPS = 6;
export const SECRET_GROUP_LEN = 5;

const CODE_RE = /^IMP-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/;
const SECRET_CANONICAL_RE = /^[0-9A-HJKMNP-TV-Z]{30}$/;

/** Unbiased random characters from ALPHABET (32 divides 256, so a mask is exact). */
function randomChars(count: number): string {
  const bytes = new Uint8Array(count);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < count; i += 1) out += ALPHABET[bytes[i] & 31];
  return out;
}

function group(chars: string, size: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < chars.length; i += size) out.push(chars.slice(i, i + size));
  return out;
}

export function generatePersonaCode(): string {
  return `IMP-${group(randomChars(CODE_GROUPS * CODE_GROUP_LEN), CODE_GROUP_LEN).join('-')}`;
}

/** Canonical form (no separators) — this is what is stored as the password. */
export function generateRecoverySecret(): string {
  return randomChars(SECRET_GROUPS * SECRET_GROUP_LEN);
}

/** Map characters people commonly confuse onto the Crockford alphabet. */
function crockfordClean(input: string): string {
  return input
    .toUpperCase()
    .replace(/[\s\-_.]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
}

/** Accepts "imp 7k3q 9xwd 2mra", "IMP-7K3Q-9XWD-2MRA", etc. Returns null if invalid. */
export function normalisePersonaCode(input: string): string | null {
  let raw = crockfordClean(input);
  if (raw.startsWith('1MP')) raw = `IMP${raw.slice(3)}`; // "IMP" may have been "cleaned"
  if (!raw.startsWith('IMP')) raw = `IMP${raw}`;
  const body = raw.slice(3);
  if (body.length !== CODE_GROUPS * CODE_GROUP_LEN) return null;
  const code = `IMP-${group(body, CODE_GROUP_LEN).join('-')}`;
  return CODE_RE.test(code) ? code : null;
}

/** Accepts the secret with or without dashes/spaces. Returns the canonical form or null. */
export function normaliseRecoverySecret(input: string): string | null {
  const raw = crockfordClean(input);
  return SECRET_CANONICAL_RE.test(raw) ? raw : null;
}

/** Human-friendly display: grouped with dashes. */
export function formatRecoverySecret(canonical: string): string {
  return group(canonical, SECRET_GROUP_LEN).join('-');
}

export function isPersonaCode(value: string): boolean {
  return CODE_RE.test(value);
}

/**
 * Supabase Auth needs an email-shaped login. This address is synthetic and
 * undeliverable: no mail is ever sent to it and it contains nothing about the
 * person.
 */
export function personaLoginEmail(code: string, domain: string): string {
  return `${code.toLowerCase()}@${domain}`;
}
