import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { ORG } from '../data/organisation';
import { TEAM } from '../data/team';
import { SERVICES, STATUS_LABEL, durationLabel } from '../data/services';
import Companion from '../components/characters/Companion';
import Scene from '../components/characters/Scene';
import { Sticker } from '../components/ui/Sticker';
import { buttonClasses } from '../components/ui/Button';
import { Chip, SectionHeading, StatusBadge } from '../components/ui/primitives';
import { cn } from '../lib/cn';
import { Carousel } from '../components/ui/Carousel';

const VALUE_TILES = [
  { surface: 'bg-lime text-ink-strong', span: 'md:col-span-2', art: { variant: 'heart', mood: 'hopeful', tone: 'rose' } },
  { surface: 'bg-lavender text-ink-strong', span: '', art: { variant: 'sprout', mood: 'joyful', tone: 'butter' } },
  { surface: 'bg-ink-strong text-ivory', span: '', art: { variant: 'pebble', mood: 'calm', tone: 'coral' } },
  { surface: 'bg-rose-soft text-ink-strong', span: '', art: { variant: 'drift', mood: 'calm', tone: 'sage' } },
  { surface: 'bg-butter text-ink-strong', span: 'md:col-span-2', art: { variant: 'bloom', mood: 'curious', tone: 'lime' } },
] as const;

const APPROACH = [
  {
    title: 'A safe, confidential space',
    text: 'Sessions offer room to explore your thoughts and emotions without judgement, with your privacy treated as a priority.',
  },
  {
    title: 'Tailored to you',
    text: 'There is no one-size-fits-all. Support is shaped around your needs, your pace and what matters in your life.',
  },
  {
    title: 'Grounded in growth',
    text: 'The aim is not only to get through a hard season, but to build resilience and understanding you can carry forward.',
  },
  {
    title: 'People and the places they work',
    text: 'For organisations, the work begins by understanding the culture — then designing training and support around what is found.',
  },
];

