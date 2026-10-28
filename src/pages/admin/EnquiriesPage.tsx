import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Mail, MessageCircle, Phone, Search, User } from 'lucide-react';
import { getService } from '../../data/services';
import { listEnquiries, updateEnquiry, type Enquiry, type EnquiryStatus } from '../../domain/admin/api';
import { Alert, Chip, EmptyState, Spinner } from '../../components/ui/primitives';
import { Button, buttonClasses } from '../../components/ui/Button';
import Companion from '../../components/characters/Companion';
import { cn } from '../../lib/cn';
import { useAdmin } from './useAdmin';
import { Drawer, NoteField } from './Drawer';
import { AdminPageHeader, MigrationNeeded, Segmented } from './ui';
import { timeAgo } from './format';

const STATUS: Record<EnquiryStatus, { label: string; tone: 'butter' | 'sky' | 'neutral' }> = {
  new: { label: 'New', tone: 'butter' },
  in_progress: { label: 'In progress', tone: 'sky' },
  closed: { label: 'Closed', tone: 'neutral' },
};
const KIND = { organisation: 'Workplace', individual: 'Service request', general: 'Message' } as const;

function whatsappHref(phone: string | null): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `254${digits.slice(1)}`;
  return digits.length >= 10 ? `https://wa.me/${digits}` : null;
}

function replyMailto(e: Enquiry): string {
  const subject = encodeURIComponent(e.kind === 'organisation' ? 'Your workplace wellbeing enquiry — Imela Ventures' : 'Your enquiry to Imela Ventures');
  const body = encodeURIComponent(`Dear ${e.name.split(' ')[0]},\n\nThank you for getting in touch with Imela Ventures.\n\n\n\nWarm regards,\nImela Ventures`);
  return `mailto:${e.email}?subject=${subject}&body=${body}`;
}

