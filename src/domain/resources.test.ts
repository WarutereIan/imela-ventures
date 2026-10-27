import { describe, expect, it } from 'vitest';
import { fromCmsRow, mapCmsCategory, stripHtml } from './resources';
import { parseBlocks } from '../components/content/markdownLite';
import { STARTER_RESOURCES, CATEGORY_BY_ID } from '../data/resources';

describe('CMS category mapping', () => {
  it('maps legacy admin categories', () => {
    expect(mapCmsCategory('Mental Health')).toBe('anxiety');
    expect(mapCmsCategory('Corporate')).toBe('workplace');
    expect(mapCmsCategory('Leadership')).toBe('workplace');
    expect(mapCmsCategory('Family')).toBe('family');
    expect(mapCmsCategory('Wellbeing')).toBe('coping');
  });
  it('passes through new ids and falls back safely', () => {
    expect(mapCmsCategory('grief')).toBe('grief');
    expect(mapCmsCategory('Something new')).toBe('coping');
    expect(mapCmsCategory(null)).toBe('coping');
  });
});

describe('safe CMS content', () => {
  it('strips HTML, including scripts and handlers, to plain text', () => {
    const text = stripHtml('<p>Hello <b>there</b></p><script>alert(1)</script><img src=x onerror="alert(2)"><p>Next</p>');
    expect(text).not.toMatch(/<|onerror|alert/);
    expect(text).toContain('Hello there');
    expect(text).toContain('Next');
  });
  it('builds a published resource from a row', () => {
    const r = fromCmsRow({ id: 'abc', title: 'T', category: 'Family', excerpt: null, content: '<p>One two three</p>', author: null, created_at: '2026-01-01' });
    expect(r).toMatchObject({ slug: 'abc', category: 'family', reviewStatus: 'published', source: 'cms', author: 'Imela Ventures' });
    expect(r.excerpt).toBe('One two three');
  });
});

describe('markdown-lite parser', () => {
  it('parses headings, lists and paragraphs', () => {
    const blocks = parseBlocks('## Title\n\nA paragraph\nwrapped.\n\n- one\n- two');
    expect(blocks).toEqual([
      { type: 'h2', text: 'Title' },
      { type: 'p', text: 'A paragraph wrapped.' },
      { type: 'ul', items: ['one', 'two'] },
    ]);
  });
});

describe('starter resources', () => {
  it('are all drafts in known categories with unique slugs', () => {
    const slugs = new Set(STARTER_RESOURCES.map((r) => r.slug));
    expect(slugs.size).toBe(STARTER_RESOURCES.length);
    for (const r of STARTER_RESOURCES) {
      expect(r.reviewStatus).toBe('draft');
      expect(CATEGORY_BY_ID[r.category]).toBeDefined();
    }
  });
});
