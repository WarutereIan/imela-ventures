import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarDays, FileText, Inbox, LogOut, Mail, Plus, Search, Settings, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { config } from '../lib/config';
import { cn } from '../lib/cn';
import { SERVICES, getService } from '../data/services';
import { Button, buttonClasses } from './ui/Button';
import { Alert, Chip, SelectField, Spinner, TextArea, TextField } from './ui/primitives';
import { SESSION_STATUS_LABEL, formatSessionDate } from './workspace/format';
import { nairobiDate } from '../domain/booking/slots';

type BlogStatus = 'draft' | 'published';
// Legacy statuses plus the booking workflow statuses.
type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'responded' | 'closed';
type EnquiryStatus = 'new' | 'in_progress' | 'closed';
type Tab = 'blog' | 'sessions' | 'enquiries' | 'notifications';

interface BlogRow {
  id: string;
  title: string | null;
  category: string | null;
  status: BlogStatus;
  created_at: string;
  updated_at: string | null;
  views: number | null;
  content: string | null;
  excerpt: string | null;
  image_url: string | null;
  author: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  category: string;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
  views: number;
  content: string;
  excerpt: string;
  imageUrl: string | null;
  author: string;
}

interface SessionRow {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  service: string;
  message: string | null;
  date: string;
  time: string;
  status: SessionStatus;
}

interface SessionBooking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  service: string;
  message: string | null;
  date: string;
  time: string;
  status: SessionStatus;
}

interface Enquiry {
  id: string;
  kind: string;
  service_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  team_size: string | null;
  preferred_contact: string | null;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
}

interface SettingRow {
  key: string;
  value: string | null;
}

interface AdminDashboardProps {
  onLogout: () => void;
  userEmail?: string;
}

const CATEGORIES = ['Mental Health', 'Corporate', 'Leadership', 'Family', 'Wellbeing'];
const SESSION_STATUSES: SessionStatus[] = ['pending', 'confirmed', 'completed', 'cancelled', 'responded', 'closed'];
const ENQUIRY_STATUSES: EnquiryStatus[] = ['new', 'in_progress', 'closed'];
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

const STATUS_TONE: Record<SessionStatus, 'butter' | 'sky' | 'sage' | 'neutral' | 'rose' | 'lavender'> = {
  pending: 'butter',
  confirmed: 'sky',
  completed: 'sage',
  cancelled: 'rose',
  responded: 'lavender',
  closed: 'neutral',
};

const mapPost = (row: BlogRow): BlogPost => ({
  id: row.id,
  title: row.title ?? '',
  category: row.category ?? 'Mental Health',
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? row.created_at,
  views: row.views ?? 0,
  content: row.content ?? '',
  excerpt: row.excerpt ?? '',
  imageUrl: row.image_url ?? null,
  author: row.author ?? '',
});

const mapSession = (row: SessionRow): SessionBooking => ({
  id: row.id,
  customerName: row.customer_name,
  email: row.email,
  phone: row.phone,
  service: row.service,
  message: row.message ?? null,
  date: row.date,
  time: row.time,
  status: row.status,
});

const serviceName = (id: string) => getService(id)?.name ?? id;
const isMissingTable = (code?: string) => code === '42P01' || code === 'PGRST205';

type Flash = { tone: 'success' | 'danger' | 'warning'; text: string } | null;

