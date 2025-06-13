import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Video, Newspaper, Download, Play, Calendar, Clock, User, Eye, Star, X } from 'lucide-react';

// CSS animations for hover effects
const hoverAnimationStyles = `
  @keyframes cardHover {
    from {
      transform: translateY(0) scale(1);
    }
    to {
      transform: translateY(-8px) scale(1.02);
    }
  }

  @keyframes imageZoom {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.1);
    }
  }

  @keyframes buttonPulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(58, 175, 169, 0.4);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 0 10px rgba(58, 175, 169, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(58, 175, 169, 0);
    }
  }

  @keyframes tagFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-2px);
    }
  }

  .content-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;
  }

  .content-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.08);
  }

  .content-card-image {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .content-card:hover .content-card-image img {
    transform: scale(1.1);
  }

  .content-card-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .content-card:hover .content-card-button {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(58, 175, 169, 0.3);
  }

  .content-card-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .content-card:hover .content-card-button::before {
    left: 100%;
  }

  .content-card-tag {
    transition: all 0.2s ease-in-out;
  }

  .content-card:hover .content-card-tag {
    transform: translateY(-2px);
    background-color: #3AAFA9;
    color: white;
  }

  .content-card-title {
    transition: color 0.3s ease-in-out;
  }

  .content-card:hover .content-card-title {
    color: #3AAFA9;
  }

  .play-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .content-card:hover .play-button {
    transform: scale(1.1);
    background-color: rgba(58, 175, 169, 0.9);
  }

  .content-card-stats {
    transition: all 0.3s ease-in-out;
  }

  .content-card:hover .content-card-stats {
    color: #3AAFA9;
  }

  .content-card-badge {
    transition: all 0.3s ease-in-out;
  }

  .content-card:hover .content-card-badge {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(58, 175, 169, 0.3);
  }
`;

