/** Lower-case, strip accents and punctuation noise, collapse whitespace. */
export function normalise(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const cache = new Map<string, RegExp>();

/**
 * Whole-word / whole-phrase containment on normalised text. A trailing `*` on
 * the phrase allows a word prefix (e.g. "argu*" matches "arguing").
 */
export function containsPhrase(normalisedText: string, phrase: string): boolean {
  let re = cache.get(phrase);
  if (!re) {
    const prefix = phrase.endsWith('*');
    const body = escapeRegExp(normalise(prefix ? phrase.slice(0, -1) : phrase)).replace(/ /g, '\\s+');
    re = new RegExp(`(^|[^a-z0-9])${body}${prefix ? '' : '(?![a-z0-9])'}`);
    cache.set(phrase, re);
  }
  return re.test(normalisedText);
}
