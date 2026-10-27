import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { STARTER_RESOURCES } from '../data/resources';
import type { Resource } from '../data/types';

/** Legacy CMS category labels (admin dashboard) → resource category ids. */
const LEGACY_CATEGORY: Record<string, string> = {
  'mental health': 'anxiety',
  corporate: 'workplace',
  leadership: 'workplace',
  family: 'family',
  wellbeing: 'coping',
};

const KNOWN = new Set(['grief', 'relationships', 'anxiety', 'stress', 'addiction', 'family', 'identity', 'workplace', 'coping']);

export function mapCmsCategory(raw: string | null | undefined): string {
  const key = (raw ?? '').trim().toLowerCase();
  if (KNOWN.has(key)) return key;
  return LEGACY_CATEGORY[key] ?? 'coping';
}

/** Plain text from possibly-HTML CMS content. Never renders markup. */
export function stripHtml(input: string): string {
  if (!input) return '';
  if (!/[<&]/.test(input)) return input;
  const withBreaks = input
    .replace(/<(script|style|template)[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(p|div|h[1-6]|li|ul|ol|blockquote)\s*>/gi, '\n\n')
    .replace(/<\s*li[^>]*>/gi, '- ');
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(withBreaks, 'text/html');
    doc.querySelectorAll('script, style, template, noscript').forEach((el) => el.remove());
    return (doc.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
  }
  return withBreaks.replace(/<[^>]*>/g, '').trim();
}

export function readingMinutes(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
}

interface CmsRow {
  id: string;
  slug?: string | null;
  title: string;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  author: string | null;
  created_at: string | null;
}

export function fromCmsRow(row: CmsRow): Resource & { cmsId: string } {
  const body = stripHtml(row.content ?? '');
  return {
    cmsId: row.id,
    slug: row.slug || row.id,
    title: row.title,
    category: mapCmsCategory(row.category),
    excerpt: stripHtml(row.excerpt ?? '') || body.slice(0, 160).trim() + (body.length > 160 ? '…' : ''),
    body,
    readMinutes: readingMinutes(body),
    author: row.author || 'Imela Ventures',
    publishedAt: row.created_at,
    reviewStatus: 'published',
    source: 'cms',
  };
}

export type LibraryResource = Resource & { cmsId?: string };

export interface ResourcesState {
  resources: LibraryResource[];
  loading: boolean;
  /** True when the CMS could not be reached; starter content is still shown. */
  cmsUnavailable: boolean;
}

let cache: LibraryResource[] | null = null;

/** Published CMS posts first (newest first), followed by starter drafts. */
export function useResources(): ResourcesState {
  const [state, setState] = useState<ResourcesState>(() =>
    cache ? { resources: cache, loading: false, cmsUnavailable: false } : { resources: STARTER_RESOURCES, loading: true, cmsUnavailable: false }
  );

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        if (!cancelled) setState({ resources: STARTER_RESOURCES, loading: false, cmsUnavailable: true });
        return;
      }
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        setState({ resources: STARTER_RESOURCES, loading: false, cmsUnavailable: true });
        return;
      }
      const cms = ((data ?? []) as CmsRow[]).map(fromCmsRow);
      cache = [...cms, ...STARTER_RESOURCES];
      setState({ resources: cache, loading: false, cmsUnavailable: false });
    })().catch(() => {
      if (!cancelled) setState({ resources: STARTER_RESOURCES, loading: false, cmsUnavailable: true });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/** Counts a view for published CMS posts only. Failures are ignored. */
export function recordView(resource: LibraryResource) {
  if (resource.source !== 'cms' || !resource.cmsId || !isSupabaseConfigured) return;
  supabase.rpc('increment_post_views', { post_id: resource.cmsId }).then(
    () => undefined,
    () => undefined
  );
}
