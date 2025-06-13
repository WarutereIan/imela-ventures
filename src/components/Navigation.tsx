import React, { useState } from 'react';
import { Menu, X, Target } from 'lucide-react';
import logo from '../images/logo.png';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, setActiveSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'client-groups', label: 'Client Groups' },
    { id: 'about', label: 'About' },
    { id: 'articles', label: 'Articles & Resources' },
    { id: 'booking', label: 'Book Session' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (sectionId: string) => {
    // Use the custom navigation event system
    const navigateEvent = new CustomEvent('navigate', {
      detail: sectionId
    });
    window.dispatchEvent(navigateEvent);
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;