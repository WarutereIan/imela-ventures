import { Link, useParams } from 'react-router-dom';
import { ArrowRight, MessageCircleHeart } from 'lucide-react';
import { CONCERN_GROUPS, concernsInGroup, getGroup } from '../../data/concerns';
import type { ConcernGroupId } from '../../data/types';
import Companion from '../../components/characters/Companion';
import Scene from '../../components/characters/Scene';
import { Sticker } from '../../components/ui/Sticker';
import { buttonClasses } from '../../components/ui/Button';
import { NotFoundPage } from '../../components/layout/PageStates';
import { GROUP_STYLE } from '../../components/support/groupStyles';
import { ServicesByStatus } from '../../components/support/ServicesByStatus';
import { servicesFromIds } from '../../components/support/search';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { cn } from '../../lib/cn';

export default function SupportGroupPage() {
  const { groupId } = useParams();
  const group = getGroup(groupId);
  useDocumentTitle(group?.title ?? 'Not found');
  if (!group) return <NotFoundPage />;

  const style = GROUP_STYLE[group.id];
  const concerns = concernsInGroup(group.id as ConcernGroupId);
  const own = concerns.filter((c) => c.group === group.id);
  const linked = concerns.filter((c) => c.group !== group.id);

  // Services ranked by how many concerns in this area point to them.
  const counts = new Map<string, number>();
  own.forEach((c) => c.serviceIds.forEach((id, i) => counts.set(id, (counts.get(id) ?? 0) + (c.serviceIds.length - i))));
  const services = servicesFromIds([...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id));
  const others = CONCERN_GROUPS.filter((g) => g.id !== group.id);
  const ch = group.character;

  return (
    <article>
      <section className="pb-10 pt-8">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
            <Link to="/support" className="hover:text-ink-strong hover:underline">
              What we help with
            </Link>
          </nav>
          <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
            <div>
              <p className="eyebrow">Support area</p>
              <h1 className="mt-1 font-display text-display-lg">{group.title}</h1>
              <p className="mt-5 max-w-xl text-xl leading-relaxed text-ink">{group.blurb}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#topics" className={buttonClasses('primary', 'lg')}>
                  Explore topics <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
                <Link to="/persona" className={buttonClasses('outline', 'lg')}>
                  <MessageCircleHeart className="h-4 w-4" aria-hidden /> Not sure? Talk it through
                </Link>
              </div>
            </div>
            <Scene environment={ch.environment} framed className="aspect-[6/5] w-full">
              <div className="flex aspect-[6/5] items-end justify-center gap-2 pb-[5%]">
                <Companion variant={ch.variant} mood={ch.mood} pose={ch.pose} tone={ch.tone} className="w-[42%] max-w-[240px]" />
                {own[1] && (
                  <Companion
                    variant={own[1].character.variant}
                    mood={own[1].character.mood}
                    pose={own[1].character.pose}
                    tone={own[1].character.tone}
                    className="w-[26%] max-w-[150px]"
                  />
                )}
              </div>
              <div className="absolute left-5 top-5">
                <Sticker tone={style.sticker.tone} tilt={-4}>
                  {style.sticker.text}
                </Sticker>
              </div>
            </Scene>
          </div>
        </div>
      </section>

      <section id="topics" aria-labelledby="topics-title" className="shell scroll-mt-32 py-10">
        <p className="eyebrow">Start with what feels closest</p>
        <h2 id="topics-title" className="font-display text-display-md">
          Topics in this area
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {own.map((c, i) => (
            <li key={c.slug}>
              <Link
                to={`/support/${c.slug}`}
                className={cn(
                  'group flex h-full items-start gap-4 rounded-card border border-line/10 p-5 shadow-soft transition-transform duration-quick hover:-translate-y-1',
                  i === 0 ? style.accent : 'bg-paper'
                )}
              >
                <Companion variant={c.character.variant} mood={c.character.mood} tone={c.character.tone} size={64} animate="none" className="shrink-0" />
                <span className="flex-1">
                  <span className="block font-semibold text-ink-strong">{c.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink">{c.tagline}</span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        {linked.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-ink-soft">Often connected:</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {linked.map((c) => (
                <li key={c.slug}>
                  <Link to={`/support/${c.slug}`} className="inline-flex rounded-pill border border-line/15 bg-paper px-4 py-2 text-sm font-semibold text-ink-strong hover:bg-ink-strong hover:text-ivory">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="services-title" className="shell py-12">
        <p className="eyebrow">Your options</p>
        <h2 id="services-title" className="font-display text-display-md">
          Support in this area
        </h2>
        <p className="mb-8 mt-3 max-w-2xl text-ink-soft">
          We show what is available today, what we are still confirming, and where a specialist referral is the right step — so you know exactly where you stand.
        </p>
        <ServicesByStatus services={services} via="concern" />
      </section>

      <section aria-labelledby="other-areas" className="shell py-12">
        <h2 id="other-areas" className="font-display text-display-sm">
          Other areas
        </h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {others.map((g) => (
            <li key={g.id}>
              <Link to={`/support/area/${g.id}`} className={cn('inline-flex rounded-pill px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5', GROUP_STYLE[g.id].tile)}>
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
