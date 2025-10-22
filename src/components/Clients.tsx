import React, { useEffect, useRef, useState } from 'react';
import { Building2, Award, Users, Globe } from 'lucide-react';

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

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Marquee keyframes for infinite horizontal scroll */
  @keyframes marqueeScroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .marquee-container {
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  .marquee-track {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    width: max-content;
    animation: marqueeScroll 60s linear infinite;
  }

  .marquee-item {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 180px;
    height: 80px;
    border-radius: 0.5rem;
    background: #f9fafb;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    margin: 0 0.5rem;
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

  .animate-slide-in {
    animation: slideIn 0.8s ease-out forwards;
  }

  .animate-delay-100 {
    animation-delay: 0.1s;
  }

  .animate-delay-200 {
    animation-delay: 0.2s;
  }

  .animate-delay-300 {
    animation-delay: 0.3s;
  }

  .animate-delay-400 {
    animation-delay: 0.4s;
  }

  .animate-delay-500 {
    animation-delay: 0.5s;
  }

  .animate-delay-600 {
    animation-delay: 0.6s;
  }

  .animate-delay-700 {
    animation-delay: 0.7s;
  }

  .animate-delay-800 {
    animation-delay: 0.8s;
  }

  .animate-delay-900 {
    animation-delay: 0.9s;
  }

  .animate-delay-1000 {
    animation-delay: 1s;
  }

  .animate-delay-1100 {
    animation-delay: 1.1s;
  }

  .animate-delay-1200 {
    animation-delay: 1.2s;
  }

  .animate-delay-1300 {
    animation-delay: 1.3s;
  }

  .animate-delay-1400 {
    animation-delay: 1.4s;
  }

  .animate-delay-1500 {
    animation-delay: 1.5s;
  }

  .animate-delay-1600 {
    animation-delay: 1.6s;
  }

  .animate-delay-1700 {
    animation-delay: 1.7s;
  }

  .animate-delay-1800 {
    animation-delay: 1.8s;
  }

  .animate-delay-1900 {
    animation-delay: 1.9s;
  }

  .animate-delay-2000 {
    animation-delay: 2s;
  }
`;

const Clients: React.FC = () => {
  // Animation refs
  const [headerRef, isHeaderVisible] = useIntersectionObserver();
  const [statsRef, isStatsVisible] = useIntersectionObserver();
  const [logosRef, isLogosVisible] = useIntersectionObserver();

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

  const clients = [
    { name: 'Africa Healthcare Network', logo: '/clients/africa healthcare.png' },
    { name: 'Amraan', logo: '/clients/amraan.png' },
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
    { name: 'Wildlife Works', logo: '/clients/wildlife.png' }
  ];

  const stats = [
    { icon: <Building2 className="h-6 w-6" />, value: '15+', label: 'Client Organizations' },
    { icon: <Award className="h-6 w-6" />, value: '8', label: 'Industries Served' },
    { icon: <Users className="h-6 w-6" />, value: '500+', label: 'Employees Trained' },
    { icon: <Globe className="h-6 w-6" />, value: '11', label: 'Countries' }
  ];

  const categories = [
    'Government', 'Non-Profit', 'Education', 'Healthcare', 
    'Agriculture', 'Faith-Based', 'Legal', 'Research', 
    'Retail', 'Professional Services', 'Business', 'Media', 
    'Food & Beverage', 'Consulting'
  ];

  return (
    <section id="clients" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className={`text-center mb-12 ${isHeaderVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Clients
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're proud to work with leading organizations across diverse industries, 
            helping them achieve their goals through our expertise in psychology and leadership development.
          </p>
        </div>

        {/* Statistics */}
        <div ref={statsRef} className={`grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 ${isStatsVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`}>
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 text-center animate-scale-in`}
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

        {/* Client Logos Marquee */}
        <div ref={logosRef} className={`${isLogosVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`}>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Valued Clients</h3>
            <div className="marquee-container">
              <div className="marquee-track">
                {[...clients, ...clients].map((client, index) => (
                  <div key={`${client.name}-${index}`} className="marquee-item">
                    <img 
                      src={client.logo}
                      alt={`${client.name} logo`}
                      className="max-h-640 max-w-570 object-contain"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const container = target.parentElement;
                        if (container) {
                          container.innerHTML = `<div class=\"w-full h-full flex items-center justify-center text-center px-2 text-xs text-gray-500\">${client.name}</div>`;
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Industries Served */}
        <div className={`mt-16 ${isLogosVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
          <div className="bg-gradient-to-r from-[#3AAFA9] to-[#339B95] rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">Industries We Serve</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category, index) => (
                <span 
                  key={category}
                  className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-30 transition-all duration-200 cursor-pointer"
                  style={{ animationDelay: `${index * 0.05 + 0.6}s` }}
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Client Testimonials */}
        <div className={`mt-16 ${isLogosVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">What Our Clients Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Testimonial 1 - Healthcare */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#3AAFA9] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    AH
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Dr. Sarah Mwangi</h4>
                    <p className="text-sm text-gray-600">Medical Director, Dawa Kenya</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "The leadership development program transformed our management team. We saw a 40% improvement in staff retention and a significant boost in team collaboration. The psychological insights provided were invaluable for our healthcare environment."
                </p>
                <div className="flex text-yellow-400 mt-3">
                  {'★'.repeat(5)}
                </div>
              </div>

              {/* Testimonial 2 - Education */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#3AAFA9] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    ML
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">David Mbehi</h4>
                    <p className="text-sm text-gray-600">Founder, AFRE AI </p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Working with Imela Ventures helped us develop a comprehensive mental health support system for our team. The counseling strategies and leadership training resulted in a 60% reduction in student stress-related issues."
                </p>
                <div className="flex text-yellow-400 mt-3">
                  {'★'.repeat(5)}
                </div>
              </div>

              {/* Testimonial 3 - Legal/Non-profit */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#3AAFA9] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    KN
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Advocate Grace Wanjiku</h4>
                    <p className="text-sm text-gray-600">Executive Director, Jirani Limited</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "The trauma-informed counseling approach and leadership development program revolutionized how we support our community. Our team's emotional intelligence and conflict resolution skills improved dramatically."
                </p>
                <div className="flex text-yellow-400 mt-3">
                  {'★'.repeat(5)}
                </div>
              </div>

              {/* Testimonial 4 - Corporate */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#3AAFA9] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    PK
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Jane Ndung'u</h4>
                    <p className="text-sm text-gray-600">HR Director, Tribe Africa</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "The executive coaching and organizational psychology insights helped us create a more inclusive and productive workplace. Employee satisfaction increased by 45% and our leadership pipeline is stronger than ever."
                </p>
                <div className="flex text-yellow-400 mt-3">
                  {'★'.repeat(5)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 ${isLogosVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1.2s' }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2" style={{ borderColor: '#3AAFA9' }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Join Our Client Family?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Discover how our expertise in psychology and leadership development can transform 
              your organization and drive sustainable growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  const navigateEvent = new CustomEvent('navigate', { detail: 'contact' });
                  window.dispatchEvent(navigateEvent);
                }}
                className="bg-[#3AAFA9] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#339B95] transition-colors duration-200 inline-flex items-center justify-center"
              >
                <Building2 className="h-5 w-5 mr-2" />
                Get Started Today
              </button>
              <button 
                onClick={() => {
                  const navigateEvent = new CustomEvent('navigate', { detail: 'about' });
                  window.dispatchEvent(navigateEvent);
                }}
                className="border-2 text-[#3AAFA9] px-8 py-3 rounded-lg font-semibold hover:bg-[#3AAFA9] hover:text-white transition-colors duration-200 inline-flex items-center justify-center"
                style={{ borderColor: '#3AAFA9' }}
              >
                Learn More About Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Clients;
