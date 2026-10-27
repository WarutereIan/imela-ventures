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
import { groupMeta } from '../../seo/site';
import { GROUP_SEO } from '../../seo/concernSeo';
import { SITE_URL, usePageMeta } from '../../seo/usePageMeta';
import { cn } from '../../lib/cn';

export default function SupportGroupPage() {
  const { groupId } = useParams();
  const group = getGroup(groupId);
  usePageMeta(group ? groupMeta(group.id, SITE_URL) : undefined);
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
      <section className="pb-4 pt-6 md:pb-10 md:pt-8">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
            <Link to="/support" className="hover:text-ink-strong hover:underline">
              What we help with
            </Link>
          </nav>
          <div className="mt-4 grid items-center gap-6 md:mt-6 md:gap-10 lg:grid-cols-[1fr_1.05fr]">
            <div>
              <h1 className="font-display text-display-lg">
                <span className="eyebrow mb-1 block">{GROUP_SEO[group.id]?.kicker ?? 'Support area'}</span>
                {group.title}
              </h1>
              <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink md:mt-5 md:text-xl">{group.blurb}</p>
              <div className="mt-6 flex flex-wrap gap-2 md:mt-8 md:gap-3">
                <a href="#topics" className={buttonClasses('primary', 'lg')}>
                  Explore topics <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
                <Link to="/persona" className={buttonClasses('outline', 'lg')}>
                  <MessageCircleHeart className="h-4 w-4" aria-hidden /> Not sure? Talk it through
                </Link>
              </div>
            </div>
            <Scene environment={ch.environment} framed className="aspect-[16/9] w-full md:aspect-[6/5]">
              <div className="flex aspect-[16/9] items-end justify-center gap-2 pb-[5%] md:aspect-[6/5]">
                <Companion variant={ch.variant} mood={ch.mood} pose={ch.pose} tone={ch.tone} className="w-[30%] max-w-[240px] md:w-[42%]" />
                {own[1] && (
                  <Companion
                    variant={own[1].character.variant}
                    mood={own[1].character.mood}
                    pose={own[1].character.pose}
                    tone={own[1].character.tone}
                    className="w-[19%] max-w-[150px] md:w-[26%]"
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

      <section id="topics" aria-labelledby="topics-title" className="shell scroll-mt-32 py-6 md:py-10">
        <p className="eyebrow">Start with what feels closest</p>
        <h2 id="topics-title" className="font-display text-display-md">
          Topics in this area
        </h2>
        <ul className="mt-5 grid grid-cols-2 gap-2.5 md:mt-8 md:gap-4 lg:grid-cols-3">
          {own.map((c, i) => (
            <li key={c.slug}>
              <Link
                to={`/support/${c.slug}`}
                className={cn(
                  'group relative flex h-full flex-col items-start gap-2 rounded-[1.25rem] border border-line/10 p-3 shadow-soft transition-transform duration-quick hover:-translate-y-1 md:flex-row md:gap-4 md:rounded-card md:p-5',
                  i === 0 ? style.accent : 'bg-paper'
                )}
              >
                <Companion variant={c.character.variant} mood={c.character.mood} tone={c.character.tone} animate="none" className="h-auto w-11 shrink-0 md:w-16" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold leading-snug text-ink-strong md:text-base">{c.title}</span>
                  <span className="mt-1 hidden text-sm leading-relaxed text-ink md:block">{c.tagline}</span>
                </span>
                <ArrowRight className="absolute right-3 top-3 h-4 w-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-1 md:static md:mt-1" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        {linked.length > 0 && (
          <div className="mt-6 md:mt-8">
            <p className="text-sm font-semibold text-ink-soft">Often connected:</p>
            <ul className="mt-3 scrollbar-hide -mx-[var(--gutter)] flex snap-x gap-2 overflow-x-auto px-[var(--gutter)] pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
              {linked.map((c) => (
                <li key={c.slug} className="shrink-0 snap-start">
                  <Link to={`/support/${c.slug}`} className="inline-flex whitespace-nowrap rounded-pill border border-line/15 bg-paper px-4 py-2 text-sm font-semibold text-ink-strong hover:bg-ink-strong hover:text-ivory">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="services-title" className="shell py-8 md:py-12">
        <p className="eyebrow">Your options</p>
        <h2 id="services-title" className="font-display text-display-md">
          Support in this area
        </h2>
        <p className="mb-5 mt-2 max-w-2xl text-sm text-ink-soft md:mb-8 md:mt-3 md:text-base">
          We show what is available today, what we are still confirming, and where a specialist referral is the right step — so you know exactly where you stand.
        </p>
        <ServicesByStatus services={services} via="concern" />
      </section>

      <section aria-labelledby="other-areas" className="shell py-8 md:py-12">
        <h2 id="other-areas" className="font-display text-display-sm">
          Other areas
        </h2>
        <ul className="mt-4 scrollbar-hide -mx-[var(--gutter)] flex snap-x gap-2 overflow-x-auto px-[var(--gutter)] pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:mt-5">
          {others.map((g) => (
            <li key={g.id} className="shrink-0 snap-start">
              <Link to={`/support/area/${g.id}`} className={cn('inline-flex whitespace-nowrap rounded-pill px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5', GROUP_STYLE[g.id].tile)}>
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
