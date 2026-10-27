import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { ORG } from '../../data/organisation';
import LegalLayout, { type LegalSection } from './LegalLayout';

const sections: LegalSection[] = [
  {
    id: 'summary',
    title: 'In short',
    body: (
      <>
        <ul>
          <li>You can explore this website and use Imela Persona without creating an account or telling us who you are.</li>
          <li>By default, what you type into Persona stays in your browser. It is not sent to Imela or saved on our servers.</li>
          <li>When you book or enquire, we collect only the contact details we need to arrange your appointment.</li>
          <li>We never sell your information or use it for advertising.</li>
          <li>Information about your mental health is sensitive personal data, and we treat it that way.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'persona',
    title: 'How Imela Persona handles what you type',
    body: (
      <>
        <p>
          Imela Persona is a guided conversation that helps you put things into words and find a possible next step. It is not a counsellor, it does
          not diagnose, and it is not monitored by a person.
        </p>
        <h3>The built-in guide (default)</h3>
        <ul>
          <li>Persona's responses and suggestions are worked out in your own browser, using Imela's service catalogue.</li>
          <li>Your conversation is held only in memory while this browser tab is open, so you can look at another page of this site and come back to it. Refreshing or closing the tab, “Start over” or Quick exit clears it. It is not saved to our servers and is not written to your browser's storage.</li>
          <li>Choosing <strong>Reset</strong>, leaving the page, or closing the tab clears it.</li>
          <li>If you choose to download a summary, the file is created on your device and goes only where you save it.</li>
        </ul>
        <h3>Optional AI reflections</h3>
        <p>
          Imela may switch on an optional feature that adds AI-generated reflections to the conversation. It is only used if Imela has enabled it
          <strong> and</strong> you actively agree each time you start a conversation. If you agree, your most recent messages are sent to Imela's
          server function and then to a third-party AI provider (currently configured by Imela) to generate a reply. These messages are not used for
          advertising and are not saved by Imela. The AI provider processes them under its own terms. Service recommendations always come from
          Imela's own catalogue, not from the AI.
        </p>
        <h3>Your conversation does not become a client record</h3>
        <p>
          If you move from Persona to booking, your conversation is not attached to your booking. You will be asked only for the contact details
          needed to arrange the session.
        </p>
      </>
    ),
  },
  {
    id: 'bookings',
    title: 'Bookings and enquiries',
    body: (
      <>
        <p>When you request a session or send an enquiry, we collect:</p>
        <ul>
          <li>your name, email address and phone number;</li>
          <li>the service, date and time you chose;</li>
          <li>an optional message, if you choose to write one;</li>
          <li>for organisations, your organisation's name and approximate team size.</li>
        </ul>
        <p>
          This is stored in Imela's database, hosted by our database provider, Supabase. Only authorised Imela team members can read it. When a
          request arrives, the team receives an email notification with your contact details and appointment time. Your optional message is not
          included in emails — it can only be read in Imela's secure dashboard.
        </p>
        <p>
          A booking request is not confirmed until Imela confirms it with you. Please don't include more detail about your situation than you are
          comfortable sharing — you can talk about it in your session instead.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Optional accounts',
    body: (
      <>
        <p>
          You never need an account to explore, use Persona, or request a booking. Where Imela offers a client portal, you can choose to create an
          account to see your appointments and keep private reflections.
        </p>
        <ul>
          <li>Private reflections you write in the portal are visible only to you — not to your counsellor or Imela's administrators.</li>
          <li>Practitioners can see only the appointments and information needed for the sessions they are assigned to.</li>
          <li>Organisations that sponsor programmes can see aggregated, anonymised participation figures only — never who attended counselling or what was discussed.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'technical',
    title: 'Technical information',
    body: (
      <>
        <p>
          Like most websites, our hosting provider and database provider may automatically log technical information such as your IP address,
          browser type and the time of your visit, to keep the service secure and working. We don't link this information to anything you type into
          Persona.
        </p>
        <p>
          This website loads fonts from Google Fonts. We do not use advertising trackers. We keep third-party scripts to a minimum, especially on
          sensitive pages.
        </p>
      </>
    ),
  },
  {
    id: 'rights',
    title: 'Your rights',
    body: (
      <>
        <p>
          Imela operates in Kenya, where the Data Protection Act, 2019 applies. Under it, information about your health — including mental health —
          is sensitive personal data. You have the right to:
        </p>
        <ul>
          <li>be told how your personal data is used;</li>
          <li>access the personal data we hold about you;</li>
          <li>ask us to correct inaccurate or misleading data;</li>
          <li>ask us to delete data we no longer need or are not entitled to keep;</li>
          <li>object to the processing of all or part of your data.</li>
        </ul>
        <p>
          To use any of these rights, contact us using the details below. You can also contact the Office of the Data Protection Commissioner in
          Kenya.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep information',
    body: (
      <>
        <ul>
          <li>Persona conversations: not stored (cleared when you reset or close the page).</li>
          <li>Booking and enquiry records: kept for as long as needed to provide and administer your sessions, and to meet professional and legal obligations. Imela is finalising its retention schedule.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact us about privacy',
    body: (
      <>
        <p>
          {ORG.name}, {ORG.postalAddress}
          <br />
          Email: <a href={`mailto:${ORG.email}`}>{ORG.email}</a>
          <br />
          Phone: <a href={ORG.phoneHref}>{ORG.phoneDisplay}</a>
        </p>
        <p>
          See also our <Link to="/terms">terms of use</Link>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  useDocumentTitle('Privacy notice');
  return (
    <LegalLayout
      eyebrow="Your privacy"
      title="Privacy notice"
      intro={<p>How this website collects, uses and protects information — written to describe what actually happens, in plain language.</p>}
      updated="27 October 2026"
      sections={sections}
    />
  );
}
