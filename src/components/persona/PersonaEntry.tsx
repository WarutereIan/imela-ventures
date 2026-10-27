import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, EyeOff, HardDrive, ShieldCheck, UserX } from 'lucide-react';
import Companion from '../characters/Companion';
import Scene from '../characters/Scene';
import { Sticker } from '../ui/Sticker';
import type { PersonaPath } from '../../domain/persona/machine';

const ENTRY_OPTIONS: { path: PersonaPath; title: string; text: string; companion: React.ReactNode; surface: string }[] = [
  {
    path: 'talk',
    title: "Talk about what's on my mind",
    text: 'Put it into words, in your own way. Persona listens and reflects back what it hears.',
    companion: <Companion variant="cloud" mood="calm" pose="hug" tone="sky" size={92} />,
    surface: 'bg-sky-soft',
  },
  {
    path: 'feelings',
    title: "Help me understand what I'm feeling",
    text: "Start with feeling words if sentences are hard right now. It's okay not to know.",
    companion: <Companion variant="pebble" mood="curious" pose="idle" tone="coral" size={92} />,
    surface: 'bg-rose-soft',
  },
  {
    path: 'find',
    title: 'Help me find the right support',
    text: "Tell us what you'd like help with and see options that may fit — with the reasons why.",
    companion: <Companion variant="sprout" mood="hopeful" pose="wave" tone="lime" size={92} />,
    surface: 'bg-sage',
  },
];

const PRIVACY_POINTS = [
  { icon: UserX, title: 'No name, no sign-up', text: "You don't need an account or to tell us who you are." },
  { icon: HardDrive, title: 'Stays in this tab', text: "What you type is kept in this page's memory only. It isn't saved to our servers or your browser storage." },
  { icon: EyeOff, title: 'Not watched by a person', text: "No one at Imela reads this conversation, so it can't send help in an emergency." },
  {
    icon: ShieldCheck,
    title: 'The honest limits',
    text: 'Like any website, our hosting providers record technical data such as IP addresses. We never connect that to what you type.',
  },
];

export function PersonaEntry({ onStart }: { onStart: (path: PersonaPath) => void }) {
  return (
    <div className="shell grid gap-10 py-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-16">
      <div>
        <Link to="/persona" className="inline-flex items-center gap-1.5 text-sm font-semibold text-lavender-ink underline-offset-4 hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Imela Persona
        </Link>
        <p className="eyebrow mt-4">Explore privately first</p>
        <h1 className="mt-2 font-display text-display-lg">You can begin without telling us who you are.</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
          Put things into words at your own pace, with a guide that stays in this tab. Nothing here reaches a counsellor. When you're ready to talk to
          one,{' '}
          <Link to="/persona/start" className="font-semibold text-lavender-ink underline underline-offset-4">
            get a Persona ID
          </Link>
          .
        </p>

        <ul className="mt-8 space-y-3" aria-label="Ways to begin">
          {ENTRY_OPTIONS.map((o) => (
            <li key={o.path}>
              <button
                type="button"
                onClick={() => onStart(o.path)}
                className={`group flex w-full items-center gap-4 rounded-card border border-line/10 p-3 pr-5 text-left shadow-soft transition-transform duration-calm ease-gentle hover:-translate-y-0.5 ${o.surface}`}
              >
                <span className="grid h-24 w-24 shrink-0 place-items-center rounded-[1.4rem] bg-paper/70">{o.companion}</span>
                <span className="flex-1">
                  <span className="block text-lg font-semibold text-ink-strong">{o.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink">{o.text}</span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-ink-strong transition-transform group-hover:translate-x-1" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside aria-labelledby="persona-privacy" className="relative">
        <Scene environment="scribble" framed className="min-h-[18rem]">
          <div className="flex h-72 items-end justify-center gap-2 pb-4">
            <Companion variant="drift" mood="calm" pose="wave" tone="sage" size={150} title="Persona's companion waving hello" />
          </div>
          <div className="absolute left-5 top-5">
            <Sticker tone="lime" tilt={-6}>
              Private by design
            </Sticker>
          </div>
          <div className="absolute right-5 top-16">
            <Sticker tone="paper" tilt={5}>
              Your pace
            </Sticker>
          </div>
        </Scene>

        <div className="relative -mt-8 mx-3 rounded-card border border-line/10 bg-paper p-6 shadow-lift sm:mx-6">
          <h2 id="persona-privacy" className="text-lg font-semibold">
            Before you begin
          </h2>
          <ul className="mt-4 space-y-4">
            {PRIVACY_POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lavender-soft text-lavender-ink">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-strong">{title}</span>
                  <span className="block text-sm leading-relaxed text-ink-soft">{text}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-ink-soft">
            Persona is an automated guide, not a counsellor. It never diagnoses. If you are in danger right now, use{' '}
            <strong>Need urgent help?</strong> at the top of the page.{' '}
            <Link to="/privacy#persona" className="font-semibold text-lavender-ink underline underline-offset-2">
              Read how Persona handles data
            </Link>
          </p>
        </div>
      </aside>
    </div>
  );
}
