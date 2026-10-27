import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { renderHead } from '../src/seo/head';
import { allPublicPages, HOME, PRIVATE_PREFIXES, siteUrl } from '../src/seo/site';

const START = '<!--seo:start-->';
const END = '<!--seo:end-->';

function replaceHead(html: string, head: string): string {
  const a = html.indexOf(START);
  const b = html.indexOf(END);
  if (a === -1 || b === -1) throw new Error('index.html is missing the <!--seo:start--> / <!--seo:end--> markers');
  return `${html.slice(0, a + START.length)}\n${head}\n    ${html.slice(b)}`;
}

/**
 * Gives every public page its own static HTML head (title, description,
 * canonical, social tags, structured data), so search engines and link
 * previews see the right wording before any JavaScript runs. Also writes
 * sitemap.xml and robots.txt from the same page list.
 */
export function seoPlugin(env: Record<string, string>): Plugin {
  const base = siteUrl(env.VITE_SITE_URL);
  let outDir = 'dist';
  return {
    name: 'imela-seo',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      return replaceHead(html, renderHead(HOME, base));
    },
    closeBundle() {
      const indexFile = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexFile)) return;
      const template = fs.readFileSync(indexFile, 'utf8');
      const pages = allPublicPages(base);

      for (const page of pages) {
        if (page.path === '/') continue;
        const file = path.join(outDir, page.path.slice(1), 'index.html');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, replaceHead(template, renderHead(page, base)));
      }

      const today = new Date().toISOString().slice(0, 10);
      const urls = pages
        .map((p) => {
          const priority = p.path === '/' ? '1.0' : p.path.split('/').length <= 2 ? '0.8' : '0.6';
          return `  <url><loc>${base}${p.path === '/' ? '/' : p.path}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`;
        })
        .join('\n');
      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
      );

      const disallow = PRIVATE_PREFIXES.map((p) => `Disallow: ${p}`).join('\n');
      fs.writeFileSync(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n${disallow}\n\nSitemap: ${base}/sitemap.xml\n`);
    },
  };
}
