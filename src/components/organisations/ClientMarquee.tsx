import { ORG } from '../../data/organisation';
import { useReducedMotion } from '../../lib/useReducedMotion';

/** Trimmed, web-sized copies of the original (12756px, ~750KB) logo files live in /clients/web. */
function webLogo(path: string): string {
  return path.replace('/clients/', '/clients/web/').replace(/\s+/g, '-');
}

function Logo({ name, logo, hidden = false }: { name: string; logo: string; hidden?: boolean }) {
  return (
    <li className="flex h-20 w-40 shrink-0 items-center justify-center rounded-2xl bg-paper px-5 shadow-soft" aria-hidden={hidden || undefined}>
      <img src={webLogo(logo)} alt={hidden ? '' : name} loading="lazy" className="max-h-14 w-auto max-w-full object-contain" />
    </li>
  );
}

/** Logos from the previous website. Scrolls slowly; static grid when motion is reduced. */
export function ClientMarquee() {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <ul className="flex flex-wrap justify-center gap-4">
        {ORG.clients.map((c) => (
          <Logo key={c.name} {...c} />
        ))}
      </ul>
    );
  }

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <ul className="marquee-track flex w-max gap-4 py-2">
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
