import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Globe, Users, Award } from 'lucide-react';

// Custom hook for intersection observer
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isVisible] as const;
};

// CSS animations
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .animate-fade-in-left {
    animation: fadeInLeft 0.8s ease-out forwards;
  }

  .animate-fade-in-right {
    animation: fadeInRight 0.8s ease-out forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.6s ease-out forwards;
  }

  .animate-pulse-slow {
    animation: pulse 3s ease-in-out infinite;
  }

  .animate-delay-200 {
    animation-delay: 0.2s;
  }

  .animate-delay-400 {
    animation-delay: 0.4s;
  }

  .animate-delay-600 {
    animation-delay: 0.6s;
  }

  .animate-delay-800 {
    animation-delay: 0.8s;
  }

  .animate-delay-1000 {
    animation-delay: 1s;
  }

  .animate-delay-1200 {
    animation-delay: 1.2s;
  }
`;

const Countries: React.FC = () => {
  // Animation refs
  const [headerRef, isHeaderVisible] = useIntersectionObserver();
  const [mapRef, isMapVisible] = useIntersectionObserver();
  const [statsRef, isStatsVisible] = useIntersectionObserver();
  
  // State for expanded regions
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  // Inject CSS animations
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = animationStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  const countries = [
    { name: 'Kenya', region: 'East Africa', flag: '🇰🇪', coordinates: { x: 55, y: 75 } },
    { name: 'Uganda', region: 'East Africa', flag: '🇺🇬', coordinates: { x: 58, y: 78 } },
    { name: 'South Sudan', region: 'East Africa', flag: '🇸🇸', coordinates: { x: 56, y: 70 } },
    { name: 'Bahrain', region: 'Middle East', flag: '🇧🇭', coordinates: { x: 65, y: 60 } },
    { name: 'United States', region: 'North America', flag: '🇺🇸', coordinates: { x: 20, y: 45 } },
    { name: 'United Kingdom', region: 'Europe', flag: '🇬🇧', coordinates: { x: 48, y: 35 } },
    { name: 'Switzerland', region: 'Europe', flag: '🇨🇭', coordinates: { x: 50, y: 40 } },
    { name: 'Jamaica', region: 'Caribbean', flag: '🇯🇲', coordinates: { x: 25, y: 55 } },
    { name: 'Australia', region: 'Oceania', flag: '🇦🇺', coordinates: { x: 85, y: 85 } },
    { name: 'Austria', region: 'Europe', flag: '🇦🇹', coordinates: { x: 52, y: 42 } },
    { name: 'Canada', region: 'North America', flag: '🇨🇦', coordinates: { x: 18, y: 35 } }
  ];

  const stats = [
    { icon: <Globe className="h-6 w-6" />, value: '11+', label: 'Countries Served' },
    { icon: <Users className="h-6 w-6" />, value: '500+', label: 'Clients Worldwide' },
    { icon: <Award className="h-6 w-6" />, value: '10+', label: 'Years Experience' },
    { icon: <MapPin className="h-6 w-6" />, value: '4', label: 'Continents' }
  ];

  const regions = [
    {
      name: 'East Africa',
      emoji: '🌍',
      countries: ['Kenya', 'Uganda', 'South Sudan'],
      count: 3
    },
    {
      name: 'Europe',
      emoji: '🇪🇺',
      countries: ['United Kingdom', 'Switzerland', 'Austria'],
      count: 3
    },
    {
      name: 'North America',
      emoji: '🇺🇸',
      countries: ['United States', 'Canada'],
      count: 2
    },
    {
      name: 'Other Regions',
      emoji: '🌎',
      countries: ['Bahrain', 'Jamaica', 'Australia'],
      count: 3
    }
  ];

  return (
    <section id="countries" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className={`text-center mb-12 ${isHeaderVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Global Reach & Impact
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We've had the privilege of working with clients across multiple continents, 
            bringing our expertise in psychology and leadership development to organizations worldwide.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Map */}
          <div ref={mapRef} className={`${isMapVisible ? 'opacity-0 animate-fade-in-left' : 'opacity-0'}`}>
            <div className="relative bg-white rounded-2xl shadow-xl p-8 overflow-hidden">
              {/* World Map Background */}
              <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl overflow-hidden">
                {/* Simplified world map using CSS */}
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Simplified continent shapes */}
                    <path d="M15,25 L35,25 L35,45 L25,50 L15,45 Z" fill="#3AAFA9" opacity="0.3" />
                    <path d="M40,20 L60,20 L60,40 L50,45 L40,40 Z" fill="#3AAFA9" opacity="0.3" />
                    <path d="M65,30 L85,30 L85,50 L75,55 L65,50 Z" fill="#3AAFA9" opacity="0.3" />
                    <path d="M20,55 L40,55 L40,75 L30,80 L20,75 Z" fill="#3AAFA9" opacity="0.3" />
                    <path d="M70,60 L90,60 L90,80 L80,85 L70,80 Z" fill="#3AAFA9" opacity="0.3" />
                  </svg>
                </div>

                {/* Country markers */}
                {countries.map((country, index) => (
                  <div
                    key={country.name}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer animate-scale-in`}
                    style={{
                      left: `${country.coordinates.x}%`,
                      top: `${country.coordinates.y}%`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    {/* Pulsing dot */}
                    <div className="relative">
                      <div 
                        className="w-4 h-4 rounded-full animate-pulse-slow"
                        style={{ backgroundColor: '#3AAFA9' }}
                      />
                      <div 
                        className="absolute inset-0 w-4 h-4 rounded-full animate-pulse-slow"
                        style={{ 
                          backgroundColor: '#3AAFA9', 
                          opacity: 0.3,
                          animationDelay: '0.5s'
                        }}
                      />
                    </div>

                    {/* Country tooltip */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{country.flag}</span>
                        <span>{country.name}</span>
                      </div>
                      <div className="text-xs text-gray-300 mt-1">{country.region}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                ))}

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {countries.map((country, index) => (
                    <line
                      key={`line-${index}`}
                      x1="50%"
                      y1="50%"
                      x2={`${country.coordinates.x}%`}
                      y2={`${country.coordinates.y}%`}
                      stroke="#3AAFA9"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      opacity="0.3"
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
                    />
                  ))}
                </svg>
              </div>

              {/* Map legend */}
              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3AAFA9' }}></div>
                  <span className="text-sm text-gray-600">Countries We Serve</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-sm text-gray-600">Global Reach</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Content */}
          <div ref={statsRef} className={`space-y-8 ${isStatsVisible ? 'opacity-0 animate-fade-in-right' : 'opacity-0'}`}>
            {/* Statistics */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className={`bg-white rounded-xl p-6 shadow-lg text-center animate-scale-in`}
                  style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
                >
                  <div className="flex justify-center mb-3" style={{ color: '#3AAFA9' }}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Featured Countries */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Featured Regions</h3>
              <div className="space-y-3">
                {regions.map((region, index) => (
                  <div key={region.name} className="space-y-2">
                    <div 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setExpandedRegion(expandedRegion === region.name ? null : region.name)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{region.emoji}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{region.name}</div>
                          <div className="text-sm text-gray-600">
                            {expandedRegion === region.name 
                              ? 'Click to collapse' 
                              : 'Click to see all countries'
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium" style={{ color: '#3AAFA9' }}>
                          {region.count} Countries
                        </div>
                        <div 
                          className={`transform transition-transform duration-200 ${
                            expandedRegion === region.name ? 'rotate-180' : ''
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded countries list */}
                    {expandedRegion === region.name && (
                      <div className="ml-8 p-3 bg-blue-50 rounded-lg border-l-4" style={{ borderColor: '#3AAFA9' }}>
                        <div className="text-sm font-medium text-gray-700 mb-2">Countries in {region.name}:</div>
                        <div className="flex flex-wrap gap-2">
                          {region.countries.map((country, countryIndex) => (
                            <span 
                              key={countryIndex}
                              className="px-3 py-1 bg-white rounded-full text-sm font-medium shadow-sm"
                              style={{ color: '#3AAFA9', border: '1px solid #3AAFA9' }}
                            >
                              {country}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-[#3AAFA9] to-[#339B95] rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Ready to Work Together?</h3>
              <p className="text-sm opacity-90 mb-4">
                Whether you're in Nairobi or New York, we bring our expertise to your organization.
              </p>
              <button 
                className="bg-white text-[#3AAFA9] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                onClick={() => {
                  const navigateEvent = new CustomEvent('navigate', { detail: 'contact' });
                  window.dispatchEvent(navigateEvent);
                }}
              >
                Get in Touch
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Countries;
