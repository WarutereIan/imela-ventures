import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, ExternalLink, Plus, Search, Trash2 } from 'lucide-react';
import { createArticle, deleteArticle, listArticles, saveArticle, type Article } from '../../domain/admin/api';
import RichText from '../../components/content/RichText';
import { Alert, Chip, SelectField, Spinner, TextArea, TextField } from '../../components/ui/primitives';
import { Button, buttonClasses } from '../../components/ui/Button';
import { cn } from '../../lib/cn';
import { useAdmin } from './useAdmin';
import { AdminPageHeader, Segmented } from './ui';
import { timeAgo } from './format';

const CATEGORIES = ['Mental Health', 'Anxiety & worry', 'Stress & burnout', 'Grief & loss', 'Relationships', 'Family', 'Workplace', 'Leadership', 'Wellbeing'];
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

export default function ArticlesPage() {
  const { toast } = useAdmin();
  const [posts, setPosts] = useState<Article[] | null>(null);
  const [error, setError] = useState(false);
  const [view, setView] = useState<'all' | 'published' | 'draft'>('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimer = useRef<number>();
  const editing = posts?.find((p) => p.id === editingId) ?? null;

  useEffect(() => {
    void listArticles().then((res) => (res.ok ? setPosts(res.data) : setError(true)));
    return () => window.clearTimeout(saveTimer.current);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (posts ?? []).filter((p) => (view === 'all' || (view === 'published' ? p.status === 'published' : p.status !== 'published')) && (!q || (p.title ?? '').toLowerCase().includes(q) || (p.category ?? '').toLowerCase().includes(q)));
  }, [posts, view, search]);

  const persist = useCallback(
    async (id: string, patch: Partial<Article>) => {
      setSaveState('saving');
      const res = await saveArticle(id, patch);
      setSaveState(res.ok ? 'saved' : 'error');
      if (!res.ok) toast({ tone: 'danger', text: 'Could not save the article.' });
      return res.ok;
    },
    [toast]
  );

  /** Saves a non-text change (category, image) straight away. */
  const update = (patch: Partial<Article>) => {
    if (!editing) return;
    const id = editing.id;
    setPosts((prev) => prev?.map((p) => (p.id === id ? { ...p, ...patch, updated_at: new Date().toISOString() } : p)) ?? null);
    void persist(id, patch);
  };

  // Keep the debounced save in sync with the latest text.
  const latestRef = useRef(editing);
  latestRef.current = editing;
  const updateText = (field: 'title' | 'excerpt' | 'content' | 'author', value: string) => {
    if (!editing) return;
    const id = editing.id;
    setPosts((prev) => prev?.map((p) => (p.id === id ? { ...p, [field]: value } : p)) ?? null);
    setSaveState('saving');
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const p = latestRef.current;
      if (p && p.id === id) void persist(id, { title: p.title, excerpt: p.excerpt, content: p.content, author: p.author || null });
    }, 700);
  };

  const create = async () => {
    const res = await createArticle();
    if (!res.ok) return toast({ tone: 'danger', text: 'Could not create a new article.' });
    setPosts((prev) => [res.data, ...(prev ?? [])]);
    setEditingId(res.data.id);
    setTab('write');
  };

  const setStatus = async (p: Article, status: 'draft' | 'published') => {
    const ok = await persist(p.id, { status });
    if (!ok) return;
    setPosts((prev) => prev?.map((x) => (x.id === p.id ? { ...x, status } : x)) ?? null);
    toast({ tone: 'success', text: status === 'published' ? 'Published — it’s now on the Resources page.' : 'Moved back to drafts.' });
  };

  const remove = async (p: Article) => {
    if (!window.confirm(`Delete “${p.title || 'Untitled'}”? This cannot be undone.`)) return;
    const res = await deleteArticle(p.id);
    if (!res.ok) return toast({ tone: 'danger', text: 'Could not delete the article.' });
    setPosts((prev) => prev?.filter((x) => x.id !== p.id) ?? null);
    if (editingId === p.id) setEditingId(null);
  };

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast({ tone: 'danger', text: 'Please choose an image file (JPG, PNG or WebP).' });
    if (file.size > MAX_IMAGE_BYTES) return toast({ tone: 'danger', text: 'That image is larger than 1.5 MB. Please resize it and try again.' });
    const reader = new FileReader();
    reader.onloadend = () => update({ image_url: reader.result as string });
    reader.readAsDataURL(file);
  };

  const words = editing?.content?.trim() ? editing.content.trim().split(/\s+/).length : 0;
  const published = posts?.filter((p) => p.status === 'published').length ?? 0;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Articles"
        lede="Published articles appear on the Resources page and in search results."
        actions={
          <Button size="sm" onClick={() => void create()}>
            <Plus className="h-4 w-4" aria-hidden /> New article
          </Button>
        }
      />
      {error && <Alert tone="danger">Could not load articles.</Alert>}
      {!posts && !error && <Spinner label="Loading articles…" />}

      {posts && (
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className={cn('space-y-3', editing && 'hidden xl:block')}>
            <Segmented
              label="Article status"
              value={view}
              onChange={setView}
              options={[
                { id: 'all', label: 'All', count: posts.length },
                { id: 'published', label: 'Published', count: published },
                { id: 'draft', label: 'Drafts', count: posts.length - published },
              ]}
            />
            <label className="relative block">
              <span className="sr-only">Search articles</span>
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-soft" aria-hidden />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or category" className="w-full rounded-pill border border-line/20 bg-paper py-2.5 pl-10 pr-4 text-sm" />
            </label>
            <ul className="grid grid-cols-1 gap-2">
              {filtered.map((p) => (
                <li key={p.id}>
                  <div className={cn('flex items-center gap-3 rounded-card bg-paper p-3 shadow-soft', editingId === p.id && 'ring-2 ring-lavender-ink')}>
                    <button type="button" onClick={() => setEditingId(p.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-lavender-soft font-display text-lg text-lavender-ink">{(p.title || 'U')[0]}</span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-ink-strong">{p.title || 'Untitled'}</span>
                        <span className="block truncate text-xs text-ink-soft">
                          {p.category} · {p.views ?? 0} views · {timeAgo(p.updated_at ?? p.created_at)}
                        </span>
                      </span>
                    </button>
                    <Chip tone={p.status === 'published' ? 'sage' : 'butter'}>{p.status === 'published' ? 'Live' : 'Draft'}</Chip>
                    <button type="button" onClick={() => void remove(p)} className="rounded-full p-2 text-ink-soft hover:bg-rose-soft hover:text-rose-ink" aria-label={`Delete ${p.title || 'untitled article'}`}>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
              {filtered.length === 0 && <li className="rounded-card bg-paper p-8 text-center text-sm text-ink-soft shadow-soft">No articles here yet.</li>}
            </ul>
          </section>

          <section className={cn('rounded-card bg-paper p-4 shadow-soft sm:p-5', !editing && 'hidden xl:block')}>
            {editing ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button type="button" onClick={() => setEditingId(null)} className={buttonClasses('ghost', 'sm', 'xl:hidden')}>
                    <ArrowLeft className="h-4 w-4" aria-hidden /> All articles
                  </button>
                  <div className="flex rounded-pill bg-ivory p-1" role="group" aria-label="Editor mode">
                    {(['write', 'preview'] as const).map((t) => (
                      <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)} className={cn('rounded-pill px-3 py-1.5 text-sm font-semibold capitalize', tab === t ? 'bg-ink-strong text-ivory' : 'text-ink')}>
                        {t === 'preview' && <Eye className="mr-1 inline h-4 w-4" aria-hidden />}
                        {t}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-ink-soft" role="status">
                    {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'All changes saved' : saveState === 'error' ? 'Not saved — check your connection' : ''}
                  </span>
                </div>

                {tab === 'write' ? (
                  <>
                    <TextField label="Title" value={editing.title ?? ''} onChange={(e) => updateText('title', e.target.value)} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField label="Category" value={editing.category ?? 'Mental Health'} onChange={(e) => update({ category: e.target.value })}>
                        {[...new Set([...CATEGORIES, editing.category ?? 'Mental Health'])].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </SelectField>
                      <TextField label="Author" value={editing.author ?? ''} onChange={(e) => updateText('author', e.target.value)} optional />
                    </div>
                    <TextArea label="Summary" value={editing.excerpt ?? ''} onChange={(e) => updateText('excerpt', e.target.value)} hint="One or two sentences. Shown on the Resources page and in Google results." className="min-h-[5rem]" />
                    <TextArea
                      label="Article"
                      value={editing.content ?? ''}
                      onChange={(e) => updateText('content', e.target.value)}
                      hint="Separate paragraphs with a blank line. Start a line with “## ” for a heading or “- ” for a bullet point."
                      className="min-h-[18rem] text-[0.95rem] leading-relaxed"
                    />
                    <p className="text-xs text-ink-soft">
                      {words.toLocaleString()} words · about {Math.max(1, Math.round(words / 200))} min read
                    </p>
                    <div>
                      <p className="text-sm font-semibold text-ink-strong">Featured image</p>
                      {editing.image_url ? (
                        <img src={editing.image_url} alt="" className="mt-2 h-40 w-full rounded-2xl object-cover" />
                      ) : (
                        <p className="mt-2 rounded-2xl border border-dashed border-line/20 p-4 text-center text-xs text-ink-soft">No image</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <label className={buttonClasses('outline', 'sm', 'cursor-pointer')}>
                          Choose image
                          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onImage} className="sr-only" />
                        </label>
                        {editing.image_url && (
                          <Button size="sm" variant="ghost" onClick={() => update({ image_url: null })}>
                            Remove
                          </Button>
                        )}
                        <span className="text-xs text-ink-soft">JPG, PNG or WebP up to 1.5 MB.</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <article className="rounded-2xl bg-ivory p-5">
                    {editing.image_url && <img src={editing.image_url} alt="" className="mb-5 h-48 w-full rounded-2xl object-cover" />}
                    <p className="eyebrow">{editing.category}</p>
                    <h2 className="mt-1 font-display text-display-md">{editing.title || 'Untitled'}</h2>
                    {editing.excerpt && <p className="mt-3 text-lg text-ink">{editing.excerpt}</p>}
                    <div className="mt-5">
                      <RichText source={editing.content || 'Nothing written yet.'} />
                    </div>
                  </article>
                )}

                <div className="flex flex-wrap items-center gap-2 border-t border-line/10 pt-4">
                  <Chip tone={editing.status === 'published' ? 'sage' : 'butter'}>{editing.status === 'published' ? 'Live on the website' : 'Draft'}</Chip>
                  {editing.status !== 'published' ? (
                    <Button size="sm" onClick={() => void setStatus(editing, 'published')} disabled={!editing.title?.trim() || !editing.content?.trim()}>
                      Publish
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => void setStatus(editing, 'draft')}>
                        Unpublish
                      </Button>
                      <Link to={`/resources/${editing.slug || editing.id}`} target="_blank" className={buttonClasses('ghost', 'sm')}>
                        <ExternalLink className="h-4 w-4" aria-hidden /> View on site
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-sm text-ink-soft">
                Choose an article to edit, or start a new one.
                <div className="mt-4">
                  <Button size="sm" onClick={() => void create()}>
                    <Plus className="h-4 w-4" aria-hidden /> New article
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
