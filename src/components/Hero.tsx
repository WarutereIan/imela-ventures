import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Phone, Mail, Users, TrendingUp, Shield } from 'lucide-react';

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

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
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

const Hero: React.FC = () => {
  const [contentRef, isContentVisible] = useIntersectionObserver();
  const [imageRef, isImageVisible] = useIntersectionObserver();

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

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div ref={contentRef} className="space-y-6">
            <div className={`space-y-3 ${isContentVisible ? 'opacity-0 animate-fade-in-left' : 'opacity-0'}`}>
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Professional Therapy
                <span className="text-[#3AAFA9] block">& Counseling Services</span>
                for Individuals & Organizations
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Expert psychological counseling for adults, teens, and couples, plus comprehensive 
                corporate training programs to enhance well-being, resilience, and leadership excellence.
              </p>
            </div>

            {/* Value Props */}
            <div className={`grid grid-cols-3 gap-4 py-4 ${isContentVisible ? 'opacity-0 animate-fade-in-up animate-delay-200' : 'opacity-0'}`}>
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-1.5" style={{ color: '#3AAFA9' }} />
                <div className="text-xs text-gray-600">Individual Therapy</div>
              </div>
              <div className="text-center">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1.5" />
                <div className="text-xs text-gray-600">Couples Counseling</div>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 text-purple-600 mx-auto mb-1.5" />
                <div className="text-xs text-gray-600">Teen Support</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-3 ${isContentVisible ? 'opacity-0 animate-fade-in-up animate-delay-400' : 'opacity-0'}`}>
              <button 
                onClick={() => window.scrollTo({ top: document.getElementById('client-groups')?.offsetTop || 0, behavior: 'smooth' })}
                className="text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center group"
                style={{ backgroundColor: '#3AAFA9' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#339B95'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
              >
                Explore Our Services
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button 
                onClick={() => {
                  const event = new CustomEvent('navigate', { detail: 'booking' });
                  window.dispatchEvent(event);
                }}
                className="border-2 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
                style={{ borderColor: '#d1d5db' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3AAFA9';
                  e.currentTarget.style.color = '#3AAFA9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.color = '#374151';
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Book Session
              </button>
            </div>

            {/* Trust Indicators */}
            <div className={`pt-3 ${isContentVisible ? 'opacity-0 animate-fade-in-up animate-delay-600' : 'opacity-0'}`}>
              <p className="text-xs text-gray-500 mb-2">Based in Nairobi, Kenya</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-xs font-medium text-gray-700">Expert Leadership Training</span>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-xs font-medium text-gray-700">Confidential Counseling</span>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-xs font-medium text-gray-700">Culture Transformation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div ref={imageRef} className="relative">
            <div className={`aspect-[4/3] rounded-xl overflow-hidden shadow-xl ${isImageVisible ? 'opacity-0 animate-fade-in-right' : 'opacity-0'}`}>
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Professional corporate training environment"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating elements */}
            <div className={`absolute -top-2 -right-2 bg-white p-3 rounded-lg shadow-lg ${isImageVisible ? 'opacity-0 animate-fade-in animate-delay-400' : 'opacity-0'}`}>
              <div className="text-lg font-bold" style={{ color: '#3AAFA9' }}>100%</div>
              <div className="text-xs text-gray-600">Confidential</div>
            </div>
            <div className={`absolute -bottom-2 -left-2 bg-white p-3 rounded-lg shadow-lg ${isImageVisible ? 'opacity-0 animate-fade-in animate-delay-600' : 'opacity-0'}`}>
              <div className="text-lg font-bold text-green-600">Expert</div>
              <div className="text-xs text-gray-600">Training</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;