import React, { useEffect, useRef, useState } from 'react';
import { Target, CheckCircle, Briefcase, Heart, Brain, Shield, Lightbulb } from 'lucide-react';

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

  // Team Members
  const teamMembers = [
    {
      name: 'Dr. Karen Mwangi',
      title: 'Founder & Lead Psychologist',
      credentials: 'PhD in Clinical Psychology, Licensed Clinical Psychologist',
      experience: '15+ years',
      specialties: ['Trauma Therapy', 'Organizational Psychology', 'Leadership Development'],
      bio: 'Dr. Karen brings over 15 years of experience in clinical psychology and organizational development. She holds a PhD from the University of Nairobi and has worked with Fortune 500 companies across East Africa. Her expertise in trauma-informed care and leadership psychology has transformed over 200 organizations.',
      avatar: 'KM'
    },
    {
      name: 'Jason Maina',
      title: 'Senior System Developer',
      credentials: 'BA. in Computer Science',
      experience: '10+ years',
      specialties: ['Data Engineering', 'System Dynamics', 'System Management'],
      bio: 'Jason specializes in system performance and transformation. With an BA from St. Paul\'s University and ICF certification, he has guided C-suite executives through complex leadership challenges, resulting in measurable improvements in team performance and organizational culture.',
      avatar: 'JM'
    },
    
    
  ];


  const approaches = [
    'Leadership Theory Integration',
    'Experiential Learning Methods',
    'Comprehensive Culture Audits',
    'Personalized Counseling Approaches',
    'Conflict Resolution Strategies',
    'Mental Health & Well-being Focus'
  ];

  // Methodology Steps
  const methodologySteps = [
    {
      step: '01',
      title: 'Assessment & Discovery',
      description: 'Comprehensive organizational culture audit, stakeholder interviews, and psychological assessments to understand current dynamics and challenges.',
      icon: <Brain className="h-6 w-6" />
    },
    {
      step: '02',
      title: 'Strategy Development',
      description: 'Customized intervention plans based on assessment findings, incorporating evidence-based psychological theories and leadership frameworks.',
      icon: <Lightbulb className="h-6 w-6" />
    },
    {
      step: '03',
      title: 'Implementation',
      description: 'Rollout of training programs, counseling services, and leadership development initiatives with continuous monitoring and adjustment.',
      icon: <Target className="h-6 w-6" />
    },
    {
      step: '04',
      title: 'Evaluation & Growth',
      description: 'Regular assessment of outcomes, measurement of key performance indicators, and ongoing support for sustainable transformation.',
      icon: <Shield className="h-6 w-6" />
    }
  ];

  // Certifications and Accreditations
  const certifications = [
    'International Coaching Federation (ICF) Certified',
    'Kenya Psychological Association Licensed',
    'Association for Talent Development (ATD) Member',
    'Society for Human Resource Management (SHRM) Certified',
    'Trauma-Informed Care Certified',
    'Diversity, Equity & Inclusion (DEI) Specialist'
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

        {/* Mission & Vision with Visual Enhancement */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div ref={imageRef} className={`${isImageVisible ? 'opacity-0 animate-fade-in-left' : 'opacity-0'}`}>
            <div className="relative bg-gradient-to-br from-[#3AAFA9] to-[#339B95] rounded-2xl p-8 text-white overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 mr-3" />
                  <h3 className="text-2xl font-bold">{mission.title}</h3>
                </div>
                <p className="text-lg leading-relaxed mb-6">{mission.description}</p>
                
                {/* Mission Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold">15+</div>
                    <div className="text-sm opacity-90">Years Experience</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold">500+</div>
                    <div className="text-sm opacity-90">Lives Impacted</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div ref={contentRef} className={`${isContentVisible ? 'opacity-0 animate-fade-in-right' : 'opacity-0'}`}>
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 border-2 border-green-200 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 left-0 w-28 h-28 bg-green-200/30 rounded-full -translate-y-14 -translate-x-14"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-green-200/30 rounded-full translate-y-10 translate-x-10"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <Lightbulb className="h-8 w-8 mr-3 text-green-600" />
                  <h3 className="text-2xl font-bold text-gray-900">{vision.title}</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">{vision.description}</p>
                
                {/* Vision Impact */}
                <div className="space-y-3">
                  <div className="flex items-center text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-semibold">Creating supportive environments</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-semibold">Fostering innovation</span>
                  </div>
                  <div className="flex items-center text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-semibold">Developing emotionally intelligent leaders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Team</h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our diverse team of experienced professionals brings together expertise in psychology, 
              leadership development, and organizational transformation to deliver exceptional results.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  {/* Header with Avatar and Basic Info */}
                  <div className="flex items-start space-x-6 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#3AAFA9] to-[#339B95] rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {member.avatar}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#3AAFA9] transition-colors duration-300">
                        {member.name}
                      </h4>
                      <p className="text-lg font-semibold text-[#3AAFA9] mb-2">{member.title}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{member.credentials}</p>
                      
                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <Briefcase className="h-4 w-4 mr-2 text-[#3AAFA9]" />
                        <span className="font-medium">{member.experience} experience</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Biography */}
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {member.bio}
                    </p>
                  </div>
                  
                  {/* Specialties */}
                  <div>
                    <h5 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Specialties</h5>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#E6F7F6] to-[#F0FDFA] text-[#3AAFA9] text-sm font-semibold rounded-full border border-[#3AAFA9]/20 hover:bg-[#3AAFA9] hover:text-white transition-all duration-300 cursor-pointer"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Decorative Element */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-[#3AAFA9] rounded-full opacity-60"></div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 font-medium">
                        Expert Professional
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Team Stats */}
          <div className="mt-16 bg-gradient-to-r from-[#3AAFA9] to-[#339B95] rounded-2xl p-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">25+</div>
                <div className="text-sm opacity-90">Years Combined Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">200+</div>
                <div className="text-sm opacity-90">Organizations Transformed</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">5000+</div>
                <div className="text-sm opacity-90">Lives Impacted</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Methodology Section with Visual Flow */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Proven Methodology</h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A comprehensive 4-step process that ensures successful outcomes for every client engagement.
            </p>
          </div>
          
          <div className="relative">
            {/* Connection Lines for Desktop */}
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-[#3AAFA9] via-green-400 to-[#3AAFA9]"></div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {methodologySteps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step Number with Enhanced Design */}
                  <div className="relative mb-6">
                    <div className="bg-gradient-to-br from-[#3AAFA9] to-[#339B95] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-xl">
                      {step.step}
                    </div>
                    {/* Connection Arrow for Mobile */}
                    {index < methodologySteps.length - 1 && (
                      <div className="lg:hidden absolute top-8 left-1/2 transform translate-x-4 w-8 h-0.5 bg-[#3AAFA9]"></div>
                    )}
                  </div>
                  
                  {/* Step Content with Visual Enhancement */}
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-[#3AAFA9]/10 rounded-full flex items-center justify-center">
                          {step.icon}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h4>
                      <p className="text-sm text-gray-700 leading-relaxed mb-4">{step.description}</p>
                      
                      {/* Step Duration */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-gray-700">
                          Duration: {index === 0 ? '1-2 weeks' : index === 1 ? '2-4 weeks' : index === 2 ? '4-8 weeks' : 'Ongoing'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              </div>
              
          {/* Methodology Stats */}
          <div className="mt-16 bg-gradient-to-r from-[#3AAFA9]/10 to-green-100 rounded-2xl p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-[#3AAFA9] mb-2">95%</div>
                <div className="text-gray-600 font-semibold">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">4-12</div>
                <div className="text-gray-600 font-semibold">Weeks Duration</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600 font-semibold">Support Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications & Credentials */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Credentials & Certifications</h3>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-sm font-semibold">{cert}</span>
                </div>
              ))}
            </div>
              </div>
            </div>

        {/* Our Approach */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Comprehensive Approach</h3>
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Evidence-Based Practice</h4>
                <p className="text-gray-700 leading-relaxed mb-6">
                  We integrate cutting-edge psychological research with practical application, 
                  ensuring our interventions are both scientifically sound and practically effective. 
                  Our approach combines cognitive-behavioral techniques, positive psychology, 
                  and organizational development theories.
                </p>
                
                <h4 className="text-xl font-bold text-gray-900 mb-4">Cultural Sensitivity</h4>
                <p className="text-gray-700 leading-relaxed">
                  Understanding the unique cultural context of East African organizations, 
                  we tailor our interventions to respect local values while incorporating 
                  international best practices in psychology and leadership development.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Measurable Outcomes</h4>
                <p className="text-gray-700 leading-relaxed mb-6">
                  We believe in data-driven transformation. Our programs include comprehensive 
                  pre and post-assessments, regular progress monitoring, and clear metrics 
                  to demonstrate return on investment and lasting behavioral change.
                </p>
                
                <h4 className="text-xl font-bold text-gray-900 mb-4">Sustainable Impact</h4>
                <p className="text-gray-700 leading-relaxed">
                  Beyond immediate results, we focus on building internal capacity and 
                  creating systems that ensure long-term organizational health and 
                  continued growth beyond our direct involvement.
                </p>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                {approaches.map((approach, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  <span className="text-sm font-semibold">{approach}</span>
                  </div>
                ))}
            </div>
              </div>
            </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2" style={{ borderColor: '#3AAFA9' }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Organization?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Let our expert team help you create a culture of excellence, resilience, and growth. 
              Contact us today to discuss your organization's unique needs and challenges.
              </p>
              <button 
                onClick={handleLearnAboutServices}
              className="bg-[#3AAFA9] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#339B95] transition-colors duration-200 inline-flex items-center justify-center"
              >
              <Heart className="h-5 w-5 mr-2" />
                Learn About Our Services
              </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;