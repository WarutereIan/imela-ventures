// persona-respond
//
// OPTIONAL AI reflection for Imela. The website works fully without
// this function: its deterministic engine runs in the browser and sends
// nothing anywhere. This endpoint is used only when the operator enables it
// AND the person has explicitly consented to their words being processed by
// an external AI provider.
//
// Contract
//   POST { messages: { role: 'user' | 'assistant', text: string }[], consent: true }
//   200  { reply: string, provider: string }
//   400  invalid input · 403 consent missing · 429 rate limited
//   503  { error: 'ai_not_configured' } when no provider is configured
//
// Privacy
//   - Message contents are never logged.
//   - Nothing is stored. Each request is processed and discarded.
//
// Configuration (Supabase secrets)
//   PERSONA_AI_PROVIDER = anthropic
//   ANTHROPIC_API_KEY   = ...
//   PERSONA_AI_MODEL    = claude-sonnet-5-5 (default)

import { json, preflight, readJson } from '../_shared/http.ts';

type Role = 'user' | 'assistant';
interface ChatMessage {
  role: Role;
  text: string;
}

interface ReplyProvider {
  name: string;
  reply(messages: ChatMessage[]): Promise<string>;
}

const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;

const SYSTEM_PROMPT = `You are Imela, a warm, reflective listening companion on the website of Imela Ventures, a counselling and mental wellness practice in Nairobi, Kenya.

Who you are:
- You are not a therapist, counsellor or doctor, and you never say or imply that you are.
- You never diagnose, label conditions, or suggest medication.
- You help the person put their experience into words and feel heard, so they can choose a next step.

How you respond:
- Keep replies under 90 words, plain and warm. No lists, no headings.
- Briefly reflect back what you heard in your own words, and invite correction if you may have misunderstood.
- Ask at most ONE gentle, open question, or none if the person seems to want space.
- Do not pressure the person to book. If it fits, you may mention that speaking with an Imela counsellor is an option.

Safety (overrides everything above):
- If the person expresses any risk of harming themselves or someone else, thoughts of suicide, or being in danger from another person, do not continue the conversation normally. Reply only with a short, caring message encouraging them to contact emergency services now on 999 or 112, or the Kenya Red Cross on 1199, or to go to the nearest hospital, and to reach someone they trust. Do not ask further questions.`;

class AnthropicProvider implements ReplyProvider {
  name = 'anthropic';
  constructor(private apiKey: string, private model: string) {}

  async reply(messages: ChatMessage[]): Promise<string> {
    // The Messages API requires the conversation to start with a user turn and
    // alternate roles; drop leading assistant turns and merge repeats.
    const turns: { role: Role; content: string }[] = [];
    for (const m of messages) {
      if (turns.length === 0 && m.role !== 'user') continue;
      const last = turns[turns.length - 1];
      if (last && last.role === m.role) last.content += `\n\n${m.text}`;
      else turns.push({ role: m.role, content: m.text });
    }
    if (turns.length === 0 || turns[turns.length - 1].role !== 'user') {
      throw new Error('conversation_must_end_with_user');
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: turns,
      }),
    });

    if (!res.ok) {
      console.error('provider_error', this.name, res.status);
      throw new Error('provider_error');
    }
    const data = await res.json();
    const text = Array.isArray(data?.content)
      ? data.content
          .filter((b: { type?: string }) => b?.type === 'text')
          .map((b: { text?: string }) => b.text ?? '')
          .join('')
          .trim()
      : '';
    if (!text) throw new Error('empty_reply');
    return text;
  }
}

function resolveProvider(): ReplyProvider | null {
  const provider = (Deno.env.get('PERSONA_AI_PROVIDER') ?? '').toLowerCase();
  if (provider === 'anthropic') {
    const key = Deno.env.get('ANTHROPIC_API_KEY');
    if (!key) return null;
    return new AnthropicProvider(key, Deno.env.get('PERSONA_AI_MODEL') ?? 'claude-sonnet-5-5');
  }
  // Add further providers here behind the same ReplyProvider interface.
  return null;
}

// Best-effort, per-instance rate limit. Edge instances are ephemeral and may
// run in parallel, so this is not a hard guarantee; put a gateway limit in
// front for strict enforcement.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { count: number; start: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return null;
  const out: ChatMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') return null;
    const { role, text } = item as Record<string, unknown>;
    if ((role !== 'user' && role !== 'assistant') || typeof text !== 'string') return null;
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > MAX_CHARS) return null;
    out.push({ role, text: trimmed });
  }
  return out;
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return json({ error: 'rate_limited' }, 429);

  let body: Record<string, unknown>;
  try {
    body = (await readJson(req, 64_000)) as Record<string, unknown>;
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  if (body?.consent !== true) return json({ error: 'consent_required' }, 403);

  const messages = parseMessages(body.messages);
  if (!messages) return json({ error: 'invalid_messages' }, 400);

  const provider = resolveProvider();
  if (!provider) return json({ error: 'ai_not_configured' }, 503);

  try {
    const reply = await provider.reply(messages);
    return json({ reply, provider: provider.name });
  } catch (err) {
    // Error class only; never the conversation.
    console.error('persona_reply_failed', provider.name, err instanceof Error ? err.message : 'unknown');
    return json({ error: 'provider_unavailable' }, 502);
  }
});
