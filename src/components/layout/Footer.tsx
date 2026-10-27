import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { ORG } from '../../data/organisation';
import { buttonClasses } from '../ui/Button';
import Companion from '../characters/Companion';

const columns = [
  {
    title: 'Find support',
    links: [
      { to: '/support', label: 'What we help with' },
      { to: '/find-support', label: 'Service finder' },
      { to: '/persona', label: 'Imela' },
      { to: '/book', label: 'Book a session' },
    ],
  },
  {
    title: 'Imela',
    links: [
      { to: '/who-we-are', label: 'Who we are' },
      { to: '/team', label: 'Team' },
      { to: '/resources', label: 'Resources' },
      { to: '/organisations', label: 'For organisations' },
    ],
  },
  {
    title: 'Your privacy',
    links: [
      { to: '/privacy', label: 'Privacy notice' },
      { to: '/privacy#persona', label: 'How Persona handles data' },
      { to: '/terms', label: 'Terms of use' },
      { to: '/portal', label: 'Client portal' },
    ],
  },
];

const Footer: React.FC = () => (
  <footer className="relative mt-32 bg-ink-strong text-ivory">
    <div className="shell relative grid gap-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-[1.3fr_2fr]">
      <div>
        <p className="font-display text-display-md text-ivory">You can take the next step at your own pace.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/book" className={buttonClasses('soft', 'md')}>
            Schedule Consultation
          </Link>
          <Link to="/persona" className={buttonClasses('outline', 'md', 'border-ivory/70 text-ivory hover:bg-ivory hover:text-ink-strong')}>
            Meet Imela
          </Link>
        </div>
        <ul className="mt-10 space-y-3 text-sm text-ivory/80">
          <li className="flex items-center gap-3">
            <Phone className="h-4 w-4" aria-hidden />
            <a href={ORG.phoneHref} className="hover:text-ivory">
              {ORG.phoneDisplay}
            </a>
          </li>
          <li className="flex items-center gap-3">
            <Mail className="h-4 w-4" aria-hidden />
            <a href={`mailto:${ORG.email}`} className="hover:text-ivory">
              {ORG.email}
            </a>
          </li>
          <li className="flex items-center gap-3">
            <MapPin className="h-4 w-4" aria-hidden />
            {ORG.postalAddress}
          </li>
        </ul>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-10">
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ivory/60">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-ivory/85 hover:text-ivory hover:underline hover:underline-offset-4">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </div>
    <div className="shell relative flex flex-col gap-3 border-t border-ivory/15 py-6 text-xs text-ivory/60 sm:flex-row sm:items-center sm:justify-between">
      <p>
        © {new Date().getFullYear()} {ORG.name} · {ORG.tagline}
      </p>
      <p>Imela is not an emergency service. In an emergency in Kenya call 999 or 112.</p>
    </div>
    {/* A companion peeking over the footer edge */}
    <div className="pointer-events-none absolute -top-[92px] right-[8%] hidden md:block" aria-hidden>
      <Companion variant="drift" mood="calm" pose="wave" tone="lavender" size={110} />
    </div>
  </footer>
);

export default Footer;
