import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Services from './components/Services';
import ClientGroups from './components/ClientGroups';
import About from './components/About';
import Countries from './components/Countries';
import Clients from './components/Clients';
import Contact from './components/Contact';
import Booking from './components/Booking';
import Articles from './components/Articles';
import Footer from './components/Footer';
import Team from './components/Team';

// Define persona types
export type PersonaType = 'personal' | 'corporate' | null;

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>(null);

  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      setActiveSection(e.detail);
      
      // Scroll to top of page smoothly when navigating between sections
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    const handlePersonaChange = (e: CustomEvent) => {
      setSelectedPersona(e.detail);
      // Reset to home when persona changes
      setActiveSection('home');
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    window.addEventListener('personaChange', handlePersonaChange as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
      window.removeEventListener('personaChange', handlePersonaChange as EventListener);
    };
  }, []);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'services':
        return <Services selectedPersona={selectedPersona} />;
      case 'client-groups':
        return <ClientGroups selectedPersona={selectedPersona} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'booking':
        return <Booking selectedPersona={selectedPersona} />;
      case 'articles':
        return <Articles selectedPersona={selectedPersona} />;
      case 'meet-team':
        return <Team />;
      default:
        return (
          <>
            <Hero selectedPersona={selectedPersona} setSelectedPersona={setSelectedPersona} />
            {selectedPersona && (
              <>
                <Services selectedPersona={selectedPersona} />
                <ClientGroups selectedPersona={selectedPersona} />
                <About />
                <Countries />
                <Clients />
              </>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        selectedPersona={selectedPersona}
        setSelectedPersona={setSelectedPersona}
      />
      <main>
        {renderActiveSection()}
      </main>
      <Footer setActiveSection={setActiveSection} selectedPersona={selectedPersona} />
    </div>
  );
}

export default App;