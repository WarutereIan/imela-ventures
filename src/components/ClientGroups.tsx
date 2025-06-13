import React, { useState, useEffect, useRef } from 'react';
import { Users, Heart, MessageCircle, Calendar, Shield, CheckCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';

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

  .animate-delay-600 {
    animation-delay: 0.6s;
  }
`;

const ClientGroups: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Animation refs
  const [headerRef, isHeaderVisible] = useIntersectionObserver();
  const [cardsRef, isCardsVisible] = useIntersectionObserver();
  const [ctaRef, isCtaVisible] = useIntersectionObserver();

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

  // Navigation functions for buttons
  const handleScheduleWorkshop = () => {
    // Navigate to booking section with workshop pre-selected
    const navigateEvent = new CustomEvent('navigate', {
      detail: 'booking'
    });
    window.dispatchEvent(navigateEvent);
    
    // Pre-select group workshop service
    setTimeout(() => {
      const workshopEvent = new CustomEvent('preSelectConsultation', {
        detail: { 
          serviceId: 'group-workshop',
          consultationFor: null
        }
      });
      window.dispatchEvent(workshopEvent);
    }, 100);
  };

  const handleBookFreeConsultation = () => {
    // Navigate to booking section with consultation pre-selected
    const navigateEvent = new CustomEvent('navigate', {
      detail: 'booking'
    });
    window.dispatchEvent(navigateEvent);
    
    // Pre-select consultation service
    setTimeout(() => {
      const consultationEvent = new CustomEvent('preSelectConsultation', {
        detail: { 
          serviceId: 'consultation',
          consultationFor: {
            title: 'General Consultation',
            description: 'Initial consultation to discuss your mental health and wellness needs'
          }
        }
      });
      window.dispatchEvent(consultationEvent);
    }, 100);
  };

  const handleViewAllServices = () => {
    // Navigate to services section
    const navigateEvent = new CustomEvent('navigate', {
      detail: 'services'
    });
    window.dispatchEvent(navigateEvent);
  };

  const handleBookSession = (groupType: string) => {
    // Navigate to booking section
    const navigateEvent = new CustomEvent('navigate', {
      detail: 'booking'
    });
    window.dispatchEvent(navigateEvent);
    
    // Pre-select appropriate service based on group type
    setTimeout(() => {
      let serviceId = 'individual-adult'; // default
      let consultationDetails = null;
      
      if (groupType.toLowerCase().includes('teen') || groupType.toLowerCase().includes('adolescent')) {
        serviceId = 'individual-teen';
      } else if (groupType.toLowerCase().includes('couple') || groupType.toLowerCase().includes('family')) {
        serviceId = 'couples-therapy';
      }
      
      const bookingEvent = new CustomEvent('preSelectConsultation', {
        detail: { 
          serviceId: serviceId,
          consultationFor: consultationDetails
        }
      });
      window.dispatchEvent(bookingEvent);
    }, 100);
  };

  const handleLearnMore = (groupTitle: string) => {
    const groupIndex = clientGroups.findIndex(group => group.title === groupTitle);
    if (groupIndex !== -1) {
      openModal(clientGroups[groupIndex], groupIndex);
    }
  };

  // Modal functions
  const openModal = (group: any, index: number) => {
    setSelectedGroup(group);
    setSelectedGroupIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
    setSelectedGroupIndex(-1);
  };

  const navigateToGroup = (index: number) => {
    if (index < 0 || index >= clientGroups.length || isTransitioning) return;
    
    setIsTransitioning(true);
    setSelectedGroup(clientGroups[index]);
    setSelectedGroupIndex(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const navigateToNext = () => {
    const nextIndex = selectedGroupIndex === clientGroups.length - 1 ? 0 : selectedGroupIndex + 1;
    navigateToGroup(nextIndex);
  };

  const navigateToPrevious = () => {
    const prevIndex = selectedGroupIndex === 0 ? clientGroups.length - 1 : selectedGroupIndex - 1;
    navigateToGroup(prevIndex);
  };

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
  }, [isModalOpen, selectedGroupIndex, isTransitioning]);

  const clientGroups = [
    {
      icon: <Users className="h-12 w-12" />,
      title: 'Adults',
      subtitle: 'Professional & Personal Growth',
      category: 'Adult Therapy',
      description: 'Comprehensive counseling services for adults facing work-life challenges, stress management, and personal development.',
      services: [
        'Stress & Anxiety Management',
        'Career Counseling',
        'Life Transitions Support',
        'Work-Life Balance',
        'Personal Development',
        'Self-Esteem Building'
      ],
      features: [
        'Individual 1-on-1 Sessions',
        'Group Workshops',
        'Online & In-Person Options',
        'Flexible Scheduling'
      ],
      color: 'blue',
      image: 'https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=800',
      heroImage: 'https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=1200',
      sections: [
        {
          title: 'Understanding Adult Mental Health',
          image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Adult mental health encompasses the emotional, psychological, and social well-being of individuals in their professional and personal lives. Our approach recognizes that adults face unique challenges including career pressures, relationship dynamics, financial stress, and life transitions that require specialized therapeutic interventions.'
        },
        {
          title: 'Our Therapeutic Approach',
          image: 'https://images.pexels.com/photos/3184394/pexels-photo-3184394.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'We utilize evidence-based therapeutic modalities including Cognitive Behavioral Therapy (CBT), Mindfulness-Based Stress Reduction (MBSR), and Solution-Focused Brief Therapy. Our therapists are trained to address the complex interplay between work stress, personal relationships, and individual well-being.'
        },
        {
          title: 'Common Areas We Address',
          image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Work-related stress and burnout, relationship challenges, life transitions (career changes, divorce, loss), anxiety and depression, self-esteem and confidence issues, work-life balance, and personal growth and development. Each session is tailored to your specific needs and goals.'
        }
      ]
    },
    {
      icon: <Heart className="h-12 w-12" />,
      title: 'Teens',
      subtitle: 'Navigating Adolescence with Confidence',
      category: 'Teen Therapy',
      description: 'Specialized support for teenagers dealing with identity, relationships, academic pressure, and emotional challenges.',
      services: [
        'Identity & Self-Discovery',
        'Academic Stress Management',
        'Social Skills Development',
        'Family Relationship Issues',
        'Emotional Regulation',
        'Future Planning & Goals'
      ],
      features: [
        'Age-Appropriate Techniques',
        'Parent Consultation Available',
        'Safe & Confidential Environment',
        'Creative Therapy Methods'
      ],
      color: 'purple',
      image: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=800',
      heroImage: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1200',
      sections: [
        {
          title: 'Understanding Adolescent Development',
          image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Adolescence is a critical period of physical, emotional, and cognitive development. Teenagers face unique challenges including identity formation, peer pressure, academic stress, and family dynamics. Our teen-focused therapy provides a safe space for young people to explore their feelings, develop coping strategies, and build resilience.'
        },
        {
          title: 'Specialized Teen Therapy Techniques',
          image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'We use age-appropriate therapeutic approaches including art therapy, music therapy, narrative therapy, and cognitive-behavioral techniques adapted for adolescents. Our therapists are specially trained to communicate effectively with teenagers and understand the unique challenges they face in today\'s world.'
        },
        {
          title: 'Common Teen Issues We Address',
          image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Academic pressure and performance anxiety, social media and peer pressure, identity and self-esteem issues, family conflicts and communication problems, depression and anxiety, behavioral challenges, and future planning and career guidance. We also provide support for teens dealing with trauma, grief, or major life changes.'
        }
      ]
    },
    {
      icon: <MessageCircle className="h-12 w-12" />,
      title: 'Couples',
      subtitle: 'Building Stronger Relationships',
      category: 'Couples Therapy',
      description: 'Expert guidance for couples seeking to strengthen their relationship, improve communication, and resolve conflicts.',
      services: [
        'Communication Enhancement',
        'Conflict Resolution',
        'Trust Building',
        'Intimacy & Connection',
        'Pre-Marital Counseling',
        'Relationship Maintenance'
      ],
      features: [
        'Joint & Individual Sessions',
        'Structured Relationship Programs',
        'Homework & Exercises',
        'Progress Tracking'
      ],
      color: 'green',
      image: 'https://images.pexels.com/photos/6146990/pexels-photo-6146990.jpeg?auto=compress&cs=tinysrgb&w=800',
      heroImage: 'https://images.pexels.com/photos/6146990/pexels-photo-6146990.jpeg?auto=compress&cs=tinysrgb&w=1200',
      sections: [
        {
          title: 'The Foundation of Healthy Relationships',
          image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Strong relationships are built on trust, communication, mutual respect, and emotional intimacy. Our couples therapy approach focuses on helping partners understand each other\'s needs, improve communication patterns, and develop healthy conflict resolution skills. We believe that with the right tools and guidance, couples can overcome challenges and build lasting, fulfilling relationships.'
        },
        {
          title: 'Evidence-Based Couples Therapy',
          image: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'We utilize proven therapeutic approaches including Emotionally Focused Therapy (EFT), the Gottman Method, and Imago Relationship Therapy. These evidence-based methods help couples identify negative patterns, enhance emotional connection, and develop practical skills for maintaining a healthy relationship long-term.'
        },
        {
          title: 'What We Help Couples With',
          image: 'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?auto=compress&cs=tinysrgb&w=600',
          content: 'Communication breakdowns and frequent arguments, trust issues and infidelity recovery, intimacy and connection challenges, financial stress and disagreements, parenting conflicts and blended family issues, pre-marital preparation and relationship strengthening, separation and divorce counseling, and rebuilding relationships after major life changes or trauma.'
        }
      ]
    }
  ];

  const workshops = [
    {
      title: 'Stress Management Workshop',
      audience: 'Adults',
      duration: '2 hours',
      format: 'Group Session',
      description: 'Learn practical techniques for managing workplace and personal stress.'
    },
    {
      title: 'Teen Confidence Building',
      audience: 'Teens',
      duration: '1.5 hours',
      format: 'Interactive Group',
      description: 'Build self-confidence and develop healthy coping strategies.'
    },
    {
      title: 'Communication for Couples',
      audience: 'Couples',
      duration: '3 hours',
      format: 'Couples Workshop',
      description: 'Enhance communication skills and deepen emotional connection.'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: '',
        text: '',
        button: '',
        accent: ''
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        button: 'bg-purple-600 hover:bg-purple-700',
        accent: 'bg-purple-600'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        button: 'bg-green-600 hover:bg-green-700',
        accent: 'bg-green-600'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!isUserInteracting) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === clientGroups.length - 1 ? 0 : prevIndex + 1
        );
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [isUserInteracting, clientGroups.length]);

  // Reset user interaction flag after 5 seconds
  useEffect(() => {
    if (isUserInteracting) {
      const timeout = setTimeout(() => {
        setIsUserInteracting(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isUserInteracting]);

  const goToNext = () => {
    setIsUserInteracting(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === clientGroups.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrev = () => {
    setIsUserInteracting(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? clientGroups.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setIsUserInteracting(true);
    setCurrentIndex(index);
  };

  return (
    <section id="client-groups" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className={`text-center mb-16 ${isHeaderVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Specialized Therapy Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional counseling tailored to meet the unique needs of different client groups. 
            Find the right support for your journey to mental wellness and personal growth.
          </p>
        </div>

        {/* Client Groups - Full Width Carousel */}
        <div ref={cardsRef} className={`mb-20 relative ${isCardsVisible ? 'opacity-0 animate-fade-in-up animate-delay-200' : 'opacity-0'}`}>
          {/* Main Carousel Container */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {clientGroups.map((group, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className={`${index % 2 === 0 ? '' : 'flex-row-reverse'} flex flex-col lg:flex-row min-h-[350px]`}>
                    {/* Image Section - Smaller rectangular image */}
                    <div className="lg:w-2/5 relative flex items-center justify-center p-2 lg:p-4">
                      <div className="w-full max-w-sm">
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                          <img
                            src={group.image}
                            alt={`${group.title} therapy session`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                          
                          {/* Image overlay badge */}
                          <div className="absolute top-2 left-2">
                            <div className={`inline-flex p-1.5 rounded-lg ${getColorClasses(group.color).bg} ${getColorClasses(group.color).text}`}>
                              {group.icon}
                            </div>
                          </div>
                          
                          <div className="absolute bottom-2 left-2 text-white">
                            <div className="text-xs font-medium opacity-90">{group.category || 'Therapy'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Section - Takes up more width */}
                    <div className="lg:w-3/5 p-3 lg:p-4 flex flex-col justify-center">
                      {/* Header - visible on all screens */}
                      <div className="mb-3">
                        <div className={`inline-flex p-2 rounded-lg ${getColorClasses(group.color).bg} ${getColorClasses(group.color).text} mb-1 lg:hidden`}>
                          {group.icon}
                        </div>
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{group.title}</h3>
                        <p className="text-sm lg:text-base text-gray-600 mb-1">{group.subtitle}</p>
                      </div>

                      <p className="text-gray-700 mb-3 text-sm leading-relaxed">{group.description}</p>

                      {/* Services and Features in two columns */}
                      <div className="grid md:grid-cols-2 gap-3 mb-3">
                        {/* Services */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1.5">Our Services Include:</h4>
                          <div className="space-y-1">
                            {group.services.map((service, i) => (
                              <div key={i} className="flex items-center text-xs text-gray-600">
                                <CheckCircle className="h-2.5 w-2.5 text-green-500 mr-1.5 flex-shrink-0" />
                                {service}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Features */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1.5">What to Expect:</h4>
                          <div className="space-y-1">
                            {group.features.map((feature, i) => (
                              <div key={i} className="flex items-center text-xs text-gray-600">
                                <Shield className="h-2.5 w-2.5 text-blue-500 mr-1.5 flex-shrink-0" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button 
                          className="text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 flex-1"
                          style={{ backgroundColor: '#3AAFA9' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#339B95'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
                          onClick={() => handleBookSession(group.title)}
                        >
                          Book Session
                        </button>
                        <button 
                          className="border-2 border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 flex-1"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3AAFA9';
                            e.currentTarget.style.color = '#3AAFA9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.color = '#374151';
                          }}
                          onClick={() => handleLearnMore(group.title)}
                        >
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>

          {/* Dots Navigation */}
          <div className="flex justify-center mt-4 space-x-2">
            {clientGroups.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                                    ? 'scale-125'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            style={{ backgroundColor: currentIndex === index ? '#3AAFA9' : undefined }}
          />
            ))}
          </div>

          {/* Auto-scroll indicator */}
          {!isUserInteracting && (
            <div className="absolute top-4 right-4 bg-black/20 text-white text-xs px-3 py-1 rounded-full">
              Auto-scrolling in 30s
            </div>
          )}
        </div>

        {/* Workshops Section */}
        <div ref={ctaRef} className={`bg-white rounded-2xl p-8 shadow-lg ${isCtaVisible ? 'opacity-0 animate-fade-in-up animate-delay-400' : 'opacity-0'}`}>
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Group Classes & Workshops</h3>
            <p className="text-lg text-gray-600">
              Join our specialized group sessions designed for peer support and shared learning experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {workshops.map((workshop, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                <h4 className="text-xl font-bold text-gray-900 mb-3">{workshop.title}</h4>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Audience:</span>
                    <span className="font-medium text-gray-900">{workshop.audience}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-900">{workshop.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium text-gray-900">{workshop.format}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{workshop.description}</p>

                <button 
                className="w-full text-white py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
                style={{ backgroundColor: '#3AAFA9' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#339B95'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
                onClick={handleScheduleWorkshop}
              >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Workshop
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r rounded-2xl p-8 text-white" style={{ background: 'linear-gradient(to right, #3AAFA9, #8b5cf6)' }}>
            <h3 className="text-3xl font-bold mb-4">Ready to Begin Your Journey?</h3>
            <p className="text-xl mb-6 opacity-90">
              Take the first step towards better mental health and personal growth. 
              Book a consultation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
                style={{ backgroundColor: 'white', color: '#3AAFA9' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                onClick={handleBookFreeConsultation}
              >
                Book Free Consultation
              </button>
              <button 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#3AAFA9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'white';
                }}
                onClick={handleViewAllServices}
              >
                View All Services
              </button>
            </div>
          </div>
        </div>

        {/* Modal for Group Details */}
        {isModalOpen && selectedGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: '#3AAFA9' }}>
                    {selectedGroup.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedGroup.title} Therapy</h2>
                    <p className="text-sm text-gray-600">{selectedGroup.subtitle}</p>
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
                    title="Previous Group (←)"
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
                    title="Next Group (→)"
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
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 group"
                    title="Close (Esc)"
                  >
                    <X className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Hero Section */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={selectedGroup.heroImage}
                    alt={selectedGroup.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-3xl font-bold mb-2">{selectedGroup.title} Therapy Services</h3>
                      <p className="text-lg opacity-90">{selectedGroup.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Content Sections */}
                <div className="p-6 space-y-8">
                  {selectedGroup.sections?.map((section: any, index: number) => (
                    <div key={index} className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="md:w-1/3">
                        <img
                          src={section.image}
                          alt={section.title}
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                      </div>
                      <div className="md:w-2/3">
                        <h4 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h4>
                        <p className="text-gray-700 leading-relaxed">{section.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Services and Features */}
                  <div className="grid md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Our Services Include:</h4>
                      <div className="space-y-2">
                        {selectedGroup.services.map((service: string, i: number) => (
                          <div key={i} className="flex items-center text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            {service}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">What to Expect:</h4>
                      <div className="space-y-2">
                        {selectedGroup.features.map((feature: string, i: number) => (
                          <div key={i} className="flex items-center text-gray-700">
                            <Shield className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="bg-gray-50 rounded-lg p-6 text-center mt-8">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Ready to Get Started?</h4>
                    <p className="text-gray-600 mb-4">
                      Take the first step towards better mental health and personal growth.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button 
                        className="text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                        style={{ backgroundColor: '#3AAFA9' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#339B95'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
                        onClick={() => {
                          closeModal();
                          handleBookSession(selectedGroup.title);
                        }}
                      >
                        Book Session
                      </button>
                      <button 
                        className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#3AAFA9';
                          e.currentTarget.style.color = '#3AAFA9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.color = '#374151';
                        }}
                        onClick={() => {
                          closeModal();
                          handleBookFreeConsultation();
                        }}
                      >
                        Free Consultation
                      </button>
                    </div>
                  </div>
                </div>

                {/* Navigation Dots */}
                <div className="flex justify-center py-4 space-x-2 border-t border-gray-200">
                  {clientGroups.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToGroup(index)}
                      disabled={isTransitioning}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === selectedGroupIndex 
                          ? 'scale-125' 
                          : 'hover:scale-110'
                      } ${isTransitioning ? 'cursor-not-allowed opacity-50' : ''}`}
                      style={{ backgroundColor: index === selectedGroupIndex ? '#3AAFA9' : '#d1d5db' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ClientGroups; 