import React, { useEffect, useRef, useState } from 'react';
import { Award, BookOpen, Users, Target, CheckCircle, MapPin } from 'lucide-react';

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

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .animate-fade-in-left {
    animation: fadeInLeft 0.8s ease-out forwards;
  }

  .animate-fade-in-right {
    animation: fadeInRight 0.8s ease-out forwards;
  }

  .animate-delay-200 {
    animation-delay: 0.2s;
  }

  .animate-delay-400 {
    animation-delay: 0.4s;
  }
`;

const About: React.FC = () => {
  // Animation refs
  const [headerRef, isHeaderVisible] = useIntersectionObserver();
  const [imageRef, isImageVisible] = useIntersectionObserver();
  const [contentRef, isContentVisible] = useIntersectionObserver();

  // Navigation handler
  const handleLearnAboutServices = () => {
    // Navigate to services section
    const navigateEvent = new CustomEvent('navigate', {
      detail: 'services'
    });
    window.dispatchEvent(navigateEvent);
  };

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

  const credentials = [
    { icon: <Award className="h-6 w-6" />, text: 'Experienced Counselor & Leader' },
    { icon: <BookOpen className="h-6 w-6" />, text: 'Corporate Training Specialist' },
    { icon: <Users className="h-6 w-6" />, text: 'Leadership Development Expert' },
    { icon: <Target className="h-6 w-6" />, text: 'Culture Transformation Consultant' }
  ];

  const approaches = [
    'Leadership Theory Integration',
    'Experiential Learning Methods',
    'Comprehensive Culture Audits',
    'Personalized Counseling Approaches',
    'Conflict Resolution Strategies',
    'Mental Health & Well-being Focus'
  ];

  const mission = {
    title: 'Our Mission',
    description: 'To empower individuals and organizations through psychological counseling and corporate training, enhancing employee well-being, resilience, and leadership skills to drive organizational success.'
  };

  const vision = {
    title: 'Our Vision',
    description: 'Creating supportive environments that promote mental health, foster innovation, and develop emotionally intelligent leaders who can navigate the complexities of modern business.'
  };

  return (
    <section id="about" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className={`text-center mb-10 ${isHeaderVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            About Imela Ventures
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A leading psychology and leadership consultancy dedicated to empowering organizations through 
            comprehensive counseling services and transformative leadership development programs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Image */}
          <div ref={imageRef} className={`${isImageVisible ? 'opacity-0 animate-fade-in-left' : 'opacity-0'}`}>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Imela Ventures - Professional counseling and training services"
                className="w-full aspect-[4/3] object-cover rounded-xl shadow-xl"
              />
              <div className="absolute -bottom-3 -right-3 bg-white p-4 rounded-lg shadow-lg">
                <div className="text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-1" style={{ color: '#3AAFA9' }} />
                  <div className="text-xs text-gray-600">Nairobi, Kenya</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className={`space-y-6 ${isContentVisible ? 'opacity-0 animate-fade-in-right animate-delay-200' : 'opacity-0'}`}>
            {/* Mission & Vision */}
            <div className="grid gap-4">
              <div className="rounded-lg p-4 border-2 shadow-md" style={{ backgroundColor: '#E6F7F6', borderColor: '#3AAFA9' }}>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">{mission.title}</h3>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{mission.description}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200 shadow-md">
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">{vision.title}</h3>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{vision.description}</p>
              </div>
            </div>

            {/* Approach */}
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 shadow-md">
              <h3 className="text-lg font-extrabold text-gray-900 mb-4">Our Approach</h3>
              <div className="space-y-3 text-gray-700 leading-relaxed mb-4">
                <p className="text-sm font-medium">
                  At Imela Ventures, we believe that effective leadership and employee well-being 
                  are the cornerstones of organizational success. Our comprehensive approach 
                  integrates various leadership theories with practical, experiential learning 
                  methods to develop strong, emotionally intelligent leaders.
                </p>
                <p className="text-sm font-medium">
                  We conduct thorough culture audits involving stakeholder meetings and personality 
                  assessments to understand your organization's unique dynamics. Our goal is to 
                  create a culture of empathy, resilience, growth, integrity, and innovation 
                  through continuous assessment and adjustment.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {approaches.map((approach, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-xs font-semibold">{approach}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Commitment */}
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-blue-200">
              <h4 className="text-lg font-extrabold text-gray-900 mb-2">
                Our Commitment to Mental Health
              </h4>
              <p className="text-gray-700 mb-3 text-sm font-medium">
                We believe that investing in mental health is essential for creating a fulfilling 
                and productive future for organizations. Our personalized counseling services 
                provide employees with a safe and confidential space to address emotional challenges, 
                work-life balance, and personal growth.
              </p>
              <button 
                onClick={handleLearnAboutServices}
                className="text-white px-5 py-2.5 rounded-lg font-bold transition-colors duration-200 text-sm shadow-md"
                style={{ backgroundColor: '#3AAFA9' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#339B95'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
              >
                Learn About Our Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;