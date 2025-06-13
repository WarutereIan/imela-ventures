import React, { useState, useEffect, useRef } from 'react';
import { Users, TrendingUp, Heart, MessageSquare, Shield, Target, ChevronLeft, ChevronRight, X } from 'lucide-react';

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

const Services: React.FC = () => {
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

  const services = [
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
          content: 'At Imela Ventures, we believe that effective leadership is the cornerstone of organizational success. As the corporate world evolves in complexity and dynamism, the need for strategic, adaptive, and emotionally intelligent leaders has never been greater. Leadership is not merely about authority—it is about influence, vision, and the ability to inspire teams toward shared goals.'
        },
        {
          title: 'The Evolution of Leadership Development',
          image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Leadership has undergone significant transformation, with various theories shaping how we understand and develop leaders today. Imela Ventures integrates key insights from four major leadership eras:',
          list: [
            { title: 'Trait-Based Leadership', description: 'While certain traits contribute to effective leadership, research has shown that leadership skills can be cultivated through training and experience.' },
            { title: 'Behavioral Leadership', description: 'Emphasizes that leadership is not just about personality but also about learned behaviors. Our programs focus on developing essential leadership competencies.' },
            { title: 'Situational Leadership', description: 'We equip leaders with the ability to adapt their style based on the demands of the situation and the needs of their teams.' },
            { title: 'New Leadership Theories', description: 'Modern leadership extends beyond individual leaders to include transformational, collaborative, and inclusive leadership models.' }
          ]
        },
        {
          title: 'Program Outcomes',
          image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Through our structured training programs, we help leaders achieve transformational results:',
          outcomes: [
            'Develop a strategic vision and align teams with organizational goals',
            'Enhance emotional intelligence to build strong, trust-based relationships',
            'Master adaptive leadership skills to navigate complexity and change',
            'Lead with ethics and integrity while fostering inclusivity',
            'Empower others by creating collaborative and high-performance teams'
          ],
          conclusion: 'At Imela Ventures, we don\'t just train leaders—we build catalysts for change, equipping professionals with the skills to influence, innovate, and inspire.'
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
          content: 'At Imela Ventures, we understand that an organization\'s culture plays a pivotal role in shaping its success, productivity, and employee well-being. Culture serves as the invisible fabric that guides employee behavior, engagement, and decision-making. A positive culture fosters teamwork, innovation, and employee satisfaction, contributing to overall organizational success.'
        },
        {
          title: 'Our Comprehensive Methodology',
          image: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Our approach to enhancing corporate well-being begins with a meticulous three-step process:',
          process: [
            {
              step: '1. Culture Audit',
              description: 'We conduct comprehensive culture audits through one-on-one meetings with stakeholders, personality assessments, and evaluation of alignment between current culture and organizational goals.',
              details: ['Stakeholder interviews with employees, managers, and executives', 'Personality tests and individual trait assessments', 'Cultural alignment evaluation']
            },
            {
              step: '2. Tailor-Made Training Programs',
              description: 'Based on audit findings, we design customized training programs that address specific cultural challenges and opportunities.',
              details: ['Leadership development programs', 'Staff training initiatives', 'Skills and insights development', 'Cultural navigation training']
            },
            {
              step: '3. Culture Transformation',
              description: 'We implement sustainable changes that create a harmonious and resilient work environment.',
              details: ['Psychological well-being initiatives', 'Innovation culture development', 'Leadership excellence programs', 'Continuous improvement systems']
            }
          ]
        },
        {
          title: 'Core Values Integration',
          image: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Through our interventions, we foster a culture that encourages five fundamental values:',
          values: [
            { name: 'Empathy', description: 'Understanding and valuing unique experiences and challenges of every individual' },
            { name: 'Resilience', description: 'Building strength to overcome obstacles and adapt to change with determination' },
            { name: 'Growth', description: 'Promoting continuous learning and professional development for all team members' },
            { name: 'Integrity', description: 'Upholding highest ethical standards, transparency, and honesty in all interactions' },
            { name: 'Innovation', description: 'Encouraging creativity and novel solutions to organizational challenges' }
          ]
        },
        {
          title: 'Measuring Success',
          image: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'We track cultural transformation progress through both qualitative and quantitative metrics, ensuring sustainable and measurable change.',
          metrics: [
            'Employee satisfaction surveys and feedback analysis',
            'Engagement level assessments and tracking',
            'Behavioral alignment with desired culture values',
            'Performance indicators and productivity metrics',
            'Retention rates and workplace atmosphere evaluation'
          ]
        }
      ]
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Personalized Counseling Services',
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
          content: 'Imela Ventures specializes in offering personalized counseling sessions tailored to individual employees. By providing a safe and confidential space for employees to explore their thoughts and emotions, we help individuals enhance their overall well-being and productivity. Our personalized approach ensures that each session meets the unique needs and circumstances of every client.'
        },
        {
          title: 'Areas We Address',
          image: 'https://images.pexels.com/photos/5428832/pexels-photo-5428832.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Our comprehensive counseling services cover a wide range of personal and professional challenges:',
          areas: [
            { 
              title: 'Stress Management', 
              description: 'Practical techniques and strategies to manage workplace and personal stress effectively',
              icon: '🧘‍♀️'
            },
            { 
              title: 'Emotional Challenges', 
              description: 'Support for dealing with anxiety, depression, grief, and other emotional difficulties',
              icon: '💙'
            },
            { 
              title: 'Work-Life Balance', 
              description: 'Strategies to maintain healthy boundaries between professional and personal life',
              icon: '⚖️'
            },
            { 
              title: 'Personal Growth', 
              description: 'Guidance for self-improvement, goal setting, and personal development',
              icon: '🌱'
            },
            { 
              title: 'Relationship Issues', 
              description: 'Support for improving interpersonal relationships both at work and home',
              icon: '🤝'
            }
          ]
        },
        {
          title: 'Key Service Benefits',
          image: 'https://images.pexels.com/photos/5428834/pexels-photo-5428834.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Our counseling services are designed with employee well-being and organizational success in mind:',
          benefits: [
            'Complete confidentiality in all counseling sessions',
            'Individualized approach tailored to specific employee needs',
            'Professional expertise with deep understanding of workplace dynamics',
            'Flexible scheduling to accommodate employee availability',
            'Regular assessment of progress and well-being improvements'
          ]
        },
        {
          title: 'Organizational Impact',
          image: 'https://images.pexels.com/photos/5428838/pexels-photo-5428838.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Investing in employee well-being through personalized counseling creates positive ripple effects throughout your organization:',
          impacts: [
            { metric: 'Reduced Absenteeism', description: 'Lower sick days and improved attendance rates' },
            { metric: 'Enhanced Productivity', description: 'Better focus and performance from emotionally healthy employees' },
            { metric: 'Improved Retention', description: 'Reduced turnover and increased employee loyalty' },
            { metric: 'Better Team Dynamics', description: 'Improved workplace morale and collaboration' },
            { metric: 'Stronger Culture', description: 'Organizational culture focused on well-being and support' }
          ],
          conclusion: 'At Imela Ventures, we believe that investing in individual well-being creates a ripple effect that transforms entire organizations.'
        }
      ]
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: 'Conflict Resolution Support',
      description: 'Expert guidance on workplace conflict resolution with respectful and constructive approaches that contribute to positive work environments.',
      features: [
        'Fair Resolution Mechanisms',
        'Growth-Oriented Approaches',
        'Harmonious Workplace Culture',
        'Effective Dispute Management',
        'Employee Growth Support'
      ],
      color: 'purple',
      heroImage: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
      sections: [
        {
          title: 'Our Philosophy & Approach',
          image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Imela Ventures recognizes the importance of a fair and supportive conflict resolution mechanism in maintaining a healthy workplace environment. We believe that conflicts, when handled properly, can become opportunities for growth, improved understanding, and stronger relationships. Our approach focuses on transforming challenging situations into learning experiences that contribute to employee growth and organizational development.'
        },
        {
          title: 'Key Service Components',
          image: 'https://images.pexels.com/photos/3183201/pexels-photo-3183201.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Our comprehensive conflict resolution approach includes three fundamental components:',
          components: [
            {
              title: 'Fair Resolution Mechanisms',
              icon: '⚖️',
              items: [
                'Establishing transparent and unbiased processes for conflict resolution',
                'Ensuring all parties have equal opportunity to present their perspectives',
                'Creating structured frameworks for addressing disputes at various levels'
              ]
            },
            {
              title: 'Growth-Oriented Approaches',
              icon: '🌱',
              items: [
                'Focus on learning and development rather than punishment',
                'Identifying underlying issues that contribute to conflicts',
                'Developing skills to prevent future conflicts',
                'Building stronger communication and relationship skills'
              ]
            },
            {
              title: 'Mediation & Facilitation',
              icon: '🤝',
              items: [
                'Professional mediation services for complex disputes',
                'Facilitated discussions between conflicting parties',
                'Neutral third-party perspective to ensure fairness',
                'Structured problem-solving approaches'
              ]
            }
          ]
        },
        {
          title: 'The Resolution Process',
          image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Our systematic approach ensures effective and lasting conflict resolution:',
          process: [
            { step: 1, title: 'Assessment', description: 'Understanding the nature and scope of the conflict' },
            { step: 2, title: 'Planning', description: 'Developing a tailored resolution strategy' },
            { step: 3, title: 'Implementation', description: 'Facilitating discussions and mediation sessions' },
            { step: 4, title: 'Follow-up', description: 'Monitoring progress and ensuring lasting resolution' },
            { step: 5, title: 'Prevention', description: 'Training and education to prevent future conflicts' }
          ]
        },
        {
          title: 'Organizational Benefits',
          image: 'https://images.pexels.com/photos/3183195/pexels-photo-3183195.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Effective conflict resolution delivers measurable benefits to your organization:',
          benefits: [
            { 
              title: 'Reduced Legal Risks', 
              description: 'Proactive conflict resolution reduces the likelihood of legal disputes',
              impact: 'Cost savings and reputation protection'
            },
            { 
              title: 'Improved Employee Retention', 
              description: 'Fair conflict resolution increases employee satisfaction and loyalty',
              impact: 'Lower turnover and recruitment costs'
            },
            { 
              title: 'Enhanced Team Dynamics', 
              description: 'Better communication and understanding between team members',
              impact: 'Increased collaboration and productivity'
            },
            { 
              title: 'Positive Work Environment', 
              description: 'Creates a culture where issues are addressed constructively',
              impact: 'Higher employee engagement and morale'
            },
            { 
              title: 'Increased Productivity', 
              description: 'Less time spent on unresolved conflicts means more focus on work',
              impact: 'Improved performance and results'
            }
          ],
          conclusion: 'This support promotes a harmonious workplace culture and contributes to employee growth even in challenging situations, ultimately strengthening the organization\'s resilience and cohesion.'
        }
      ]
    }
  ];

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
    <section id="services" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className={`text-center mb-10 ${isHeaderVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Comprehensive Corporate Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Empowering organizations through psychological counseling and corporate training 
            to enhance employee well-being, resilience, and leadership skills.
          </p>
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
                        className="w-full text-white py-2.5 rounded-lg font-semibold transition-colors duration-200 text-sm" 
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

        {/* Core Values */}
        <div ref={valuesRef} className={`bg-gray-50 rounded-xl p-6 ${isValuesVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
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
            <h3 className="text-2xl font-bold mb-3">Ready to Transform Your Organization?</h3>
            <p className="text-lg mb-4 opacity-90">
              Invest in mental health and well-being to create a fulfilling and productive future for your organization.
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
      </div>
    </section>
  );
};

export default Services;