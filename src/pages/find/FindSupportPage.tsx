import { useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { NeedFinder } from '../../components/find/NeedFinder';
import { ServiceTable } from '../../components/find/ServiceTable';
import Companion from '../../components/characters/Companion';
import { Sticker } from '../../components/ui/Sticker';
import { SectionHeading } from '../../components/ui/primitives';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

export default function FindSupportPage() {
  useDocumentTitle('Find support');
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const highlight = params.get('service');
  const q = params.get('q') ?? '';

  useEffect(() => {
    if (hash === '#catalogue' && highlight) {
      const el = document.getElementById(`svc-${highlight}`) ?? document.getElementById(`svc-m-${highlight}`);
      el?.scrollIntoView({ block: 'center' });
    }
  }, [hash, highlight]);

  return (
    <>
      <section className="relative overflow-hidden bg-lavender">
        <div className="shell relative py-14 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <p className="eyebrow text-ink-strong">Service finder</p>
              <h1 className="mt-2 font-display text-display-lg">Tell us what you need. We'll help you find your next step.</h1>
              <p className="mt-4 max-w-xl text-lg text-ink">
                Describe it however it comes to you. We'll show options from Imela's services — and explain why each one might fit.
              </p>
            </div>
            <div className="relative hidden items-end justify-center lg:flex" aria-hidden>
              <Companion variant="cloud" mood="curious" pose="hold" hold="lantern" tone="sky" size={200} />
              <div className="absolute left-2 top-4">
                <Sticker tone="lime" tilt={-8}>
                  No sign-up
                </Sticker>
              </div>
              <div className="absolute right-0 top-24">
                <Sticker tone="paper" tilt={6}>
                  Explained, not judged
                </Sticker>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <NeedFinder initialText={q} />
          </div>
        </div>
      </section>

      <section id="catalogue" className="shell section scroll-mt-28">
        <SectionHeading
          eyebrow="Everything we offer"
          title="Compare services"
          lede={
            <>
              Every service shows whether it's available now or still being confirmed. Only available services can be booked. Not sure?{' '}
              <Link to="/book?service=consultation" className="font-semibold text-lavender-ink underline underline-offset-4">
                Start with an initial consultation
              </Link>
              .
            </>
          }
        />
        <div className="mt-8">
          <ServiceTable highlight={highlight} />
        </div>
      </section>
    </>
  );
}
