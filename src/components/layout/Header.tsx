import React, { useContext, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LifeBuoy, Menu, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { buttonClasses } from '../ui/Button';
import { UrgentHelpContext } from './UrgentHelp';
import Companion from '../characters/Companion';

export const PRIMARY_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/who-we-are', label: 'Who We Are' },
  { to: '/resources', label: 'Resources' },
  { to: '/team', label: 'Team' },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2', className)} aria-label="Imela Ventures — home">
      <img src="/logo-transparent.png" alt="" width={70} height={56} className="h-12 w-auto object-contain" />
      <span className="sr-only">Imela Ventures</span>
    </Link>
  );
}

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const openUrgentHelp = useContext(UrgentHelpContext);
  const isOrg = location.pathname.startsWith('/organisations');

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'relative rounded-pill px-3.5 py-2 text-[0.95rem] font-medium transition-colors',
      isActive ? 'bg-ink-strong/[0.07] text-ink-strong' : 'text-ink hover:text-ink-strong hover:bg-ink/5'
    );

  return (
    <header className="sticky top-0 z-40 border-b border-line/10 bg-ivory/90 backdrop-blur-md">
      {/* Audience pathways + urgent help */}
      <div className="border-b border-line/10 bg-ivory-deep/60">
        <div className="shell flex h-9 items-center justify-between gap-3 text-xs">
          <nav aria-label="Audience" className="flex items-center gap-1">
            <Link
              to="/support"
              className={cn('rounded-pill px-3 py-1 font-semibold', !isOrg ? 'bg-paper text-ink-strong shadow-soft' : 'text-ink-soft hover:text-ink-strong')}
              aria-current={!isOrg ? 'true' : undefined}
            >
              <span className="sm:hidden">Individuals</span>
              <span className="hidden sm:inline">For individuals</span>
            </Link>
            <Link
              to="/organisations"
              className={cn('rounded-pill px-3 py-1 font-semibold', isOrg ? 'bg-paper text-ink-strong shadow-soft' : 'text-ink-soft hover:text-ink-strong')}
              aria-current={isOrg ? 'true' : undefined}
            >
              <span className="sm:hidden">Organisations</span>
              <span className="hidden sm:inline">For organisations</span>
            </Link>
          </nav>
          <button onClick={openUrgentHelp} className="inline-flex items-center gap-1.5 rounded-pill px-2 py-1 font-semibold text-rose-ink hover:bg-rose-soft">
            <LifeBuoy className="h-3.5 w-3.5" aria-hidden />
            <span className="sm:hidden">Urgent help</span>
            <span className="hidden sm:inline">Need urgent help?</span>
          </button>
        </div>
      </div>

      <div className="shell flex h-[4.25rem] items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/persona" className={navLinkClass}>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-lavender-ink" aria-hidden />
              Imela Persona
            </span>
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/book" className={buttonClasses('primary', 'md', 'hidden sm:inline-flex')}>
            Schedule Consultation
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={buttonClasses('outline', 'sm', 'lg:hidden')}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <Menu className="h-4 w-4" aria-hidden /> Menu
          </button>
        </div>
      </div>

      {/* Mobile menu sheet */}
      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 flex flex-col bg-lavender lg:hidden">
          <div className="shell flex h-[4.25rem] items-center justify-between">
            <Logo />
            <button onClick={() => setOpen(false)} className={buttonClasses('primary', 'sm')} autoFocus>
              <X className="h-4 w-4" aria-hidden /> Close
            </button>
          </div>
          <nav aria-label="Mobile" className="shell flex flex-1 flex-col gap-1 overflow-y-auto pb-8 pt-4">
            {[...PRIMARY_NAV, { to: '/persona', label: 'Imela Persona' }, { to: '/support', label: 'Find support' }, { to: '/organisations', label: 'For organisations' }].map(
              (item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item ? item.end : undefined}
                  className={({ isActive }) =>
                    cn('rounded-2xl px-4 py-3 font-display text-3xl text-ink-strong', isActive ? 'bg-paper/70' : 'hover:bg-paper/40')
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
            <Link to="/book" className={buttonClasses('primary', 'lg', 'mt-6')}>
              Schedule Consultation
            </Link>
            <div className="mt-auto flex justify-end pt-8">
              <Companion variant="sprout" mood="joyful" pose="wave" tone="butter" size={110} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
