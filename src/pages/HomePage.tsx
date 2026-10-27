import { useDocumentTitle } from '../lib/useDocumentTitle';
import { HomeHero } from './home/HomeHero';
import { CheckIn } from './home/CheckIn';
import { Journey } from './home/Journey';
import { AreasBento, ClosingCta, Confidentiality, Faqs, HowItWorks, Pathways, PersonaFeature, ResourcesTeaser, TeamTeaser } from './home/HomeSections';

export default function HomePage() {
  useDocumentTitle('');
  return (
    <>
      <HomeHero />
      <CheckIn />
      <Journey />
      <Pathways />
      <PersonaFeature />
      <AreasBento />
      <HowItWorks />
      <TeamTeaser />
      <ResourcesTeaser />
      <Confidentiality />
      <Faqs />
      <ClosingCta />
    </>
  );
}
