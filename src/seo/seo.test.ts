import { describe, expect, it } from 'vitest';
import { CONCERNS, CONCERN_GROUPS } from '../data/concerns';
import { CONCERN_SEO, GROUP_SEO } from './concernSeo';
import { renderHead } from './head';
import { allPublicPages, fullTitle, isPrivatePath, STATIC_PAGES } from './site';

const BASE = 'https://example.test';

describe('search metadata', () => {
  it('covers every concern and support area', () => {
    for (const c of CONCERNS) expect(CONCERN_SEO[c.slug], c.slug).toBeDefined();
    for (const g of CONCERN_GROUPS) expect(GROUP_SEO[g.id], g.id).toBeDefined();
  });

  it('keeps titles and descriptions short enough to show in full', () => {
    for (const page of allPublicPages(BASE)) {
      expect(fullTitle(page.title).length, page.path).toBeLessThanOrEqual(70);
      expect(page.description.length, page.path).toBeGreaterThan(50);
      expect(page.description.length, page.path).toBeLessThanOrEqual(160);
    }
  });

  it('gives every public page a unique title, description and path', () => {
    const pages = allPublicPages(BASE);
    for (const key of ['title', 'description', 'path'] as const) {
      expect(new Set(pages.map((p) => p[key])).size, key).toBe(pages.length);
    }
  });

  it('never lists private areas as public pages', () => {
    for (const page of allPublicPages(BASE)) expect(isPrivatePath(page.path), page.path).toBe(false);
    expect(isPrivatePath('/persona/space/abc')).toBe(true);
    expect(isPrivatePath('/persona/explore')).toBe(false);
  });

  it('renders an escaped head with canonical URL and structured data', () => {
    const head = renderHead({ ...STATIC_PAGES['/support'], description: 'A "quoted" </script> test' }, BASE);
    expect(head).toContain('<link rel="canonical" href="https://example.test/support" />');
    expect(head).toContain('&quot;quoted&quot; &lt;/script&gt;');
    expect(head).not.toMatch(/<\/script>[^\n]*<\/script>/);
    expect(head).toContain('"@type":"ProfessionalService"');
  });
});
