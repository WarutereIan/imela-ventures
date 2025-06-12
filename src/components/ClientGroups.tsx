import React, { useState, useEffect } from 'react';
import { Users, Heart, MessageCircle, Calendar, Shield, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const ClientGroups: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

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
      image: 'https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=800'
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
      image: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=800'
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
      image: 'https://images.pexels.com/photos/6146990/pexels-photo-6146990.jpeg?auto=compress&cs=tinysrgb&w=800'
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
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Specialized Therapy Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional counseling tailored to meet the unique needs of different client groups. 
            Find the right support for your journey to mental wellness and personal growth.
          </p>
        </div>

        {/* Client Groups - Full Width Carousel */}
        <div className="mb-20 relative">
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
        <div className="bg-white rounded-2xl p-8 shadow-lg">
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
              >
                View All Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientGroups; 