function useFlash(): [Flash, (f: Flash, ms?: number) => void] {
  const [flash, setFlash] = useState<Flash>(null);
  const timer = useRef<number>();
  const show = useCallback((f: Flash, ms = 6000) => {
    window.clearTimeout(timer.current);
    setFlash(f);
    if (f) timer.current = window.setTimeout(() => setFlash(null), ms);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return [flash, show];
}

/* ------------------------------------------------------------------ */
/* Articles                                                             */
/* ------------------------------------------------------------------ */

function BlogTab({ posts, setPosts, notify }: { posts: BlogPost[]; setPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>; notify: (f: Flash) => void }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimer = useRef<number>();
  const editing = posts.find((p) => p.id === editingId) ?? null;

  const filtered = useMemo(
    () =>
      posts.filter((p) => {
        const q = search.toLowerCase();
        return (filter === 'All' || p.category === filter) && (!q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      }),
    [posts, filter, search]
  );

  const persist = useCallback(
    async (post: BlogPost) => {
      setSaveState('saving');
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: post.title,
          category: post.category,
          status: post.status,
          updated_at: post.updatedAt,
          content: post.content,
          excerpt: post.excerpt,
          image_url: post.imageUrl,
          author: post.author || null,
        })
        .eq('id', post.id);
      setSaveState(error ? 'error' : 'saved');
      if (error) notify({ tone: 'danger', text: 'Could not save changes to the post.' });
    },
    [notify]
  );

  /** Edits apply locally at once and are saved after a short pause in typing. */
  const update = (patch: Partial<BlogPost>, immediate = false) => {
    if (!editing) return;
    const next = { ...editing, ...patch, updatedAt: new Date().toISOString() };
    setPosts((prev) => prev.map((p) => (p.id === next.id ? next : p)));
    window.clearTimeout(saveTimer.current);
    setSaveState('saving');
    if (immediate) void persist(next);
    else saveTimer.current = window.setTimeout(() => void persist(next), 700);
  };
  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  const create = async () => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({ title: 'Untitled post', category: 'Mental Health', status: 'draft', created_at: now, updated_at: now, views: 0, content: '', excerpt: '', image_url: null, author: 'Imela Team' })
      .select('*')
      .single();
    if (error || !data) return notify({ tone: 'danger', text: 'Could not create a new post.' });
    const post = mapPost(data as BlogRow);
    setPosts((prev) => [post, ...prev]);
    setEditingId(post.id);
  };

  const setStatus = async (post: BlogPost, status: BlogStatus) => {
    const updatedAt = new Date().toISOString();
    const { error } = await supabase.from('blog_posts').update({ status, updated_at: updatedAt }).eq('id', post.id);
    if (error) return notify({ tone: 'danger', text: `Could not ${status === 'published' ? 'publish' : 'unpublish'} the post.` });
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, status, updatedAt } : p)));
    notify({ tone: 'success', text: status === 'published' ? 'Post published.' : 'Post moved back to drafts.' });
  };

  const remove = async (post: BlogPost) => {
    if (!window.confirm(`Delete “${post.title || 'Untitled'}”? This cannot be undone.`)) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);
    if (error) return notify({ tone: 'danger', text: 'Could not delete the post.' });
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    if (editingId === post.id) setEditingId(null);
  };

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify({ tone: 'danger', text: 'Please choose an image file (JPG or PNG).' });
    if (file.size > MAX_IMAGE_BYTES) return notify({ tone: 'danger', text: 'That image is larger than 1.5 MB. Please resize it and try again.' });
    const reader = new FileReader();
    reader.onloadend = () => update({ imageUrl: reader.result as string }, true);
    reader.readAsDataURL(file);
  };

  return (
    <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-card bg-paper p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-display-sm">Articles</h2>
            <p className="text-sm text-ink-soft">Only published posts appear on the Resources page.</p>
          </div>
          <Button size="sm" onClick={create}>
            <Plus className="h-4 w-4" aria-hidden /> New post
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search posts</span>
            <Search className="absolute left-3 top-3 h-4 w-4 text-ink-soft" aria-hidden />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or category" className="w-full rounded-pill border border-line/20 bg-ivory py-2.5 pl-9 pr-4 text-sm" />
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-pill border border-line/20 bg-ivory px-4 py-2.5 text-sm">
              {['All', ...CATEGORIES].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <ul className="mt-4 divide-y divide-line/10">
          {filtered.map((p) => (
            <li key={p.id} className={cn('flex flex-wrap items-center gap-3 py-3', editingId === p.id && 'rounded-2xl bg-lavender-soft/60 px-3')}>
              <button className="min-w-0 flex-1 text-left" onClick={() => setEditingId(p.id)}>
                <span className="block truncate font-semibold">{p.title || 'Untitled'}</span>
                <span className="text-xs text-ink-soft">
                  {p.category} · {p.views} views · updated {new Date(p.updatedAt).toLocaleDateString('en-GB')}
                </span>
              </button>
              <Chip tone={p.status === 'published' ? 'sage' : 'butter'}>{p.status === 'published' ? 'Published' : 'Draft'}</Chip>
              {p.status === 'draft' && (
                <Button size="sm" variant="soft" onClick={() => setStatus(p, 'published')}>
                  Publish
                </Button>
              )}
              <button onClick={() => remove(p)} className="rounded-full p-2 text-ink-soft hover:bg-rose-soft hover:text-rose-ink" aria-label={`Delete ${p.title || 'untitled post'}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="py-8 text-center text-sm text-ink-soft">No posts yet. Create your first article to get started.</li>}
        </ul>
      </div>

      <div className="rounded-card bg-paper p-5 shadow-soft">
        {editing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-display-sm">Edit post</h2>
              <span className="text-xs text-ink-soft" role="status">
                {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'All changes saved' : saveState === 'error' ? 'Not saved — check your connection' : ''}
              </span>
            </div>
            <TextField label="Title" value={editing.title} onChange={(e) => update({ title: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Category" value={editing.category} onChange={(e) => update({ category: e.target.value }, true)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </SelectField>
              <TextField label="Author" value={editing.author} onChange={(e) => update({ author: e.target.value })} optional />
            </div>
            <TextArea label="Excerpt" value={editing.excerpt} onChange={(e) => update({ excerpt: e.target.value })} hint="One or two sentences shown on the Resources page." className="min-h-[5rem]" />
            <TextArea
              label="Content"
              value={editing.content}
              onChange={(e) => update({ content: e.target.value })}
              hint="Plain text. Separate paragraphs with a blank line; start a line with “## ” for a heading or “- ” for a bullet."
              className="min-h-[14rem] font-mono text-sm"
            />
            <div>
              <p className="text-sm font-semibold text-ink-strong">Featured image</p>
              {editing.imageUrl ? (
                <img src={editing.imageUrl} alt="" className="mt-2 h-36 w-full rounded-2xl object-cover" />
              ) : (
                <p className="mt-2 rounded-2xl border border-dashed border-line/20 p-4 text-center text-xs text-ink-soft">No image</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <label className={buttonClasses('outline', 'sm', 'cursor-pointer')}>
                  Choose image
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onImage} className="sr-only" />
                </label>
                {editing.imageUrl && (
                  <Button size="sm" variant="ghost" onClick={() => update({ imageUrl: null }, true)}>
                    Remove
                  </Button>
                )}
                <span className="text-xs text-ink-soft">JPG, PNG or WebP up to 1.5 MB.</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-line/10 pt-4">
              <Chip tone={editing.status === 'published' ? 'sage' : 'butter'}>{editing.status === 'published' ? 'Published' : 'Draft'}</Chip>
              {editing.status === 'draft' ? (
                <Button size="sm" onClick={() => setStatus(editing, 'published')}>
                  Publish now
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setStatus(editing, 'draft')}>
                  Move to drafts
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                Close
              </Button>
            </div>
            <details className="rounded-2xl bg-ivory p-4">
              <summary className="cursor-pointer text-sm font-semibold">Preview (plain text)</summary>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{editing.content || 'Nothing written yet.'}</div>
            </details>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-ink-soft">
            Select a post to edit, or create a new one.
            <div className="mt-4">
              <Button size="sm" onClick={create}>
                <Plus className="h-4 w-4" aria-hidden /> New post
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Bookings                                                             */
/* ------------------------------------------------------------------ */

/** Manual confirmation email. Deliberately omits the client's message and service details. */
function confirmationMailto(s: SessionBooking): string {
  const subject = encodeURIComponent('Your Imela appointment');
  const body = encodeURIComponent(
    [
      `Dear ${s.customerName},`,
      '',
      'Your appointment with Imela Ventures is confirmed:',
      '',
      `Date: ${formatSessionDate(s.date)}`,
      `Time: ${s.time} (Nairobi time)`,
      '',
      'If you need to reschedule or cancel, please contact us at least 24 hours in advance.',
      '',
      'Warm regards,',
      'Imela Ventures',
    ].join('\n')
  );
  return `mailto:${s.email}?subject=${subject}&body=${body}`;
}

function ReviewDialog({ session, onClose, onResponded }: { session: SessionBooking; onClose: () => void; onResponded: () => Promise<boolean> }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (ref.current && !ref.current.open) ref.current.showModal?.();
  }, []);

  const send = async () => {
    setBusy(true);
    setErr(null);
    const ok = await onResponded();
    setBusy(false);
    if (!ok) return setErr('Could not mark the booking as responded, so your reply was not opened. Please try again.');
    const subject = encodeURIComponent('A message from Imela Ventures');
    window.location.href = `mailto:${session.email}?subject=${subject}&body=${encodeURIComponent(reply.trim())}`;
    onClose();
  };

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="review-title" className="m-auto w-[min(94vw,38rem)] rounded-card bg-ivory p-0 text-ink shadow-lift backdrop:bg-ink-strong/50">
      <div className="space-y-4 p-6">
        <div>
          <h2 id="review-title" className="font-display text-display-sm">
            {session.customerName}
          </h2>
          <p className="text-sm text-ink-soft">
            {serviceName(session.service)} · {formatSessionDate(session.date)} at {session.time}
          </p>
        </div>
        <dl className="grid gap-3 rounded-2xl bg-paper p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-soft">Email</dt>
            <dd>{session.email}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Phone</dt>
            <dd>{session.phone}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-ink-soft">Message from client</dt>
            <dd className="whitespace-pre-wrap">{session.message || '—'}</dd>
          </div>
        </dl>
        <TextArea label="Your reply" value={reply} onChange={(e) => setReply(e.target.value)} hint="Opens in your email app. The booking is marked “Responded” first." />
        {err && <Alert tone="danger">{err}</Alert>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={send} disabled={busy || !reply.trim()}>
            {busy ? 'Saving…' : 'Mark responded & open email'}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

function SessionsTab({ sessions, setSessions, notify }: { sessions: SessionBooking[]; setSessions: React.Dispatch<React.SetStateAction<SessionBooking[]>>; notify: (f: Flash, ms?: number) => void }) {
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming'>('upcoming');
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [confirming, setConfirming] = useState<string | null>(null);
  const [manualFor, setManualFor] = useState<SessionBooking | null>(null);
  const [review, setReview] = useState<SessionBooking | null>(null);

  const filtered = useMemo(() => {
    const today = nairobiDate(new Date());
    const q = search.toLowerCase();
    return sessions.filter(
      (s) =>
        (statusFilter === 'all' || s.status === statusFilter) &&
        (serviceFilter === 'all' || s.service === serviceFilter) &&
        (!q || s.customerName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) &&
        (dateFilter === 'all' || (dateFilter === 'today' ? s.date === today : s.date >= today))
    );
  }, [sessions, statusFilter, serviceFilter, search, dateFilter]);

  const setStatus = async (id: string, status: SessionStatus): Promise<boolean> => {
    const previous = sessions.find((s) => s.id === id)?.status;
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    const { error } = await supabase.from('sessions').update({ status }).eq('id', id);
    if (error) {
      setSessions((prev) => prev.map((s) => (s.id === id && previous ? { ...s, status: previous } : s)));
      notify({ tone: 'danger', text: 'Could not update the booking status.' });
      return false;
    }
    return true;
  };

  const confirm = async (s: SessionBooking) => {
    setConfirming(s.id);
    setManualFor(null);
    const ok = await setStatus(s.id, 'confirmed');
    if (!ok) return setConfirming(null);
    let emailed = false;
    try {
      const { error } = await supabase.functions.invoke('send-booking-confirmation', { body: { bookingId: s.id } });
      emailed = !error;
    } catch {
      emailed = false;
    }
    setConfirming(null);
    if (emailed) notify({ tone: 'success', text: `Booking confirmed and a confirmation email was sent to ${s.email}.` });
    else {
      setManualFor({ ...s, status: 'confirmed' });
      notify({ tone: 'warning', text: 'Booking confirmed, but the confirmation email could not be sent automatically. Use “Email manually” to let the client know.' }, 12000);
    }
  };

  // Catalogue services first, then any legacy values already stored.
  const serviceIds = useMemo(() => {
    const known = SERVICES.map((s) => s.id);
    const stored = sessions.map((s) => s.service).filter((id) => !known.includes(id));
    return [...known, ...new Set(stored)];
  }, [sessions]);

  return (
    <section className="rounded-card bg-paper p-5 shadow-soft">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-display-sm">Bookings</h2>
          <p className="text-sm text-ink-soft">New requests appear here in real time.</p>
        </div>
        {manualFor && (
          <a href={confirmationMailto(manualFor)} className={buttonClasses('outline', 'sm')}>
            <Mail className="h-4 w-4" aria-hidden /> Email {manualFor.customerName} manually
          </a>
        )}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <label className="relative">
          <span className="sr-only">Search bookings</span>
          <Search className="absolute left-3 top-3 h-4 w-4 text-ink-soft" aria-hidden />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or email" className="w-full rounded-pill border border-line/20 bg-ivory py-2.5 pl-9 pr-4 text-sm" />
        </label>
        <select aria-label="Date filter" value={dateFilter} onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)} className="rounded-pill border border-line/20 bg-ivory px-4 py-2.5 text-sm">
          <option value="upcoming">Upcoming</option>
          <option value="today">Today</option>
          <option value="all">All dates</option>
        </select>
        <select aria-label="Status filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as SessionStatus | 'all')} className="rounded-pill border border-line/20 bg-ivory px-4 py-2.5 text-sm">
          <option value="all">All statuses</option>
          {SESSION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {SESSION_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select aria-label="Service filter" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="rounded-pill border border-line/20 bg-ivory px-4 py-2.5 text-sm">
          <option value="all">All services</option>
          {serviceIds.map((id) => (
            <option key={id} value={id}>
              {serviceName(id)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-ink-soft">
            <tr>
              <th className="py-2 pr-3 font-semibold">Client</th>
              <th className="py-2 pr-3 font-semibold">Service</th>
              <th className="py-2 pr-3 font-semibold">When</th>
              <th className="py-2 pr-3 font-semibold">Status</th>
              <th className="py-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/10">
            {filtered.map((s) => (
              <tr key={s.id} className="align-top">
                <td className="py-3 pr-3">
                  <p className="font-semibold">{s.customerName}</p>
                  <p className="text-xs text-ink-soft">{s.email}</p>
                  <p className="text-xs text-ink-soft">{s.phone}</p>
                </td>
                <td className="py-3 pr-3">{serviceName(s.service)}</td>
                <td className="whitespace-nowrap py-3 pr-3">
                  {formatSessionDate(s.date)}
                  <br />
                  <span className="text-xs text-ink-soft">{s.time}</span>
                </td>
                <td className="py-3 pr-3">
                  <Chip tone={STATUS_TONE[s.status] ?? 'neutral'}>{SESSION_STATUS_LABEL[s.status] ?? s.status}</Chip>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {s.status === 'pending' && (
                      <Button size="sm" onClick={() => confirm(s)} disabled={confirming === s.id}>
                        {confirming === s.id ? 'Confirming…' : 'Confirm'}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setReview(s)}>
                      Review
                    </Button>
                    <select
                      aria-label={`Change status for ${s.customerName}`}
                      value={s.status}
                      onChange={(e) => void setStatus(s.id, e.target.value as SessionStatus)}
                      className="rounded-pill border border-line/20 bg-ivory px-3 py-1.5 text-xs"
                    >
                      {SESSION_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {SESSION_STATUS_LABEL[st]}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-ink-soft">
                  No bookings match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {review && <ReviewDialog session={review} onClose={() => setReview(null)} onResponded={() => setStatus(review.id, 'responded')} />}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Enquiries                                                            */
/* ------------------------------------------------------------------ */

function EnquiriesTab({ notify }: { notify: (f: Flash) => void }) {
  const [rows, setRows] = useState<Enquiry[] | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setState(isMissingTable(error.code) ? 'missing' : 'error');
        else {
          setRows((data ?? []) as Enquiry[]);
          setState('ready');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const setStatus = async (id: string, status: EnquiryStatus) => {
    const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
    if (error) return notify({ tone: 'danger', text: 'Could not update the enquiry.' });
    setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, status } : r)) ?? null);
  };

  return (
    <section className="rounded-card bg-paper p-5 shadow-soft">
      <h2 className="font-display text-display-sm">Enquiries</h2>
      <p className="text-sm text-ink-soft">Workplace programme and consultation enquiries sent from the website.</p>
      {state === 'loading' && <Spinner className="mt-4" />}
      {state === 'missing' && (
        <Alert tone="warning" className="mt-4" title="The enquiries table isn’t set up yet">
          Apply <code className="break-all">supabase/migrations/20261027000006_enquiries.sql</code>. Until then, the website offers visitors their own email app instead.
        </Alert>
      )}
      {state === 'error' && (
        <Alert tone="danger" className="mt-4">
          Could not load enquiries.
        </Alert>
      )}
      {state === 'ready' && rows && rows.length === 0 && <p className="mt-6 text-sm text-ink-soft">No enquiries yet.</p>}
      <ul className="mt-4 space-y-3">
        {rows?.map((r) => (
          <li key={r.id} className="rounded-2xl border border-line/10 bg-ivory p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {r.name}
                  {r.organisation && <span className="font-normal text-ink-soft"> · {r.organisation}</span>}
                </p>
                <p className="text-xs text-ink-soft">
                  {new Date(r.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} · {r.kind}
                  {r.team_size && ` · ${r.team_size}`}
                  {r.service_id && ` · ${serviceName(r.service_id)}`}
                </p>
              </div>
              <select aria-label={`Status for enquiry from ${r.name}`} value={r.status} onChange={(e) => setStatus(r.id, e.target.value as EnquiryStatus)} className="rounded-pill border border-line/20 bg-paper px-3 py-1.5 text-xs">
                {ENQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            {r.message && <p className="mt-3 whitespace-pre-wrap text-sm">{r.message}</p>}
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <a className="font-semibold text-lavender-ink underline-offset-4 hover:underline" href={`mailto:${r.email}?subject=${encodeURIComponent('Your enquiry to Imela Ventures')}`}>
                {r.email}
              </a>
              {r.phone && (
                <a className="font-semibold text-lavender-ink underline-offset-4 hover:underline" href={`tel:${r.phone}`}>
                  {r.phone}
                </a>
              )}
              {r.preferred_contact && <span className="text-ink-soft">Prefers {r.preferred_contact}</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications                                                        */
/* ------------------------------------------------------------------ */

function NotificationsTab({ initialEmail, initialEnabled, available, notify }: { initialEmail: string; initialEnabled: boolean; available: boolean; notify: (f: Flash) => void }) {
  const [email, setEmail] = useState(initialEmail);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  const save = async (key: string, value: string) => {
    setSaving(true);
    const { error } = await supabase.from('settings').upsert({ key, value });
    setSaving(false);
    if (error) notify({ tone: 'danger', text: 'Could not save the notification setting.' });
    else notify({ tone: 'success', text: 'Notification settings saved.' });
  };

  return (
    <section className="max-w-2xl rounded-card bg-paper p-6 shadow-soft">
      <h2 className="font-display text-display-sm">Booking notifications</h2>
      {!available && (
        <Alert tone="warning" className="mt-4">
          Settings could not be loaded. Changes may not save until the database is reachable.
        </Alert>
      )}
      <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-ivory p-4">
        <div>
          <p id="notify-label" className="font-semibold">
            Email me about new bookings
          </p>
          <p className="text-sm text-ink-soft">The booking notification function reads this setting before sending.</p>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          aria-labelledby="notify-label"
          onClick={() => {
            const next = !enabled;
            setEnabled(next);
            void save('notifications_enabled', String(next));
          }}
          className={cn('relative h-7 w-12 shrink-0 rounded-pill transition-colors', enabled ? 'bg-sage-ink' : 'bg-ink/20')}
        >
          <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform', enabled ? 'translate-x-6' : 'translate-x-1')} />
        </button>
      </div>
      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.includes('@')) return notify({ tone: 'danger', text: 'Please enter a valid email address.' });
          void save('notification_email', email.trim());
        }}
      >
        <div className="flex-1">
          <TextField label="Notification email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} hint="Use an inbox you check often." />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        Emails are sent by the <code>send-booking-notification</code> Edge Function through your email provider (see supabase/README.md). For privacy,
        notification emails never include the client’s message — read it here in the dashboard.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard shell                                                      */
/* ------------------------------------------------------------------ */

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'sessions', label: 'Bookings', icon: CalendarDays },
  { id: 'enquiries', label: 'Enquiries', icon: Inbox },
  { id: 'blog', label: 'Articles', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Settings },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, userEmail }) => {
  const [tab, setTab] = useState<Tab>('sessions');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [sessions, setSessions] = useState<SessionBooking[]>([]);
  const [settings, setSettings] = useState<{ email: string; enabled: boolean; available: boolean }>({ email: '', enabled: true, available: false });
  const [flash, notify] = useFlash();

  useEffect(() => {
    let active = true;
    (async () => {
      const [blogRes, sessionsRes, settingsRes] = await Promise.all([
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('sessions').select('*').order('date', { ascending: true }).order('time', { ascending: true }),
        supabase.from('settings').select('*'),
      ]);
      if (!active) return;
      // Each source loads independently so one failure doesn't hide the rest.
      const problems: string[] = [];
      if (blogRes.error) problems.push('articles');
      else setPosts(((blogRes.data ?? []) as BlogRow[]).map(mapPost));
      if (sessionsRes.error) problems.push('bookings');
      else setSessions(((sessionsRes.data ?? []) as SessionRow[]).map(mapSession));
      if (settingsRes.error) problems.push('settings');
      else {
        const rows = (settingsRes.data ?? []) as SettingRow[];
        setSettings({
          email: rows.find((r) => r.key === 'notification_email')?.value ?? '',
          enabled: (rows.find((r) => r.key === 'notifications_enabled')?.value ?? 'true') === 'true',
          available: true,
        });
      }
      if (problems.length) setLoadError(`Could not load ${problems.join(', ')}. Check your connection and database access.`);
      setLoading(false);
    })().catch(() => {
      if (!active) return;
      setLoadError('Could not reach the database. Check your connection.');
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Real-time booking updates
  useEffect(() => {
    const channel = supabase
      .channel('admin:sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const s = mapSession(payload.new as SessionRow);
          setSessions((prev) => (prev.some((x) => x.id === s.id) ? prev : [s, ...prev]));
        } else if (payload.eventType === 'UPDATE') {
          const s = mapSession(payload.new as SessionRow);
          setSessions((prev) => prev.map((x) => (x.id === s.id ? s : x)));
        } else if (payload.eventType === 'DELETE') {
          const id = (payload.old as Partial<SessionRow>).id;
          setSessions((prev) => prev.filter((x) => x.id !== id));
        }
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const metrics = useMemo(() => {
    const today = nairobiDate(new Date());
    return {
      published: posts.filter((p) => p.status === 'published').length,
      drafts: posts.filter((p) => p.status === 'draft').length,
      views: posts.reduce((n, p) => n + p.views, 0),
      pending: sessions.filter((s) => s.status === 'pending').length,
      upcoming: sessions.filter((s) => s.date >= today && ['pending', 'confirmed'].includes(s.status)).length,
    };
  }, [posts, sessions]);

  return (
    <div className="min-h-screen bg-ivory">
      <header className="sticky top-0 z-30 border-b border-line/10 bg-ivory/90 backdrop-blur">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="Back to website">
              <img src="/logo-transparent.png" alt="" className="h-11 w-auto" />
            </Link>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft sm:inline">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            {userEmail && <span className="hidden text-xs text-ink-soft md:inline">{userEmail}</span>}
            <Button size="sm" variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </Button>
          </div>
        </div>
        <nav aria-label="Admin sections" className="shell flex gap-1 overflow-x-auto pb-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={cn('inline-flex shrink-0 items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold', tab === id ? 'bg-ink-strong text-ivory' : 'text-ink hover:bg-ink/5')}
            >
              <Icon className="h-4 w-4" aria-hidden /> {label}
              {id === 'sessions' && metrics.pending > 0 && <span className="rounded-pill bg-butter px-2 text-xs text-ink-strong">{metrics.pending}</span>}
            </button>
          ))}
          <Link to="/staff/persona" className="inline-flex shrink-0 items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold text-lavender-ink hover:bg-lavender-soft">
            Persona cases
          </Link>
        </nav>
      </header>

      <main className="shell space-y-6 py-8">
        {!config.platformDbReady && (
          <div role="note" className="flex gap-3 rounded-card border-2 border-rose/50 bg-rose-soft p-5 text-rose-ink">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div className="text-sm">
              <p className="font-semibold">Security setup pending: apply supabase/migrations so only administrators can read bookings.</p>
              <p className="mt-1">
                With the current database policies, any signed-in account can read client bookings. Disable public sign-ups in Supabase Auth until the
                migrations are applied (see supabase/README.md), then set VITE_PLATFORM_DB_READY=true.
              </p>
            </div>
          </div>
        )}

        {flash && (
          <Alert tone={flash.tone} live>
            {flash.text}
          </Alert>
        )}
        {loadError && <Alert tone="danger">{loadError}</Alert>}

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Upcoming bookings', value: metrics.upcoming, note: `${metrics.pending} awaiting confirmation` },
            { label: 'Published articles', value: metrics.published, note: `${metrics.drafts} drafts · ${metrics.views} views` },
            { label: 'Notifications', value: settings.enabled ? 'On' : 'Off', note: settings.email || 'No email set' },
          ].map((m) => (
            <div key={m.label} className="rounded-card bg-paper p-5 shadow-soft">
              <p className="text-sm text-ink-soft">{m.label}</p>
              <p className="mt-1 font-display text-4xl text-ink-strong">{loading ? '—' : m.value}</p>
              <p className="mt-1 truncate text-xs text-ink-soft">{m.note}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <Spinner label="Loading dashboard…" />
        ) : (
          <>
            {tab === 'sessions' && <SessionsTab sessions={sessions} setSessions={setSessions} notify={notify} />}
            {tab === 'enquiries' && <EnquiriesTab notify={notify} />}
            {tab === 'blog' && <BlogTab posts={posts} setPosts={setPosts} notify={notify} />}
            {tab === 'notifications' && (
              <NotificationsTab key={`${settings.email}|${settings.enabled}`} initialEmail={settings.email} initialEnabled={settings.enabled} available={settings.available} notify={notify} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
