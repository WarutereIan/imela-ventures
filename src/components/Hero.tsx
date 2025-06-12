import React from 'react';
import { ArrowRight, Phone, Mail, Users, TrendingUp, Shield } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Professional Therapy
                <span className="text-blue-600 block">& Counseling Services</span>
                for Individuals & Organizations
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Expert psychological counseling for adults, teens, and couples, plus comprehensive 
                corporate training programs to enhance well-being, resilience, and leadership excellence.
              </p>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-1.5" />
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
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => window.scrollTo({ top: document.getElementById('client-groups')?.offsetTop || 0, behavior: 'smooth' })}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center group"
              >
                Explore Our Services
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button 
                onClick={() => {
                  const event = new CustomEvent('navigate', { detail: 'booking' });
                  window.dispatchEvent(event);
                }}
                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors duration-200 flex items-center justify-center"
              >
                <Phone className="h-4 w-4 mr-2" />
                Book Session
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-3">
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
          <div className="relative">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-xl">
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Professional corporate training environment"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-2 -right-2 bg-white p-3 rounded-lg shadow-lg">
              <div className="text-lg font-bold text-blue-600">100%</div>
              <div className="text-xs text-gray-600">Confidential</div>
            </div>
            <div className="absolute -bottom-2 -left-2 bg-white p-3 rounded-lg shadow-lg">
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