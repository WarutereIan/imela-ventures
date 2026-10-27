import { Link } from 'react-router-dom';
import { ArrowRight, Feather } from 'lucide-react';
import Companion from '../../components/characters/Companion';
import { buttonClasses } from '../../components/ui/Button';
import { Sticker } from '../../components/ui/Sticker';

/** Floating label pill, echoing the "balance your roles" reference. */
function FloatPill({ children, badge, className }: { children: React.ReactNode; badge?: React.ReactNode; className?: string }) {
  return (
    <span className={`absolute flex items-center gap-2 rounded-pill bg-paper/95 py-2 pl-4 pr-2 text-sm font-semibold text-ink-strong shadow-lift ${className}`}>
      {children}
      {badge}
    </span>
  );
}

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="shell grid items-center gap-12 pb-16 pt-10 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:pb-24 lg:pt-16">
        <div className="reveal relative z-10">
          <h1 className="font-display text-display-xl">
            <span className="eyebrow mb-3 block">Counselling &amp; mental health support in Nairobi</span>
            You don't have to carry it <em className="font-display italic text-lavender-ink">all</em> alone.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink sm:text-xl">
            Take a breath — you're welcome here. Whether it's anxiety, stress, low mood, your relationship, grief or pressure at work, there's space for
            you. Talk to a counsellor in person or online, and let's understand what you need, together.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#check-in" className={buttonClasses('primary', 'lg')}>
              Find the Support I Need <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link to="/persona" className={buttonClasses('outline', 'lg')}>
              Meet Imela
            </Link>
          </div>
          <p className="mt-6 flex max-w-md items-start gap-2 text-sm text-ink-soft">
            <Feather className="mt-0.5 h-4 w-4 shrink-0 text-lavender-ink" aria-hidden />
            Begin at your own pace, and share only what you're comfortable sharing. No sign-up needed to explore.
          </p>
        </div>

        {/* Immersive companion scene */}
        <div className="relative mx-auto aspect-[5/6] w-full max-w-[21rem] sm:max-w-[34rem]" aria-hidden>
          <div className="absolute inset-x-[6%] inset-y-0 rounded-[46%_54%_52%_48%/42%_44%_56%_58%] bg-lavender" />
          <svg viewBox="0 0 400 480" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <g stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8">
              <path d="M70 120 c30-40 80 10 50 40 s-60-10-20-40 70-10 90 20" />
              <path d="M300 70 c20 10 30 40 6 50" />
              <path d="M320 300 l8-26 M342 308 l4-30" />
            </g>
          </svg>
          <div className="absolute bottom-[9%] left-[4%] w-[34%]">
            <Companion variant="heart" mood="calm" pose="hold" tone="rose" className="w-full" />
          </div>
          <div className="absolute bottom-[10%] left-[34%] w-[30%]">
            <Companion variant="sprout" mood="joyful" pose="reach" tone="butter" className="w-full" />
          </div>
          <div className="absolute bottom-[8%] right-[2%] w-[38%]">
            <Companion variant="cloud" mood="hopeful" pose="wave" tone="sky" className="w-full" />
          </div>
          <div className="absolute left-[30%] top-[14%] w-[22%]">
            <Companion variant="drift" mood="curious" pose="idle" tone="sage" className="w-full" />
          </div>

          <FloatPill className="left-0 top-[34%]" badge={<span className="h-7 w-7 rounded-full bg-lime" />}>
            At your pace
          </FloatPill>
          <FloatPill className="right-0 top-[22%]" badge={<span className="grid h-7 w-7 place-items-center rounded-full bg-rose-soft text-xs text-rose-ink">♥</span>}>
            No judgement
          </FloatPill>
          <div className="absolute bottom-0 right-[18%]">
            <Sticker tone="lime" tilt={-5}>
              You choose what to share
            </Sticker>
          </div>
        </div>
      </div>
    </section>
  );
}