export default function EnquiriesPage() {
  const { toast, summary } = useAdmin();
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState<Enquiry[] | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [view, setView] = useState<EnquiryStatus | 'all'>('new');
  const [search, setSearch] = useState('');
  const openId = params.get('open');

  const load = useCallback(async () => {
    const res = await listEnquiries();
    if (res.ok) {
      setRows(res.data);
      setState('ready');
    } else setState(res.reason === 'missing' ? 'missing' : 'error');
  }, []);

  useEffect(() => {
    void load();
  }, [load, summary]);

  const counts = useMemo(() => {
    const c = { new: 0, in_progress: 0, closed: 0 };
    for (const r of rows ?? []) c[r.status] += 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rows ?? []).filter(
      (r) =>
        (view === 'all' || r.status === view) &&
        (!q || [r.name, r.email, r.organisation ?? '', r.message ?? ''].some((v) => v.toLowerCase().includes(q)))
    );
  }, [rows, view, search]);

  const open = rows?.find((r) => r.id === openId) ?? null;
  const setOpen = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('open', id);
    else next.delete('open');
    setParams(next, { replace: true });
  };

  // Opening a new enquiry moves it to "In progress", so the team can see it's being handled.
  useEffect(() => {
    if (open && open.status === 'new') void setStatus(open, 'in_progress', true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open?.id]);

  const setStatus = async (r: Enquiry, status: EnquiryStatus, quiet = false) => {
    setRows((prev) => prev?.map((x) => (x.id === r.id ? { ...x, status } : x)) ?? null);
    const res = await updateEnquiry(r.id, { status });
    if (!res.ok) {
      setRows((prev) => prev?.map((x) => (x.id === r.id ? { ...x, status: r.status } : x)) ?? null);
      toast({ tone: 'danger', text: 'Could not update the enquiry.' });
    } else if (!quiet) toast({ tone: 'success', text: `Marked ${STATUS[status].label.toLowerCase()}.` });
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Enquiries" lede="Workplace programme requests, service requests and messages sent from the website." />

      {state === 'missing' && <MigrationNeeded what="Enquiries" file="20261027000006_enquiries.sql" />}
      {state === 'error' && <Alert tone="danger">Could not load enquiries. Check your connection.</Alert>}
      {state === 'loading' && <Spinner label="Loading enquiries…" />}

      {state === 'ready' && (
        <>
          <Segmented<EnquiryStatus | 'all'>
            label="Enquiry status"
            value={view}
            onChange={setView}
            options={[
              { id: 'new', label: 'New', count: counts.new },
              { id: 'in_progress', label: 'In progress', count: counts.in_progress },
              { id: 'closed', label: 'Closed' },
              { id: 'all', label: 'All' },
            ]}
          />
          <label className="relative block">
            <span className="sr-only">Search enquiries</span>
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-soft" aria-hidden />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, organisation, email or message" className="w-full rounded-pill border border-line/20 bg-paper py-2.5 pl-10 pr-4 text-sm" />
          </label>

          {filtered.length === 0 ? (
            <EmptyState title={view === 'new' ? 'No new enquiries.' : 'Nothing here.'} art={<Companion variant="cloud" mood="calm" tone="sky" size={84} />}>
              New enquiries appear here the moment they're sent.
            </EmptyState>
          ) : (
            <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {filtered.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => setOpen(r.id)} className={cn('flex h-full w-full flex-col gap-2 rounded-card bg-paper p-4 text-left shadow-soft hover:bg-lavender-soft/40', r.status === 'new' && 'ring-2 ring-butter')}>
                    <span className="flex items-center gap-2">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-soft text-sky-ink">
                        {r.kind === 'organisation' ? <Building2 className="h-4 w-4" aria-hidden /> : <User className="h-4 w-4" aria-hidden />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-ink-strong">{r.name}</span>
                        <span className="block truncate text-xs text-ink-soft">
                          {KIND[r.kind]}
                          {r.organisation && ` · ${r.organisation}`}
                          {r.service_id && ` · ${getService(r.service_id)?.name ?? r.service_id}`}
                        </span>
                      </span>
                      <Chip tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Chip>
                    </span>
                    {r.message && <span className="line-clamp-2 text-sm text-ink">{r.message}</span>}
                    <span className="text-xs text-ink-soft">{timeAgo(r.created_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open?.name ?? ''}
        subtitle={open && `${KIND[open.kind]}${open.organisation ? ` · ${open.organisation}` : ''} · ${new Date(open.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`}
        footer={
          open && (
            <>
              {open.status !== 'closed' ? (
                <Button onClick={() => void setStatus(open, 'closed')}>Mark handled</Button>
              ) : (
                <Button variant="outline" onClick={() => void setStatus(open, 'in_progress')}>
                  Reopen
                </Button>
              )}
            </>
          )
        }
      >
        {open && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <a href={replyMailto(open)} className={buttonClasses('soft', 'sm', 'flex-col gap-1 py-3 h-auto')}>
                <Mail className="h-4 w-4" aria-hidden /> Reply
              </a>
              {open.phone ? (
                <a href={`tel:${open.phone}`} className={buttonClasses('soft', 'sm', 'flex-col gap-1 py-3 h-auto')}>
                  <Phone className="h-4 w-4" aria-hidden /> Call
                </a>
              ) : (
                <span />
              )}
              {whatsappHref(open.phone) ? (
                <a href={whatsappHref(open.phone)!} target="_blank" rel="noreferrer" className={buttonClasses('soft', 'sm', 'flex-col gap-1 py-3 h-auto')}>
                  <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                </a>
              ) : (
                <span />
              )}
            </div>
            <dl className="grid gap-3 rounded-2xl bg-paper p-4 text-sm sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-ink-soft">Email</dt>
                <dd className="break-all font-medium">{open.email}</dd>
              </div>
              {open.phone && (
                <div>
                  <dt className="text-ink-soft">Phone</dt>
                  <dd className="font-medium">{open.phone}</dd>
                </div>
              )}
              {open.preferred_contact && (
                <div>
                  <dt className="text-ink-soft">Prefers</dt>
                  <dd className="font-medium capitalize">{open.preferred_contact}</dd>
                </div>
              )}
              {open.team_size && (
                <div>
                  <dt className="text-ink-soft">Team size</dt>
                  <dd className="font-medium">{open.team_size}</dd>
                </div>
              )}
              {open.service_id && (
                <div>
                  <dt className="text-ink-soft">Service</dt>
                  <dd className="font-medium">{getService(open.service_id)?.name ?? open.service_id}</dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-ink-soft">Message</dt>
                <dd className="whitespace-pre-wrap">{open.message || '—'}</dd>
              </div>
            </dl>
            <NoteField
              key={open.id}
              initial={open.admin_note ?? ''}
              disabled={open.admin_note === undefined}
              onSave={async (v) => {
                const res = await updateEnquiry(open.id, { admin_note: v || null });
                if (res.ok) setRows((prev) => prev?.map((x) => (x.id === open.id ? { ...x, admin_note: v } : x)) ?? null);
                return res.ok;
              }}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
