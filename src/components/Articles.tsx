import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, BookOpen, Video, Newspaper, Download, Play, Calendar, Clock, User, Eye, Star, X } from 'lucide-react';
import { PersonaType } from '../App';
import { supabase } from '../supabaseClient';

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

interface ArticlesProps {
  selectedPersona: PersonaType;
}

interface BlogPost {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  views: number;
  content?: string;
  excerpt?: string;
  image_url?: string;
  author?: string;
}

const Articles: React.FC<ArticlesProps> = ({ selectedPersona }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch blog posts from Supabase
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setBlogPosts(data || []);
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Error loading blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogPosts();

    // Set up real-time subscription for new blog posts
    const channel = supabase
      .channel('public:blog_posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts',
          filter: 'status=eq.published',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newPost: BlogPost = payload.new as BlogPost;
            setBlogPosts((prev) => {
              // Avoid duplicates
              if (prev.some((p) => p.id === newPost.id)) return prev;
              return [newPost, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedPost: BlogPost = payload.new as BlogPost;
            if (updatedPost.status === 'published') {
              setBlogPosts((prev) =>
                prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
              );
            } else {
              // Remove if status changed to draft
              setBlogPosts((prev) => prev.filter((p) => p.id !== updatedPost.id));
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedPost: BlogPost = payload.old as BlogPost;
            setBlogPosts((prev) => prev.filter((p) => p.id !== deletedPost.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Map blog posts from Supabase to the component's expected format
  const mappedArticles = blogPosts.map((post) => {
    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = post.content?.split(/\s+/).length || 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    // Map category to lowercase with hyphens for consistency
    const categoryMap: { [key: string]: string } = {
      'Mental Health': 'mental-health',
      'Corporate': 'corporate',
      'Leadership': 'leadership',
      'Family': 'family',
      'Wellbeing': 'wellness',
    };
    const mappedCategory = categoryMap[post.category] || post.category.toLowerCase().replace(/\s+/g, '-');

    return {
      id: post.id,
      type: 'article',
      title: post.title,
      category: mappedCategory,
      author: post.author || 'Imela Team',
      date: post.created_at,
      readTime: `${readTime} min`,
      excerpt: post.excerpt || post.content?.substring(0, 150) + '...' || 'No excerpt available.',
      image: post.image_url || 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=600',
      tags: [post.category.toLowerCase()],
      views: post.views || 0,
      rating: 4.8, // Default rating, can be added to Supabase schema later
      fullContent: post.content || post.excerpt || 'Content not available.',
    };
  });

  const allContent = [...mappedArticles];

  // Extract unique categories from blog posts
  const uniqueCategories = Array.from(new Set(blogPosts.map((post) => post.category)));
  const categoryMap: { [key: string]: string } = {
    'Mental Health': 'mental-health',
    'Corporate': 'corporate',
    'Leadership': 'leadership',
    'Family': 'family',
    'Wellbeing': 'wellness',
  };

  const categories = [
    { id: 'all', label: 'All Categories' },
    ...uniqueCategories.map((cat) => ({
      id: categoryMap[cat] || cat.toLowerCase().replace(/\s+/g, '-'),
      label: cat,
    })),
  ];

  const tabs = [
    { id: 'all', label: 'All', icon: BookOpen },
    { id: 'article', label: 'Articles', icon: BookOpen },
  ];

  const filteredContent = allContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleContentClick = async (item: any) => {
    setSelectedContent(item);
    setIsModalOpen(true);

    // Increment view count in Supabase
    try {
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ views: (item.views || 0) + 1 })
        .eq('id', item.id);

      if (!updateError) {
        // Update local state optimistically
        setBlogPosts((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, views: (p.views || 0) + 1 } : p
          )
        );
      }
    } catch (err) {
      // Silently fail - view count update is not critical
      // eslint-disable-next-line no-console
      console.error('Failed to update view count:', err);
    }
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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3AAFA9] mb-4"></div>
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Content Grid */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredContent.map(item => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>

            {/* No Results */}
            {filteredContent.length === 0 && !error && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts found</h3>
                <p className="text-gray-600">
                  {blogPosts.length === 0
                    ? 'No published blog posts yet. Check back soon!'
                    : 'Try adjusting your search terms or filters to find what you\'re looking for.'}
                </p>
              </div>
            )}
          </>
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