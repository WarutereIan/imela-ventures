import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { ORG } from '../../data/organisation';
import { CrisisContacts } from '../../components/layout/UrgentHelp';
import LegalLayout, { type LegalSection } from './LegalLayout';

const sections: LegalSection[] = [
  {
    id: 'using',
    title: 'Using this website',
    body: (
      <p>
        This website is provided by {ORG.name} to help people learn about counselling and wellbeing support, explore their options and request
        appointments. Please use it lawfully and respectfully, and don't attempt to disrupt it or access information that isn't yours.
      </p>
    ),
  },
  {
    id: 'emergency',
    title: 'Not an emergency service',
    body: (
      <>
        <p>
          Imela is not an emergency service, and this website — including Imela Persona — is not monitored around the clock. If you or someone else
          is in immediate danger, contact emergency services now.
        </p>
        <div className="not-prose my-4">
          <CrisisContacts compact />
        </div>
      </>
    ),
  },
  {
    id: 'not-advice',
    title: 'Not a diagnosis or substitute for professional care',
    body: (
      <>
        <p>
          Information on this website, including articles in our resource library, is general and is not professional advice for your situation.
          Some resources are marked as drafts awaiting review by an Imela counsellor.
        </p>
        <p>
          Imela Persona and the service finder suggest possible next steps based on what you share. Their suggestions are not a diagnosis, a clinical
          assessment or a treatment plan, and they don't replace speaking with a qualified professional.
        </p>
      </>
    ),
  },
  {
    id: 'ai',
    title: 'Automated and AI features',
    body: (
      <p>
        By default, Persona uses a built-in guide that runs in your browser. Imela may offer optional AI-generated reflections, which are only used
        with your agreement and are clearly labelled. AI-generated text can be wrong or miss important context. Recommendations for services always
        come from Imela's own catalogue. Read more in our <Link to="/privacy#persona">privacy notice</Link>.
      </p>
    ),
  },
  {
    id: 'bookings',
    title: 'Booking requests',
    body: (
      <>
        <p>
          Submitting the booking form sends a request. Your appointment is not confirmed until Imela confirms it with you directly. Times shown as
          available may change before confirmation.
        </p>
        <p>
          Fees, session formats and cancellation arrangements are confirmed with you during consultation or when your booking is confirmed. If you
          need to change or cancel, please contact us as early as you can.
        </p>
      </>
    ),
  },
  {
    id: 'content',
    title: 'Content and illustrations',
    body: (
      <p>
        The illustrated companions on this site are original artwork used to make the site feel welcoming. They do not represent real people or
        practitioners. Practitioner qualifications are listed only once verified by Imela.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes and contact',
    body: (
      <p>
        We may update these terms as the website develops. For questions, contact us at <a href={`mailto:${ORG.email}`}>{ORG.email}</a> or{' '}
        <a href={ORG.phoneHref}>{ORG.phoneDisplay}</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  useDocumentTitle('Terms of use');
  return (
    <LegalLayout
      eyebrow="The small print, in plain words"
      title="Terms of use"
      intro={<p>What you can expect from this website, and what it can and can't do for you.</p>}
      updated="27 October 2026"
      sections={sections}
      companion="pebble"
    />
  );
}
