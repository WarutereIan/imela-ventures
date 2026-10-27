import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import Companion from '../characters/Companion';
import { buttonClasses } from '../ui/Button';
import { Spinner } from '../ui/primitives';

export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <Companion variant="pebble" mood="calm" tone="lavender" size={84} />
        <Spinner label="Loading…" />
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <section className="shell grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="flex flex-col items-center">
        <Companion variant="cloud" mood="uncertain" pose="idle" tone="sky" size={150} title="A confused cloud companion" />
        <h1 className="mt-6 font-display text-display-md">We couldn't find that page.</h1>
        <p className="mt-3 max-w-md text-ink-soft">It may have moved. You can head home, or start with what you need right now.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className={buttonClasses('primary')}>
            Go home
          </Link>
          <Link to="/support" className={buttonClasses('outline')}>
            Find support
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Route-level error boundary. Never renders error details that could contain user data. */
export function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  return (
    <section className="shell grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="flex flex-col items-center">
        <Companion variant="pebble" mood="tired" tone="clay" size={140} />
        <h1 className="mt-6 font-display text-display-md">Something went wrong on our side.</h1>
        <p className="mt-3 max-w-md text-ink-soft">
          Please try again. If you need support now, you can always call us on <a className="underline" href="tel:+254721803569">+254 721 803 569</a>.
        </p>
        <div className="mt-8 flex gap-3">
          <button onClick={() => window.location.reload()} className={buttonClasses('primary')}>
            Try again
          </button>
          <a href="/" className={buttonClasses('outline')}>
            Go home
          </a>
        </div>
      </div>
    </section>
  );
}
