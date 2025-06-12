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
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ready to transform your organization? Contact us to learn more about our 
            counseling and corporate training services.
          </p>
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
                className="text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                style={{ backgroundColor: '#3AAFA9' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#339B95'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </button>

              <p className="text-sm text-gray-500 text-center">
                * Required fields. We'll respond within 24 hours.
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
                    <p className="font-medium text-gray-900 text-sm">info@imelaventures.com</p>
                    <p className="text-xs text-gray-600">Email for inquiries and consultations</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" style={{ color: '#3AAFA9' }} />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">+254 xxx xxx xxx</p>
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