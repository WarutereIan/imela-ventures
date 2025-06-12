import React from 'react';
import { Target, Phone, Mail, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react';
import logo from '../images/logo.png';

interface FooterProps {
  setActiveSection: (section: string) => void;
}

const Footer: React.FC<FooterProps> = ({ setActiveSection }) => {
  const quickLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ];

  const services = [
    'Leadership Development',
    'Culture Transformation',
    'Personalized Counseling',
    'Conflict Resolution',
    'Culture Audits',
    'Corporate Training'
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="Imela Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold">Imela Ventures</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Empowering individuals and organizations through psychological counseling and 
              corporate training to enhance well-being, resilience, and leadership excellence.
            </p>
            <div className="flex space-x-4">
              <Linkedin 
                className="h-6 w-6 text-gray-400 cursor-pointer transition-colors duration-200"
                onMouseEnter={(e) => e.currentTarget.style.color = '#3AAFA9'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
              />
              <Twitter 
                className="h-6 w-6 text-gray-400 cursor-pointer transition-colors duration-200"
                onMouseEnter={(e) => e.currentTarget.style.color = '#3AAFA9'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
              />
              <Facebook 
                className="h-6 w-6 text-gray-400 cursor-pointer transition-colors duration-200"
                onMouseEnter={(e) => e.currentTarget.style.color = '#3AAFA9'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => setActiveSection(link.id)}
                    className="text-gray-300 transition-colors duration-200"
                    onMouseEnter={(e) => e.currentTarget.style.color = '#3AAFA9'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <span className="text-gray-300">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 mt-1 flex-shrink-0" style={{ color: '#3AAFA9' }} />
                <div>
                  <p className="text-gray-300">Nairobi, Kenya</p>
                  <p className="text-gray-400 text-sm">Serving East Africa</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 flex-shrink-0" style={{ color: '#3AAFA9' }} />
                <p className="text-gray-300">info@imelaventures.com</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 flex-shrink-0" style={{ color: '#3AAFA9' }} />
                <p className="text-gray-300">+254 721 803 569</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Imela Ventures. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Professional Ethics
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="py-4" style={{ backgroundColor: '#2D5A58' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm" style={{ color: '#B8E6E3' }}>
            <strong>Our Mission:</strong> Empowering organizations through psychological counseling and 
            corporate training to enhance employee well-being, resilience, and leadership skills.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;