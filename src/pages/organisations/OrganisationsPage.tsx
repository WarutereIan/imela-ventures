import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BarChart3, EyeOff, Lock, Phone, Users } from 'lucide-react';
import { SERVICES } from '../../data/services';
import { ORG } from '../../data/organisation';
import Companion from '../../components/characters/Companion';
import { Sticker } from '../../components/ui/Sticker';
import { buttonClasses } from '../../components/ui/Button';
import { SectionHeading, StatusBadge } from '../../components/ui/primitives';
import { EnquiryForm } from '../../components/organisations/EnquiryForm';
import { ClientMarquee } from '../../components/organisations/ClientMarquee';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

const ORG_SERVICES = SERVICES.filter((s) => s.audience === 'organisation');

const TILE_STYLES = ['bg-lime text-ink-strong', 'bg-ink-strong text-ivory', 'bg-lavender text-ink-strong', 'bg-rose-soft text-ink-strong', 'bg-paper text-ink-strong'];

/** From the Imela company profile: how a workplace engagement unfolds. */
const METHOD = [
  {
    step: '01',
    title: 'Culture audit',
    text: 'One-to-one and group conversations with employees, managers and executives, supported by personality assessments, to understand the beliefs, values and behaviours that shape your workplace.',
  },
  {
    step: '02',
    title: 'Tailor-made programmes',
    text: 'Training designed around what the audit finds — for leadership and staff alike — so every level has the skills to contribute to a healthier culture.',
  },
  {
    step: '03',
    title: 'Culture transformation',
    text: 'Ongoing work to build empathy, resilience, growth, integrity and innovation into everyday working life. Not a one-off event, but a continuing process.',
  },
  {
    step: '04',
    title: 'Measuring progress',
    text: 'Regular qualitative and quantitative check-ins on satisfaction, engagement and how closely behaviours match the culture you want.',
  },
];

