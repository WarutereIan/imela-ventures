// Shared helpers for Imela edge functions (Deno).

/**
 * ALLOWED_ORIGIN may list several origins separated by commas. The www and
 * non-www forms of each are both allowed, since sites are often reachable at
 * either. Unset means any origin.
 */
const allowedOrigins = (Deno.env.get('ALLOWED_ORIGIN') ?? '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean)
  .flatMap((o) => {
    const m = o.match(/^(https?:\/\/)(www\.)?(.+)$/);
    return m ? [`${m[1]}${m[3]}`, `${m[1]}www.${m[3]}`] : [o];
  });

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': allowedOrigins[0] ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
};

/** Reflects the caller's origin when it is on the allow-list. Call once per request. */
export function applyCors(req: Request) {
  const origin = req.headers.get('Origin');
  if (allowedOrigins.length && origin && allowedOrigins.includes(origin)) corsHeaders['Access-Control-Allow-Origin'] = origin;
}

export function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extraHeaders },
  });
}

/** For responses carrying credentials: never cached by browsers or proxies. */
export const NO_STORE = { 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' };

/** Best-effort fixed-window limiter. Edge instances are ephemeral and run in
 * parallel, so treat this as a speed bump, not a guarantee. */
export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, { count: number; start: number }>();
  return (key: string): boolean => {
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || now - entry.start > windowMs) {
      if (hits.size > 10_000) hits.clear();
      hits.set(key, { count: 1, start: now });
      return false;
    }
    entry.count += 1;
    return entry.count > max;
  };
}

export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export function preflight(req: Request): Response | null {
  applyCors(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  return null;
}

export async function readJson(req: Request, maxBytes = 64_000): Promise<unknown> {
  const text = await req.text();
  if (text.length > maxBytes) throw new Error('payload_too_large');
  return JSON.parse(text);
}

/** Escape a value for safe interpolation into HTML e-mail bodies. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function formatDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export interface EmailMessage {
  to: string[];
  subject: string;
  html: string;
}

/**
 * Sends via Resend. Returns a discriminated result instead of throwing so
 * callers can report honestly; never claims success without a 2xx response.
 */
export async function sendEmail(msg: EmailMessage): Promise<{ ok: true } | { ok: false; reason: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return { ok: false, reason: 'email_not_configured' };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: Deno.env.get('EMAIL_FROM') ?? 'Imela Ventures <noreply@imelaventures.com>',
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
    }),
  });

  if (!res.ok) {
    // Log the status only — never the payload, which contains personal data.
    console.error('resend_failed', res.status);
    return { ok: false, reason: 'email_provider_error' };
  }
  return { ok: true };
}
