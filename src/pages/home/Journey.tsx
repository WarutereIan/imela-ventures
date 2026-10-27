import { useEffect, useRef, useState } from 'react';
import Companion, { type CompanionMood, type CompanionPose } from '../../components/characters/Companion';
import { cn } from '../../lib/cn';

const STAGES: { title: string; text: string; mood: CompanionMood; pose: CompanionPose }[] = [
  { title: 'Arrive', text: 'Come as you are. Nothing to prove, nothing to explain yet.', mood: 'uncertain', pose: 'idle' },
  { title: 'Explore', text: 'Look around, read, or try a private check-in — no sign-up needed.', mood: 'curious', pose: 'idle' },
  { title: 'Understand', text: "Put things into words, and see which kinds of support might fit and why.", mood: 'calm', pose: 'hug' },
  { title: 'Connect', text: 'When it feels right, speak with a counsellor — online or in person.', mood: 'hopeful', pose: 'hold' },
  { title: 'Continue', text: 'Keep going at your own pace, with follow-up and resources along the way.', mood: 'joyful', pose: 'reach' },
];

/**
 * The journey from uncertainty toward support, told by one companion whose
 * expression changes along the path. The path draws itself in as it scrolls
 * into view (instantly for reduced motion).
 */
export function Journey() {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} aria-labelledby="journey-title" className="section overflow-hidden">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <div>
            <p className="eyebrow">The journey</p>
            <h2 id="journey-title" className="mt-2 font-display text-display-lg">
              From “I don't know” to a next step that feels right.
            </h2>
          </div>
          <p className="text-lg text-ink-soft lg:pb-2">
            Support isn't a single leap. It's a series of small, manageable steps — and you decide how quickly to take them. This website can help you find your
            way to support; the support itself comes from people.
          </p>
        </div>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-5 md:gap-4">
          <svg className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-16 w-full md:block" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden>
            <path
              d="M40 30 C 160 -10, 220 70, 330 30 S 520 -10, 620 30 S 820 70, 960 30"
              fill="none"
              stroke="#4E3D99"
              strokeWidth="3"
              strokeDasharray="10 12"
              strokeLinecap="round"
              pathLength={1}
              style={{
                strokeDasharray: seen ? '0.012 0.016' : '0 1',
                transition: 'stroke-dasharray 1.6s var(--ease-gentle)',
              }}
            />
          </svg>
          {STAGES.map((s, i) => (
            <li
              key={s.title}
              className={cn('relative flex gap-4 md:flex-col md:items-center md:text-center', seen ? 'reveal' : 'opacity-0')}
              style={{ animationDelay: `${i * 140}ms` }}
            >
              <div className="relative grid h-[120px] w-[110px] shrink-0 place-items-center md:mx-auto">
                <span className="absolute inset-2 rounded-full bg-lavender-soft" aria-hidden />
                <Companion variant="drift" tone="sage" mood={s.mood} pose={s.pose} size={96} className="relative" />
              </div>
              <div>
                <p className="font-hand text-2xl text-lavender-ink">0{i + 1}</p>
                <h3 className="font-display text-display-sm">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft md:px-2">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