export default function OrganisationsPage() {
  useDocumentTitle('Workplace mental wellness');
  const [params] = useSearchParams();

  return (
    <>
      {/* Hero */}
      <section className="shell grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.15fr_1fr] lg:pt-20">
        <div>
          <p className="eyebrow mb-3">For organisations</p>
          <h1 className="font-display text-display-xl">Healthier people. More thoughtful workplaces.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Practical, human-centred mental wellness support for organisations that want to care for their people.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#enquire" className={buttonClasses('primary', 'lg', 'h-auto min-h-14 w-full py-3 text-center sm:w-auto')}>
              Build a Workplace Wellness Programme
            </a>
            <a href={ORG.phoneHref} className={buttonClasses('outline', 'lg', 'w-full sm:w-auto')}>
              <Phone className="h-4 w-4" aria-hidden /> Speak to Our Team
            </a>
          </div>
          <p className="mt-5 text-sm text-ink-soft">
            Already working with Imela?{' '}
            <Link to="/organisations/workspace" className="font-semibold text-ink-strong underline underline-offset-4">
              Open your organisation workspace
            </Link>
          </p>
        </div>

        {/* Bold bento of tiles, echoing an agency moodboard */}
        <div className="grid grid-cols-2 gap-3" aria-hidden>
          <div className="flex min-h-[10.5rem] sm:aspect-square flex-col justify-between rounded-card bg-lime p-5">
            <span className="text-sm font-semibold">people first</span>
            <Companion variant="bloom" mood="joyful" pose="wave" tone="butter" size={84} className="self-end sm:h-auto sm:w-[110px]" />
          </div>
          <div className="flex min-h-[10.5rem] sm:aspect-square flex-col justify-between rounded-card bg-ink-strong p-5 text-ivory">
            <span className="font-display text-2xl leading-none sm:text-3xl">leaders who listen</span>
            <Companion variant="sprout" mood="hopeful" pose="reach" tone="lavender" size={64} className="self-end sm:h-auto sm:w-[90px]" />
          </div>
          <div className="relative flex min-h-[10.5rem] sm:aspect-square items-end rounded-card bg-lavender p-5">
            <Sticker tone="lime" tilt={-6} className="absolute left-3 top-4 text-xs sm:text-sm">
              culture audit
            </Sticker>
            <Sticker tone="paper" tilt={5} className="absolute right-3 top-12 text-xs sm:top-16 sm:text-sm">
              team workshops
            </Sticker>
            <Companion variant="cloud" mood="calm" pose="hug" tone="sky" size={76} className="sm:h-auto sm:w-[100px]" />
          </div>
          <div className="flex min-h-[10.5rem] sm:aspect-square flex-col justify-between rounded-card bg-rose-soft p-5">
            <span className="font-display text-xl leading-tight sm:text-2xl">burnout isn’t a badge</span>
            <Companion variant="pebble" mood="tired" tone="coral" size={64} className="self-end sm:h-auto sm:w-[90px]" />
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section className="bg-ivory-deep/60 py-20" aria-labelledby="offer-title">
        <div className="shell">
          <SectionHeading
            id="offer-title"
            eyebrow="What we offer"
            title="Support that fits how your organisation works"
            lede="Every engagement is shaped around your people and your culture. These are the services Imela offers organisations today."
          />
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ORG_SERVICES.map((s, i) => (
              <li key={s.id} className={`flex flex-col rounded-card p-6 ${TILE_STYLES[i % TILE_STYLES.length]} ${i === 0 ? 'lg:row-span-2' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className={`text-xl font-semibold ${i % TILE_STYLES.length === 1 ? 'text-ivory' : ''}`}>{s.name}</h3>
                  <StatusBadge status={s.status} />
                </div>
                <p className="mt-3 text-[0.95rem] leading-relaxed opacity-90">{s.summary}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {s.supports.map((x) => (
                    <li key={x} className="flex gap-2">
                      <span aria-hidden>—</span>
                      {x}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/organisations?service=${s.id}#enquire`}
                  className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold underline-offset-4 hover:underline"
                >
                  Enquire about {s.name.toLowerCase()} <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            ))}
            <li className="flex flex-col rounded-card border-2 border-dashed border-ink/20 bg-paper/70 p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">Team workshops</h3>
              </div>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                Interactive sessions on stress, burnout, communication and resilience, delivered as part of the wellbeing training
                above and tailored to your teams.
              </p>
            </li>
            <li className="flex flex-col rounded-card border-2 border-dashed border-ink/20 bg-paper/70 p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">Wellbeing assessments</h3>
                <StatusBadge status="awaiting_verification" />
              </div>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                Imela is confirming which validated, properly licensed workplace wellbeing assessments it will offer. Until then,
                assessment forms part of the culture audit conversation.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* Method */}
      <section className="shell py-20" aria-labelledby="method-title">
        <SectionHeading id="method-title" eyebrow="How we work" title="From understanding your culture to measuring change" />
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {METHOD.map((m, i) => (
            <li key={m.step} className="relative rounded-card bg-paper p-6 shadow-soft">
              <span className="font-display text-5xl text-lavender-ink">{m.step}</span>
              <h3 className="mt-2 text-lg font-semibold">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.text}</p>
              {i < METHOD.length - 1 && (
                <ArrowRight className="absolute -right-5 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-ink-soft lg:block" aria-hidden />
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Privacy promise */}
      <section className="shell" aria-labelledby="privacy-title">
        <div className="grid gap-10 rounded-blob bg-ink-strong p-8 text-ivory sm:p-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-hand text-2xl text-lime">A promise to your employees</p>
            <h2 id="privacy-title" className="mt-2 font-display text-display-md text-ivory">
              What’s said in counselling stays in counselling.
            </h2>
            <p className="mt-4 text-ivory/80">
              Your organisation never sees individual counselling conversations, notes or diagnoses — only anonymised, aggregated
              participation with small groups suppressed.
            </p>
          </div>
          <ul className="grid gap-4 text-sm">
            {[
              { icon: EyeOff, text: 'No names, notes or session content are ever shared with employers.' },
              { icon: Users, text: 'Participation figures are shown only for groups of five or more; smaller numbers are hidden.' },
              { icon: BarChart3, text: 'Reports show programme-level trends, never individuals.' },
              { icon: Lock, text: 'Access is enforced by the database itself, not just by what the website displays.' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 rounded-2xl bg-ivory/10 p-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-lime" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Clients */}
      <section className="py-20" aria-labelledby="clients-title">
        <div className="shell mb-8">
          <h2 id="clients-title" className="text-center font-display text-display-sm">
            Organisations Karen and the Imela team have worked with
          </h2>
        </div>
        <ClientMarquee />
        <p className="shell mt-6 text-center text-sm text-ink-soft">Our reach extends across {ORG.reach.length} countries, including {ORG.reach.slice(0, 4).join(', ')} and beyond.</p>
      </section>

      {/* Enquiry */}
      <section id="enquire" className="scroll-mt-28 bg-lavender-soft py-20" aria-labelledby="enquire-title">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading
              id="enquire-title"
              eyebrow="Let’s talk"
              title="Build a workplace wellness programme"
              lede="Tell us a little about your organisation. We’ll arrange a conversation to understand your needs before proposing anything."
            />
            <div className="mt-8 hidden lg:block">
              <Companion variant="heart" mood="hopeful" pose="hold" hold="lantern" tone="rose" size={170} />
            </div>
            <p className="mt-6 text-sm text-ink-soft">
              Prefer to talk now? Call{' '}
              <a href={ORG.phoneHref} className="font-semibold text-ink-strong underline">
                {ORG.phoneDisplay}
              </a>{' '}
              or email{' '}
              <a href={`mailto:${ORG.email}`} className="font-semibold text-ink-strong underline">
                {ORG.email}
              </a>
              .
            </p>
          </div>
          <EnquiryForm key={params.get('service') ?? ''} initialServiceId={params.get('service')} />
        </div>
      </section>
    </>
  );
}
