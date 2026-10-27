import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Companion, { type CompanionMood, type CompanionPose, type CompanionTone, type CompanionVariant } from '../../components/characters/Companion';
import Scene from '../../components/characters/Scene';
import { cn } from '../../lib/cn';

interface Choice {
  label: string;
  to: string;
  hint: string;
  look: { variant: CompanionVariant; mood: CompanionMood; pose: CompanionPose; tone: CompanionTone };
  surface: string;
}

/** Each choice opens a journey that fits it — a topic page, an area, or Persona when words are hard to find. */
const CHECK_IN_CHOICES: Choice[] = [
  { label: "My mind won't slow down.", to: '/support/anxiety-worry', hint: 'Worry & racing thoughts', look: { variant: 'pebble', mood: 'anxious', pose: 'idle', tone: 'coral' }, surface: 'bg-paper' },
  { label: "I'm struggling in a relationship.", to: '/support/area/relationships-family', hint: 'Partners, marriage & family', look: { variant: 'heart', mood: 'lonely', pose: 'hug', tone: 'rose' }, surface: 'bg-rose-soft' },
  { label: "I've lost someone or something important.", to: '/support/area/grief-loss', hint: 'Grief & loss', look: { variant: 'cloud', mood: 'grieving', pose: 'hug', tone: 'sky' }, surface: 'bg-sky-soft' },
  { label: "I feel stuck in a pattern I can't break.", to: '/support/area/addiction-patterns', hint: 'Habits & behaviour patterns', look: { variant: 'sprout', mood: 'tired', pose: 'idle', tone: 'lime' }, surface: 'bg-lime' },
  { label: "I'm overwhelmed by life.", to: '/support/stress-overwhelm', hint: 'Stress & overwhelm', look: { variant: 'bloom', mood: 'tired', pose: 'reach', tone: 'butter' }, surface: 'bg-butter' },
  { label: "I'm struggling with who I am.", to: '/support/area/identity-growth', hint: 'Identity & self-worth', look: { variant: 'drift', mood: 'uncertain', pose: 'idle', tone: 'lavender' }, surface: 'bg-lavender-soft' },
  { label: "I'm finding it difficult to cope.", to: '/persona?path=talk', hint: 'Talk it through privately', look: { variant: 'pebble', mood: 'lonely', pose: 'hug', tone: 'clay' }, surface: 'bg-[#EBDACF]' },
  { label: "I'm not sure what I'm feeling.", to: '/persona?path=feelings', hint: 'Find the words with Persona', look: { variant: 'cloud', mood: 'curious', pose: 'idle', tone: 'lavender' }, surface: 'bg-sage' },
  { label: 'Something else.', to: '/find-support', hint: 'Describe it in your own words', look: { variant: 'drift', mood: 'hopeful', pose: 'wave', tone: 'sage' }, surface: 'bg-ink-strong text-ivory' },
];

export function CheckIn() {
  return (
    <Scene environment="scribble" className="scroll-mt-28" >
      <section id="check-in" aria-labelledby="check-in-title" className="shell section">
        <div className="max-w-2xl">
          <p className="eyebrow text-ink-strong">A gentle check-in</p>
          <h2 id="check-in-title" className="mt-2 font-display text-display-lg">
            What feels heaviest right now?
          </h2>
          <p className="mt-4 text-lg text-ink">You don't need the perfect words. Start with what feels closest.</p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHECK_IN_CHOICES.map((c, i) => (
            <li key={c.label}>
              <Link
                to={c.to}
                className={cn(
                  'group relative flex h-full min-h-[8.5rem] items-center gap-4 overflow-hidden rounded-card border-2 border-ink-strong p-4 pr-5 shadow-sticker transition-transform duration-calm ease-gentle hover:-translate-y-1 hover:-rotate-[0.6deg]',
                  c.surface
                )}
                style={{ transitionDelay: `${i * 10}ms` }}
              >
                <span className="grid h-24 w-24 shrink-0 place-items-center rounded-[1.4rem] bg-paper/60">
                  <Companion {...c.look} size={86} animate="none" />
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-semibold leading-snug">{c.label}</span>
                  <span className="mt-1 block text-sm opacity-75">{c.hint}</span>
                </span>
                <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-strong">
          <Link to="/support" className="font-semibold underline underline-offset-4">
            Skip — show me everything you help with
          </Link>
          <Link to="/book?service=consultation" className="font-semibold underline underline-offset-4">
            I'd rather just speak to someone
          </Link>
        </div>
      </section>
    </Scene>
  );
}
