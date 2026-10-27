import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import type { CaseResource } from '../../domain/personaPortal/types';

/** A resource shared by a counsellor: internal paths stay in the app, external links open safely in a new tab. */
export function ResourceLink({ resource }: { resource: CaseResource }) {
  const internal = resource.url.startsWith('/');
  const body = (
    <>
      <span className="font-semibold text-ink-strong">{resource.title}</span>
      {resource.note && <span className="mt-0.5 block text-sm text-ink-soft">{resource.note}</span>}
    </>
  );
  return internal ? (
    <Link to={resource.url} className="block rounded-2xl bg-paper p-3 shadow-soft hover:bg-lavender-soft/50">
      {body}
    </Link>
  ) : (
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl bg-paper p-3 shadow-soft hover:bg-lavender-soft/50">
      {body}
      <span className="mt-1 inline-flex items-center gap-1 text-xs text-ink-soft">
        <ExternalLink className="h-3 w-3" aria-hidden /> Opens another website
      </span>
    </a>
  );
}
