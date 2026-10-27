import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import { STATIC_PAGES } from '../../seo/site';
import { usePageMeta } from '../../seo/usePageMeta';
import { TEAM } from '../../data/team';
import { FORMAT_LABEL } from '../../data/services';
import type { ServiceFormat, TeamMember } from '../../data/types';
import Companion from '../../components/characters/Companion';
import Scene from '../../components/characters/Scene';
import { Chip, EmptyState } from '../../components/ui/primitives';
import { Sticker } from '../../components/ui/Sticker';
import { buttonClasses } from '../../components/ui/Button';
import { cn } from '../../lib/cn';

const FORMATS: ServiceFormat[] = ['in_person', 'online'];

function PractitionerCard({ member }: { member: TeamMember }) {
  const first = member.name.split(' ')[0];
  return (
    <article className="group relative grid overflow-hidden rounded-blob border border-line/10 bg-paper shadow-soft transition-shadow hover:shadow-lift md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Scene environment={member.character.environment} className="min-h-[12rem] md:min-h-[18rem]">
        <div className="flex min-h-[12rem] flex-col items-center justify-end pb-3 md:min-h-[18rem] md:pb-4">
          <Companion variant={member.character.variant} mood={member.character.mood} pose={member.character.pose} tone={member.character.tone} className="h-auto w-28 md:w-[170px]" />
          <p className="mt-1 rounded-pill bg-paper/85 px-3 py-1 text-xs text-ink-soft">Illustration — not a photo of {first}</p>
        </div>
      </Scene>
      <div className="flex flex-col p-5 md:p-8">
        <p className="eyebrow">{member.role}</p>
        <h2 className="mt-1 font-display text-display-md">
          <Link to={`/team/${member.slug}`} className="after:absolute after:inset-0">
            {member.name}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-4 leading-relaxed text-ink-soft md:line-clamp-none">{member.bio[0]}</p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Areas of practice">
          {member.areas.slice(0, 5).map((a) => (
            <li key={a}>
              <Chip tone="lavender">{a}</Chip>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-ink">
          <span className="font-semibold">Formats: </span>
          {member.formats ? member.formats.map((f) => FORMAT_LABEL[f]).join(' · ') : 'To be confirmed'}
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-lavender-ink md:pt-6">
          View profile <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </article>
  );
}

export default function TeamPage() {
  usePageMeta(STATIC_PAGES['/team']);
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState<ServiceFormat | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEAM.filter(
      (m) =>
        (!format || m.formats?.includes(format)) &&
        (!q || m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.areas.some((a) => a.toLowerCase().includes(q)))
    );
  }, [query, format]);

  return (
    <>
      <section className="shell pb-6 pt-8 md:pb-10 md:pt-20">
        <div className="grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h1 className="font-display text-display-lg">
              <span className="eyebrow mb-2 block">Our counsellors in Nairobi</span>
              Real people, ready to listen.
            </h1>
          </div>
          <p className="text-base leading-relaxed text-ink-soft md:text-lg">
            Our counsellors bring care, discretion and experience to every conversation — in person in Nairobi and online. Profiles only list qualifications Imela has verified.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-card bg-ivory-deep/70 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-5 md:mt-10">
          <div className="relative flex-1">
            <label htmlFor="team-search" className="sr-only">
              Search by name or area of practice
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" aria-hidden />
            <input
              id="team-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or area, e.g. couples"
              className="h-12 w-full rounded-pill border border-line/20 bg-paper pl-12 pr-4 placeholder:text-ink-soft/70 focus:border-lavender-ink focus:outline-none focus:ring-2 focus:ring-lavender-ink/30"
            />
          </div>
          <div role="group" aria-label="Filter by format" className="flex flex-wrap gap-2">
            {[null, ...FORMATS].map((f) => (
              <button
                key={f ?? 'any'}
                type="button"
                aria-pressed={format === f}
                onClick={() => setFormat(f)}
                className={cn(
                  'rounded-pill border px-4 py-2 text-sm font-semibold transition-colors',
                  format === f ? 'border-ink-strong bg-ink-strong text-ivory' : 'border-line/20 bg-paper hover:border-ink/40'
                )}
              >
                {f ? FORMAT_LABEL[f] : 'Any format'}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-soft" aria-live="polite">
          {results.length} {results.length === 1 ? 'practitioner' : 'practitioners'}
        </p>
      </section>

      <section className="shell" aria-label="Practitioners">
        {results.length === 0 ? (
          <EmptyState title="No one matches those filters." art={<Companion variant="cloud" mood="uncertain" tone="sky" size={100} animate="none" />}>
            Try clearing the search, or{' '}
            <Link to="/book?service=consultation" className="underline">
              book a consultation
            </Link>{' '}
            and we'll match you with the right person.
          </EmptyState>
        ) : (
          <ul className="grid gap-8">
            {results.map((m) => (
              <li key={m.slug}>
                <PractitionerCard member={m} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="shell pt-10 md:pt-16">
        <div className="relative grid gap-6 overflow-hidden rounded-blob bg-lime p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div>
            <h2 className="font-display text-display-md">Not sure who to see?</h2>
            <p className="mt-3 max-w-xl text-ink">
              Start with a short consultation. We'll listen to what you need and suggest the right kind of support — no commitment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/book?service=consultation" className={buttonClasses('primary')}>
                Schedule Consultation
              </Link>
              <Link to="/persona" className={buttonClasses('outline')}>
                Explore privately first
              </Link>
            </div>
          </div>
          <div className="relative mx-auto hidden sm:block">
            <Companion variant="pebble" mood="joyful" pose="wave" tone="coral" size={140} />
            <div className="absolute -left-10 top-2">
              <Sticker tone="paper" tilt={-8}>
                hi there
              </Sticker>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
