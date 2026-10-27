import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Markdown-lite renderer for resources. Supports paragraphs (blank-line
 * separated), "## " / "### " headings, "- " bullet lists and [text](url)
 * links. It builds React elements only — no HTML strings are ever injected.
 */
export type Block =
  | { type: 'h2' | 'h3' | 'p'; text: string }
  | { type: 'ul'; items: string[] };

export function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const chunks = source.replace(/\r\n/g, '\n').split(/\n{2,}/);
  for (const raw of chunks) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.every((l) => /^[-*•]\s+/.test(l))) {
      blocks.push({ type: 'ul', items: lines.map((l) => l.replace(/^[-*•]\s+/, '')) });
    } else if (lines[0].startsWith('### ')) {
      blocks.push({ type: 'h3', text: lines[0].slice(4) });
      if (lines.length > 1) blocks.push({ type: 'p', text: lines.slice(1).join(' ') });
    } else if (lines[0].startsWith('## ')) {
      blocks.push({ type: 'h2', text: lines[0].slice(3) });
      if (lines.length > 1) blocks.push({ type: 'p', text: lines.slice(1).join(' ') });
    } else {
      blocks.push({ type: 'p', text: lines.join(' ') });
    }
  }
  return blocks;
}

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function isSafeHref(href: string) {
  return href.startsWith('/') || /^https?:\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href);
}

export function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, label, href] = m;
    if (!isSafeHref(href)) out.push(label);
    else if (href.startsWith('/')) out.push(<Link key={m.index} to={href}>{label}</Link>);
    else
      out.push(
        <a key={m.index} href={href} rel="noopener noreferrer" target={/^https?:/i.test(href) ? '_blank' : undefined}>
          {label}
        </a>
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
