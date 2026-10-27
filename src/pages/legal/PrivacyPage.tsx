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
    title: 'Imela Persona: anonymous counselling',
    body: (
      <>
        <p>
          Imela Persona lets you talk with an Imela counsellor by private written messages without giving your name, email address, phone number or
          social media account. It is designed so that your identity is never required — but no online service can promise absolute anonymity, and
          we explain the limits below.
        </p>
        <h3>Your Persona ID and recovery secret</h3>
        <ul>
          <li>When you start, our server creates a random Persona ID (for example IMP-7K3Q-9XWD-2MRA) and a separate recovery secret.</li>
          <li>The Persona ID only identifies your private space. The recovery secret is what lets you in. It is stored only as a one-way hash, so no one at Imela can see or recover it.</li>
          <li>If you lose your recovery secret, we cannot restore access. We do not offer email or phone recovery, because that would require identifying you.</li>
          <li>You can issue a new recovery secret from your space at any time. Doing so signs out every session.</li>
        </ul>
        <h3>What we store</h3>
        <ul>
          <li>The support categories you choose, anything you write, messages between you and counsellors, and resources they share with you.</li>
          <li>Timestamps of your conversations, and the date (not time) you were last active.</li>
          <li>For counsellors only: internal case notes, how your conversation was routed (for example to a grief or relationships queue) and whether it was flagged for prompt review. You never need to provide your identity for any of this.</li>
        </ul>
        <h3>Who can see it</h3>
        <ul>
          <li>Imela counsellors who are assigned to, or picking up, your conversation, and Imela administrators. They see your Persona ID, not your identity.</li>
          <li>Every time a staff member opens, assigns, replies to or adds a note to a conversation, that action is recorded in an access log.</li>
          <li>Other people using Imela Persona can never see your space.</li>
        </ul>
        <h3>The honest limits of anonymity</h3>
        <ul>
          <li>Like any website, our hosting provider and sign-in system (Supabase) record technical data such as IP addresses in their own security logs. We do not copy these into your counselling records and do not use them to identify you.</li>
          <li>Anything you choose to write — such as names, places or your workplace — can identify you to the counsellors handling your case.</li>
          <li>If what you write suggests that someone may be at serious and imminent risk, a counsellor reviews it promptly and follows Imela's safeguarding process. Because we do not know who you are, we cannot send emergency help to you — please contact emergency services if you are in danger.</li>
          <li>Imela may be required to disclose information where Kenyan law requires it.</li>
        </ul>
        <h3>How long we keep it, and deleting it</h3>
        <ul>
          <li>Imela's policy is to delete closed conversations 12 months after they close, using a scheduled clean-up.</li>
          <li>You can permanently delete your Persona — including every conversation, message and resource — from your space's settings at any time.</li>
          <li>Your sign-in session is kept only in this browser tab's memory (or, if you choose, until the tab closes), and ends automatically after 15 minutes without activity.</li>
        </ul>
        <h3>Exploring privately first</h3>
        <p>
          The separate “explore privately” guide runs entirely in your browser. What you type there is held in memory only, is not sent to our servers and is
          not connected to any Persona ID. If Imela switches on optional AI reflections there, they are used only if you actively agree, and your recent
          messages are then sent to Imela's server function and a third-party AI provider to write a reply; they are not stored by Imela or used for
          advertising. Suggestions always come from Imela's own service list.
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
