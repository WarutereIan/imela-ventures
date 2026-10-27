import { useEffect } from 'react';
import { headTags } from './head';
import { fullTitle, siteUrl, type PageMeta } from './site';

export const SITE_URL = siteUrl(import.meta.env.VITE_SITE_URL as string | undefined);

function apply(meta: PageMeta) {
  document.title = fullTitle(meta.title);
  for (const t of headTags(meta, SITE_URL)) {
    const selector =
      t.tag === 'script'
        ? 'script#seo-jsonld'
        : t.tag === 'link'
          ? `link[rel="${t.attrs.rel}"]`
          : t.attrs.name
            ? `meta[name="${t.attrs.name}"]`
            : `meta[property="${t.attrs.property}"]`;
    let el = document.head.querySelector<HTMLElement>(selector);
    if (!el) {
      el = document.createElement(t.tag);
      document.head.appendChild(el);
    }
    for (const [k, v] of Object.entries(t.attrs)) el.setAttribute(k, v);
    if (t.tag === 'script') el.textContent = t.content ?? '';
  }
}

/**
 * Sets the title, description, canonical URL, social tags and structured
 * data for the current page. Never pass user-entered or sensitive text.
 */
export function usePageMeta(meta: PageMeta | undefined) {
  const key = meta ? JSON.stringify(meta) : '';
  useEffect(() => {
    if (meta) apply(meta);
    // `key` captures every field of `meta`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
