import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, EyeOff, Lock, MessageCircleHeart, ShieldCheck } from 'lucide-react';
import Companion from '../../components/characters/Companion';
import Scene from '../../components/characters/Scene';
import { buttonClasses } from '../../components/ui/Button';
import { Sticker } from '../../components/ui/Sticker';
import { SERVICES, isBookable } from '../../data/services';
import { CONCERN_GROUPS } from '../../data/concerns';
import { TEAM } from '../../data/team';
import { ORG } from '../../data/organisation';
import ResourceCard from '../../components/resources/ResourceCard';
import { useResources } from '../../domain/resources';
import { cn } from '../../lib/cn';
import { Carousel } from '../../components/ui/Carousel';

/* ---------- Individual & organisational pathways ---------- */
export function Pathways() {
  const individual = SERVICES.filter((s) => s.audience === 'individual' && isBookable(s));
  const organisation = SERVICES.filter((s) => s.audience === 'organisation' && isBookable(s));
  return (
    <section aria-labelledby="pathways-title" className="shell section pt-0">
      <h2 id="pathways-title" className="sr-only">
        Support for individuals and organisations
      </h2>
      <Carousel label="Support for individuals and organisations" gridFrom="lg" gridClassName="lg:grid-cols-[1.25fr_1fr] lg:gap-5" slideClassName="w-[88%] sm:w-[72%]">
        <article className="relative overflow-hidden rounded-blob bg-sage p-6 sm:p-10">
          <p className="eyebrow text-sage-ink">For you & the people close to you</p>
          <h3 className="mt-2 max-w-md font-display text-display-md">Personal counselling, at a pace that feels safe.</h3>
          <p className="mt-4 max-w-lg text-ink">
            One-to-one, couples, family and teen counselling in a confidential, non-judgemental space. Psychological assessment is being confirmed and will be
            listed here once it's available.
          </p>
          <ul className="mt-6 flex max-w-lg flex-wrap gap-2">
            {individual.map((s) => (
              <li key={s.id} className="rounded-pill bg-paper/80 px-3 py-1.5 text-sm font-medium">
                {s.name}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/support" className={buttonClasses('primary')}>
              Explore personal support <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/find-support#catalogue" className={buttonClasses('ghost')}>
              Compare services
            </Link>
          </div>
          <div className="pointer-events-none absolute -bottom-4 right-4 hidden w-40 sm:block" aria-hidden>
            <Companion variant="pebble" mood="hopeful" pose="wave" tone="coral" className="w-full" />
          </div>
        </article>

        <article className="relative overflow-hidden rounded-blob bg-ink-strong p-6 text-ivory sm:p-10">
          <p className="eyebrow text-lime">For organisations</p>
          <h3 className="mt-2 font-display text-display-md text-ivory">Healthier people. More thoughtful workplaces.</h3>
          <p className="mt-4 text-ivory/80">
            Employee counselling, wellbeing training, leadership development and culture work — with privacy built in for every employee.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            {organisation.slice(0, 5).map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-lime" aria-hidden />
                {s.name}
              </li>
            ))}
          </ul>
          <Link to="/organisations" className={buttonClasses('soft', 'md', 'mt-8 bg-lime text-ink-strong hover:bg-lime/80')}>
            Workplace wellness <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </article>
      </Carousel>
    </section>
  );
}

/* ---------- Imela Persona feature ---------- */
export function PersonaFeature() {
  const points = [
    { icon: EyeOff, text: 'No name or sign-up needed' },
    { icon: Lock, text: 'Stays in your browser tab — not saved' },
    { icon: MessageCircleHeart, text: 'Reflects back, never diagnoses' },
    { icon: ShieldCheck, text: 'Urgent help is always one tap away' },
  ];
  return (
    <section aria-labelledby="persona-feature-title" className="shell section">
      <div className="grid overflow-hidden rounded-blob bg-paper shadow-lift lg:grid-cols-[1fr_1.05fr]">
        <Scene environment="dusk" className="min-h-[15rem] sm:min-h-[22rem]">
          <div className="flex h-full min-h-[15rem] flex-col justify-end p-5 sm:min-h-[22rem] sm:p-8">
            {/* An illustrative, clearly-labelled example exchange */}
            <div className="space-y-2" aria-label="Example conversation (illustration)" role="img">
              <p className="ml-auto w-fit max-w-[85%] rounded-3xl rounded-br-md bg-lavender-ink px-4 py-2.5 text-sm text-white">I'm not sure how to explain it. Everything just feels heavy.</p>
              <p className="w-fit max-w-[85%] rounded-3xl rounded-bl-md bg-paper px-4 py-2.5 text-sm text-ink-strong">
                That sounds tiring to carry. You don't need the right words — would you like to start with how it feels?
              </p>
              <p className="pt-1 text-xs text-white/80">Example only</p>
            </div>
          </div>
          <div className="absolute right-4 top-4 w-20 sm:right-6 sm:top-6 sm:w-32" aria-hidden>
            <Companion variant="drift" mood="calm" pose="wave" tone="sage" className="w-full" />
          </div>
        </Scene>
        <div className="p-7 sm:p-10">
          <p className="eyebrow">Imela Persona</p>
          <h2 id="persona-feature-title" className="mt-2 font-display text-display-md">
            A private, judgement-free place to begin.
          </h2>
          <p className="mt-4 text-ink">
            Sometimes the hardest part is knowing where to start. Persona lets you put things into words at your own pace, reflects back what it hears, and — if you
            want — suggests kinds of support that may fit, with the reasons why.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm font-medium">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lavender-soft text-lavender-ink">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/persona" className={buttonClasses('accent', 'lg')}>
              Meet Imela Persona
            </Link>
            <Link to="/privacy#persona" className={buttonClasses('ghost', 'lg')}>
              How it handles data
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Areas bento ---------- */
const BENTO: Record<string, string> = {
  'emotional-wellbeing': 'lg:col-span-2 lg:row-span-2',
  'relationships-family': 'lg:col-span-2',
  'grief-loss': '',
  'trauma-history': '',
  'addiction-patterns': 'lg:col-span-2',
  'identity-growth': '',
  'young-people-families': '',
  workplace: 'lg:col-span-2',
  specialist: 'lg:col-span-2',
};

export function AreasBento() {
  return (
    <section aria-labelledby="areas-title" className="shell section">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">What we help with</p>
          <h2 id="areas-title" className="mt-2 font-display text-display-lg">
            Whatever you're carrying, it has a place here.
          </h2>
        </div>
        <Link to="/support" className={buttonClasses('outline')}>
          See every area
        </Link>
      </div>
      {/* Phones and tablets: a swipe row of area cards. Desktop: the bento grid. */}
      <Carousel
        label="Areas we help with"
        className="mt-8 lg:mt-10"
        gridFrom="lg"
        gridClassName="lg:grid-cols-4 lg:auto-rows-[minmax(11rem,auto)] lg:gap-3"
        slideClassName="w-[72%] sm:w-[44%]"
        slideClassNames={CONCERN_GROUPS.map((g) => BENTO[g.id])}
      >
        {CONCERN_GROUPS.map((g, i) => {
          const big = i === 0;
          const dark = g.id === 'workplace';
          return (
            <Link
              key={g.id}
              to={`/support/area/${g.id}`}
              className={cn(
                'group relative flex h-full min-h-[14rem] flex-col justify-between overflow-hidden rounded-card p-5 transition-transform duration-calm ease-gentle hover:-translate-y-1 lg:min-h-0',
                dark ? 'bg-ink-strong text-ivory' : g.surface
              )}
            >
              <span className={cn('relative z-10 block max-w-[75%] font-display text-display-sm', big && 'lg:text-display-md')}>{g.title}</span>
              {big && <span className="relative z-10 mt-3 hidden max-w-sm text-ink lg:block">{g.blurb}</span>}
              <span className="relative z-10 mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                Explore <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </span>
              <span className={cn('absolute bottom-2 right-2 w-24', big && 'lg:w-52')} aria-hidden>
                <Companion {...g.character} animate={big ? 'ambient' : 'none'} className="w-full" />
              </span>
            </Link>
          );
        })}
      </Carousel>
      <p className="mt-4 text-sm text-ink-soft">These are areas people often bring to counselling — not diagnoses. Each page shows honestly which services are available today.</p>
    </section>
  );
}

/* ---------- How Imela works ---------- */
export function HowItWorks() {
  const steps = [
    { title: 'Tell us a little', text: 'Through Persona, the service finder, a call or the booking form — whatever feels easiest.' },
    { title: 'Find the right fit', text: 'We suggest options from our services and explain why. A short consultation helps if you\'re unsure.' },
    { title: 'Choose a time', text: 'Request a session online. The team confirms it with you — usually within one working day.' },
    { title: 'Meet your counsellor', text: 'Online or in person. Your first session is a chance to talk about what you need and how you\'d like to work.' },
  ];
  return (
    <section aria-labelledby="how-title" className="bg-ivory-deep">
      <div className="shell section grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div>
          <p className="eyebrow">How Imela works</p>
          <h2 id="how-title" className="mt-2 font-display text-display-lg">
            Simple, human, and at your pace.
          </h2>
          <div className="mt-8 hidden items-end gap-4 lg:flex" aria-hidden>
            <Companion variant="bloom" mood="hopeful" pose="hold" hold="lantern" tone="butter" size={140} />
            <Sticker tone="paper" tilt={-4} className="mb-10">
              Fees confirmed upfront
            </Sticker>
          </div>
        </div>
        <Carousel label="How Imela works, step by step" gridFrom="lg" gridClassName="lg:grid-cols-1 lg:gap-4" slideClassName="w-[80%] sm:w-[48%]">
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-col gap-4 rounded-card bg-paper p-5 shadow-soft lg:flex-row lg:gap-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink-strong font-display text-xl text-ivory">{i + 1}</span>
              <div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-ink-soft">{s.text}</p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

/* ---------- Team teaser ---------- */
export function TeamTeaser() {
  const lead = TEAM[0];
  if (!lead) return null;
  return (
    <section aria-labelledby="team-title" className="shell section">
      <div className="grid items-center gap-6 rounded-blob bg-butter/60 p-6 sm:gap-10 sm:p-10 lg:grid-cols-[auto_1fr]">
        <figure className="mx-auto">
          <Scene environment={lead.character.environment} framed className="h-40 w-40 sm:h-60 sm:w-60">
            <div className="flex h-40 items-end justify-center pb-2 sm:h-60">
              <Companion {...lead.character} className="h-auto w-24 sm:w-[150px]" />
            </div>
          </Scene>
          <figcaption className="mt-2 text-center text-xs text-ink-soft">Illustration — not a photo of {lead.name.split(' ')[0]}</figcaption>
        </figure>
        <div>
          <p className="eyebrow text-butter-ink">The team</p>
          <h2 id="team-title" className="mt-2 font-display text-display-md">
            Meet {lead.name}
          </h2>
          <p className="text-sm font-semibold text-ink-soft">{lead.role}</p>
          <p className="mt-4 max-w-2xl text-ink">{lead.bio[0]}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/team/${lead.slug}`} className={buttonClasses('primary')}>
              Read Karen's profile
            </Link>
            <Link to="/team" className={buttonClasses('ghost')}>
              The whole team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Resources ---------- */
export function ResourcesTeaser() {
  const { resources } = useResources();
  const picks = resources.slice(0, 3);
  if (picks.length === 0) return null;
  return (
    <section aria-labelledby="resources-title" className="shell section">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Resources</p>
          <h2 id="resources-title" className="mt-2 font-display text-display-md">
            Gentle reading for where you are.
          </h2>
        </div>
        <Link to="/resources" className={buttonClasses('outline')}>
          All resources
        </Link>
      </div>
      <Carousel label="Featured resources" className="mt-8" gridFrom="md" gridClassName="md:grid-cols-3 md:gap-4" slideClassName="w-[80%] sm:w-[55%]">
        {picks.map((r) => (
          <ResourceCard key={r.slug} resource={r} />
        ))}
      </Carousel>
    </section>
  );
}

/* ---------- Confidentiality ---------- */
export function Confidentiality() {
  return (
    <section aria-labelledby="confidential-title" className="shell section">
      <div className="grid gap-8 rounded-blob border-2 border-ink-strong bg-paper p-7 shadow-sticker sm:p-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="eyebrow">Confidentiality</p>
          <h2 id="confidential-title" className="mt-2 font-display text-display-md">
            What you share stays between you and your counsellor.
          </h2>
        </div>
        <ul className="space-y-4 text-ink">
          <li>
            <strong className="text-ink-strong">Sessions are confidential.</strong> Your counsellor will explain how confidentiality works — and its limits, such as
            when someone may be at serious risk — in your first session.
          </li>
          <li>
            <strong className="text-ink-strong">Employers never see your sessions.</strong> If your workplace arranges support, they only ever receive anonymised,
            aggregated numbers.
          </li>
          <li>
            <strong className="text-ink-strong">We collect only what we need.</strong> Booking asks for contact details, not your story.{' '}
            <Link to="/privacy" className="font-semibold text-lavender-ink underline underline-offset-4">
              Read our privacy notice
            </Link>
            .
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ---------- FAQs ---------- */
const FAQS = [
  {
    q: "I don't know what kind of help I need. Where do I start?",
    a: "That's very common. You could talk it through with Imela Persona, try the service finder, or book a short initial consultation — a counsellor will help you work out what fits.",
  },
  { q: 'Do I need to create an account?', a: 'No. You can explore, use Persona and request a booking without an account.' },
  {
    q: 'Is Imela Persona a therapist?',
    a: "No. Persona is an automated guide that helps you put things into words and find relevant support. It doesn't diagnose, and no one is monitoring the conversation.",
  },
  {
    q: 'Are sessions online or in person?',
    a: 'Individual counselling for adults is offered online and in person. For other services, the format is confirmed when you book.',
  },
  { q: 'How much does it cost?', a: "Fees depend on the service and are confirmed with you during your initial consultation, before you commit to anything." },
  {
    q: 'What if I need help urgently?',
    a: "Imela isn't an emergency service. If you're in danger, call 999 or 112 in Kenya, or use “Need urgent help?” at the top of any page.",
  },
];

export function Faqs() {
  return (
    <section aria-labelledby="faq-title" className="shell section">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 id="faq-title" className="mt-2 font-display text-display-md">
            Things people often ask
          </h2>
          <p className="mt-4 text-ink-soft">
            Something else on your mind? Call{' '}
            <a href={ORG.phoneHref} className="font-semibold text-ink underline underline-offset-4">
              {ORG.phoneDisplay}
            </a>
            .
          </p>
        </div>
        <div className="divide-y divide-line/15 border-y border-line/15">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-ink-strong [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lavender-soft text-lavender-ink transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Closing CTA ---------- */
export function ClosingCta() {
  return (
    <section aria-labelledby="closing-title" className="shell pb-8 pt-8">
      <Scene environment="sky" framed className="px-6 py-14 text-center sm:px-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          <div className="flex items-end gap-2" aria-hidden>
            <Companion variant="heart" mood="joyful" pose="wave" tone="rose" size={90} />
            <Companion variant="sprout" mood="hopeful" pose="reach" tone="lavender" size={80} />
          </div>
          <h2 id="closing-title" className="mt-6 font-display text-display-lg">
            Whenever you're ready, we're here.
          </h2>
          <p className="mt-4 text-lg text-ink">There's no wrong way to begin. Take one small step — and we'll take the next one together.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/book?service=consultation" className={buttonClasses('primary', 'lg')}>
              Schedule Consultation
            </Link>
            <Link to="/persona" className={buttonClasses('outline', 'lg', 'bg-paper/70')}>
              Start with Persona
            </Link>
          </div>
        </div>
      </Scene>
    </section>
  );
}
