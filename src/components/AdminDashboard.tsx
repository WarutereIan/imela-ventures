import React, { useEffect, useMemo, useState } from 'react';
import { 
  BarChart3, 
  CalendarDays, 
  FileText, 
  LogOut, 
  Mail, 
  Plus, 
  Search, 
  Settings, 
  Tag, 
  Trash2 
} from 'lucide-react';
import { supabase } from '../supabaseClient';

type BlogStatus = 'draft' | 'published';
// Support legacy statuses plus new booking workflow statuses
type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'responded' | 'closed';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
  views: number;
}

interface SessionBooking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  service: string;
  message?: string | null;
  date: string;
  time: string;
  status: SessionStatus;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const CATEGORIES = ['All', 'Mental Health', 'Corporate', 'Leadership', 'Family', 'Wellbeing'];
const SERVICES = ['All', 'Individual Therapy', 'Couples Therapy', 'Family Session', 'Corporate Training', 'Leadership Workshop'];
const SESSION_STATUSES: SessionStatus[] = ['pending', 'confirmed', 'responded', 'closed'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'blog' | 'sessions' | 'notifications'>('blog');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Blog state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogFilterCategory, setBlogFilterCategory] = useState('All');
  const [blogSearch, setBlogSearch] = useState('');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [blogImage, setBlogImage] = useState<string | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState<SessionBooking[]>([]);
  const [sessionDateFilter, setSessionDateFilter] = useState<'all' | 'today' | 'upcoming'>('upcoming');
  const [sessionStatusFilter, setSessionStatusFilter] = useState<SessionStatus | 'all'>('all');
  const [sessionServiceFilter, setSessionServiceFilter] = useState<string>('All');
  const [sessionSearch, setSessionSearch] = useState('');

  // Notifications state
  const [notificationEmail, setNotificationEmail] = useState('admin@imelaventures.com');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Review / email response state
  const [reviewSession, setReviewSession] = useState<SessionBooking | null>(null);
  const [reviewMessage, setReviewMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isConfirmingBooking, setIsConfirmingBooking] = useState<string | null>(null);

  // Initial load from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [blogRes, sessionsRes, settingsRes] = await Promise.all([
          supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('sessions')
            .select('*')
            .order('date', { ascending: true })
            .order('time', { ascending: true }),
          supabase.from('settings').select('*'),
        ]);

        if (blogRes.error) throw blogRes.error;
        if (sessionsRes.error) throw sessionsRes.error;
        if (settingsRes.error) throw settingsRes.error;

        const mappedBlogs: BlogPost[] =
          blogRes.data?.map((row: any) => ({
            id: row.id,
            title: row.title,
            category: row.category,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            views: row.views ?? 0,
          })) ?? [];

        const mappedSessions: SessionBooking[] =
          sessionsRes.data?.map((row: any) => ({
            id: row.id,
            customerName: row.customer_name,
            email: row.email,
            phone: row.phone,
            service: row.service,
            message: row.message ?? null,
            date: row.date,
            time: row.time,
            status: row.status,
          })) ?? [];

        const settings = settingsRes.data ?? [];
        const emailSetting = settings.find((s: any) => s.key === 'notification_email');
        const enabledSetting = settings.find(
          (s: any) => s.key === 'notifications_enabled'
        );

        setBlogPosts(mappedBlogs);
        setSessions(mappedSessions);
        if (emailSetting?.value) {
          setNotificationEmail(emailSetting.value);
        }
        if (enabledSetting?.value != null) {
          setNotificationsEnabled(enabledSetting.value === 'true');
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Error loading data from Supabase', err);
        setError('Could not load data from Supabase. Check your connection and tables.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Real-time updates for bookings / sessions
  useEffect(() => {
    const channel = supabase
      .channel('public:sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row: any = payload.new;
            const newSession: SessionBooking = {
              id: row.id,
              customerName: row.customer_name,
              email: row.email,
              phone: row.phone,
              service: row.service,
              message: row.message ?? null,
              date: row.date,
              time: row.time,
              status: row.status,
            };
            setSessions((prev) => {
              // Avoid duplicates
              if (prev.some((s) => s.id === newSession.id)) return prev;
              return [newSession, ...prev];
            });
          }

          if (payload.eventType === 'UPDATE') {
            const row: any = payload.new;
            setSessions((prev) =>
              prev.map((s) =>
                s.id === row.id
                  ? {
                      ...s,
                      customerName: row.customer_name,
                      email: row.email,
                      phone: row.phone,
                      service: row.service,
                      message: row.message ?? null,
                      date: row.date,
                      time: row.time,
                      status: row.status,
                    }
                  : s
              )
            );
          }

          if (payload.eventType === 'DELETE') {
            const row: any = payload.old;
            setSessions((prev) => prev.filter((s) => s.id !== row.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Derived metrics
  const blogMetrics = useMemo(() => {
    const total = blogPosts.length;
    const published = blogPosts.filter(p => p.status === 'published').length;
    const drafts = blogPosts.filter(p => p.status === 'draft').length;
    const views = blogPosts.reduce((sum, p) => sum + p.views, 0);
    return { total, published, drafts, views };
  }, [blogPosts]);

  const sessionMetrics = useMemo(() => {
    const total = sessions.length;
    const responded = sessions.filter(s => s.status === 'responded').length;
    const pending = sessions.filter(s => s.status === 'pending').length;
    return { total, responded, pending };
  }, [sessions]);

  const filteredBlogPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesCategory = blogFilterCategory === 'All' || post.category === blogFilterCategory;
      const matchesSearch =
        !blogSearch ||
        post.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
        post.category.toLowerCase().includes(blogSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [blogPosts, blogFilterCategory, blogSearch]);

  const filteredSessions = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return sessions.filter(session => {
      const matchesStatus = sessionStatusFilter === 'all' || session.status === sessionStatusFilter;
      const matchesService = sessionServiceFilter === 'All' || session.service === sessionServiceFilter;
      const matchesSearch =
        !sessionSearch ||
        session.customerName.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        session.email.toLowerCase().includes(sessionSearch.toLowerCase());

      let matchesDate = true;
      if (sessionDateFilter === 'today') {
        matchesDate = session.date === today;
      } else if (sessionDateFilter === 'upcoming') {
        matchesDate = session.date >= today;
      }

      return matchesStatus && matchesService && matchesSearch && matchesDate;
    });
  }, [sessions, sessionStatusFilter, sessionServiceFilter, sessionSearch, sessionDateFilter]);

  const startNewPost = async () => {
    const now = new Date().toISOString();
    const draft: Omit<BlogPost, 'id'> = {
      title: 'Untitled Post',
      category: 'Mental Health',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      views: 0,
    };

    const { data, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        title: draft.title,
        category: draft.category,
        status: draft.status,
        created_at: draft.createdAt,
        updated_at: draft.updatedAt,
        views: draft.views,
      })
      .select('*')
      .single();

    if (insertError) {
      // eslint-disable-next-line no-console
      console.error('Error creating blog post', insertError);
      setError('Could not create a new post.');
      return;
    }

    const newPost: BlogPost = {
      id: data.id,
      title: data.title,
      category: data.category,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      views: data.views ?? 0,
    };

    setBlogPosts(prev => [newPost, ...prev]);
    setEditingPost(newPost);
    setBlogImage(null);
  };

  const updatePost = async (patch: Partial<BlogPost>) => {
    if (!editingPost) return;
    const next: BlogPost = {
      ...editingPost,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    setEditingPost(next);
    setBlogPosts(prev => prev.map(p => (p.id === next.id ? next : p)));

    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({
        title: next.title,
        category: next.category,
        status: next.status,
        updated_at: next.updatedAt,
        views: next.views,
      })
      .eq('id', next.id);

    if (updateError) {
      // eslint-disable-next-line no-console
      console.error('Error updating blog post', updateError);
      setError('Could not save changes to the post.');
    }
  };

  const deletePost = async (id: string) => {
    setBlogPosts(prev => prev.filter(p => p.id !== id));
    if (editingPost?.id === id) {
      setEditingPost(null);
      setBlogImage(null);
    }

    const { error: deleteError } = await supabase.from('blog_posts').delete().eq('id', id);
    if (deleteError) {
      // eslint-disable-next-line no-console
      console.error('Error deleting blog post', deleteError);
      setError('Could not delete the post.');
    }
  };

  const publishPost = async (id: string) => {
    const updatedAt = new Date().toISOString();
    setBlogPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'published', updatedAt } : p))
    );

    const { error: publishError } = await supabase
      .from('blog_posts')
      .update({ status: 'published', updated_at: updatedAt })
      .eq('id', id);

    if (publishError) {
      // eslint-disable-next-line no-console
      console.error('Error publishing blog post', publishError);
      setError('Could not publish the post.');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBlogImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSessionStatusChange = async (id: string, status: SessionStatus) => {
    // Optimistically update UI first
    const previousStatus = sessions.find(s => s.id === id)?.status;
    setSessions(prev => prev.map(s => (s.id === id ? { ...s, status } : s)));

    try {
      const { error: sessionError } = await supabase
        .from('sessions')
        .update({ status })
        .eq('id', id);

      if (sessionError) {
        // Revert optimistic update on error
        setSessions(prev => prev.map(s => (s.id === id ? { ...s, status: previousStatus || 'pending' } : s)));
        // eslint-disable-next-line no-console
        console.error('Error updating session status', sessionError);
        setError(`Could not update session status: ${sessionError.message}`);
        // Clear error after 5 seconds
        setTimeout(() => setError(null), 5000);
        return;
      }

      // Success - clear any previous errors
      setError(null);
      
      // Optionally trigger email notification for confirmed bookings
      if (status === 'confirmed') {
        // You can add email notification logic here if needed
        // eslint-disable-next-line no-console
        console.log('Booking confirmed:', id);
      }
    } catch (err: any) {
      // Revert optimistic update on exception
      setSessions(prev => prev.map(s => (s.id === id ? { ...s, status: previousStatus || 'pending' } : s)));
      // eslint-disable-next-line no-console
      console.error('Exception updating session status', err);
      setError(`Failed to update session status: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleConfirmBooking = async (session: SessionBooking) => {
    setIsConfirmingBooking(session.id);
    setError(null);
    setSuccessMessage(null);

    try {
      // Update booking status to confirmed
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ status: 'confirmed' })
        .eq('id', session.id);

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update booking status');
      }

      // Optimistically update UI
      setSessions(prev =>
        prev.map(s => (s.id === session.id ? { ...s, status: 'confirmed' } : s))
      );

      // Send confirmation email to customer
      try {
        const { error: emailError } = await supabase.functions.invoke(
          'send-booking-confirmation',
          {
            body: {
              bookingId: session.id,
              customerName: session.customerName,
              email: session.email,
              phone: session.phone,
              service: session.service,
              date: session.date,
              time: session.time,
              message: session.message,
            },
          }
        );

        if (emailError) {
          // eslint-disable-next-line no-console
          console.error('Email sending failed:', emailError);
          // Still show success for status update, but note email issue
          setError('Booking confirmed, but confirmation email failed to send. Please contact the customer manually.');
          setTimeout(() => setError(null), 8000);
          setIsConfirmingBooking(null);
          return;
        }

        // Success - show success message
        setSuccessMessage('Booking confirmed and checkout email sent successfully.');
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (emailErr: any) {
        // eslint-disable-next-line no-console
        console.error('Exception sending confirmation email:', emailErr);
        setError('Booking confirmed, but confirmation email failed. Please contact the customer manually.');
        setTimeout(() => setError(null), 8000);
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Error confirming booking:', err);
      setError(`Failed to confirm booking: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsConfirmingBooking(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white">
        <div className="px-6 py-5 border-b">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Imela Ventures
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-slate-900">Admin</p>
            <BarChart3 className="h-5 w-5 text-[#3AAFA9]" />
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <button
            onClick={() => setActiveTab('blog')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left ${
              activeTab === 'blog'
                ? 'bg-[#E6F7F6] text-[#136F71]'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="h-4 w-4" />
            Blog Content
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left ${
              activeTab === 'sessions'
                ? 'bg-[#E6F7F6] text-[#136F71]'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Bookings & Sessions
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left ${
              activeTab === 'notifications'
                ? 'bg-[#E6F7F6] text-[#136F71]'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings className="h-4 w-4" />
            Email Notifications
          </button>
        </nav>
        <div className="px-4 py-4 border-t flex items-center justify-between text-xs text-slate-500">
          <span>Secure admin area</span>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar (for mobile & meta info) */}
        <header className="sticky top-0 z-20 bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F7F6] text-[#3AAFA9] md:hidden">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Admin Dashboard
              </p>
              <p className="text-sm font-medium text-slate-900">
                {activeTab === 'blog'
                  ? 'Manage blog content'
                  : activeTab === 'sessions'
                  ? 'Manage bookings & sessions'
                  : 'Manage email notifications'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>Real-time view</span>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 md:hidden"
            >
              <LogOut className="h-3 w-3" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {successMessage}
            </div>
          )}

          {/* Overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 mb-1">Published Posts</p>
              <p className="text-2xl font-bold text-slate-900">{blogMetrics.published}</p>
              <p className="text-xs text-slate-400 mt-1">
                {blogMetrics.drafts} drafts • {blogMetrics.views} total views
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 mb-1">Bookings</p>
              <p className="text-2xl font-bold text-slate-900">{sessionMetrics.total}</p>
              <p className="text-xs text-slate-400 mt-1">
                {sessionMetrics.pending} pending • {sessionMetrics.responded} responded
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 mb-1">Notifications</p>
              <p className="text-2xl font-bold text-slate-900">
                {notificationsEnabled ? 'On' : 'Off'}
              </p>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {notificationEmail}
              </p>
            </div>
          </div>

          {/* Main panels */}
          {isLoading ? (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-sm text-slate-500">
              Loading data from Supabase...
            </div>
          ) : null}

          {activeTab === 'blog' && (
            <section className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4 items-start">
              {/* Blog list & filters */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Blog Posts</p>
                    <p className="text-xs text-slate-500">
                      Create, edit, publish or delete posts. Save drafts as you go.
                    </p>
                  </div>
                  <button
                    onClick={startNewPost}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#3AAFA9] px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#339B95]"
                  >
                    <Plus className="h-3 w-3" />
                    New Post
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search posts by title or category"
                      value={blogSearch}
                      onChange={e => setBlogSearch(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
                    />
                  </div>
                  <select
                    value={blogFilterCategory}
                    onChange={e => setBlogFilterCategory(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border border-slate-100 rounded-lg overflow-hidden max-h-[340px] overflow-y-auto scrollbar-hide">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Title</th>
                        <th className="px-3 py-2 text-left font-medium">Category</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                        <th className="px-3 py-2 text-right font-medium">Views</th>
                        <th className="px-3 py-2 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBlogPosts.map(post => (
                        <tr
                          key={post.id}
                          className={`border-t border-slate-100 hover:bg-slate-50 cursor-pointer ${
                            editingPost?.id === post.id ? 'bg-slate-50' : ''
                          }`}
                          onClick={() => setEditingPost(post)}
                        >
                          <td className="px-3 py-2 text-slate-900 max-w-[180px] truncate">
                            {post.title || 'Untitled'}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                              <Tag className="h-3 w-3" />
                              {post.category}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                post.status === 'published'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {post.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-slate-600">{post.views}</td>
                          <td
                            className="px-3 py-2 text-right text-slate-400"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1">
                              {post.status === 'draft' && (
                                <button
                                  onClick={() => publishPost(post.id)}
                                  className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100"
                                >
                                  Publish
                                </button>
                              )}
                              <button
                                onClick={() => deletePost(post.id)}
                                className="rounded-md p-1 text-slate-400 hover:text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredBlogPosts.length === 0 && (
                        <tr>
                          <td
                            className="px-3 py-6 text-center text-slate-400 text-xs"
                            colSpan={5}
                          >
                            No posts yet. Create your first article to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Blog editor / details */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    {editingPost ? 'Edit Post' : 'Post Details'}
                  </p>
                  {editingPost && (
                    <span className="text-[11px] text-slate-400">
                      Last updated:{' '}
                      {new Date(editingPost.updatedAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  )}
                </div>

                {editingPost ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Title</label>
                      <input
                        type="text"
                        value={editingPost.title}
                        onChange={e => updatePost({ title: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
                        placeholder="Write a clear, engaging title"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Category</label>
                        <select
                          value={editingPost.category}
                          onChange={e => updatePost({ category: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
                        >
                          {CATEGORIES.filter(c => c !== 'All').map(cat => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">
                          Status & Actions
                        </label>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              editingPost.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {editingPost.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                          {editingPost.status === 'draft' && (
                            <button
                              onClick={() => publishPost(editingPost.id)}
                              className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#3AAFA9] px-2 py-1 text-[11px] font-medium text-white hover:bg-[#339B95]"
                            >
                              Publish now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">
                        Featured Image
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-24 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                          {blogImage ? (
                            <img
                              src={blogImage}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-[11px] text-slate-400 text-center px-2">
                              Upload preview
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="text-[11px]"
                          />
                          <p className="text-[10px] text-slate-400">
                            Optional. JPG or PNG up to 2MB.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">
                        Content (managed in your CMS / backend)
                      </label>
                      <textarea
                        placeholder="Write or paste your article content here..."
                        className="w-full rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500 h-28 resize-none bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
                      />
                      <p className="text-[10px] text-slate-400">
                        This is a front-end preview only. Connect this editor to your API or CMS to
                        store full article content.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        Auto-saved locally for this browser.
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingPost(null)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileText className="h-8 w-8 text-slate-200 mb-3" />
                    <p className="text-sm font-medium text-slate-800">No post selected</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Select a post from the list to edit, or create a new article to start writing.
                    </p>
                    <button
                      onClick={startNewPost}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#3AAFA9] px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#339B95]"
                    >
                      <Plus className="h-3 w-3" />
                      New Post
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'sessions' && (
            <section className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Bookings & Enquiries</p>
                  <p className="text-xs text-slate-500">
                    New bookings appear here in real time as clients submit the form.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-3">
                <div className="relative md:col-span-2">
                  <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                  placeholder="Search by client name or email"
                    value={sessionSearch}
                    onChange={e => setSessionSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
                  />
                </div>
                <select
                  value={sessionDateFilter}
                  onChange={e => setSessionDateFilter(e.target.value as 'all' | 'today' | 'upcoming')}
                  className="rounded-lg border border-slate-200 px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="today">Today</option>
                  <option value="all">All dates</option>
                </select>
                <select
                  value={sessionStatusFilter}
                  onChange={e =>
                    setSessionStatusFilter(e.target.value as SessionStatus | 'all')
                  }
                  className="rounded-lg border border-slate-200 px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
                >
                  <option value="all">All statuses</option>
                  {SESSION_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status[0].toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={sessionServiceFilter}
                  onChange={e => setSessionServiceFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
                >
                  {SERVICES.map(service => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-100 rounded-lg overflow-hidden max-h-[420px] overflow-y-auto scrollbar-hide">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Client</th>
                      <th className="px-3 py-2 text-left font-medium">Service</th>
                      <th className="px-3 py-2 text-left font-medium">Date & Time</th>
                      <th className="px-3 py-2 text-left font-medium">Contact</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                      <th className="px-3 py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map(session => (
                      <tr
                        key={session.id}
                        className="border-t border-slate-100 hover:bg-slate-50 align-top"
                      >
                        <td className="px-3 py-2">
                          <p className="text-slate-900 font-medium">{session.customerName}</p>
                          {session.message && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                              {session.message}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          <p className="text-xs font-medium">{session.service}</p>
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          <p className="text-xs font-medium">
                            {new Date(session.date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-[11px] text-slate-500">{session.time}</p>
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          <p className="text-xs">{session.email}</p>
                          <p className="text-[11px] text-slate-500">{session.phone}</p>
                        </td>
                        <td className="px-3 py-2">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                session.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700'
                                  : session.status === 'confirmed'
                                  ? 'bg-blue-50 text-blue-700'
                                  : session.status === 'responded'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : session.status === 'closed'
                                  ? 'bg-slate-50 text-slate-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {session.status[0].toUpperCase() + session.status.slice(1)}
                            </span>
                            <select
                              value={session.status}
                              onChange={e =>
                                handleSessionStatusChange(
                                  session.id,
                                  e.target.value as SessionStatus
                                )
                              }
                              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
                            >
                              {SESSION_STATUSES.map(status => (
                                <option key={status} value={status}>
                                  Mark {status}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right align-top">
                          <div className="flex flex-col gap-2 items-end">
                            {session.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleConfirmBooking(session)}
                                disabled={isConfirmingBooking === session.id}
                                className="inline-flex items-center justify-center rounded-lg bg-[#3AAFA9] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#339B95] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isConfirmingBooking === session.id ? 'Confirming...' : 'Confirm Booking'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setReviewSession(session);
                                setReviewMessage('');
                              }}
                              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSessions.length === 0 && (
                      <tr>
                        <td
                          className="px-3 py-6 text-center text-slate-400 text-xs"
                          colSpan={6}
                        >
                          No bookings match your filters yet. New enquiries will appear here in
                          real time.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-4 items-start">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Notification Settings</p>
                  <p className="text-xs text-slate-500">
                    Control how you receive booking confirmations and updates.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F7F6] text-[#3AAFA9]">
                        <Mail className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            Booking email notifications
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Every new booking will trigger an email to your inbox.
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            const next = !notificationsEnabled;
                            setNotificationsEnabled(next);
                            const { error: upsertError } = await supabase
                              .from('settings')
                              .upsert({
                                key: 'notifications_enabled',
                                value: String(next),
                              });
                            if (upsertError) {
                              // eslint-disable-next-line no-console
                              console.error('Error saving notification toggle', upsertError);
                              setError('Could not save notification preference.');
                            }
                          }}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full border transition-colors ${
                            notificationsEnabled
                              ? 'border-emerald-400 bg-emerald-400'
                              : 'border-slate-300 bg-slate-200'
                          }`}
                          aria-label="Toggle notifications"
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              notificationsEnabled ? 'translate-x-4' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">
                          Notification email address
                        </label>
                        <input
                          type="email"
                          value={notificationEmail}
                          onChange={async e => {
                            const nextEmail = e.target.value;
                            setNotificationEmail(nextEmail);
                            setIsSavingSettings(true);

                            const { error: upsertError } = await supabase
                              .from('settings')
                              .upsert({ key: 'notification_email', value: nextEmail });

                            if (upsertError) {
                              // eslint-disable-next-line no-console
                              console.error('Error saving notification email', upsertError);
                              setError('Could not save notification email.');
                            }

                            setIsSavingSettings(false);
                          }}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
                          placeholder="you@example.com"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-slate-400">
                            Use an email you check often. All booking confirmations and status
                            updates will be sent here.
                          </p>
                          {isSavingSettings && (
                            <p className="text-[10px] text-slate-400">Saving…</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 border border-dashed border-slate-200 px-3 py-3 text-[11px] text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700">How this works</p>
                    <p>
                      This dashboard is front-end–only. To send real emails, connect this screen to
                      your backend or a service like SendGrid, Mailgun, or Gmail via your API.
                    </p>
                    <p>
                      When a new booking is received, your backend should read these settings and
                      trigger the notification automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-900">
                  Example email notification
                </p>
                <div className="border border-slate-100 rounded-lg p-3 text-[11px] text-slate-700 space-y-1 bg-slate-50">
                  <p className="font-semibold">Subject: New booking received</p>
                  <p>
                    To: <span className="font-mono">{notificationEmail}</span>
                  </p>
                  <p className="pt-1">
                    Hi Imela Ventures team, a new booking has just been created on your website.
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Client: Jane Doe</li>
                    <li>Service: Individual Therapy</li>
                    <li>Date & time: 10:00, Tue 5 Jan</li>
                    <li>Status: Pending confirmation</li>
                  </ul>
                  <p className="pt-1">
                    Log into your dashboard to confirm, reschedule, or cancel this session.
                  </p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Review & email response modal */}
      {reviewSession && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Review Booking
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {reviewSession.customerName}
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  {reviewSession.service} •{' '}
                  {new Date(reviewSession.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  at {reviewSession.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReviewSession(null);
                  setReviewMessage('');
                }}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">Customer</p>
                <p>{reviewSession.customerName}</p>
                <p className="text-slate-500">{reviewSession.email}</p>
                <p className="text-slate-500">{reviewSession.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">Details</p>
                <p>{reviewSession.service}</p>
                {reviewSession.message && (
                  <p className="text-slate-500 whitespace-pre-line">
                    {reviewSession.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-800">Email response</p>
              <div className="grid grid-cols-[auto,1fr] gap-2 items-center text-[11px] text-slate-600">
                <span className="font-semibold">From:</span>
                <span className="font-mono">info@imelaventures.com</span>
                <span className="font-semibold">To:</span>
                <span className="font-mono">{reviewSession.email}</span>
              </div>
              <textarea
                value={reviewMessage}
                onChange={(e) => setReviewMessage(e.target.value)}
                placeholder="Type your reply to the client here..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 h-28 resize-none focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
              />
              <p className="text-[10px] text-slate-400">
                This will be sent as an email to the client. After sending, the booking will be
                marked as Responded automatically.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={async () => {
                  // Allow closing without sending
                  setReviewSession(null);
                  setReviewMessage('');
                }}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSendingReply || !reviewMessage.trim()}
                onClick={async () => {
                  if (!reviewSession || !reviewMessage.trim()) return;
                  try {
                    setIsSendingReply(true);
                    setError(null);

                    const { error: fnError } = await supabase.functions.invoke(
                      'send-booking-response',
                      {
                        body: {
                          bookingId: reviewSession.id,
                          to: reviewSession.email,
                          from: 'info@imelaventures.com',
                          message: reviewMessage.trim(),
                          customerName: reviewSession.customerName,
                          service: reviewSession.service,
                          date: reviewSession.date,
                          time: reviewSession.time,
                        },
                      }
                    );

                    if (fnError) {
                      // eslint-disable-next-line no-console
                      console.error('Error sending booking response', fnError);
                      setError('Could not send email response. Please try again.');
                    } else {
                      await handleSessionStatusChange(reviewSession.id, 'responded');
                      setReviewSession(null);
                      setReviewMessage('');
                    }
                  } finally {
                    setIsSendingReply(false);
                  }
                }}
                className="inline-flex items-center justify-center rounded-lg bg-[#3AAFA9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#339B95] disabled:opacity-60"
              >
                {isSendingReply ? 'Sending…' : 'Send reply & mark Responded'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


