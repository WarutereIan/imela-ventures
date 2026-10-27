import { Link } from 'react-router-dom';
import { ArrowRight, KeyRound, MessageCircleHeart, RotateCcw, UserX } from 'lucide-react';
import Companion from '../../../components/characters/Companion';
import Scene from '../../../components/characters/Scene';
import { Sticker } from '../../../components/ui/Sticker';
import { buttonClasses } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/primitives';
import { CrisisContacts } from '../../../components/layout/UrgentHelp';
import { Carousel } from '../../../components/ui/Carousel';
import { PrivacyLimits } from '../../../components/personaPortal/shared';
import { portalAvailable } from '../../../domain/personaPortal/api';
import { useDocumentTitle } from '../../../lib/useDocumentTitle';

const STEPS = [
  { icon: KeyRound, title: 'Get a Persona ID', text: 'We create an ID and a private recovery secret for you. No name, email, phone or social account.' },
  { icon: MessageCircleHeart, title: 'Share what you choose', text: 'Pick what you need support with, and write as much or as little as you like.' },
  { icon: UserX, title: 'Talk with a counsellor', text: 'An Imela counsellor reads your message and replies in your private space.' },
  { icon: RotateCcw, title: 'Come back any time', text: 'Return with your ID and secret to read replies, continue, or start a new conversation.' },
];

export default function PortalLandingPage() {
  useDocumentTitle('Imela Persona — anonymous counselling');

  return (
    <div className="pb-16">
      <section className="shell grid gap-10 py-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 lg:py-16">
        <div>
          <p className="eyebrow">Imela Persona</p>
          <h1 className="mt-2 font-display text-display-lg">Talk to a counsellor without telling us who you are.</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Anonymous counselling by private written messages. You get a Persona ID and a recovery secret instead of an account — so you can seek support, hear
            back from a counsellor and return whenever you need to.
          </p>

          {portalAvailable ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/persona/start" className={buttonClasses('primary', 'lg')}>
                Get my Persona ID <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/persona/access" className={buttonClasses('outline', 'lg')}>
                I already have one
              </Link>
            </div>
          ) : (
            <Alert tone="info" className="mt-8" title="Anonymous counselling is being set up">
              You can explore privately right now, or book a consultation if you'd like to speak to someone.
              <span className="mt-3 flex flex-wrap gap-2">
                <Link to="/book?service=consultation" className={buttonClasses('primary', 'sm')}>
                  Book a consultation
                </Link>
              </span>
            </Alert>
          )}

          <Link
            to="/persona/explore"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-lavender-ink underline underline-offset-4"
          >
            Not ready? Explore privately first <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="relative" aria-hidden>
          <Scene environment="dusk" framed className="min-h-[16rem] sm:min-h-[22rem]">
            <div className="flex h-64 items-end justify-center gap-3 pb-4 sm:h-[22rem]">
              <Companion variant="drift" mood="calm" pose="hold" hold="lantern" tone="sage" className="h-auto w-28 sm:w-40" />
              <Companion variant="heart" mood="hopeful" pose="wave" tone="rose" className="h-auto w-20 sm:w-28" />
            </div>
          </Scene>
          <div className="absolute left-4 top-4">
            <Sticker tone="lime" tilt={-6}>
              No name needed
            </Sticker>
          </div>
          <div className="absolute right-4 top-16">
            <Sticker tone="paper" tilt={5}>
              Real counsellors
            </Sticker>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-title" className="shell">
        <h2 id="how-title" className="font-display text-display-sm">
          How it works
        </h2>
        <Carousel label="How Imela Persona works" className="mt-5" gridFrom="sm" gridClassName="sm:grid-cols-2 sm:gap-3 lg:grid-cols-4" slideClassName="w-[80%]">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="rounded-card bg-paper p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-lavender-soft text-lavender-ink">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-hand text-2xl text-lavender-ink">0{i + 1}</span>
              </div>
              <h3 className="mt-3 font-semibold text-ink-strong">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p>
            </div>
          ))}
        </Carousel>
      </section>

      <section aria-labelledby="privacy-title" className="shell mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-card border border-line/10 bg-paper p-6 shadow-soft sm:p-8">
          <h2 id="privacy-title" className="font-display text-display-sm">
            Private by design — and honest about the limits
          </h2>
          <div className="mt-5">
            <PrivacyLimits />
          </div>
          <p className="mt-5 text-sm text-ink-soft">
            Your recovery secret is the only way back in. Imela can't see it or reset it, and there's no email or phone recovery — that's what keeps your identity out
            of it.{' '}
            <Link to="/privacy#persona" className="font-semibold text-lavender-ink underline underline-offset-2">
              Read the full privacy notice
            </Link>
          </p>
        </div>
        <div className="self-start rounded-card border-2 border-rose/40 bg-rose-soft/50 p-6 sm:p-8">
          <h2 className="font-display text-display-sm">Need help right now?</h2>
          <p className="mt-2 text-ink">
            Messages here are read by people during working hours, not in real time. If you or someone else is in immediate danger, contact emergency services now.
          </p>
          <CrisisContacts className="mt-4" compact />
        </div>
      </section>
    </div>
  );
}