export default function WhoWeArePage() {
  useDocumentTitle('Who We Are');
  const founder = TEAM[0];
  const individual = SERVICES.filter((s) => s.audience === 'individual' && s.status === 'available');
  const assessment = SERVICES.find((s) => s.id === 'psychological-assessment');

  return (
    <>
      {/* Hero */}
      <section className="shell grid items-center gap-8 pb-10 pt-8 sm:gap-10 sm:pb-16 sm:pt-14 lg:grid-cols-[1.15fr_1fr] lg:pt-20">
        <div>
          <p className="eyebrow">Who we are</p>
          <h1 className="mt-2 font-display text-display-xl">
            Together creating a <em className="font-display italic text-rose-ink">new reality.</em>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft sm:mt-6 sm:text-lg">
            Imela Ventures is a Nairobi-based practice dedicated to personal and organisational growth — offering psychological counselling for
            individuals, couples and families, and wellbeing, leadership and culture programmes for workplaces.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
            <Link to="/book" className={buttonClasses('primary', 'lg')}>
              Schedule Consultation
            </Link>
            <a href="#approach" className={buttonClasses('outline', 'lg')}>
              How we work
            </a>
          </div>
        </div>
        <Scene environment="sunrise" framed className="h-64 sm:h-[26rem]">
          <div className="relative flex h-64 items-end justify-center pb-4 sm:h-[26rem]">
            <Companion variant="heart" mood="hopeful" pose="hold" tone="rose" className="-mr-4 w-24 sm:-mr-6 sm:w-[150px]" />
            <Companion variant="bloom" mood="joyful" pose="wave" tone="butter" className="z-10 w-32 sm:w-[175px]" />
            <Companion variant="cloud" mood="calm" pose="hug" tone="sky" className="-ml-4 w-24 sm:-ml-6 sm:w-[140px]" />
            <div className="absolute left-5 top-6">
              <Sticker tone="lime" tilt={-7}>
                empathy first
              </Sticker>
            </div>
            <div className="absolute right-5 top-16">
              <Sticker tone="lavender" tilt={6}>
                at your pace
              </Sticker>
            </div>
          </div>
        </Scene>
      </section>

      {/* Mission & vision */}
      <section className="shell" aria-label="Mission and vision">
        <Carousel label="Mission and vision" gridFrom="lg" gridClassName="lg:grid-cols-[1.35fr_1fr] lg:gap-6" slideClassName="w-[88%] sm:w-[70%]">
        <div className="rounded-blob bg-paper p-6 shadow-soft sm:p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">Our mission</p>
          <p className="mt-3 font-display text-[1.2rem] leading-snug text-ink-strong sm:mt-4 sm:text-display-sm">{ORG.mission}</p>
        </div>
        <div className="flex flex-col justify-between rounded-blob bg-ink-strong p-6 text-ivory sm:p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ivory/60">Our vision</p>
          <p className="mt-3 font-display text-[1.2rem] leading-snug text-ivory sm:mt-4 sm:text-display-sm">{ORG.vision}</p>
          <Companion variant="sprout" mood="hopeful" pose="reach" tone="lavender" size={96} className="mt-6 hidden self-end lg:block" />
        </div>
        </Carousel>
      </section>

      {/* Philosophy & approach */}
      <section id="approach" className="section scroll-mt-32">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-12">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              eyebrow="Our philosophy of care"
              title="Every person's story is different. Support should be too."
              lede="Imela was founded on a simple belief: when people feel understood, they can begin to change what feels stuck — and when workplaces invest in wellbeing, everyone benefits."
            />
          </div>
          <Carousel label="The Imela approach" gridFrom="lg" gridClassName="lg:grid-cols-1 lg:gap-4" slideClassName="w-[80%] sm:w-[48%]">
            {APPROACH.map((a, i) => (
              <div key={a.title} className="flex flex-col gap-4 rounded-card border border-line/10 bg-paper p-5 shadow-soft lg:grid lg:grid-cols-[auto_1fr] lg:gap-5 lg:p-6">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-lavender-soft font-display text-xl text-lavender-ink" aria-hidden>
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{a.title}</h3>
                  <p className="mt-1 leading-relaxed text-ink-soft">{a.text}</p>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Values bento */}
      <section className="shell" aria-labelledby="values-heading">
        <h2 id="values-heading" className="font-display text-display-md">
          What we stand for
        </h2>
        <Carousel
          label="Our values"
          className="mt-6 md:mt-8"
          gridFrom="md"
          gridClassName="md:grid-cols-4 md:gap-4"
          slideClassName="w-[72%] sm:w-[48%]"
          slideClassNames={VALUE_TILES.map((t) => t.span)}
        >
          {ORG.values.map((v, i) => {
            const tile = VALUE_TILES[i];
            return (
              <div key={v.title} className={cn('relative flex min-h-[13rem] flex-col justify-between overflow-hidden rounded-card p-6', tile.surface)}>
                <div className="max-w-[16rem]">
                  <h3 className={cn('font-display text-3xl', i === 2 ? 'text-ivory' : 'text-ink-strong')}>{v.title}</h3>
                  <p className={cn('mt-2 text-sm leading-relaxed', i === 2 ? 'text-ivory/80' : 'text-ink')}>{v.text}</p>
                </div>
                <Companion
                  variant={tile.art.variant}
                  mood={tile.art.mood}
                  tone={tile.art.tone}
                  size={84}
                  animate="none"
                  className="absolute -bottom-3 right-3"
                />
              </div>
            );
          })}
        </Carousel>
      </section>

      {/* Counselling & assessment */}
      <section className="section" aria-labelledby="services-heading">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
          <div>
            <SectionHeading
              id="services-heading"
              eyebrow="Counselling & assessment"
              title="Psychological support for the people in your life — including you."
              lede="We offer counselling for adults, teenagers, couples and families, as well as small-group workshops. Psychological assessment is something we are confirming before we offer it."
            />
            <div className="mt-6 rounded-card border border-dashed border-butter-ink/40 bg-butter/30 p-4 sm:mt-8 sm:p-5">
              <div className="flex items-center gap-2">
                {assessment && <StatusBadge status={assessment.status} />}
                <span className="font-semibold text-ink-strong">Psychological assessment</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                Formal assessment requires properly licensed instruments and qualified interpretation. We will only list assessments once Imela
                has confirmed which it offers. Until then, a consultation is the best place to talk about what you're looking for.
              </p>
            </div>
          </div>
          <ul className="divide-y divide-line/10 rounded-card border border-line/10 bg-paper shadow-soft">
            {individual.map((s) => (
              <li key={s.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
                <div>
                  <p className="font-semibold text-ink-strong">{s.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft sm:line-clamp-none">{s.summary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Chip>{durationLabel(s)}</Chip>
                  <Chip tone="sage">{STATUS_LABEL[s.status]}</Chip>
                </div>
              </li>
            ))}
            <li className="p-4 sm:p-5">
              <Link to="/find-support" className="inline-flex items-center gap-1.5 font-semibold text-lavender-ink hover:underline">
                See every service and how to book <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Two pathways */}
      <section className="shell" aria-label="Support for individuals and organisations">
        <Carousel label="Support for individuals and organisations" gridFrom="md" gridClassName="md:grid-cols-2 md:gap-6" slideClassName="w-[86%] sm:w-[70%]">
        <Link to="/support" className="group relative block overflow-hidden rounded-blob bg-sage p-6 transition-shadow hover:shadow-lift sm:p-8 md:p-10">
          <User className="h-7 w-7 text-sage-ink" aria-hidden />
          <h2 className="mt-4 font-display text-display-sm">For individuals, couples & families</h2>
          <p className="mt-3 max-w-md text-ink">
            Stress, grief, relationships, identity, family life — explore what we help with and find a starting point that feels right.
          </p>
          <span className="mt-6 inline-flex items-center gap-1.5 font-semibold text-sage-ink">
            Explore support <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
          <Companion variant="pebble" mood="calm" pose="hug" tone="coral" size={110} animate="none" className="absolute -bottom-4 right-6 hidden sm:block" />
        </Link>
        <Link to="/organisations" className="group relative block overflow-hidden rounded-blob bg-ink-strong p-6 text-ivory transition-shadow hover:shadow-lift sm:p-8 md:p-10">
          <Building2 className="h-7 w-7 text-lime" aria-hidden />
          <h2 className="mt-4 font-display text-display-sm text-ivory">For organisations</h2>
          <p className="mt-3 max-w-md text-ivory/80">
            Employee counselling, wellbeing training, leadership development, conflict resolution and culture transformation — designed around
            your people.
          </p>
          <span className="mt-6 inline-flex items-center gap-1.5 font-semibold text-lime">
            Workplace wellness <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
          <Companion variant="bloom" mood="hopeful" pose="idle" tone="lime" size={110} animate="none" className="absolute -bottom-4 right-6 hidden sm:block" />
        </Link>
        </Carousel>
      </section>

      {/* Ethics & confidentiality */}
      <section className="section" aria-labelledby="ethics-heading">
        <div className="shell">
          <Scene environment="scribble" framed>
            <div className="grid gap-6 p-5 sm:gap-10 sm:p-8 md:p-14 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="font-hand text-2xl text-ink-strong">Integrity, always</p>
                <h2 id="ethics-heading" className="mt-1 font-display text-display-md">
                  Ethics & confidentiality
                </h2>
                <p className="mt-4 text-ink">
                  Honesty, transparency and confidentiality guide every interaction — whether you are an individual client or an employee referred
                  through your workplace.
                </p>
              </div>
              <Carousel label="Ethics and confidentiality" gridFrom="sm" gridClassName="sm:grid-cols-2 sm:gap-4" slideClassName="w-[84%]" bleed={false}>
                <div className="rounded-card bg-paper/95 p-5">
                  <Lock className="h-5 w-5 text-lavender-ink" aria-hidden />
                  <h3 className="mt-3 font-semibold">What you share stays private</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    What you discuss in sessions is kept confidential and is not shared with family members or employers.
                  </p>
                </div>
                <div className="rounded-card bg-paper/95 p-5">
                  <ShieldCheck className="h-5 w-5 text-lavender-ink" aria-hidden />
                  <h3 className="mt-3 font-semibold">The limits, explained upfront</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    As in professional practice generally, confidentiality can have limits — for example where there is a serious risk of harm to
                    you or someone else, or where the law requires it. Your counsellor will explain exactly how this works in your first session.
                  </p>
                </div>
                <div className="rounded-card bg-paper/95 p-5">
                  <Building2 className="h-5 w-5 text-lavender-ink" aria-hidden />
                  <h3 className="mt-3 font-semibold">Employers see programmes, not people</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    Organisations never receive individual counselling content. Any reporting is aggregated so individuals can't be identified.
                  </p>
                </div>
                <div className="rounded-card bg-paper/95 p-5">
                  <User className="h-5 w-5 text-lavender-ink" aria-hidden />
                  <h3 className="mt-3 font-semibold">Your choices, your pace</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    You decide what to share and when. Read our{' '}
                    <Link to="/privacy" className="font-semibold text-lavender-ink underline underline-offset-4">
                      privacy notice
                    </Link>{' '}
                    to see how this website handles information.
                  </p>
                </div>
              </Carousel>
            </div>
          </Scene>
        </div>
      </section>

      {/* Team teaser */}
      {founder && (
        <section className="shell section grid items-center gap-6 pt-0 sm:gap-10 md:grid-cols-[auto_1fr]" aria-labelledby="team-heading">
          <div className="relative mx-auto">
            <div className="grid h-40 w-40 place-items-center rounded-full bg-butter sm:h-56 sm:w-56">
              <Companion variant={founder.character.variant} mood={founder.character.mood} pose={founder.character.pose} tone={founder.character.tone} className="h-auto w-28 sm:w-[170px]" />
            </div>
            <p className="mt-2 text-center text-xs text-ink-soft">Illustration — not a photo of {founder.name.split(' ')[0]}</p>
          </div>
          <div>
            <p className="eyebrow">Meet the founder</p>
            <h2 id="team-heading" className="mt-1 font-display text-display-md">
              {founder.name}
            </h2>
            <p className="mt-1 font-semibold text-ink-soft">{founder.role}</p>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink sm:mt-4 sm:text-lg">{founder.bio[0]}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/team/${founder.slug}`} className={buttonClasses('outline')}>
                Read {founder.name.split(' ')[0]}'s profile
              </Link>
              <Link to="/team" className={buttonClasses('ghost')}>
                Meet the team
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Reach */}
      <section className="shell pb-[var(--space-section)]" aria-labelledby="reach-heading">
        <div className="rounded-blob bg-sky-soft p-6 sm:p-8 md:p-14">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <p className="eyebrow">Our reach</p>
              <h2 id="reach-heading" className="mt-1 font-display text-display-md">
                Rooted in Nairobi. Working with people far beyond it.
              </h2>
              <p className="mt-3 text-ink">Countries where Imela has supported clients and organisations, as listed in our company profile.</p>
            </div>
            <ul className="flex flex-wrap gap-2 sm:gap-3">
              {ORG.reach.map((country, i) => (
                <li key={country}>
                  <Sticker tone={i === 0 ? 'ink' : (['paper', 'lime', 'lavender', 'butter'] as const)[i % 4]} tilt={((i % 5) - 2) * 2}>
                    {country}
                  </Sticker>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="shell" aria-labelledby="contact-heading">
        <div className="grid gap-6 rounded-blob border-2 border-ink-strong bg-paper p-6 sm:gap-8 sm:p-8 md:p-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 id="contact-heading" className="font-display text-display-md">
              Ready when you are.
            </h2>
            <p className="mt-3 max-w-lg text-ink-soft">
              Book a short first consultation, enquire on behalf of your organisation, or simply get in touch. We'll take it from there together.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/book?service=consultation" className={buttonClasses('primary', 'lg')}>
                Schedule Consultation
              </Link>
              <Link to="/organisations#enquire" className={buttonClasses('outline', 'lg')}>
                Enquire for an organisation
              </Link>
            </div>
          </div>
          <ul className="space-y-3 self-center sm:space-y-4">
            <li>
              <a href={ORG.phoneHref} className="flex items-center gap-4 rounded-card bg-lavender-soft p-4 hover:bg-lavender/50">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-paper">
                  <Phone className="h-5 w-5 text-lavender-ink" aria-hidden />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Call</span>
                  <span className="block font-semibold text-ink-strong">{ORG.phoneDisplay}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${ORG.email}`} className="flex items-center gap-4 rounded-card bg-rose-soft p-4 hover:bg-rose-soft/70">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-paper">
                  <Mail className="h-5 w-5 text-rose-ink" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Email</span>
                  <span className="block text-sm font-semibold text-ink-strong [overflow-wrap:anywhere] sm:text-base">{ORG.email}</span>
                </span>
              </a>
            </li>
            <li className="px-1 text-sm text-ink-soft">{ORG.postalAddress}</li>
          </ul>
        </div>
      </section>
    </>
  );
}
