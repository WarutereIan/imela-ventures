import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Services from './components/Services';
import ClientGroups from './components/ClientGroups';
import About from './components/About';
import Contact from './components/Contact';
import Booking from './components/Booking';
import MemberPortal from './components/MemberPortal';
import Footer from './components/Footer';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      setActiveSection(e.detail);
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'services':
        return <Services />;
      case 'client-groups':
        return <ClientGroups />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'booking':
        return <Booking />;
      case 'member-portal':
        return <MemberPortal />;
      default:
        return (
          <>
            <Hero />
            <Services />
            <ClientGroups />
            <About />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <main>
        {renderActiveSection()}
      </main>
      <Footer setActiveSection={setActiveSection} />
    </div>
  );
}

export default App;