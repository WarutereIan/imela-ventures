import React, { useState, useEffect, useRef } from 'react';
import { Users, TrendingUp, Heart, MessageSquare, Shield, Target, ChevronLeft, ChevronRight, X, Building2, Brain, Lightbulb } from 'lucide-react';
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

// Add custom CSS animations
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

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes bounceInUp {
    0% {
      opacity: 0;
      transform: translateY(100px) scale(0.8);
    }
    60% {
      transform: translateY(-10px) scale(1.1);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes zoomIn {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes flipInY {
    0% {
      opacity: 0;
      transform: perspective(400px) rotateY(90deg);
    }
    40% {
      transform: perspective(400px) rotateY(-20deg);
    }
    60% {
      transform: perspective(400px) rotateY(10deg);
    }
    80% {
      transform: perspective(400px) rotateY(-5deg);
    }
    100% {
      opacity: 1;
      transform: perspective(400px) rotateY(0deg);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .hover\\:scale-102:hover {
    transform: scale(1.02);
  }
`;

interface ServicesProps {
  selectedPersona: PersonaType;
}

const Services: React.FC<ServicesProps> = ({ selectedPersona }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Animation refs
  const [headerRef, isHeaderVisible] = useIntersectionObserver();
  const [carouselRef, isCarouselVisible] = useIntersectionObserver();
  const [valuesRef, isValuesVisible] = useIntersectionObserver();
  const [ctaRef, isCtaVisible] = useIntersectionObserver();

  // Inject custom CSS animations
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = animationStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isModalOpen || isTransitioning) return;
      
      if (e.key === 'ArrowLeft') {
        navigateToPrevious();
      } else if (e.key === 'ArrowRight') {
        navigateToNext();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isModalOpen, selectedServiceIndex, isTransitioning]);

  // Service packages with clear pricing and deliverables
  const getServicePackages = () => {
    if (selectedPersona === 'personal') {
      return [
        {
          name: 'Individual Therapy',
          packages: [
            {
              title: 'Single Session',
              price: 'KSh 3,000',
              duration: '50 minutes',
              features: ['One-on-one counseling', 'Personalized approach', 'Confidential session'],
              description: 'Perfect for trying our services or addressing immediate concerns.'
            },
            {
              title: '4-Session Package',
              price: 'KSh 10,000',
              duration: '4 weeks',
              features: ['4 individual sessions', 'Progress tracking', 'Personalized plan', 'Between-session support'],
              description: 'Ideal for addressing specific challenges with structured support.',
              popular: true
            },
            {
              title: '8-Session Package',
              price: 'KSh 18,000',
              duration: '8 weeks',
              features: ['8 individual sessions', 'Comprehensive assessment', 'Personalized treatment plan', 'Ongoing support'],
              description: 'Comprehensive support for deeper personal growth and transformation.'
            }
          ]
        },
        {
          name: 'Couples Counseling',
          packages: [
            {
              title: 'Single Session',
              price: 'KSh 4,000',
              duration: '60 minutes',
              features: ['Couple assessment', 'Communication guidance', 'Conflict resolution tools'],
              description: 'Initial consultation to understand relationship dynamics.'
            },
            {
              title: '6-Session Package',
              price: 'KSh 20,000',
              duration: '6 weeks',
              features: ['6 couples sessions', 'Relationship assessment', 'Communication skills training', 'Conflict resolution strategies'],
              description: 'Structured program to strengthen your relationship.',
              popular: true
            }
          ]
        },
        {
          name: 'Family Support',
          packages: [
            {
              title: 'Family Session',
              price: 'KSh 5,000',
              duration: '90 minutes',
              features: ['Family assessment', 'Communication improvement', 'Conflict resolution'],
              description: 'Comprehensive family support session.'
            },
            {
              title: '4-Session Family Package',
              price: 'KSh 16,000',
              duration: '4 weeks',
              features: ['4 family sessions', 'Individual teen sessions', 'Parent guidance', 'Family communication plan'],
              description: 'Complete family transformation program.'
            }
          ]
        }
      ];
    }
    
    // Corporate service packages
    return [
      {
        name: 'Leadership Development',
        packages: [
          {
            title: 'Executive Coaching',
            price: 'KSh 15,000',
            duration: 'per session',
            features: ['One-on-one executive coaching', 'Leadership assessment', 'Personalized development plan'],
            description: 'Individual coaching for senior leaders and executives.'
          },
          {
            title: 'Leadership Workshop',
            price: 'KSh 25,000',
            duration: 'per day',
            features: ['Full-day workshop', 'Up to 20 participants', 'Materials included', 'Follow-up support'],
            description: 'Comprehensive leadership development for teams.',
            popular: true
          },
          {
            title: 'Leadership Program',
            price: 'KSh 150,000',
            duration: '3 months',
            features: ['12 sessions', 'Group coaching', 'Individual assessments', 'Certification'],
            description: 'Complete leadership transformation program.'
          }
        ]
      },
      {
        name: 'Culture Transformation',
        packages: [
          {
            title: 'Culture Assessment',
            price: 'KSh 50,000',
            duration: '2 weeks',
            features: ['Organizational assessment', 'Stakeholder interviews', 'Detailed report', 'Recommendations'],
            description: 'Comprehensive culture audit and analysis.'
          },
          {
            title: 'Culture Transformation',
            price: 'KSh 200,000',
            duration: '6 months',
            features: ['Full culture transformation', 'Team workshops', 'Ongoing support', 'Progress tracking'],
            description: 'Complete organizational culture transformation.',
            popular: true
          }
        ]
      },
      {
        name: 'Employee Wellbeing',
        packages: [
          {
            title: 'Wellness Workshop',
            price: 'KSh 20,000',
            duration: 'half day',
            features: ['Stress management training', 'Mental health awareness', 'Wellness strategies'],
            description: 'Team wellness and mental health workshop.'
          },
          {
            title: 'Employee Support Program',
            price: 'KSh 100,000',
            duration: '6 months',
            features: ['Individual counseling sessions', 'Group workshops', 'Manager training', 'Wellness initiatives'],
            description: 'Comprehensive employee wellbeing program.',
            popular: true
          }
        ]
      }
    ];
  };

  // Persona-specific services data
  const getServicesData = () => {
    if (selectedPersona === 'personal') {
      return [
        {
          icon: <Heart className="h-8 w-8" />,
          title: 'Individual Therapy Sessions',
          description: 'Personalized one-on-one counseling sessions to help you navigate life challenges, manage stress, and achieve personal growth.',
          features: [
            'Stress & Anxiety Management',
            'Depression Support',
            'Personal Growth & Self-Discovery',
            'Trauma Recovery',
            'Life Transitions Support'
          ],
          color: 'red',
          heroImage: 'https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=800',
          sections: [
            {
              title: 'Our Personal Approach',
              image: 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=600',
              content: 'Every individual is unique, and our therapy sessions are tailored to meet your specific needs. We provide a safe, confidential, and non-judgmental space where you can explore your thoughts, feelings, and experiences.'
            }
          ]
        },
        {
          icon: <Users className="h-8 w-8" />,
          title: 'Couples Counseling',
          description: 'Strengthen your relationship through guided communication, conflict resolution, and deeper understanding of each other.',
          features: [
            'Communication Skills',
            'Conflict Resolution',
            'Intimacy Building',
            'Trust Restoration',
            'Relationship Goals Setting'
          ],
          color: 'blue',
          heroImage: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
          sections: [
            {
              title: 'Building Stronger Relationships',
              image: 'https://images.pexels.com/photos/3184394/pexels-photo-3184394.jpeg?auto=compress&cs=tinysrgb&w=600',
              content: 'Our couples counseling sessions help partners develop better communication skills, resolve conflicts constructively, and strengthen their emotional connection.'
            }
          ]
        },
        {
          icon: <Shield className="h-8 w-8" />,
          title: 'Teen & Family Support',
          description: 'Specialized support for teenagers and families navigating the challenges of adolescence and family dynamics.',
          features: [
            'Teen Counseling',
            'Family Therapy',
            'Parent Guidance',
            'School-Related Issues',
            'Behavioral Support'
          ],
          color: 'purple',
          heroImage: 'https://images.pexels.com/photos/5428834/pexels-photo-5428834.jpeg?auto=compress&cs=tinysrgb&w=800',
          sections: [
            {
              title: 'Supporting Families',
              image: 'https://images.pexels.com/photos/5428832/pexels-photo-5428832.jpeg?auto=compress&cs=tinysrgb&w=600',
              content: 'We understand the unique challenges facing teenagers and families today. Our specialized approach helps improve family communication and supports healthy adolescent development.'
            }
          ]
        }
      ];
    }
    
    // Corporate services
    return [
      {
        icon: <Users className="h-8 w-8" />,
        title: 'Leadership Development & Training',
        description: 'Comprehensive programs that nurture adaptive and emotionally intelligent leaders through strategic vision development and experiential learning.',
        features: [
          'Strategic Vision Development',
          'Emotional Intelligence Training',
          'Decision-Making Enhancement',
          'Conflict Resolution Skills',
          'Experiential Learning & Case Studies'
        ],
        color: 'blue',
        heroImage: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
        sections: [
          {
            title: 'Our Philosophy',
            image: 'https://images.pexels.com/photos/3184394/pexels-photo-3184394.jpeg?auto=compress&cs=tinysrgb&w=600',
            content: 'At Imela Ventures, we believe that effective leadership is the cornerstone of organizational success. As the corporate world evolves in complexity and dynamism, the need for strategic, adaptive, and emotionally intelligent leaders has never been greater.'
          }
        ]
      },
      {
        icon: <TrendingUp className="h-8 w-8" />,
        title: 'Corporate Culture Transformation',
        description: 'Comprehensive culture audits and transformation programs to create positive environments that enhance employee engagement and satisfaction.',
        features: [
          'Culture Audits & Assessments',
          'Stakeholder Meetings',
          'Personality Assessments',
          'Empathy & Resilience Building',
          'Innovation & Growth Culture'
        ],
        color: 'green',
        heroImage: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
        sections: [
          {
            title: 'Why Culture Transformation Matters',
            image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600',
            content: 'At Imela Ventures, we understand that an organization\'s culture plays a pivotal role in shaping its success, productivity, and employee well-being.'
          }
        ]
      },
      {
        icon: <Building2 className="h-8 w-8" />,
        title: 'Employee Wellbeing Programs',
        description: 'Tailored counseling sessions to help employees manage stress and personal challenges, improving overall well-being and productivity.',
        features: [
          'Stress Management',
          'Work-Life Balance',
          'Personal Growth Support',
          'Confidential Sessions',
          'Individual Productivity Enhancement'
        ],
        color: 'red',
        heroImage: 'https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=800',
        sections: [
          {
            title: 'Our Personalized Approach',
            image: 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=600',
            content: 'Imela Ventures specializes in offering personalized counseling sessions tailored to individual employees. By providing a safe and confidential space for employees to explore their thoughts and emotions, we help individuals enhance their overall well-being and productivity.'
          }
        ]
      }
    ];
  };

  const services = getServicesData();

  const values = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Empathy',
      description: 'Understanding and connecting with others on a deeper level'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Resilience',
      description: 'Building strength to overcome challenges and adapt to change'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Growth',
      description: 'Continuous learning and development for individuals and organizations'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Integrity',
      description: 'Maintaining the highest ethical standards in all our interactions'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!isUserInteracting) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % services.length);
      }, 30000); // Change slide every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isUserInteracting, services.length]);

  const nextSlide = () => {
    setIsUserInteracting(true);
    setCurrentSlide((prev) => (prev + 1) % services.length);
    setTimeout(() => setIsUserInteracting(false), 10000); // Resume auto-scroll after 10 seconds
  };

  const prevSlide = () => {
    setIsUserInteracting(true);
    setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
    setTimeout(() => setIsUserInteracting(false), 10000); // Resume auto-scroll after 10 seconds
  };

  const goToSlide = (index: number) => {
    setIsUserInteracting(true);
    setCurrentSlide(index);
    setTimeout(() => setIsUserInteracting(false), 10000); // Resume auto-scroll after 10 seconds
  };

  const openModal = (service: any, index: number) => {
    setSelectedService(service);
    setSelectedServiceIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    setSelectedServiceIndex(-1);
    setIsTransitioning(false);
    document.body.style.overflow = 'unset';
  };

  const navigateToService = (index: number) => {
    if (isTransitioning || index === selectedServiceIndex) return;
    
    setIsTransitioning(true);
    
    // Add fade out effect
    setTimeout(() => {
      setSelectedServiceIndex(index);
      setSelectedService(services[index]);
      
      // Add fade in effect
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
    }, 150);
  };

  const navigateToNext = () => {
    const nextIndex = (selectedServiceIndex + 1) % services.length;
    navigateToService(nextIndex);
  };

  const navigateToPrevious = () => {
    const prevIndex = selectedServiceIndex === 0 ? services.length - 1 : selectedServiceIndex - 1;
    navigateToService(prevIndex);
  };

  const handleScheduleConsultation = () => {
    // Close the modal first
    closeModal();
    
    // Add a small delay to ensure modal closes smoothly
    setTimeout(() => {
      // Navigate to booking section using the app's navigation system
      const navigateEvent = new CustomEvent('navigate', {
        detail: 'booking'
      });
      window.dispatchEvent(navigateEvent);
      
      // After navigation, dispatch event to pre-select consultation service with specific service info
      setTimeout(() => {
        const consultationEvent = new CustomEvent('preSelectConsultation', {
          detail: { 
            serviceId: 'consultation',
            consultationFor: selectedService ? {
              title: selectedService.title,
              description: selectedService.description
            } : null
          }
        });
        window.dispatchEvent(consultationEvent);
      }, 100);
    }, 300);
  };

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div ref={headerRef} className={`text-center mb-16 ${isHeaderVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-block bg-gradient-to-r from-[#3AAFA9] to-[#339B95] text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
            {selectedPersona === 'personal' ? '🎯 Personal Development' : '🏢 Corporate Excellence'}
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {selectedPersona === 'personal' ? 'Our Personal Services' : 'Comprehensive Corporate Solutions'}
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            {selectedPersona === 'personal' 
              ? 'Professional counseling and therapy services tailored to your individual needs, helping you navigate life challenges and achieve personal growth.'
              : 'Empowering organizations through psychological counseling and corporate training to enhance employee well-being, resilience, and leadership skills.'
            }
          </p>
          
          {/* Service Stats */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl font-bold text-[#3AAFA9] mb-2">
                {selectedPersona === 'personal' ? '500+' : '200+'}
              </div>
              <div className="text-gray-600 font-semibold">
                {selectedPersona === 'personal' ? 'Lives Transformed' : 'Organizations Helped'}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600 font-semibold">Success Rate</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600 font-semibold">Years Experience</div>
            </div>
          </div>
        </div>

        {/* Services Carousel */}
        <div ref={carouselRef} className={`relative mb-12 ${isCarouselVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          {/* Navigation Arrows - Outside the carousel */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg transition-all duration-200 z-10 border border-gray-200"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-50 rounded-full p-3 shadow-lg transition-all duration-200 z-10 border border-gray-200"
          >
            <ChevronRight className="h-6 w-6 text-gray-600" />
          </button>

          <div className="max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
          {services.map((service, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-300 h-full">
                      <div className={`inline-flex p-2 rounded-lg ${getColorClasses(service.color)} mb-3`}>
                {service.icon}
              </div>
              
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{service.description}</p>
              
                      <div className="space-y-2 mb-4">
                {service.features.map((feature, i) => (
                          <div key={i} className="flex items-center text-xs text-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: '#3AAFA9' }}></div>
                    {feature}
                  </div>
                ))}
              </div>
              
                      <button 
                        onClick={() => openModal(service, index)}
                        className="w-full cta-secondary text-white py-2.5 rounded-lg font-semibold transition-colors duration-200 text-sm" 
                        style={{ backgroundColor: '#3AAFA9' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#339B95'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  currentSlide === index 
                    ? 'bg-gray-200'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                style={{ backgroundColor: currentSlide === index ? '#3AAFA9' : undefined }}
              ></button>
          ))}
          </div>
        </div>

        {/* Service Packages & Pricing */}
        <div ref={valuesRef} className={`mb-12 ${isValuesVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Service Packages & Pricing</h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose from our comprehensive service packages designed to meet your specific needs. 
              All packages include detailed deliverables and clear timelines.
            </p>
          </div>

          <div className="space-y-12">
            {getServicePackages().map((serviceCategory, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#3AAFA9] to-[#339B95] p-6 text-white">
                  <h4 className="text-2xl font-bold">{serviceCategory.name}</h4>
                  <p className="text-lg opacity-90 mt-2">
                    {selectedPersona === 'personal' 
                      ? 'Personalized counseling and therapy services'
                      : 'Professional corporate development solutions'
                    }
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviceCategory.packages.map((pkg, pkgIndex) => (
                      <div 
                        key={pkgIndex} 
                        className={`relative bg-white rounded-xl border-2 p-6 hover:shadow-xl transition-all duration-300 ${
                          pkg.popular 
                            ? 'border-[#3AAFA9] shadow-lg scale-105' 
                            : 'border-gray-200 hover:border-[#3AAFA9]'
                        }`}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-[#3AAFA9] text-white px-4 py-1 rounded-full text-sm font-semibold">
                              Most Popular
                            </span>
                          </div>
                        )}
                        
                        <div className="text-center mb-4">
                          <h5 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h5>
                          <div className="text-sm text-gray-600">{pkg.duration}</div>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-4 text-center">{pkg.description}</p>
                        
                        <div className="space-y-2 mb-6">
                          {pkg.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center text-sm text-gray-700">
                              <div className="w-2 h-2 bg-[#3AAFA9] rounded-full mr-3 flex-shrink-0"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <button 
                          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                            pkg.popular
                              ? 'bg-[#3AAFA9] text-white hover:bg-[#339B95] hover:scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-[#3AAFA9] hover:text-white'
                          }`}
                          onClick={handleScheduleConsultation}
                        >
                          Get Started
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Values */}
        <div className={`bg-gray-50 rounded-xl p-6 mb-12 ${isValuesVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Core Values</h3>
            <p className="text-base text-gray-600">
              The principles that guide our approach to organizational transformation and employee well-being.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-gray-600 mb-3 flex justify-center">
                  {value.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h4>
                <p className="text-gray-600 text-xs">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div ref={ctaRef} className={`text-center mt-10 ${isCtaVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <div className="rounded-xl p-6 text-white" style={{ backgroundColor: '#3AAFA9' }}>
            <h3 className="text-2xl font-bold mb-3">
              {selectedPersona === 'personal' ? 'Ready to Start Your Journey?' : 'Ready to Transform Your Organization?'}
            </h3>
            <p className="text-lg mb-4 opacity-90">
              {selectedPersona === 'personal' 
                ? 'Take the first step towards better mental health and personal growth. Book a consultation today.'
                : 'Invest in mental health and well-being to create a fulfilling and productive future for your organization.'
              }
            </p>
            <button 
              className="cta-primary px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg active:scale-95"
              style={{ backgroundColor: 'white', color: '#3AAFA9' }}
              onClick={handleScheduleConsultation}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {selectedPersona === 'personal' ? 'Schedule Consultation' : 'Schedule a Consultation'}
            </button>
          </div>
        </div>

        {/* Modal for Service Details */}
        {isModalOpen && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: '#3AAFA9' }}>
                    {selectedService.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedService.title}</h2>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={navigateToPrevious}
                    disabled={isTransitioning}
                    className={`p-2 rounded-lg transition-colors duration-200 group ${
                      isTransitioning 
                        ? 'bg-gray-50 cursor-not-allowed' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title="Previous Service (←)"
                  >
                    <ChevronLeft className={`h-5 w-5 transition-colors duration-200 ${
                      isTransitioning 
                        ? 'text-gray-400' 
                        : 'text-gray-600 group-hover:text-gray-800'
                    }`} />
                  </button>
                  
                  {/* Next Button */}
                  <button
                    onClick={navigateToNext}
                    disabled={isTransitioning}
                    className={`p-2 rounded-lg transition-colors duration-200 group ${
                      isTransitioning 
                        ? 'bg-gray-50 cursor-not-allowed' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title="Next Service (→)"
                  >
                    <ChevronRight className={`h-5 w-5 transition-colors duration-200 ${
                      isTransitioning 
                        ? 'text-gray-400' 
                        : 'text-gray-600 group-hover:text-gray-800'
                    }`} />
                  </button>
                  
                  {/* Close Button */}
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 transition-colors duration-200 group"
                    title="Close (Esc)"
                  >
                    <X className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition-colors duration-200" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className={`overflow-y-auto max-h-[calc(90vh-120px)] transition-opacity duration-300 ${
                isTransitioning ? 'opacity-50' : 'opacity-100'
              }`}>
                {/* Hero Image */}
                <div className="relative h-64 bg-gray-200 overflow-hidden">
                  <img
                    src={selectedService.heroImage}
                    alt={selectedService.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end transition-opacity duration-500">
                    <div className="p-6 text-white animate-fade-in-up">
                      <h1 className="text-3xl font-bold mb-2 transform transition-all duration-700 delay-200">{selectedService.title}</h1>
                      <p className="text-lg opacity-90 transform transition-all duration-700 delay-300">{selectedService.description}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Service Sections */}
                  {selectedService.sections?.map((section: any, index: number) => (
                    <div 
                      key={index} 
                      className="mb-8 opacity-0 animate-fade-in-up"
                      style={{ 
                        animationDelay: `${(index + 1) * 200}ms`,
                        animationFillMode: 'forwards'
                      }}
                    >
                      <div className="flex flex-col lg:flex-row gap-6 items-start">
                        <div className="lg:w-1/3 group">
                          <img
                            src={section.image}
                            alt={section.title}
                            className="w-full h-48 object-cover rounded-lg shadow-md transition-all duration-500 group-hover:shadow-xl group-hover:scale-105 group-hover:brightness-110"
                          />
                        </div>
                        <div className="lg:w-2/3">
                          <h2 className="text-2xl font-bold text-gray-900 mb-4 transform transition-all duration-500 hover:text-teal-600">{section.title}</h2>
                          <p className="text-gray-700 mb-4 leading-relaxed transition-colors duration-300 hover:text-gray-900">{section.content}</p>
                          
                          {/* Leadership Development specific content */}
                          {section.list && (
                            <div className="space-y-3">
                              {section.list.map((item: any, i: number) => (
                                <div 
                                  key={i} 
                                  className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 transform transition-all duration-300 hover:shadow-md hover:scale-102 hover:bg-blue-100 cursor-pointer"
                                  style={{ 
                                    animationDelay: `${(i + 1) * 100}ms`,
                                    opacity: 0,
                                    animation: 'fadeInLeft 0.6s ease-out forwards'
                                  }}
                                >
                                  <h4 className="font-semibold text-blue-900 mb-1 transition-colors duration-200 hover:text-blue-700">{item.title}</h4>
                                  <p className="text-blue-800 text-sm transition-colors duration-200">{item.description}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {section.outcomes && (
                            <div className="bg-green-50 p-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:bg-green-100">
                              <ul className="space-y-2">
                                {section.outcomes.map((outcome: string, i: number) => (
                                  <li 
                                    key={i} 
                                    className="flex items-start transform transition-all duration-300 hover:translate-x-2 hover:text-green-900"
                                    style={{ 
                                      animationDelay: `${i * 100}ms`,
                                      opacity: 0,
                                      animation: 'fadeInRight 0.5s ease-out forwards'
                                    }}
                                  >
                                    <span className="text-green-600 mr-2 transition-transform duration-200 hover:scale-125">✅</span>
                                    <span className="text-green-800">{outcome}</span>
                                  </li>
                                ))}
                              </ul>
                              {section.conclusion && (
                                <p className="mt-4 text-green-800 font-medium italic transition-all duration-300 hover:text-green-900 hover:scale-105 transform">{section.conclusion}</p>
                              )}
                            </div>
                          )}

                          {/* Culture Transformation specific content */}
                          {section.process && section.process[0].details && (
                            <div className="space-y-4">
                              {section.process.map((proc: any, i: number) => (
                                <div 
                                  key={i} 
                                  className="bg-green-50 p-4 rounded-lg border border-green-200 transform transition-all duration-500 hover:shadow-lg hover:scale-102 hover:bg-green-100 cursor-pointer"
                                  style={{ 
                                    animationDelay: `${i * 150}ms`,
                                    opacity: 0,
                                    animation: 'slideInUp 0.6s ease-out forwards'
                                  }}
                                >
                                  <h4 className="font-bold text-green-900 mb-2 transition-colors duration-200 hover:text-green-700">{proc.step}</h4>
                                  <p className="text-green-800 mb-3 transition-colors duration-200">{proc.description}</p>
                                  <ul className="space-y-1">
                                    {proc.details.map((detail: string, j: number) => (
                                      <li 
                                        key={j} 
                                        className="text-sm text-green-700 flex items-center transition-all duration-200 hover:text-green-900 hover:translate-x-1"
                                      >
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 transition-all duration-200 hover:scale-150"></div>
                                        {detail}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}

                          {section.values && (
                            <div className="grid md:grid-cols-2 gap-4">
                              {section.values.map((value: any, i: number) => (
                                <div 
                                  key={i} 
                                  className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 transform transition-all duration-500 hover:shadow-lg hover:scale-105 hover:from-green-100 hover:to-green-200 cursor-pointer"
                                  style={{ 
                                    animationDelay: `${i * 100}ms`,
                                    opacity: 0,
                                    animation: 'bounceIn 0.8s ease-out forwards'
                                  }}
                                >
                                  <h4 className="font-bold text-green-900 mb-2 transition-colors duration-200 hover:text-green-700">{value.name}</h4>
                                  <p className="text-green-800 text-sm transition-colors duration-200">{value.description}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {section.metrics && (
                            <div className="bg-green-50 p-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:bg-green-100">
                              <ul className="space-y-2">
                                {section.metrics.map((metric: string, i: number) => (
                                  <li 
                                    key={i} 
                                    className="flex items-start transform transition-all duration-300 hover:translate-x-2"
                                    style={{ 
                                      animationDelay: `${i * 80}ms`,
                                      opacity: 0,
                                      animation: 'fadeInLeft 0.5s ease-out forwards'
                                    }}
                                  >
                                    <span className="text-green-600 mr-2 transition-transform duration-200 hover:scale-125 hover:rotate-12">📊</span>
                                    <span className="text-green-800 transition-colors duration-200 hover:text-green-900">{metric}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Counseling Services specific content */}
                          {section.areas && (
                            <div className="grid md:grid-cols-2 gap-4">
                              {section.areas.map((area: any, i: number) => (
                                <div 
                                  key={i} 
                                  className="bg-red-50 p-4 rounded-lg border border-red-200 transform transition-all duration-500 hover:shadow-lg hover:scale-105 hover:bg-red-100 cursor-pointer"
                                  style={{ 
                                    animationDelay: `${i * 120}ms`,
                                    opacity: 0,
                                    animation: 'flipInY 0.8s ease-out forwards'
                                  }}
                                >
                                  <div className="flex items-center mb-2">
                                    <span className="text-2xl mr-3 transition-transform duration-300 hover:scale-125 hover:rotate-12">{area.icon}</span>
                                    <h4 className="font-bold text-red-900 transition-colors duration-200 hover:text-red-700">{area.title}</h4>
                                  </div>
                                  <p className="text-red-800 text-sm transition-colors duration-200">{area.description}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {section.benefits && typeof section.benefits[0] === 'string' && (
                            <div className="bg-red-50 p-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:bg-red-100">
                              <ul className="space-y-2">
                                {section.benefits.map((benefit: string, i: number) => (
                                  <li 
                                    key={i} 
                                    className="flex items-start transform transition-all duration-300 hover:translate-x-2"
                                    style={{ 
                                      animationDelay: `${i * 100}ms`,
                                      opacity: 0,
                                      animation: 'slideInRight 0.5s ease-out forwards'
                                    }}
                                  >
                                    <span className="text-red-600 mr-2 transition-transform duration-200 hover:scale-125">✅</span>
                                    <span className="text-red-800 transition-colors duration-200 hover:text-red-900">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {section.impacts && (
                            <div className="space-y-4">
                              {section.impacts.map((impact: any, i: number) => (
                                <div 
                                  key={i} 
                                  className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400 transform transition-all duration-500 hover:shadow-lg hover:scale-102 hover:bg-red-100 cursor-pointer"
                                  style={{ 
                                    animationDelay: `${i * 150}ms`,
                                    opacity: 0,
                                    animation: 'slideInLeft 0.6s ease-out forwards'
                                  }}
                                >
                                  <h4 className="font-bold text-red-900 mb-1 transition-colors duration-200 hover:text-red-700">{impact.metric}</h4>
                                  <p className="text-red-800 text-sm mb-1 transition-colors duration-200">{impact.description}</p>
                                </div>
                              ))}
                              {section.conclusion && (
                                <p className="mt-4 text-red-800 font-medium italic bg-red-50 p-4 rounded-lg transition-all duration-300 hover:bg-red-100 hover:shadow-md transform hover:scale-105">{section.conclusion}</p>
                              )}
                            </div>
                          )}

                          {/* Conflict Resolution specific content */}
                          {section.components && (
                            <div className="space-y-4">
                              {section.components.map((comp: any, i: number) => (
                                <div 
                                  key={i} 
                                  className="bg-purple-50 p-4 rounded-lg border border-purple-200 transform transition-all duration-500 hover:shadow-lg hover:scale-102 hover:bg-purple-100 cursor-pointer"
                                  style={{ 
                                    animationDelay: `${i * 150}ms`,
                                    opacity: 0,
                                    animation: 'zoomIn 0.6s ease-out forwards'
                                  }}
                                >
                                  <div className="flex items-center mb-3">
                                    <span className="text-2xl mr-3 transition-transform duration-300 hover:scale-125 hover:rotate-12">{comp.icon}</span>
                                    <h4 className="font-bold text-purple-900 transition-colors duration-200 hover:text-purple-700">{comp.title}</h4>
                                  </div>
                                  <ul className="space-y-1">
                                    {comp.items.map((item: string, j: number) => (
                                      <li 
                                        key={j} 
                                        className="text-purple-800 text-sm flex items-start transition-all duration-200 hover:text-purple-900 hover:translate-x-1"
                                      >
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 mt-2 transition-all duration-200 hover:scale-150"></div>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}

                          {section.process && !section.process[0].details && (
                            <div className="flex flex-wrap gap-2">
                              {section.process.map((proc: any, i: number) => (
                                <div 
                                  key={i} 
                                  className="bg-purple-50 p-3 rounded-lg border border-purple-200 flex-1 min-w-48 transform transition-all duration-500 hover:shadow-lg hover:scale-105 hover:bg-purple-100 cursor-pointer"
                                  style={{ 
                                    animationDelay: `${i * 100}ms`,
                                    opacity: 0,
                                    animation: 'bounceInUp 0.8s ease-out forwards'
                                  }}
                                >
                                  <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-2 transition-all duration-300 hover:bg-purple-700 hover:scale-110">
                                      {proc.step}
                                    </div>
                                    <h4 className="font-bold text-purple-900 text-sm transition-colors duration-200 hover:text-purple-700">{proc.title}</h4>
                                  </div>
                                  <p className="text-purple-800 text-sm transition-colors duration-200">{proc.description}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {section.benefits && typeof section.benefits[0] === 'object' && section.benefits[0].title && (
                            <div className="space-y-4">
                              {section.benefits.map((benefit: any, i: number) => (
                                <div 
                                  key={i} 
                                  className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400 transform transition-all duration-500 hover:shadow-lg hover:scale-102 hover:bg-purple-100 cursor-pointer"
                                  style={{ 
                                    animationDelay: `${i * 120}ms`,
                                    opacity: 0,
                                    animation: 'slideInUp 0.6s ease-out forwards'
                                  }}
                                >
                                  <h4 className="font-bold text-purple-900 mb-1 transition-colors duration-200 hover:text-purple-700">{benefit.title}</h4>
                                  <p className="text-purple-800 text-sm mb-1 transition-colors duration-200">{benefit.description}</p>
                                  <p className="text-purple-600 text-xs italic transition-colors duration-200 hover:text-purple-800">Impact: {benefit.impact}</p>
                                </div>
                              ))}
                              {section.conclusion && (
                                <p className="mt-4 text-purple-800 font-medium italic bg-purple-50 p-4 rounded-lg transition-all duration-300 hover:bg-purple-100 hover:shadow-md transform hover:scale-105">{section.conclusion}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Service Features */}
                  <div 
                    className="mt-8 p-6 bg-gray-50 rounded-lg opacity-0 animate-fade-in-up transition-all duration-300 hover:shadow-lg hover:bg-gray-100"
                    style={{ 
                      animationDelay: '800ms',
                      animationFillMode: 'forwards'
                    }}
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4 transition-colors duration-200 hover:text-teal-600">Key Features</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedService.features.map((feature: string, index: number) => (
                        <div 
                          key={index} 
                          className="flex items-center transform transition-all duration-300 hover:translate-x-2 hover:scale-105"
                          style={{ 
                            animationDelay: `${900 + (index * 50)}ms`,
                            opacity: 0,
                            animation: 'fadeInRight 0.5s ease-out forwards'
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full mr-3 transition-all duration-200 hover:scale-150" 
                            style={{ backgroundColor: '#3AAFA9' }}
                          ></div>
                          <span className="text-gray-700 transition-colors duration-200 hover:text-gray-900">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div 
                    className="mt-8 text-center opacity-0 animate-fade-in-up"
                    style={{ 
                      animationDelay: '1000ms',
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div 
                      className="rounded-xl p-6 text-white transform transition-all duration-500 hover:scale-105 hover:shadow-2xl" 
                      style={{ backgroundColor: '#3AAFA9' }}
                    >
                      <h3 className="text-xl font-bold mb-3 transition-all duration-300 hover:scale-110 transform">Ready to Get Started?</h3>
                      <p className="mb-4 opacity-90 transition-opacity duration-300 hover:opacity-100">
                        Contact us to learn how this service can benefit your organization.
                      </p>
                      <button 
                        className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg active:scale-95"
                        style={{ backgroundColor: 'white', color: '#3AAFA9' }}
                        onClick={handleScheduleConsultation}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Schedule a Consultation
                      </button>
                    </div>
                  </div>

                  {/* Service Navigation Dots */}
                  <div className="mt-8 flex justify-center items-center space-x-3 pb-4">
                    <div className="flex items-center space-x-2">
                      {services.map((service, index) => (
                        <button
                          key={index}
                          onClick={() => navigateToService(index)}
                          disabled={isTransitioning}
                          className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${
                            index === selectedServiceIndex 
                              ? 'scale-125 shadow-lg' 
                              : 'hover:opacity-80'
                          } ${isTransitioning ? 'cursor-not-allowed opacity-50' : ''}`}
                          style={{ 
                            backgroundColor: index === selectedServiceIndex ? '#3AAFA9' : '#d1d5db'
                          }}
                          title={service.title}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Navigation Hint */}
                  <div className="text-center text-xs text-gray-400 pb-2">
                    Use ← → arrow keys or click dots to navigate • Press Esc to close
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visual Footer Section */}
        <div className="mt-20 bg-gradient-to-r from-[#3AAFA9] to-[#339B95] rounded-2xl p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              {selectedPersona === 'personal' 
                ? 'Take the first step towards personal growth and transformation with our expert counseling services.'
                : 'Transform your organization with our proven corporate training and development programs.'
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold mb-2">Free Consultation</h4>
              <p className="text-sm opacity-90">Get personalized advice from our experts</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold mb-2">Confidential</h4>
              <p className="text-sm opacity-90">Your privacy and security are our priority</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold mb-2">Proven Results</h4>
              <p className="text-sm opacity-90">Evidence-based methods that deliver outcomes</p>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => {
                const navigateEvent = new CustomEvent('navigate', { detail: 'booking' });
                window.dispatchEvent(navigateEvent);
              }}
              className="bg-white text-[#3AAFA9] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              🚀 Book Your FREE Consultation Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;