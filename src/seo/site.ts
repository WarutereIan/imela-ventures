/**
 * Search metadata for every public page: titles, descriptions, canonical URLs
 * and structured data. This module is pure so the build can import it to
 * write per-page HTML heads, sitemap.xml and robots.txt (see
 * scripts/seoPlugin.ts), and the app uses the same values at runtime.
 *
 * Only facts from src/data may appear here. No ratings, prices, credentials or
 * services that Imela has not confirmed.
 */
import { CONCERNS, CONCERN_GROUPS } from '../data/concerns';
import { FAQS } from '../data/faqs';
import { ORG } from '../data/organisation';
import { STARTER_RESOURCES } from '../data/resources';
import { TEAM } from '../data/team';
import { CONCERN_SEO, GROUP_SEO } from './concernSeo';

export const SITE_NAME = 'Imela Ventures';
export const DEFAULT_SITE_URL = 'https://www.imelaventures.com';
export const SOCIAL_IMAGE = '/logo.png';

export function siteUrl(env?: string): string {
  return (env || DEFAULT_SITE_URL).replace(/\/+$/, '');
}

export type JsonLd = Record<string, unknown>;

export interface PageMeta {
  /** Page-specific part of the title. The brand is appended if it fits. */
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  jsonLd?: JsonLd[];
  /** Article pages get og:type "article". */
  type?: 'website' | 'article';
}

/** Full <title>: "Page | Imela Ventures" when that stays readable in results. */
export function fullTitle(title: string): string {
  if (!title) return HOME.title;
  if (title.includes(SITE_NAME)) return title;
  const withBrand = `${title} | ${SITE_NAME}`;
  return withBrand.length <= 70 ? withBrand : title;
}

/* ------------------------------------------------------------------ Static pages */

export const HOME: PageMeta = {
  title: 'Counselling & Mental Health Support in Nairobi | Imela Ventures',
  description:
    'Confidential counselling in Nairobi and online across Kenya for anxiety, depression, stress, marriage, grief, teens and workplace mental health. Book today.',
  path: '/',
  jsonLd: [faqLd(FAQS)],
};

export const STATIC_PAGES: Record<string, PageMeta> = {
  '/': HOME,
  '/who-we-are': {
    title: 'About Imela Ventures: Counselling & Wellness in Nairobi',
    description:
      'Imela Ventures is a Nairobi counselling and psychological wellbeing practice for individuals, couples, families and organisations across Kenya.',
    path: '/who-we-are',
  },
  '/team': {
    title: 'Our Counsellors in Nairobi',
    description:
      'Meet the Imela Ventures counselling team in Nairobi: experienced, compassionate counsellors for individuals, couples, families and workplaces.',
    path: '/team',
  },
  '/support': {
    title: 'What We Help With: Counselling Services A–Z',
    description:
      'Counselling and mental health support in Nairobi for anxiety, depression, stress, relationships, grief, trauma, addiction, teens and workplace wellbeing.',
    path: '/support',
  },
  '/find-support': {
    title: 'Find the Right Counselling Service for You',
    description:
      'Describe what you are going through in your own words and get matched to suitable counselling services in Nairobi and online, with a clear reason for each.',
    path: '/find-support',
  },
  '/book': {
    title: 'Book a Counselling Session in Nairobi or Online',
    description:
      'Book a counselling session or initial consultation with Imela Ventures: individual, couples, family or teen counselling, in Nairobi or online.',
    path: '/book',
  },
  '/organisations': {
    title: 'Corporate Wellness & Employee Mental Health in Kenya',
    description:
      'Workplace mental health programmes in Kenya: employee counselling, wellbeing training, leadership development, conflict resolution and culture audits.',
    path: '/organisations',
  },
  '/resources': {
    title: 'Mental Health Resources & Self-Help Guides',
    description:
      'Free, practical mental health and wellbeing guides on anxiety, stress, burnout, grief, relationships, parenting, boundaries and workplace wellbeing.',
    path: '/resources',
  },
  '/persona': {
    title: 'Anonymous Online Counselling in Kenya',
    description:
      'Talk to a counsellor anonymously by private message. No name, email or phone number needed: you get a Persona ID and a recovery secret instead of an account.',
    path: '/persona',
  },
  '/persona/explore': {
    title: 'Free, Private Mental Health Check-In',
    description:
      'A private guided check-in that helps you put feelings into words and find support that fits. Runs in your browser, needs no sign-up and is not stored.',
    path: '/persona/explore',
  },
  '/privacy': {
    title: 'Privacy Notice',
    description: 'How Imela Ventures collects, uses and protects personal and counselling information under the Kenya Data Protection Act 2019.',
    path: '/privacy',
  },
  '/terms': {
    title: 'Terms of Use',
    description: 'The terms for using the Imela Ventures website, booking requests, the private guide and anonymous counselling.',
    path: '/terms',
  },
};

/** Private or utility areas: never indexed and listed in robots.txt. */
export const PRIVATE_PREFIXES = ['/admin', '/portal', '/practitioner', '/staff', '/organisations/workspace', '/persona/space', '/persona/start', '/persona/access', '/dev'];

