import React, { useEffect, useState } from 'react';
import { LogIn } from 'lucide-react';
import { supabase } from '../supabaseClient';
import AdminDashboard from './AdminDashboard';

const AdminRoute: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Check if Supabase is configured
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('AdminRoute mounted. Current path:', window.location.pathname);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      setSupabaseError('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          // eslint-disable-next-line no-console
          console.error('Error checking auth:', error);
        }
        setUser(data?.user ?? null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize auth:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || 'Login failed. Check your email and password.');
    } else {
      setUser(data.user);
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking admin session...
      </div>
    );
  }

  if (user) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6F7F6] text-[#3AAFA9]">
            <LogIn className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Secure Access
            </p>
            <h1 className="text-lg font-bold text-slate-900">Admin Login</h1>
          </div>
        </div>
        
        {supabaseError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {supabaseError}
          </div>
        )}
        
        <p className="text-xs text-slate-500">
          Sign in with your admin email and password. You can manage blog posts, bookings, and
          notifications once authenticated.
        </p>
        <p className="text-[11px] text-slate-400">
          Use the admin account you created in Supabase (for example, <span className="font-mono">admin@yourdomain.com</span>).
        </p>
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3AAFA9]"
              placeholder="Your password"
              required
            />
          </div>
          {error && <p className="text-[11px] text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center rounded-lg bg-[#3AAFA9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#339B95] disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Log in'}
          </button>
        </form>
        <p className="text-[10px] text-slate-400 pt-1">
          Create an admin user in your Supabase Auth settings, then use those credentials here.
        </p>
      </div>
    </div>
  );
};

export default AdminRoute;


