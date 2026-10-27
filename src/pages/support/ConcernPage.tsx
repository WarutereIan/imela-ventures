import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MessageCircleHeart, ShieldCheck } from 'lucide-react';
import { concernsInGroup, getConcern, getGroup } from '../../data/concerns';
import type { Concern, ConcernGroup } from '../../data/types';
import Companion from '../../components/characters/Companion';
import Scene from '../../components/characters/Scene';
import { Sticker } from '../../components/ui/Sticker';
import { buttonClasses } from '../../components/ui/Button';
import { CrisisContacts } from '../../components/layout/UrgentHelp';
import { NotFoundPage } from '../../components/layout/PageStates';
import { GROUP_STYLE, type GroupStyle, type SectionKey } from '../../components/support/groupStyles';
import { FeelsLike, HowSupportHelps } from '../../components/support/FeelsLike';
import { PrivateCheckIn } from '../../components/support/PrivateCheckIn';
import { ServicesByStatus } from '../../components/support/ServicesByStatus';
import { servicesFromIds } from '../../components/support/search';
import { RelatedResources } from '../../components/support/RelatedResources';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { cn } from '../../lib/cn';

function Breadcrumb({ group }: { group: ConcernGroup }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link to="/support" className="hover:text-ink-strong hover:underline">
            What we help with
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link to={`/support/area/${group.id}`} className="hover:text-ink-strong hover:underline">
            {group.title}
          </Link>
        </li>
      </ol>
    </nav>
  );
}

function HeroActions({ concern }: { concern: Concern }) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <a href="#services" className={buttonClasses('primary', 'lg')}>
        See support options <ArrowRight className="h-4 w-4" aria-hidden />
      </a>
      <Link to="/persona" className={buttonClasses('outline', 'lg')}>
        <MessageCircleHeart className="h-4 w-4" aria-hidden />
        Talk it through first
      </Link>
      {concern.group === 'workplace' && (
        <Link to="/organisations" className={buttonClasses('ghost', 'lg')}>
          For organisations
        </Link>
      )}
    </div>
  );
}

function HeroArt({ concern, style, className }: { concern: Concern; style: GroupStyle; className?: string }) {
  const c = concern.character;
  return (
    <Scene environment={c.environment} framed className={cn('aspect-[5/4] w-full', className)}>
      <div className="relative flex aspect-[5/4] items-end justify-center pb-[6%]">
        <span aria-hidden className="absolute bottom-[8%] left-1/2 aspect-square w-[58%] max-w-[330px] -translate-x-1/2 rounded-full bg-paper/45" />
        <Companion variant={c.variant} mood={c.mood} pose={c.pose} tone={c.tone} className="relative w-[46%] max-w-[260px]" />
      </div>
      <div className="absolute left-5 top-5">
        <Sticker tone={style.sticker.tone} tilt={-5}>
          {style.sticker.text}
        </Sticker>
      </div>
    </Scene>
  );
}

