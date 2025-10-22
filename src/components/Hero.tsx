import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Phone, Mail, Users, TrendingUp, Shield, Building2, Heart, Target } from 'lucide-react';
import { PersonaType } from '../App';

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

interface HeroProps {
  selectedPersona: PersonaType;
  setSelectedPersona: (persona: PersonaType) => void;
}

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

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
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

  .animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.6s ease-out forwards;
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
`;

const Hero: React.FC<HeroProps> = ({ selectedPersona, setSelectedPersona }) => {
  const [contentRef, isContentVisible] = useIntersectionObserver();

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

  const handlePersonaSelect = (persona: PersonaType) => {
    setSelectedPersona(persona);
    const personaEvent = new CustomEvent('personaChange', {
      detail: persona
    });
    window.dispatchEvent(personaEvent);
  };

  const navigateToSection = (section: string) => {
    const navigateEvent = new CustomEvent('navigate', {
      detail: section
    });
    window.dispatchEvent(navigateEvent);
  };

  // Persona selection view (when no persona is selected)
  if (!selectedPersona) {
    return (
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={contentRef} className="text-center">
            {/* Main Header */}
            <div className={`space-y-6 mb-12 ${isContentVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`}>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Empowering You
                <span className="text-[#3AAFA9] block">Personally</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Professional therapy and counseling for individuals, couples, and families.
              </p>
            </div>

            {/* Persona Selection Cards */}
            <div className={`grid md:grid-cols-2 gap-8 max-w-4xl mx-auto ${isContentVisible ? 'opacity-0 animate-fade-in-up animate-delay-400' : 'opacity-0'}`}>
              {/* Personal Services Card */}
              <div 
                onClick={() => handlePersonaSelect('personal')}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#3AAFA9] transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="bg-[#3AAFA9] bg-opacity-10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-opacity-20 transition-all duration-300">
                    <Users className="h-10 w-10 text-[#3AAFA9]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Personal Services</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Individual therapy, couples counseling, and family support sessions tailored to your personal needs.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-6">
                    <div className="flex items-center justify-center">
                      <Heart className="h-4 w-4 mr-2 text-[#3AAFA9]" />
                      Individual & Couples Therapy
                    </div>
                    <div className="flex items-center justify-center">
                      <Shield className="h-4 w-4 mr-2 text-[#3AAFA9]" />
                      Teen & Family Support
                    </div>
                  </div>
                  <div className="bg-[#3AAFA9] text-white px-6 py-3 rounded-lg font-semibold group-hover:bg-[#339B95] transition-colors duration-200 inline-flex items-center">
                    Get Personal Support
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </div>

              {/* Corporate Services Card */}
              <div 
                onClick={() => handlePersonaSelect('corporate')}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#3AAFA9] transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="bg-[#3AAFA9] bg-opacity-10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-opacity-20 transition-all duration-300">
                    <Building2 className="h-10 w-10 text-[#3AAFA9]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Corporate Services</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Employee wellbeing programs, leadership training, and organizational development workshops.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-6">
                    <div className="flex items-center justify-center">
                      <Target className="h-4 w-4 mr-2 text-[#3AAFA9]" />
                      Leadership Development
                    </div>
                    <div className="flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-[#3AAFA9]" />
                      Employee Wellbeing
                    </div>
                  </div>
                  <div className="bg-[#3AAFA9] text-white px-6 py-3 rounded-lg font-semibold group-hover:bg-[#339B95] transition-colors duration-200 inline-flex items-center">
                    Enhance Your Team
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className={`pt-12 ${isContentVisible ? 'opacity-0 animate-fade-in-up animate-delay-800' : 'opacity-0'}`}>
              <p className="text-sm text-gray-500 mb-4">Based in Nairobi, Kenya</p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-700">Expert Leadership Training</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-700">Confidential Counseling</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-700">Professional Excellence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Persona-specific hero content (when persona is selected)
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div ref={contentRef} className="space-y-6">
            <div className={`space-y-3 ${isContentVisible ? 'opacity-0 animate-fade-in-left' : 'opacity-0'}`}>
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {selectedPersona === 'personal' ? (
                  <>
                    Professional Therapy
                    <span className="text-[#3AAFA9] block">& Counseling Services</span>
                    for Individuals & Families
                  </>
                ) : (
                  <>
                    Corporate Training
                    <span className="text-[#3AAFA9] block">& Employee Wellbeing</span>
                    for Organizations
                  </>
                )}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {selectedPersona === 'personal' 
                  ? 'Expert psychological counseling for adults, teens, and couples. Providing a safe and confidential space to explore thoughts, emotions, and personal growth.'
                  : 'Comprehensive corporate training programs to enhance employee well-being, resilience, and leadership excellence. Transform your organizational culture.'
                }
              </p>
            </div>

            {/* Value Props */}
            <div className={`grid grid-cols-3 gap-4 py-4 ${isContentVisible ? 'opacity-0 animate-fade-in-up animate-delay-200' : 'opacity-0'}`}>
              {selectedPersona === 'personal' ? (
                <>
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-1.5" style={{ color: '#3AAFA9' }} />
                    <div className="text-xs text-gray-600">Individual Therapy</div>
                  </div>
                  <div className="text-center">
                    <Heart className="h-6 w-6 text-red-500 mx-auto mb-1.5" />
                    <div className="text-xs text-gray-600">Couples Counseling</div>
                  </div>
                  <div className="text-center">
                    <Shield className="h-6 w-6 text-purple-600 mx-auto mb-1.5" />
                    <div className="text-xs text-gray-600">Teen Support</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <Target className="h-6 w-6 mx-auto mb-1.5" style={{ color: '#3AAFA9' }} />
                    <div className="text-xs text-gray-600">Leadership Training</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1.5" />
                    <div className="text-xs text-gray-600">Team Building</div>
                  </div>
                  <div className="text-center">
                    <Building2 className="h-6 w-6 text-blue-600 mx-auto mb-1.5" />
                    <div className="text-xs text-gray-600">Corporate Wellness</div>
                  </div>
                </>
              )}
            </div>

            {/* Enhanced CTA Buttons */}
            <div className={`space-y-4 ${isContentVisible ? 'opacity-0 animate-fade-in-up animate-delay-400' : 'opacity-0'}`}>
              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => navigateToSection('booking')}
                  className="bg-gradient-to-r from-[#3AAFA9] to-[#339B95] text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-[#339B95] hover:to-[#2A8B87] transition-all duration-300 flex items-center justify-center group shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-1"
                >
                  🚀 {selectedPersona === 'personal' ? 'Book FREE Consultation Now' : 'Get FREE Discovery Call'}
                  <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
                <button 
                  onClick={() => navigateToSection('services')}
                  className="border-2 text-[#3AAFA9] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#3AAFA9] hover:text-white transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{ borderColor: '#3AAFA9' }}
                >
                  📋 View Our Services
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>

              {/* Urgency & Trust Elements */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-semibold">FREE Initial Consultation</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-semibold">24-Hour Response</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-semibold">No Commitment</span>
                </div>
              </div>

              {/* Secondary CTA */}
              <div className="text-center">
                <button 
                  onClick={() => navigateToSection('contact')}
                  className="text-[#3AAFA9] hover:text-[#339B95] font-semibold underline transition-colors duration-200"
                >
                  📞 Or call us directly: +254 721 803 569
                </button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className={`pt-3 ${isContentVisible ? 'opacity-0 animate-fade-in-up animate-delay-600' : 'opacity-0'}`}>
              <p className="text-xs text-gray-500 mb-2">Based in Nairobi, Kenya</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-xs font-medium text-gray-700">
                    {selectedPersona === 'personal' ? 'Licensed Therapists' : 'Expert Training'}
                  </span>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-xs font-medium text-gray-700">Confidential Sessions</span>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-xs font-medium text-gray-700">Professional Excellence</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Visual Content */}
          <div className={`${isContentVisible ? 'opacity-0 animate-fade-in-right animate-delay-200' : 'opacity-0'}`}>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 text-center border border-gray-100">
              {/* Hero Image */}
              <div className="relative mb-6">
                <img
                  src={selectedPersona === 'personal' 
                    ? 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=600'
                    : 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600'
                  }
                  alt={selectedPersona === 'personal' ? 'Professional counseling session' : 'Corporate training workshop'}
                  className="w-full h-48 object-cover rounded-xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-2 text-sm font-semibold text-gray-800">
                      {selectedPersona === 'personal' ? (
                        <>
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>Licensed Therapists</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="h-4 w-4 text-[#3AAFA9]" />
                          <span>Expert Training</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#3AAFA9]/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-[#3AAFA9] mb-1">
                    {selectedPersona === 'personal' ? '500+' : '200+'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedPersona === 'personal' ? 'Lives Transformed' : 'Organizations Helped'}
                  </div>
                </div>
                <div className="bg-green-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600 mb-1">15+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {selectedPersona === 'personal' ? 'Personalized Care' : 'Transform Your Organization'}
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedPersona === 'personal' 
                  ? 'Every session is tailored to your unique needs and goals.'
                  : 'Evidence-based programs that drive measurable results.'
                }
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                  ✓ Licensed
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                  ✓ Confidential
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                  ✓ Proven Results
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;