import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Heart, MessageSquare, Shield, Target, ChevronLeft, ChevronRight } from 'lucide-react';

const Services: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

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
      color: 'blue'
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
      color: 'green'
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
      color: 'red'
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
      color: 'purple'
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

  return (
    <section id="services" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Comprehensive Corporate Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Empowering organizations through psychological counseling and corporate training 
            to enhance employee well-being, resilience, and leadership skills.
          </p>
        </div>

        {/* Services Carousel */}
        <div className="relative mb-12">
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
        <div className="bg-gray-50 rounded-xl p-6">
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
        <div className="text-center mt-10">
          <div className="rounded-xl p-6 text-white" style={{ backgroundColor: '#3AAFA9' }}>
            <h3 className="text-2xl font-bold mb-3">Ready to Transform Your Organization?</h3>
            <p className="text-lg mb-4 opacity-90">
              Invest in mental health and well-being to create a fulfilling and productive future for your organization.
            </p>
            <button 
              className="px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              style={{ backgroundColor: 'white', color: '#3AAFA9' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Schedule a Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;