function Hero({ concern, group, style }: { concern: Concern; group: ConcernGroup; style: GroupStyle }) {
  const c = concern.character;
  const titleBlock = (
    <>
      <p className="eyebrow mt-5">{style.eyebrow}</p>
      <h1 className="mt-1 font-display text-display-lg">{concern.title}</h1>
      <p className="mt-4 max-w-xl text-xl leading-relaxed text-ink">{concern.tagline}</p>
    </>
  );

  if (style.hero === 'banner') {
    return (
      <section className="pb-6 pt-8">
        <div className="shell">
          <Breadcrumb group={group} />
          <Scene environment={c.environment} framed className="mt-5 h-[300px] sm:h-[360px]">
            <div className="flex h-[300px] items-end justify-center gap-6 pb-6 sm:h-[360px]">
              <Companion variant={c.variant} mood={c.mood} pose={c.pose} tone={c.tone} size={200} className="max-w-[48%]" />
            </div>
            <div className="absolute right-5 top-5">
              <Sticker tone={style.sticker.tone} tilt={4}>
                {style.sticker.text}
              </Sticker>
            </div>
          </Scene>
          <div className="relative z-10 mx-auto -mt-16 max-w-3xl rounded-blob bg-ivory px-6 pb-2 pt-4 text-center sm:px-10">
            {titleBlock}
            <div className="flex justify-center">
              <HeroActions concern={concern} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (style.hero === 'quiet') {
    return (
      <section className="pb-6 pt-8">
        <div className="shell">
          <Breadcrumb group={group} />
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end">
            <div className="flex-1">
              <Sticker tone={style.sticker.tone} tilt={-3}>
                {style.sticker.text}
              </Sticker>
              {titleBlock}
              <HeroActions concern={concern} />
            </div>
            <div className={cn('grid h-48 w-48 shrink-0 place-items-center self-center rounded-full md:h-60 md:w-60', style.accent)}>
              <Companion variant={c.variant} mood={c.mood} pose={c.pose} tone={c.tone} size={150} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const artLeft = style.hero === 'split-left';
  return (
    <section className="pb-6 pt-8">
      <div className="shell">
        <Breadcrumb group={group} />
        <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className={cn(artLeft && 'lg:order-2')}>
            {titleBlock}
            <HeroActions concern={concern} />
          </div>
          <HeroArt concern={concern} style={style} className={cn(artLeft && 'lg:order-1')} />
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
  return (
    <div className="mb-6">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="font-display text-display-md">
        {title}
      </h2>
    </div>
  );
}

export default function ConcernPage() {
  const { slug } = useParams();
  const concern = getConcern(slug);
  const group = concern ? getGroup(concern.group) : undefined;
  useDocumentTitle(concern?.title ?? 'Not found');
  if (!concern || !group) return <NotFoundPage />;

  const style = GROUP_STYLE[group.id];
  const services = servicesFromIds(concern.serviceIds);
  const siblings = concernsInGroup(group.id).filter((c) => c.slug !== concern.slug);

  const sections: Record<SectionKey, React.ReactNode> = {
    feels: (
      <section key="feels" aria-labelledby="feels-title" className="shell py-12">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionTitle eyebrow="In your words" title="It can feel like…" id="feels-title" />
            <p className="max-w-sm text-ink-soft">People describe it in many ways. If any of these sound familiar, you're not alone — and you don't need them to match exactly.</p>
          </div>
          <FeelsLike items={concern.feelsLike} style={style.feels} />
        </div>
      </section>
    ),
    helps: (
      <section key="helps" aria-labelledby="helps-title" className="py-12">
        <div className="shell">
          <div className={cn('rounded-blob p-6 sm:p-10', style.accent)}>
            <SectionTitle eyebrow="What support can look like" title="How talking with someone may help" id="helps-title" />
            <HowSupportHelps items={concern.howSupportHelps} style={style.helps} />
            <p className="mt-6 text-sm text-ink">Every person is different. A counsellor will work with you on what matters to you — nothing is promised, and nothing is forced.</p>
          </div>
        </div>
      </section>
    ),
    checkin: (
      <section key="checkin" aria-label="Private check-in" className="shell py-12">
        <PrivateCheckIn reflections={concern.reflections} character={concern.character} accent={style.accent} startCollapsed={style.checkinCollapsed} />
      </section>
    ),
    services: (
      <section key="services" id="services" aria-labelledby="services-title" className="shell scroll-mt-32 py-12">
        <SectionTitle eyebrow="Your options" title="Support that may fit" id="services-title" />
        <ServicesByStatus services={services} via="concern" />
      </section>
    ),
  };

  return (
    <article>
      <Hero concern={concern} group={group} style={style} />

      <section aria-label="About this area" className="shell py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="prose-imela space-y-1 text-lg">
            {concern.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div role="note" className="h-fit rounded-card border border-line/10 bg-paper p-5 text-sm text-ink-soft shadow-soft">
            <p className="flex items-center gap-2 font-semibold text-ink-strong">
              <ShieldCheck className="h-4 w-4 text-sage-ink" aria-hidden /> Not a diagnosis
            </p>
            <p className="mt-2">This page describes common experiences to help you find your way. Only a qualified professional, in conversation with you, can assess what you're going through.</p>
          </div>
        </div>
      </section>

      {concern.safetyNote && (
        <section aria-labelledby="safety-title" className="shell pb-4">
          <div className="rounded-blob border border-rose/25 bg-rose-soft/50 p-6 sm:p-8">
            <h2 id="safety-title" className="font-display text-display-sm">
              If you're not safe right now
            </h2>
            <p className="mt-2 max-w-2xl text-ink">
              If you're thinking about harming yourself, or someone is hurting you, please reach out for immediate help. You don't have to wait for an appointment.
            </p>
            <CrisisContacts className="mt-5" />
          </div>
        </section>
      )}

      {style.order.map((key) => sections[key])}

      <section aria-labelledby="resources-title" className="shell py-12">
        <SectionTitle eyebrow="Take your time" title="Related resources" id="resources-title" />
        <RelatedResources categories={concern.resourceCategories} />
      </section>

      {siblings.length > 0 && (
        <section aria-labelledby="siblings-title" className="shell py-12">
          <h2 id="siblings-title" className="font-display text-display-sm">
            Also in {group.title.toLowerCase()}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {siblings.map((s) => (
              <li key={s.slug}>
                <Link to={`/support/${s.slug}`} className="inline-flex rounded-pill border border-line/15 bg-paper px-4 py-2 text-sm font-semibold text-ink-strong transition-colors hover:bg-ink-strong hover:text-ivory">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="shell pt-6">
        <div className="relative overflow-hidden rounded-blob bg-ink-strong px-6 py-10 text-ivory sm:px-12">
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-display-md text-ivory">Ready when you are.</h2>
            <p className="mt-3 text-ivory/80">A short first conversation is a gentle way to begin. You can share as much or as little as you like.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/book?service=consultation&via=concern" className={buttonClasses('soft', 'lg')}>
                Book an initial consultation
              </Link>
              <Link to={`/support/area/${group.id}`} className={buttonClasses('outline', 'lg', 'border-ivory/70 text-ivory hover:bg-ivory hover:text-ink-strong')}>
                <ArrowLeft className="h-4 w-4" aria-hidden /> Back to {group.title.toLowerCase()}
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-4 right-4 hidden sm:block" aria-hidden>
            <Companion variant={concern.character.variant} mood="hopeful" pose="wave" tone={concern.character.tone} size={150} />
          </div>
        </div>
      </section>
    </article>
  );
}
