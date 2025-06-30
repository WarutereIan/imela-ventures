import React, { useState } from 'react';
import { Menu, X, Target, Users, Building2 } from 'lucide-react';
import logo from '../images/logo.png';
import { PersonaType } from '../App';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  selectedPersona: PersonaType;
  setSelectedPersona: (persona: PersonaType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeSection, 
  setActiveSection, 
  selectedPersona, 
  setSelectedPersona 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Persona-specific navigation items
  const getNavItems = () => {
    if (!selectedPersona) {
      return [
        { id: 'home', label: 'Home' },
        { id: 'about', label: 'About Us' },
        { id: 'contact', label: 'Contact' },
      ];
    }

    const commonItems = [
      { id: 'home', label: 'Home' },
      { id: 'services', label: selectedPersona === 'personal' ? 'Personal Therapy' : 'Corporate Services' },
      { id: 'about', label: 'About Us' },
      { id: 'meet-team', label: 'Meet the Team' },
      { id: 'articles', label: 'Resources' },
      { id: 'contact', label: 'Contact' },
    ];

    if (selectedPersona === 'personal') {
      commonItems.splice(-1, 0, { id: 'booking', label: 'Book Session' });
    } else {
      commonItems.splice(-1, 0, { id: 'booking', label: 'Schedule Workshop' });
    }

    return commonItems;
  };

  const navItems = getNavItems();

  const handleNavClick = (sectionId: string) => {
    const navigateEvent = new CustomEvent('navigate', {
      detail: sectionId
    });
    window.dispatchEvent(navigateEvent);
    setIsMenuOpen(false);
  };

  const handlePersonaChange = (persona: PersonaType) => {
    const personaEvent = new CustomEvent('personaChange', {
      detail: persona
    });
    window.dispatchEvent(personaEvent);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo - Far Left */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => handleNavClick('home')}
          >
            <img src={logo} alt="Imela Logo" className="h-12 w-auto" />
          </div>

          {/* Persona Switch - Only show when persona is selected */}
          {selectedPersona && (
            <div className="hidden md:flex ml-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handlePersonaChange('personal')}
                  className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedPersona === 'personal'
                      ? 'bg-white shadow-sm text-[#3AAFA9]'
                      : 'text-gray-600 hover:text-[#3AAFA9]'
                  }`}
                >
                  <Users className="h-4 w-4 mr-1.5" />
                  Personal
                </button>
                <button
                  onClick={() => handlePersonaChange('corporate')}
                  className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedPersona === 'corporate'
                      ? 'bg-white shadow-sm text-[#3AAFA9]'
                      : 'text-gray-600 hover:text-[#3AAFA9]'
                  }`}
                >
                  <Building2 className="h-4 w-4 mr-1.5" />
                  Corporate
                </button>
              </div>
            </div>
          )}

          {/* Desktop Navigation - Centered and Spread Out */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex justify-between max-w-4xl w-full px-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={activeSection === item.id ? { 
                  backgroundColor: '#E6F7F6', 
                  color: '#3AAFA9' 
                } : undefined}
                onMouseEnter={activeSection !== item.id ? (e) => e.currentTarget.style.color = '#3AAFA9' : undefined}
                onMouseLeave={activeSection !== item.id ? (e) => e.currentTarget.style.color = '#374151' : undefined}
              >
                {item.label}
              </button>
            ))}
            </div>
          </div>

          {/* Primary CTA Button */}
          {selectedPersona && (
            <div className="hidden md:block ml-4">
              <button
                onClick={() => handleNavClick('booking')}
                className="bg-[#3AAFA9] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 hover:bg-[#339B95]"
              >
                {selectedPersona === 'personal' ? 'Schedule Consultation' : 'Book Workshop'}
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden ml-auto">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-white p-2"
              onMouseEnter={(e) => e.currentTarget.style.color = '#3AAFA9'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {/* Mobile Persona Switcher */}
              {selectedPersona && (
                <div className="mb-4 px-3">
                  <p className="text-xs text-gray-500 mb-2">Switch Mode:</p>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => handlePersonaChange('personal')}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        selectedPersona === 'personal'
                          ? 'bg-white shadow-sm text-[#3AAFA9]'
                          : 'text-gray-600'
                      }`}
                    >
                      <Users className="h-4 w-4 mr-1.5" />
                      Personal
                    </button>
                    <button
                      onClick={() => handlePersonaChange('corporate')}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        selectedPersona === 'corporate'
                          ? 'bg-white shadow-sm text-[#3AAFA9]'
                          : 'text-gray-600'
                      }`}
                    >
                      <Building2 className="h-4 w-4 mr-1.5" />
                      Corporate
                    </button>
                  </div>
                </div>
              )}

              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={activeSection === item.id ? { 
                    backgroundColor: '#E6F7F6', 
                    color: '#3AAFA9' 
                  } : undefined}
                  onMouseEnter={activeSection !== item.id ? (e) => e.currentTarget.style.color = '#3AAFA9' : undefined}
                  onMouseLeave={activeSection !== item.id ? (e) => e.currentTarget.style.color = '#374151' : undefined}
                >
                  {item.label}
                </button>
              ))}

              {/* Mobile CTA */}
              {selectedPersona && (
                <div className="mt-4 px-3">
                  <button
                    onClick={() => handleNavClick('booking')}
                    className="w-full bg-[#3AAFA9] text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors duration-200 hover:bg-[#339B95]"
                  >
                    {selectedPersona === 'personal' ? 'Schedule Consultation' : 'Book Workshop'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;