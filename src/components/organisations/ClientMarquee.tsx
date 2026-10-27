import { ORG } from '../../data/organisation';
import { useReducedMotion } from '../../lib/useReducedMotion';

/** Trimmed, web-sized copies of the original (12756px, ~750KB) logo files live in /clients/web. */
function webLogo(path: string): string {
  return path.replace('/clients/', '/clients/web/').replace(/\s+/g, '-');
}

function Logo({ name, logo, hidden = false, className = 'h-16 w-32 sm:h-20 sm:w-40' }: { name: string; logo: string; hidden?: boolean; className?: string }) {
  return (
    <li className={`flex shrink-0 items-center justify-center rounded-2xl bg-paper px-3 shadow-soft sm:px-5 ${className}`} aria-hidden={hidden || undefined}>
      <img src={webLogo(logo)} alt={hidden ? '' : name} loading="lazy" className="max-h-10 w-auto max-w-full object-contain sm:max-h-14" />
    </li>
  );
}

/** Logos from the previous website. Scrolls slowly; static grid when motion is reduced. */
export function ClientMarquee() {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <ul className="shell grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
        {ORG.clients.map((c) => (
          <Logo key={c.name} {...c} className="h-14 w-full sm:h-20 sm:w-40" />
        ))}
      </ul>
    );
  }

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <ul className="marquee-track flex w-max gap-3 py-2 sm:gap-4">
        {ORG.clients.map((c) => (
          <Logo key={c.name} {...c} />
        ))}
        {ORG.clients.map((c) => (
          <Logo key={`dup-${c.name}`} {...c} hidden />
        ))}
      </ul>
    </div>
  );
}
