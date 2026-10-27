import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Globe2, MapPin, ShieldQuestion } from 'lucide-react';
import { teamMemberMeta } from '../../seo/site';
import { SITE_URL, usePageMeta } from '../../seo/usePageMeta';
import { getPractitioner } from '../../data/team';
import { FORMAT_LABEL, SERVICES, isBookable } from '../../data/services';
import Companion from '../../components/characters/Companion';
import Scene from '../../components/characters/Scene';
import { NotFoundPage } from '../../components/layout/PageStates';
import { ServiceCard } from '../../components/services/ServiceCard';
import { buttonClasses } from '../../components/ui/Button';
import { Chip } from '../../components/ui/primitives';
import { Carousel } from '../../components/ui/Carousel';

export default function TeamMemberPage() {
  const { slug } = useParams();
  const member = getPractitioner(slug);
  usePageMeta(member ? teamMemberMeta(member.slug, SITE_URL) : undefined);
  if (!member) return <NotFoundPage />;

  const first = member.name.split(' ')[0];
  const verified = member.qualifications.filter((q) => q.verified);
  const services = SERVICES.filter((s) => s.practitionerIds.includes(member.slug) && isBookable(s) && s.audience === 'individual');
  const bookHref = `/book?service=consultation&practitioner=${encodeURIComponent(member.slug)}`;

  return (
    <>
      <section className="shell pt-6 md:pt-14">
        <Link to="/team" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-ink-strong">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All team members
        </Link>
        <div className="mt-4 grid gap-6 md:mt-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:gap-10">
          <div>
            <p className="eyebrow">{member.role}</p>
            <h1 className="mt-1 font-display text-display-lg">{member.name}</h1>
            <div className="mt-4 space-y-3 text-base leading-relaxed text-ink md:mt-6 md:space-y-4 md:text-lg">
              {member.bio.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 md:mt-8">
              <Link to={bookHref} className={buttonClasses('primary', 'lg')}>
                Book a consultation with {first}
              </Link>
              <Link to="/persona" className={buttonClasses('outline', 'lg')}>
                Not sure yet? Explore first
              </Link>
            </div>
          </div>
          <Scene environment={member.character.environment} framed className="order-first h-52 lg:order-none lg:h-[22rem]">
            <div className="flex h-52 flex-col items-center justify-end pb-3 lg:h-[22rem] lg:pb-5">
              <Companion variant={member.character.variant} mood={member.character.mood} pose={member.character.pose} tone={member.character.tone} className="h-auto w-32 lg:w-[200px]" />
              <p className="mt-1 rounded-pill bg-paper/85 px-3 py-1 text-xs text-ink-soft">Illustration — not a photo of {first}</p>
            </div>
          </Scene>
        </div>
      </section>

      <section className="shell grid gap-3 pt-10 md:grid-cols-2 md:gap-6 md:pt-16 lg:grid-cols-[1.3fr_1fr_1fr]" aria-label="Practice details">
        <div className="rounded-card bg-lavender-soft p-5 md:row-span-2 md:p-6 lg:row-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-lavender-ink">Areas of practice</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {member.areas.map((a) => (
              <li key={a}>
                <Chip tone="ink" className="text-sm">
                  {a}
                </Chip>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-card bg-paper p-5 shadow-soft md:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">
            <MapPin className="h-4 w-4" aria-hidden /> Session formats
          </h2>
          <p className="mt-3 text-lg font-semibold text-ink-strong">
            {member.formats ? member.formats.map((f) => FORMAT_LABEL[f]).join(' · ') : 'To be confirmed'}
          </p>
          <h2 className="mt-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft md:mt-6">
            <Globe2 className="h-4 w-4" aria-hidden /> Languages
          </h2>
          <p className="mt-3 text-lg font-semibold text-ink-strong">{member.languages?.length ? member.languages.join(', ') : 'To be confirmed'}</p>
        </div>
        <div className="rounded-card bg-paper p-5 shadow-soft md:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">
            <BadgeCheck className="h-4 w-4" aria-hidden /> Qualifications
          </h2>
          {verified.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {verified.map((q) => (
                <li key={q.label} className="flex items-start gap-2 text-ink-strong">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> {q.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 flex items-start gap-2 text-ink">
              <ShieldQuestion className="mt-0.5 h-5 w-5 shrink-0 text-butter-ink" aria-hidden />
              Qualifications are being verified and will be listed here once confirmed.
            </p>
          )}
        </div>
      </section>

      {services.length > 0 && (
        <section className="shell pt-10 md:pt-16" aria-labelledby="sessions-heading">
          <h2 id="sessions-heading" className="font-display text-display-md">
            Sessions with {first}
          </h2>
          <Carousel
            label={`Sessions with ${first}`}
            className="mt-6 md:mt-8"
            gridFrom="md"
            gridClassName="md:grid-cols-2 md:gap-6 xl:grid-cols-3"
            slideClassName="w-[86%] sm:w-[62%]"
          >
            {services.map((s) => (
              // Positioned wrapper keeps the card's sr-only labels inside the scroll area.
              <div key={s.id} className="relative">
                <ServiceCard service={s} className="h-full" />
              </div>
            ))}
          </Carousel>
        </section>
      )}
    </>
  );
}
