import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, ArrowLeft, ArrowRight, X } from 'lucide-react';

// Add CSS for consultation highlight effect
const consultationHighlightStyles = `
  .consultation-highlight {
    animation: consultationPulse 2s ease-in-out;
    border: 2px solid #3AAFA9;
    border-radius: 12px;
    box-shadow: 0 0 20px rgba(58, 175, 169, 0.3);
  }

  @keyframes consultationPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(58, 175, 169, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(58, 175, 169, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(58, 175, 169, 0);
    }
  }
`;

const Booking: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    clientType: '',
    additionalInfo: ''
  });
  const [isBooked, setIsBooked] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<{[key: string]: string[]}>({});
  const [consultationDetails, setConsultationDetails] = useState<{
    title: string;
    description: string;
  } | null>(null);

  // Listen for service pre-selection event
  useEffect(() => {
    const handlePreSelectService = (event: CustomEvent) => {
      const { serviceId, consultationFor } = event.detail;
      if (serviceId === 'consultation' || serviceId === 'group-workshop') {
        setSelectedService(serviceId);
        setConsultationDetails(consultationFor);
        setStep(2); // Move to date selection step
        
        // Add a visual highlight effect
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
          bookingSection.classList.add('consultation-highlight');
          setTimeout(() => {
            bookingSection.classList.remove('consultation-highlight');
          }, 2000);
        }
      }
    };

    window.addEventListener('preSelectConsultation', handlePreSelectService as EventListener);
    
    return () => {
      window.removeEventListener('preSelectConsultation', handlePreSelectService as EventListener);
    };
  }, []);

  // Inject CSS styles for consultation highlight
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = consultationHighlightStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Check URL parameters for service pre-selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam === 'consultation') {
      setSelectedService('consultation');
      setStep(2);
    }
  }, []);

  const services = [
    {
      id: 'individual-adult',
      title: 'Individual Therapy - Adults',
      duration: '60 minutes',
      durationMinutes: 60,
      description: 'One-on-one counseling session for adults'
    },
    {
      id: 'individual-teen',
      title: 'Individual Therapy - Teens',
      duration: '50 minutes',
      durationMinutes: 50,
      description: 'Specialized therapy session for teenagers'
    },
    {
      id: 'couples-therapy',
      title: 'Couples Therapy',
      duration: '90 minutes',
      durationMinutes: 90,
      description: 'Joint counseling session for couples'
    },
    {
      id: 'group-workshop',
      title: 'Group Workshop',
      duration: '120 minutes',
      durationMinutes: 120,
      description: 'Group therapy session or workshop'
    },
    {
      id: 'consultation',
      title: 'Initial Consultation',
      duration: '30 minutes',
      durationMinutes: 30,
      description: 'Initial consultation to discuss your needs'
    }
  ];

  const allTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  // Mock unavailable dates and times - in a real app, this would come from an API
  const unavailableDates = new Set([
    '2024-12-25', '2024-12-26', '2024-01-01', // Holidays
    '2024-12-24', '2024-12-31' // Half days
  ]);

  const partiallyBookedDates: {[key: string]: string[]} = {
    '2024-12-23': ['10:00 AM', '02:00 PM'], // These times are unavailable
    '2024-12-27': ['09:00 AM', '11:00 AM', '03:00 PM'],
    '2024-12-30': ['12:00 PM', '04:00 PM']
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends for now
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push({
          date: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
    }
    return dates;
  };

  const availableDates = generateDates();

  // Helper functions for availability management
  const getAvailableTimeSlotsForDate = (date: string): string[] => {
    if (!date || unavailableDates.has(date)) return [];
    
    const bookedSlots = partiallyBookedDates[date] || [];
    return allTimeSlots.filter(slot => !bookedSlots.includes(slot));
  };

  const isDateAvailable = (date: string): boolean => {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    
    // Skip unavailable dates
    if (unavailableDates.has(date)) return false;
    
    // Check if date has any available time slots
    const availableSlots = getAvailableTimeSlotsForDate(date);
    return availableSlots.length > 0;
  };

  const getDateStatus = (date: string): 'available' | 'partially-booked' | 'unavailable' => {
    if (!isDateAvailable(date)) return 'unavailable';
    
    const availableSlots = getAvailableTimeSlotsForDate(date);
    const totalSlots = allTimeSlots.length;
    
    if (availableSlots.length === totalSlots) return 'available';
    return 'partially-booked';
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Generate 42 days (6 weeks) for calendar grid
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === new Date().toDateString();
      const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0));
      
      days.push({
        date: new Date(currentDate),
        dateStr,
        isCurrentMonth,
        isToday,
        isPast,
        status: isCurrentMonth && !isPast ? getDateStatus(dateStr) : 'unavailable'
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const createCalendarEvent = async (bookingData: {
    service: string;
    date: string;
    time: string;
    client: typeof formData;
  }) => {
    const selectedServiceData = services.find(s => s.id === bookingData.service);
    if (!selectedServiceData) return;

    // Convert time to 24-hour format for calendar
    const timeIn24Hour = convertTo24Hour(bookingData.time);
    const startDateTime = new Date(`${bookingData.date}T${timeIn24Hour}:00`);
    const endDateTime = new Date(startDateTime.getTime() + selectedServiceData.durationMinutes * 60000);

    const event = {
      summary: `${selectedServiceData.title} - ${bookingData.client.name}`,
      description: `
        Client: ${bookingData.client.name}
        Email: ${bookingData.client.email}
        Phone: ${bookingData.client.phone}
        Client Type: ${bookingData.client.clientType}
        ${bookingData.client.additionalInfo ? `Additional Info: ${bookingData.client.additionalInfo}` : ''}
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Africa/Nairobi',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Africa/Nairobi',
      },
      attendees: [
        {
          email: bookingData.client.email,
          displayName: bookingData.client.name,
        },
        {
          email: 'karenmuthonimwangi@gmail.com', // Counselor's email
          displayName: 'Karen Muthoni Mwangi',
        },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };

    try {
      // This would typically use the Google Calendar API
      // For now, we'll simulate the API call
      console.log('Creating calendar event:', event);
      
      // In a real implementation, you would:
      // 1. Authenticate with Google Calendar API
      // 2. Create the event using gapi.client.calendar.events.insert()
      // 3. Send confirmation emails to both parties
      
      return { success: true, eventId: 'simulated-event-id' };
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      return { success: false, error };
    }
  };

  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }
    return `${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookingData = {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      client: formData
    };

    console.log('Booking submitted:', bookingData);
    
    // Create calendar event
    const calendarResult = await createCalendarEvent(bookingData);
    
    if (calendarResult?.success) {
      console.log('Calendar event created successfully');
      setIsBooked(true);
    } else {
      console.error('Failed to create calendar event');
      // For now, still proceed with booking even if calendar creation fails
      setIsBooked(true);
    }
  };

  if (isBooked) {
    return (
      <section className="py-20 bg-white min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully scheduled. You'll receive a confirmation email shortly with all the details.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="text-sm text-gray-600 mb-2">Your Appointment:</div>
            <div className="font-semibold text-gray-900">{services.find(s => s.id === selectedService)?.title}</div>
            {(selectedService === 'consultation' || selectedService === 'group-workshop') && consultationDetails && (
              <div className="bg-white p-3 rounded-lg border-l-4 mt-3 mb-3" style={{ borderLeftColor: '#3AAFA9' }}>
                <div className="text-xs text-gray-600 mb-1">
                  {selectedService === 'consultation' ? 'Consultation Focus:' : 'Workshop Focus:'}
                </div>
                <div className="font-medium text-gray-900 text-sm mb-1">{consultationDetails.title}</div>
                <div className="text-gray-600 text-xs">{consultationDetails.description}</div>
              </div>
            )}
            <div className="text-gray-600">{selectedDate} at {selectedTime}</div>
          </div>
          <button 
            onClick={() => {
              setIsBooked(false);
              setStep(1);
              setSelectedService('');
              setSelectedDate('');
              setSelectedTime('');
              setConsultationDetails(null);
              setFormData({
                name: '',
                email: '',
                phone: '',
                clientType: '',
                additionalInfo: ''
              });
            }}
            className="text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            style={{ backgroundColor: '#3AAFA9' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#339B95'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
          >
            Book Another Session
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Book Your Session
          </h2>
          <p className="text-xl text-gray-600">
            Schedule your appointment in just a few simple steps
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber ? 'text-white' : 'text-gray-600'
                }`}
                style={{ backgroundColor: step >= stepNumber ? '#3AAFA9' : '#d1d5db' }}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`flex-1 h-1 rounded ${
                    step > stepNumber ? '' : 'bg-gray-300'
                  }`}
                  style={{ backgroundColor: step > stepNumber ? '#3AAFA9' : undefined }}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Select a Service</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-colors duration-200 ${
                      selectedService === service.id
                                              ? 'text-white'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={selectedService === service.id ? { backgroundColor: '#3AAFA9', borderColor: '#3AAFA9' } : undefined}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{service.title}</h4>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration}
                    </div>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Enhanced Date Picker */}
          {step === 2 && (
            <div>
              {/* Service Pre-selection Notice */}
              {(selectedService === 'consultation' || selectedService === 'group-workshop') && (
                <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-green-50 border border-teal-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-teal-600 mr-2" />
                    <div>
                      <p className="text-teal-800 font-medium">
                        {selectedService === 'consultation' ? 'Initial Consultation Selected' : 'Group Workshop Selected'}
                      </p>
                      <p className="text-teal-600 text-sm">
                        {selectedService === 'consultation' 
                          ? "Perfect choice! Let's schedule your 30-minute consultation to discuss your needs."
                          : "Great choice! Let's schedule your group workshop session for collaborative learning."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose a Date</h3>
              
              {/* Calendar Header */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h4 className="text-lg font-semibold">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {generateCalendarDays().map((day, index) => {
                    const isSelected = selectedDate === day.dateStr;
                    const canSelect = day.status !== 'unavailable' && day.isCurrentMonth && !day.isPast;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => canSelect ? setSelectedDate(day.dateStr) : null}
                        disabled={!canSelect}
                        className={`
                          relative p-2 text-sm rounded-lg transition-all duration-200
                          ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                          ${day.isPast ? 'text-gray-400 cursor-not-allowed' : ''}
                          ${day.isToday ? 'font-bold' : ''}
                          ${isSelected ? 'text-white' : ''}
                          ${canSelect && !isSelected ? 'hover:bg-gray-100 text-gray-900' : ''}
                          ${day.status === 'unavailable' ? 'text-gray-400 cursor-not-allowed' : ''}
                          ${day.status === 'partially-booked' && !isSelected ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${day.status === 'available' && !isSelected ? 'bg-green-100 text-green-800' : ''}
                        `}
                        style={isSelected ? { backgroundColor: '#3AAFA9' } : undefined}
                      >
                        <span>{day.date.getDate()}</span>
                        {/* Status indicator dots */}
                        {day.status === 'partially-booked' && !isSelected && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full"></div>
                        )}
                        {day.status === 'available' && !isSelected && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-sm mb-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-100 rounded mr-2"></div>
                  <span>Limited availability</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-200 rounded mr-2"></div>
                  <span>Unavailable</span>
                </div>
              </div>

              {/* Selected date info */}
              {selectedDate && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#E6F7F6' }}>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" style={{ color: '#3AAFA9' }} />
                                          <span className="font-medium" style={{ color: '#2D5A58' }}>
                      Selected: {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                                      <div className="text-sm mt-1" style={{ color: '#2D5A58' }}>
                    {getAvailableTimeSlotsForDate(selectedDate).length} time slots available
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Time */}
          {step === 3 && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Pick a Time</h3>
              
              {/* Selected date reminder */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>

              {/* Time slots */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allTimeSlots.map((time: string) => {
                  const isAvailable = getAvailableTimeSlotsForDate(selectedDate).includes(time);
                  const isSelected = selectedTime === time;
                  
                  return (
                    <button
                      key={time}
                      disabled={!isAvailable}
                      className={`p-4 rounded-lg border-2 transition-colors duration-200 relative ${
                        isSelected
                          ? 'text-white'
                          : isAvailable
                                                      ? 'border-gray-200 hover:border-gray-300 text-gray-900'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                              }`}
                        style={isSelected ? { backgroundColor: '#3AAFA9', borderColor: '#3AAFA9' } : undefined}
                        onClick={() => isAvailable ? setSelectedTime(time) : null}
                    >
                      <Clock className={`h-5 w-5 mx-auto mb-2 ${
                        isSelected ? '' : isAvailable ? 'text-gray-600' : 'text-gray-400'
                      }`} 
                      style={{ color: isSelected ? 'white' : undefined }} />
                      <div className="text-sm font-medium">{time}</div>
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <X className="h-6 w-6 text-red-400" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* No available slots message */}
              {getAvailableTimeSlotsForDate(selectedDate).length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-lg font-medium">No available time slots</p>
                    <p className="text-sm">Please select a different date</p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    style={{ backgroundColor: '#3AAFA9' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#339B95'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
                  >
                    Choose Different Date
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Client Information */}
          {step === 4 && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="clientType" className="block text-sm font-semibold text-gray-900 mb-2">
                      I am a *
                    </label>
                    <select
                      id="clientType"
                      name="clientType"
                      required
                      value={formData.clientType}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="new-client">New client</option>
                      <option value="returning-client">Returning client</option>
                      <option value="referred-client">Referred by someone</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-semibold text-gray-900 mb-2">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    rows={4}
                    value={formData.additionalInfo}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any specific concerns or questions you'd like to discuss..."
                  ></textarea>
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium">{services.find(s => s.id === selectedService)?.title}</span>
                    </div>
                    {(selectedService === 'consultation' || selectedService === 'group-workshop') && consultationDetails && (
                      <div className="bg-white p-4 rounded-lg border-l-4 mt-3" style={{ borderLeftColor: '#3AAFA9' }}>
                        <div className="mb-2">
                          <span className="text-gray-600 text-xs font-medium">
                            {selectedService === 'consultation' ? 'Consultation Focus:' : 'Workshop Focus:'}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold text-gray-900 text-sm">{consultationDetails.title}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 text-xs leading-relaxed">{consultationDetails.description}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{services.find(s => s.id === selectedService)?.duration}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full text-white py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                  style={{ backgroundColor: '#3AAFA9' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#339B95'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
                >
                  Confirm Booking
                </button>
              </form>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                step === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Previous
            </button>

            {step < 4 && (
              <button
                onClick={handleNext}
                disabled={
                  (step === 1 && !selectedService) ||
                  (step === 2 && !selectedDate) ||
                  (step === 3 && !selectedTime)
                }
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                  (step === 1 && !selectedService) ||
                  (step === 2 && !selectedDate) ||
                  (step === 3 && !selectedTime)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'text-white'
                                  }`}
                  style={
                    !((step === 1 && !selectedService) ||
                    (step === 2 && !selectedDate) ||
                    (step === 3 && !selectedTime)) ? { backgroundColor: '#3AAFA9' } : undefined
                  }
                  onMouseEnter={
                    !((step === 1 && !selectedService) ||
                    (step === 2 && !selectedDate) ||
                    (step === 3 && !selectedTime)) ? (e) => e.currentTarget.style.backgroundColor = '#339B95' : undefined
                  }
                  onMouseLeave={
                    !((step === 1 && !selectedService) ||
                    (step === 2 && !selectedDate) ||
                    (step === 3 && !selectedTime)) ? (e) => e.currentTarget.style.backgroundColor = '#3AAFA9' : undefined
                  }
                >
                  Next
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-8 text-gray-600">
          <p>Need help? Contact us at <a href="tel:+254721803569" className="text-blue-600 hover:underline" style={{ color: '#3AAFA9' }}>+254 721 803 569</a></p>
        </div>
      </div>
    </section>
  );
};

export default Booking; 