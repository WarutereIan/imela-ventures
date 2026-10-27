/**
 * Facts about Imela Ventures taken from the published company profile and the
 * previous website. Anything not listed here should not be stated as fact.
 */
export const ORG = {
  name: 'Imela Ventures',
  tagline: 'Together creating a new reality',
  phoneDisplay: '+254 721 803 569',
  phoneHref: 'tel:+254721803569',
  email: 'mwangikaren77@gmail.com',
  postalAddress: 'P.O. Box 176-00502, Nairobi, Kenya',
  city: 'Nairobi, Kenya',
  website: 'www.imelaventures.com',
  timeZone: 'Africa/Nairobi',
  mission:
    'To empower individuals and teams to overcome challenges, build resilience, and achieve their full potential — through personalised counselling and tailored corporate solutions that promote mental health and psychological wellbeing.',
  vision:
    'To be the catalyst for positive transformation in workplaces by nurturing a culture of psychological well-being, innovation, and leadership excellence.',
  values: [
    {
      title: 'Empathy',
      text: 'Understanding and valuing the unique experiences and challenges of every individual.',
    },
    {
      title: 'Growth',
      text: 'Continuous learning, personal development and professional growth for individuals and teams alike.',
    },
    {
      title: 'Resilience',
      text: 'Helping people and organisations overcome obstacles and adapt to change with strength.',
    },
    {
      title: 'Integrity',
      text: 'The highest ethical standards — honesty, transparency and confidentiality in every interaction.',
    },
    {
      title: 'Innovation',
      text: 'Creativity and novel solutions, fostering a culture of adaptability and progress.',
    },
  ],
  /** Countries listed under "Our reach" in the company profile. */
  reach: ['Kenya', 'Tanzania', 'Uganda', 'Bahrain', 'United Kingdom', 'Austria', 'United States', 'Jamaica', 'Australia'],
  /** Organisations shown on the previous website's client wall. */
  clients: [
    { name: 'Africa Healthcare Network', logo: '/clients/africa healthcare.png' },
    { name: 'Armaan', logo: '/clients/amraan.png' },
    { name: "Brown's Food Co", logo: '/clients/browns.png' },
    { name: 'DBK', logo: '/clients/dbk.png' },
    { name: 'Heads', logo: '/clients/heads.png' },
    { name: 'Katiba Institute', logo: '/clients/katiba.png' },
    { name: 'Media Pal', logo: '/clients/media pal.png' },
    { name: 'Mizizi Learning Hub', logo: '/clients/mizizi.png' },
    { name: 'Namati', logo: '/clients/namati.png' },
    { name: 'Newmark', logo: '/clients/newmark.png' },
    { name: 'NRB', logo: '/clients/nrb.png' },
    { name: 'Parker Randall', logo: '/clients/parker.png' },
    { name: 'Spring Valley', logo: '/clients/spring valley.png' },
    { name: 'USAID', logo: '/clients/usaid.png' },
    { name: 'Wildlife Works', logo: '/clients/wildlife.png' },
  ],
} as const;