const Articles: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Inject hover animation styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = hoverAnimationStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  const content = {
    articles: [
      {
        id: 1,
        type: 'article',
        title: 'Understanding Anxiety: Signs, Symptoms, and Management',
        category: 'mental-health',
        author: 'Dr. Sarah Kimani',
        date: '2024-01-15',
        readTime: '8 min',
        excerpt: 'Anxiety is a common mental health condition that affects millions of people worldwide. Learn about the signs, symptoms, and effective management strategies.',
        image: 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=600',
        tags: ['anxiety', 'mental health', 'coping strategies'],
        views: 1245,
        rating: 4.8,
        fullContent: `
          <h2>Understanding Anxiety: A Comprehensive Guide</h2>
          
          <p>Anxiety is one of the most common mental health conditions affecting millions of people worldwide. While it's normal to feel anxious occasionally, persistent anxiety can significantly impact your daily life, relationships, and overall well-being.</p>
          
          <h3>What is Anxiety?</h3>
          <p>Anxiety is your body's natural response to stress or danger. It's characterized by feelings of worry, nervousness, or fear about future events or situations. When these feelings become overwhelming or interfere with daily activities, it may indicate an anxiety disorder.</p>
          
          <h3>Common Signs and Symptoms</h3>
          <ul>
            <li><strong>Physical symptoms:</strong> Rapid heartbeat, sweating, trembling, shortness of breath</li>
            <li><strong>Emotional symptoms:</strong> Excessive worry, restlessness, irritability, feeling on edge</li>
            <li><strong>Behavioral symptoms:</strong> Avoidance of certain situations, difficulty concentrating, sleep disturbances</li>
            <li><strong>Cognitive symptoms:</strong> Racing thoughts, catastrophic thinking, difficulty making decisions</li>
          </ul>
          
          <h3>Effective Management Strategies</h3>
          
          <h4>1. Deep Breathing Exercises</h4>
          <p>Practice slow, deep breathing to activate your body's relaxation response. Try the 4-7-8 technique: inhale for 4 counts, hold for 7, exhale for 8.</p>
          
          <h4>2. Progressive Muscle Relaxation</h4>
          <p>Systematically tense and release different muscle groups to reduce physical tension and promote relaxation.</p>
          
          <h4>3. Mindfulness and Meditation</h4>
          <p>Regular mindfulness practice can help you stay grounded in the present moment and reduce anxious thoughts about the future.</p>
          
          <h4>4. Regular Exercise</h4>
          <p>Physical activity releases endorphins and can significantly reduce anxiety levels. Aim for at least 30 minutes of moderate exercise daily.</p>
          
          <h4>5. Healthy Sleep Habits</h4>
          <p>Maintain a consistent sleep schedule and create a relaxing bedtime routine to improve sleep quality.</p>
          
          <h3>When to Seek Professional Help</h3>
          <p>Consider seeking professional support if:</p>
          <ul>
            <li>Anxiety interferes with daily activities</li>
            <li>You experience panic attacks</li>
            <li>Physical symptoms are concerning</li>
            <li>Self-help strategies aren't enough</li>
          </ul>
          
          <p>Remember, seeking help is a sign of strength, not weakness. With proper support and treatment, anxiety can be effectively managed.</p>
        `
      },
      {
        id: 2,
        type: 'article',
        title: 'Building Resilience in Children: A Parent\'s Guide',
        category: 'parenting',
        author: 'Dr. Michael Wanjiku',
        date: '2024-01-10',
        readTime: '12 min',
        excerpt: 'Discover practical strategies to help your children develop emotional resilience and cope with life\'s challenges effectively.',
        image: 'https://images.pexels.com/photos/1620653/pexels-photo-1620653.jpeg?auto=compress&cs=tinysrgb&w=600',
        tags: ['parenting', 'children', 'resilience'],
        views: 987,
        rating: 4.9
      },
      {
        id: 3,
        type: 'article',
        title: 'The Impact of Social Media on Teen Mental Health',
        category: 'teenagers',
        author: 'Dr. Grace Muthoni',
        date: '2024-01-08',
        readTime: '10 min',
        excerpt: 'Exploring the complex relationship between social media usage and teenage mental health, with tips for healthy digital habits.',
        image: 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=600',
        tags: ['teenagers', 'social media', 'digital wellness'],
        views: 1456,
        rating: 4.7
      }
    ],
    videos: [
      {
        id: 4,
        type: 'video',
        title: 'Mindfulness Meditation for Stress Relief',
        category: 'wellness',
        author: 'Dr. James Muturi',
        date: '2024-01-12',
        duration: '15 min',
        excerpt: 'A guided mindfulness meditation session to help reduce stress and promote inner peace.',
        image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=600',
        tags: ['mindfulness', 'meditation', 'stress relief'],
        views: 2341,
        rating: 4.9,
        videoUrl: 'https://www.youtube.com/embed/inpok4MKVLM'
      },
      {
        id: 5,
        type: 'video',
        title: 'Effective Communication in Relationships',
        category: 'relationships',
        author: 'Dr. Mary Njoroge',
        date: '2024-01-05',
        duration: '25 min',
        excerpt: 'Learn essential communication skills to strengthen your relationships and resolve conflicts peacefully.',
        image: 'https://images.pexels.com/photos/6146990/pexels-photo-6146990.jpeg?auto=compress&cs=tinysrgb&w=600',
        tags: ['relationships', 'communication', 'conflict resolution'],
        views: 1876,
        rating: 4.8,
        videoUrl: 'https://www.youtube.com/embed/8-JXOnFOXQk'
      },
      {
        id: 6,
        type: 'video',
        title: 'Coping with Grief and Loss',
        category: 'mental-health',
        author: 'Dr. Peter Kamau',
        date: '2024-01-03',
        duration: '30 min',
        excerpt: 'Understanding the grief process and developing healthy coping mechanisms for dealing with loss.',
        image: 'https://images.pexels.com/photos/5473956/pexels-photo-5473956.jpeg?auto=compress&cs=tinysrgb&w=600',
        tags: ['grief', 'loss', 'healing'],
        views: 1654,
        rating: 4.8,
        videoUrl: 'https://www.youtube.com/embed/gsYL4PC0hyk'
      }
    ],
    news: [
      {
        id: 7,
        type: 'news',
        title: 'New Mental Health Initiative Launched in Kenya',
        category: 'news',
        author: 'Imela Team',
        date: '2024-01-20',
        readTime: '5 min',
        excerpt: 'The Kenyan government announces a new nationwide mental health initiative to improve access to counselling services.',
        image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=600',
        tags: ['mental health policy', 'Kenya', 'healthcare'],
        views: 2103,
        rating: 4.6
      },
      {
        id: 8,
        type: 'news',
        title: 'World Mental Health Day 2024: Breaking the Stigma',
        category: 'news',
        author: 'Imela Team',
        date: '2024-01-18',
        readTime: '6 min',
        excerpt: 'Reflecting on World Mental Health Day and the ongoing efforts to reduce stigma around mental health treatment.',
        image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
        tags: ['mental health awareness', 'stigma', 'advocacy'],
        views: 1789,
        rating: 4.7
      }
    ]
  };

  const allContent = [...content.articles, ...content.videos, ...content.news];

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'mental-health', label: 'Mental Health' },
    { id: 'parenting', label: 'Parenting' },
    { id: 'teenagers', label: 'Teenagers' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'wellness', label: 'Wellness' },
    { id: 'news', label: 'News' }
  ];

  const tabs = [
    { id: 'all', label: 'All', icon: BookOpen },
    { id: 'article', label: 'Articles', icon: BookOpen },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'news', label: 'News', icon: Newspaper }
  ];

  const filteredContent = allContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleContentClick = (item: any) => {
    setSelectedContent(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  const ContentCard = ({ item }: { item: any }) => (
    <div className="content-card bg-white rounded-lg shadow-md overflow-hidden">
      <div className="content-card-image relative">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-48 object-cover transition-transform duration-400"
        />
        <div className="absolute top-4 left-4">
          <span className="content-card-badge px-3 py-1 text-xs font-semibold rounded-full text-white" 
                style={{ backgroundColor: '#3AAFA9' }}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </span>
        </div>
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              onClick={() => handleContentClick(item)}
              className="play-button bg-black bg-opacity-50 rounded-full p-3 cursor-pointer"
            >
              <Play className="h-6 w-6 text-white" />
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <User className="h-4 w-4 mr-1" />
          <span className="mr-4">{item.author}</span>
          <Calendar className="h-4 w-4 mr-1" />
          <span className="mr-4">{new Date(item.date).toLocaleDateString()}</span>
          {item.readTime && (
            <>
              <Clock className="h-4 w-4 mr-1" />
              <span>{item.readTime}</span>
            </>
          )}
          {item.duration && (
            <>
              <Clock className="h-4 w-4 mr-1" />
              <span>{item.duration}</span>
            </>
          )}
        </div>
        
        <h3 className="content-card-title text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {item.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {item.excerpt}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map((tag: string, index: number) => (
            <span key={index} className="content-card-tag px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="content-card-stats flex items-center text-sm text-gray-600">
            <Eye className="h-4 w-4 mr-1" />
            <span className="mr-4">{item.views} views</span>
            <Star className="h-4 w-4 mr-1 text-yellow-400" />
            <span>{item.rating}</span>
          </div>
          
          <button 
            onClick={() => handleContentClick(item)}
            className="content-card-button text-white px-4 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: '#3AAFA9' }}
          >
            {item.type === 'video' ? 'Watch' : 'Read'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Articles & Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive collection of articles, videos, and news related to mental health, 
            counselling, and wellbeing. Stay informed and discover valuable insights for your journey.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search articles, videos, or topics..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 bg-white border border-gray-200 hover:bg-gray-50 ${
                  activeTab === tab.id
                    ? 'border-2'
                    : ''
                }`}
                style={activeTab === tab.id ? { 
                  color: '#3AAFA9', 
                  borderColor: '#3AAFA9' 
                } : { color: '#374151' }}
                onMouseEnter={activeTab !== tab.id ? (e) => {
                  e.currentTarget.style.color = '#3AAFA9';
                  e.currentTarget.style.borderColor = '#3AAFA9';
                } : undefined}
                onMouseLeave={activeTab !== tab.id ? (e) => {
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.borderColor = '#d1d5db';
                } : undefined}
              >
                <IconComponent className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredContent.map(item => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>

        {/* No Results */}
        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Stay Updated
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive the latest articles, resources, and insights 
            directly in your inbox.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              className="text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 hover:shadow-md"
              style={{ backgroundColor: '#3AAFA9' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#339B95'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Modal for Article/Video Content */}
        {isModalOpen && selectedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center">
                  <div className="flex items-center text-sm text-gray-600 mr-4">
                    <User className="h-4 w-4 mr-1" />
                    <span className="mr-4">{selectedContent.author}</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(selectedContent.date).toLocaleDateString()}</span>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full text-white" 
                        style={{ backgroundColor: '#3AAFA9' }}>
                    {selectedContent.type.charAt(0).toUpperCase() + selectedContent.type.slice(1)}
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedContent.type === 'video' ? (
                  // Video Content
                  <div className="p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      {selectedContent.title}
                    </h1>
                    <div className="aspect-video mb-6">
                      <iframe
                        src={selectedContent.videoUrl}
                        title={selectedContent.title}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                      />
                    </div>
                    <p className="text-gray-600 mb-4">
                      {selectedContent.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedContent.tags.map((tag: string, index: number) => (
                        <span key={index} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Article Content
                  <div className="p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                      {selectedContent.title}
                    </h1>
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedContent.fullContent || `
                          <p>${selectedContent.excerpt}</p>
                          <p>This is a sample article content. In a real application, this would contain the full article text with proper formatting, images, and comprehensive information about the topic.</p>
                          <p>The article would provide detailed insights, practical tips, and evidence-based information to help readers understand and apply the concepts discussed.</p>
                        `
                      }}
                    />
                    <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                      {selectedContent.tags.map((tag: string, index: number) => (
                        <span key={index} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Articles; 