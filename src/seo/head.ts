import { fullTitle, organizationLd, SITE_NAME, SOCIAL_IMAGE, websiteLd, type PageMeta } from './site';

export interface HeadTag {
  tag: 'meta' | 'link' | 'script';
  /** Used to find and update the same tag in the browser. */
  key: string;
  attrs: Record<string, string>;
  content?: string;
}

/** The managed <head> tags for a page, shared by the build and the browser. */
export function headTags(meta: PageMeta, base: string): HeadTag[] {
  const url = `${base}${meta.path === '/' ? '/' : meta.path}`;
  const title = fullTitle(meta.title);
  const image = `${base}${SOCIAL_IMAGE}`;
  const robots = meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1';
  const ld = [organizationLd(base), websiteLd(base), ...(meta.jsonLd ?? [])];

  const name = (n: string, content: string): HeadTag => ({ tag: 'meta', key: `name:${n}`, attrs: { name: n, content } });
  const prop = (p: string, content: string): HeadTag => ({ tag: 'meta', key: `property:${p}`, attrs: { property: p, content } });

  return [
    name('description', meta.description),
    name('robots', robots),
    { tag: 'link', key: 'canonical', attrs: { rel: 'canonical', href: url } },
    prop('og:site_name', SITE_NAME),
    prop('og:type', meta.type ?? 'website'),
    prop('og:locale', 'en_KE'),
    prop('og:title', title),
    prop('og:description', meta.description),
    prop('og:url', url),
    prop('og:image', image),
    name('twitter:card', 'summary'),
    name('twitter:title', title),
    name('twitter:description', meta.description),
    name('twitter:image', image),
    {
      tag: 'script',
      key: 'jsonld',
      attrs: { type: 'application/ld+json', id: 'seo-jsonld' },
      // Escape "<" so content can never close the script element.
      content: JSON.stringify(ld.length === 1 ? ld[0] : ld).replace(/</g, '\\u003c'),
    },
  ];
}

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Serialises the head for static HTML files written at build time. */
export function renderHead(meta: PageMeta, base: string): string {
  const tags = headTags(meta, base).map((t) => {
    const attrs = Object.entries(t.attrs)
      .map(([k, v]) => `${k}="${esc(v)}"`)
      .join(' ');
    return t.tag === 'script' ? `<script ${attrs}>${t.content ?? ''}</script>` : `<${t.tag} ${attrs} />`;
  });
  return [`<title>${esc(fullTitle(meta.title))}</title>`, ...tags].map((l) => `    ${l}`).join('\n');
}
