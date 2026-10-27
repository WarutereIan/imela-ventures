import { CONCERNS } from '../../data/concerns';
import { getService } from '../../data/services';
import type { Concern, Service } from '../../data/types';
import { normalise } from '../../domain/text';

/** Client-side concern search over titles, taglines and keywords. Never leaves the device. */
export function searchConcerns(query: string, concerns: Concern[] = CONCERNS): Concern[] {
  const q = normalise(query);
  if (!q) return [];
  const terms = q.split(' ').filter((t) => t.length > 1);
  if (terms.length === 0) return [];
  return concerns
    .map((c) => {
      const title = normalise(c.title);
      const hay = normalise([c.title, c.tagline, ...c.keywords].join(' '));
      let score = 0;
      for (const t of terms) {
        if (title.includes(t)) score += 3;
        else if (hay.includes(t)) score += 1;
      }
      if (hay.includes(q)) score += 2;
      return { c, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.c);
}


/** Resolve catalogue ids to services, dropping unknown ids and duplicates. */
export function servicesFromIds(ids: string[]): Service[] {
  const seen = new Set<string>();
  const out: Service[] = [];
  for (const id of ids) {
    const s = getService(id);
    if (s && !seen.has(s.id)) {
      seen.add(s.id);
      out.push(s);
    }
  }
  return out;
}
