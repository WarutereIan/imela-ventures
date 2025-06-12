import React, { useState } from 'react';
import { Play, Lock, Download, Calendar, User, Search, Filter, BookOpen, Video, Users, Star } from 'lucide-react';

const MemberPortal: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would authenticate against your backend
    setIsLoggedIn(true);
  };

  const premiumContent = {
    videos: [
      {
        id: 1,
        title: 'Stress Management Techniques for Adults',
        category: 'adults',
        duration: '45 min',
        description: 'Learn effective techniques to manage stress in your daily life.',
        thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
        level: 'Beginner',
        rating: 4.8,
        views: 234
      },
      {
        id: 2,
        title: 'Communication Skills for Couples',
        category: 'couples',
        duration: '60 min',
        description: 'Enhance your relationship through better communication.',
        thumbnail: 'https://images.pexels.com/photos/6146990/pexels-photo-6146990.jpeg?auto=compress&cs=tinysrgb&w=400',
        level: 'Intermediate',
        rating: 4.9,
        views: 189
      },
      {
        id: 3,
        title: 'Building Confidence in Teenagers',
        category: 'teens',
        duration: '35 min',
        description: 'Help teenagers build self-confidence and resilience.',
        thumbnail: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=400',
        level: 'Beginner',
        rating: 4.7,
        views: 156
      },
      {
        id: 4,
        title: 'Mindfulness and Meditation Basics',
        category: 'adults',
        duration: '30 min',
        description: 'Introduction to mindfulness practices for mental wellness.',
        thumbnail: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400',
        level: 'Beginner',
        rating: 4.6,
        views: 298
      },
      {
        id: 5,
        title: 'Conflict Resolution Workshop',
        category: 'couples',
        duration: '75 min',
        description: 'Learn to resolve conflicts constructively in relationships.',
        thumbnail: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=400',
        level: 'Advanced',
        rating: 4.8,
        views: 167
      },
      {
        id: 6,
        title: 'Managing Academic Pressure',
        category: 'teens',
        duration: '40 min',
        description: 'Strategies for teens to handle academic stress effectively.',
        thumbnail: 'https://images.pexels.com/photos/4778621/pexels-photo-4778621.jpeg?auto=compress&cs=tinysrgb&w=400',
        level: 'Intermediate',
        rating: 4.5,
        views: 201
      }
    ],
    worksheets: [
      {
        id: 1,
        title: 'Daily Stress Assessment Tool',
        category: 'adults',
        type: 'PDF',
        description: 'Track and assess your daily stress levels.'
      },
      {
        id: 2,
        title: 'Couple Communication Exercises',
        category: 'couples',
        type: 'PDF',
        description: 'Practical exercises to improve relationship communication.'
      },
      {
        id: 3,
        title: 'Teen Confidence Building Activities',
        category: 'teens',
        type: 'PDF',
        description: 'Fun activities to boost teenage self-confidence.'
      }
    ],
    webinars: [
      {
        id: 1,
        title: 'Mental Health in the Workplace',
        date: '2024-02-15',
        time: '2:00 PM EAT',
        category: 'adults',
        description: 'Live session on maintaining mental health at work.',
        attendees: 45
      },
      {
        id: 2,
        title: 'Parenting Teenagers Workshop',
        date: '2024-02-20',
        time: '6:00 PM EAT',
        category: 'teens',
        description: 'Supporting parents in understanding teenage development.',
        attendees: 32
      }
    ]
  };

  const categories = [
    { id: 'all', label: 'All Content' },
    { id: 'adults', label: 'Adults' },
    { id: 'teens', label: 'Teens' },
    { id: 'couples', label: 'Couples' }
  ];

  const filteredVideos = premiumContent.videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isLoggedIn) {
    return (
      <section className="py-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Member Portal</h2>
              <p className="text-gray-600">Access exclusive content and resources</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have access? 
                <a href="#contact" className="text-blue-600 hover:underline ml-1">Contact us</a>
              </p>
            </div>

            {/* Preview of what's available */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Inside:</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Video className="h-4 w-4 mr-3 text-blue-600" />
                  Exclusive therapy videos and workshops
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 mr-3 text-blue-600" />
                  Downloadable worksheets and tools
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-3 text-blue-600" />
                  Live webinars and group sessions
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-3 text-blue-600" />
                  Personalized resources
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Your Portal</h2>
            <p className="text-xl text-gray-600">Access your exclusive content and resources</p>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'videos', label: 'Videos', icon: <Video className="h-5 w-5" /> },
            { id: 'worksheets', label: 'Worksheets', icon: <BookOpen className="h-5 w-5" /> },
            { id: 'webinars', label: 'Webinars', icon: <Users className="h-5 w-5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Display */}
        {activeTab === 'videos' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map(video => (
              <div key={video.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <Play className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-600 font-semibold uppercase">{video.category}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{video.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{video.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Level: {video.level}</span>
                    <span>{video.views} views</span>
                  </div>
                  
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'worksheets' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumContent.worksheets.map(worksheet => (
              <div key={worksheet.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{worksheet.type}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">{worksheet.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{worksheet.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 font-semibold uppercase">{worksheet.category}</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'webinars' && (
          <div className="space-y-4">
            {premiumContent.webinars.map(webinar => (
              <div key={webinar.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">{webinar.date} at {webinar.time}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{webinar.title}</h3>
                    <p className="text-gray-600 mb-2">{webinar.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{webinar.attendees} attendees</span>
                      <span className="mx-2">•</span>
                      <span className="text-blue-600 font-semibold uppercase">{webinar.category}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">
                      Join Webinar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {activeTab === 'videos' && filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MemberPortal; 