export function isPrivatePath(path: string): boolean {
  return PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

/* ------------------------------------------------------------------ Structured data */

export function organizationLd(base: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${base}/#organization`,
    name: ORG.name,
    slogan: ORG.tagline,
    description: ORG.mission,
    url: `${base}/`,
    logo: `${base}/logo.png`,
    image: `${base}${SOCIAL_IMAGE}`,
    telephone: ORG.phoneHref.replace('tel:', ''),
    email: ORG.email,
    address: {
      '@type': 'PostalAddress',
      postOfficeBoxNumber: '176-00502',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
    },
    areaServed: [{ '@type': 'Country', name: 'Kenya' }, { '@type': 'City', name: 'Nairobi' }],
    knowsAbout: [
      'Counselling',
      'Mental health',
      'Psychological wellbeing',
      'Anxiety',
      'Depression',
      'Stress management',
      'Burnout',
      'Marriage counselling',
      'Couples counselling',
      'Family counselling',
      'Grief and bereavement',
      'Teen counselling',
      'Workplace mental health',
      'Employee wellbeing',
      'Leadership development',
    ],
    founder: TEAM[0] ? { '@type': 'Person', name: TEAM[0].name, jobTitle: TEAM[0].role } : undefined,
  };
}

export function websiteLd(base: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    name: SITE_NAME,
    url: `${base}/`,
    inLanguage: 'en-KE',
    publisher: { '@id': `${base}/#organization` },
  };
}

function breadcrumbLd(base: string, items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${base}${it.path}` })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

/* ------------------------------------------------------------------ Dynamic pages */

export function concernMeta(slug: string, base: string): PageMeta | undefined {
  const concern = CONCERNS.find((c) => c.slug === slug);
  const seo = CONCERN_SEO[slug];
  if (!concern || !seo) return undefined;
  const group = CONCERN_GROUPS.find((g) => g.id === concern.group);
  const path = `/support/${slug}`;
  return {
    title: seo.title,
    description: seo.description,
    path,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: seo.title,
        description: seo.description,
        url: `${base}${path}`,
        about: { '@type': 'Thing', name: concern.title },
        provider: { '@id': `${base}/#organization` },
      },
      breadcrumbLd(base, [
        { name: 'Home', path: '/' },
        { name: 'What we help with', path: '/support' },
        ...(group ? [{ name: group.title, path: `/support/area/${group.id}` }] : []),
        { name: concern.title, path },
      ]),
    ],
  };
}

export function groupMeta(id: string, base: string): PageMeta | undefined {
  const group = CONCERN_GROUPS.find((g) => g.id === id);
  const seo = GROUP_SEO[id];
  if (!group || !seo) return undefined;
  const path = `/support/area/${id}`;
  return {
    title: seo.title,
    description: seo.description,
    path,
    jsonLd: [
      breadcrumbLd(base, [
        { name: 'Home', path: '/' },
        { name: 'What we help with', path: '/support' },
        { name: group.title, path },
      ]),
    ],
  };
}

export function teamMemberMeta(slug: string, base: string): PageMeta | undefined {
  const m = TEAM.find((t) => t.slug === slug);
  if (!m) return undefined;
  const path = `/team/${slug}`;
  const firstSentence = m.bio[0]?.split('. ')[0] ?? '';
  return {
    title: `${m.name}, ${m.role}`,
    description: `${firstSentence}. ${m.areas.slice(0, 3).join(', ')} in Nairobi and online.`.slice(0, 158),
    path,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: m.name,
        jobTitle: m.role,
        url: `${base}${path}`,
        worksFor: { '@id': `${base}/#organization` },
        knowsAbout: m.areas,
      },
    ],
  };
}

export function resourceMeta(slug: string, base: string): PageMeta | undefined {
  const r = STARTER_RESOURCES.find((x) => x.slug === slug);
  if (!r) return undefined;
  return articleMeta(r, base);
}

export function articleMeta(r: { slug: string; title: string; excerpt: string; author: string; publishedAt: string | null }, base: string): PageMeta {
  const path = `/resources/${r.slug}`;
  return {
    title: r.title,
    description: r.excerpt,
    path,
    type: 'article',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: r.title,
        description: r.excerpt,
        url: `${base}${path}`,
        author: { '@type': 'Organization', name: r.author },
        publisher: { '@id': `${base}/#organization` },
        ...(r.publishedAt ? { datePublished: r.publishedAt } : {}),
        inLanguage: 'en-KE',
      },
    ],
  };
}

/** Every indexable page, for the sitemap and build-time HTML heads. */
export function allPublicPages(base: string): PageMeta[] {
  const pages: PageMeta[] = Object.values(STATIC_PAGES);
  for (const g of CONCERN_GROUPS) {
    const m = groupMeta(g.id, base);
    if (m) pages.push(m);
  }
  for (const c of CONCERNS) {
    const m = concernMeta(c.slug, base);
    if (m) pages.push(m);
  }
  for (const t of TEAM) {
    const m = teamMemberMeta(t.slug, base);
    if (m) pages.push(m);
  }
  for (const r of STARTER_RESOURCES) {
    const m = resourceMeta(r.slug, base);
    if (m) pages.push(m);
  }
  return pages;
}
