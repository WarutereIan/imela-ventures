import React, { useState, useEffect, useRef } from 'react';
import { Linkedin, Mail, Award, Star } from 'lucide-react';

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

const Team: React.FC = () => {
  const [headerRef, isHeaderVisible] = useIntersectionObserver();
  const [teamRef, isTeamVisible] = useIntersectionObserver();

  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Karen Mwangi',
      title: 'Founder & Lead Psychologist',
      image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=600',
      bio: 'Dr. Karen brings over 15 years of experience in clinical psychology and organizational development. She specializes in leadership development and corporate culture transformation.',
      credentials: ['PhD in Clinical Psychology', 'Certified Leadership Coach', 'Corporate Training Specialist'],
      specializations: ['Leadership Development', 'Corporate Culture', 'Executive Coaching'],
      email: 'karen@imelaventures.com',
      linkedin: '#'
    },
    {
      id: 2,
      name: 'Dr. James Kiprotich',
      title: 'Senior Psychologist',
      image: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=600',
      bio: 'Dr. James specializes in trauma therapy and stress management. With 12 years of experience, he has helped hundreds of individuals and families navigate life challenges.',
      credentials: ['PhD in Psychology', 'Trauma Therapy Specialist', 'Family Counselor'],
      specializations: ['Trauma Recovery', 'Stress Management', 'Family Therapy'],
      email: 'james@imelaventures.com',
      linkedin: '#'
    },
    {
      id: 3,
      name: 'Sarah Wanjiku',
      title: 'Corporate Training Specialist',
      image: 'https://images.pexels.com/photos/5327664/pexels-photo-5327664.jpeg?auto=compress&cs=tinysrgb&w=600',
      bio: 'Sarah is a certified corporate trainer with expertise in employee wellbeing programs and organizational psychology. She designs customized training solutions for various industries.',
      credentials: ['MA in Organizational Psychology', 'Certified Corporate Trainer', 'Wellbeing Consultant'],
      specializations: ['Employee Wellbeing', 'Team Building', 'Conflict Resolution'],
      email: 'sarah@imelaventures.com',
      linkedin: '#'
    },
    {
      id: 4,
      name: 'Michael Ochieng',
      title: 'Youth & Family Counselor',
      image: 'https://images.pexels.com/photos/5327647/pexels-photo-5327647.jpeg?auto=compress&cs=tinysrgb&w=600',
      bio: 'Michael focuses on adolescent psychology and family dynamics. His compassionate approach has helped numerous teens and families build stronger relationships.',
      credentials: ['MA in Counseling Psychology', 'Youth Specialist Certification', 'Family Mediation Training'],
      specializations: ['Teen Counseling', 'Family Mediation', 'Behavioral Support'],
      email: 'michael@imelaventures.com',
      linkedin: '#'
    }
  ];

  // Inject CSS animations
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
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

      .animate-fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className={`text-center mb-16 ${isHeaderVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Team</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our team of licensed professionals brings decades of combined experience in psychology, 
            counseling, and organizational development to support your journey.
          </p>
        </div>

        {/* Team Grid */}
        <div ref={teamRef} className={`grid lg:grid-cols-2 gap-8 ${isTeamVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`}>
          {teamMembers.map((member, index) => (
            <div 
              key={member.id} 
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="md:flex">
                {/* Image */}
                <div className="md:w-1/3">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="md:w-2/3 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-[#3AAFA9] font-semibold">{member.title}</p>
                    </div>
                    <div className="flex space-x-2">
                      <a 
                        href={`mailto:${member.email}`}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-[#3AAFA9] hover:text-white transition-colors duration-200"
                        title="Email"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                      <a 
                        href={member.linkedin}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-[#3AAFA9] hover:text-white transition-colors duration-200"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.bio}</p>

                  {/* Credentials */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <Award className="h-4 w-4 mr-1 text-[#3AAFA9]" />
                      Credentials
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {member.credentials.map((credential, i) => (
                        <span 
                          key={i}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {credential}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <Star className="h-4 w-4 mr-1 text-[#3AAFA9]" />
                      Specializations
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {member.specializations.map((spec, i) => (
                        <span 
                          key={i}
                          className="inline-block bg-[#3AAFA9] bg-opacity-10 text-[#3AAFA9] text-xs px-2 py-1 rounded font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className={`text-center mt-16 ${isTeamVisible ? 'opacity-0 animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Work With Our Team?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Schedule a consultation with one of our expert professionals and take the first step 
              towards achieving your personal or organizational goals.
            </p>
            <button 
              onClick={() => {
                const navigateEvent = new CustomEvent('navigate', { detail: 'booking' });
                window.dispatchEvent(navigateEvent);
              }}
              className="cta-primary bg-[#3AAFA9] text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 hover:bg-[#339B95] inline-flex items-center"
            >
              Schedule Consultation
              <Award className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;