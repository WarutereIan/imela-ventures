import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const services = [
    'Leadership Development & Training',
    'Corporate Culture Transformation',
    'Personalized Counseling Services',
    'Conflict Resolution Support',
    'Culture Audit & Assessment',
    'General Inquiry'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section className="py-20 bg-white min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for reaching out to Imela Ventures. We'll contact you within 24 hours to discuss your needs.
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            style={{ backgroundColor: '#3AAFA9' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#339B95'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
          >
            Send Another Message
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header with Urgency */}
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-[#3AAFA9] to-[#339B95] text-white px-8 py-3 rounded-full text-lg font-bold mb-6 shadow-lg">
            🎯 FREE Initial Consultation - Limited Time
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Organization?
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6">
            Book your <strong className="text-[#3AAFA9]">FREE consultation</strong> today and discover how our expert team can help you achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="font-semibold">No Commitment Required</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="font-semibold">24-Hour Response Guarantee</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="font-semibold">Expert Guidance</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Company/Organization *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Your organization"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="+254 721 803 569"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Service of Interest *
                </label>
                <select
                  id="service"
                  name="service"
                  required
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                >
                  <option value="">Select a service</option>
                  {services.map((service, index) => (
                    <option key={index} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Tell us about your organization's needs and how we can help..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#3AAFA9] to-[#339B95] text-white py-4 rounded-xl font-bold text-lg hover:from-[#339B95] hover:to-[#2A8B87] transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
              >
                <Send className="h-6 w-6 mr-3" />
                🚀 Get My FREE Consultation Now
              </button>
              
              <p className="text-center text-sm text-gray-500 mt-3">
                ⚡ We'll respond within 24 hours with your personalized consultation details
              </p>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="rounded-xl p-5" style={{ backgroundColor: '#E6F7F6' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-1" style={{ color: '#3AAFA9' }} />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Nairobi, Kenya</p>
                    <p className="text-gray-600 text-xs">Serving organizations across Kenya and East Africa</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3" style={{ color: '#3AAFA9' }} />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">mwangikaren77@gmail.com</p>
                    <p className="text-xs text-gray-600">Email for inquiries and consultations</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" style={{ color: '#3AAFA9' }} />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">+254 721 803 569</p>
                    <p className="text-xs text-gray-600">Call for immediate assistance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Why Choose Imela Ventures?</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Expert Leadership</p>
                    <p className="text-xs text-gray-600">Led by experienced counselor Karen Muthoni Mwangi</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Comprehensive Approach</p>
                    <p className="text-xs text-gray-600">Holistic solutions for organizational transformation</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Proven Results</p>
                    <p className="text-xs text-gray-600">Track record of successful culture transformations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Confidential & Professional</p>
                    <p className="text-xs text-gray-600">Maintaining highest standards of confidentiality</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="rounded-xl p-5 text-white text-center" style={{ backgroundColor: '#3AAFA9' }}>
              <h4 className="text-lg font-bold mb-2">
                Ready to Transform Your Organization?
              </h4>
              <p className="mb-3 opacity-90 text-sm">
                Let's discuss how we can help enhance your employee well-being and leadership capabilities.
              </p>
              <button 
                className="px-5 py-2.5 rounded-lg font-semibold transition-colors duration-200 text-sm"
                style={{ backgroundColor: 'white', color: '#3AAFA9' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Schedule Free Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;