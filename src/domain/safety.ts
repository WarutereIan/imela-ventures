import { normalise } from './text';

/**
 * Risk screening for free text typed into Persona or the service finder.
 *
 * This is a deliberately cautious, high-recall screen — not an assessment. A
 * match never labels the person; it pauses the ordinary flow and offers
 * immediate human support first. False positives are acceptable (the person
 * can say they are safe and continue); false negatives are not, so patterns
 * err on the side of matching.
 */
export type RiskKind = 'self_harm' | 'harm_from_others' | 'harm_to_others' | 'medical';

export interface RiskSignal {
  kind: RiskKind;
}

const PATTERNS: Record<RiskKind, RegExp[]> = {
  self_harm: [
    /\bsuicid/,
    /\bkill(ing)? my ?self\b/,
    /\bend(ing)? (it all|my life|everything|things)\b/,
    /\btake my (own )?life\b/,
    /\b(want|wanna|going|plan(ning)?) to die\b/,
    /\bwish i (was|were) dead\b/,
    /\bbetter off (dead|without me)\b/,
    /\bno (reason|point) (to|in) (live|living|go on|going on)\b/,
    /\bdon'?t want to (live|be alive|exist|be here anymore|wake up)\b/,
    /\b(can'?t|cannot) go on\b/,
    /\bself[ -]?harm/,
    /\b(hurt|hurting|harm|harming|cut|cutting|burn|burning) my ?self\b/,
    /\bnot worth living\b/,
    /\bdisappear forever\b/,
    // Kiswahili / Sheng
    /\bkujiua\b/,
    /\bnataka kufa\b/,
    /\bnitajiua\b/,
  ],
  harm_from_others: [
    /\b(he|she|they|my (husband|wife|partner|boyfriend|girlfriend|bf|gf|father|mother|dad|mum|mom|parent|parents|uncle|aunt|brother|sister|boss|step ?dad|step ?mum|step ?mom|ex)) (hits?|beats?|hurts?|chokes?|kicks?|slaps?|threatens?|threatened|rapes?|raped|abuses?|abused|attacks?|attacked) me\b/,
    /\b(i am|i'm|im|i've been|i have been|being) (abused|beaten|raped|assaulted|threatened|hit)\b/,
    /\bnot safe (at home|where i live|with (him|her|them|my))/,
    /\b(afraid|scared) for my (life|safety)\b/,
    /\b(going|wants?|threaten(ed|s)?) to (kill|hurt) me\b/,
    /\bdomestic (violence|abuse)\b/,
    /\bgbv\b/,
    /\b(sexual(ly)?) (abuse|abused|assault|assaulted)\b/,
    /\banani(piga|tishia)\b/,
  ],
  harm_to_others: [
    /\b(want|going|plan(ning)?) to (kill|hurt|harm|stab|shoot) (him|her|them|someone|somebody|people|my)\b/,
    /\bi might (kill|hurt) (him|her|them|someone|somebody)\b/,
  ],
  medical: [/\boverdos(e|ed|ing)\b/, /\btook (too many|a lot of) (pills|tablets)\b/, /\bswallowed (pills|tablets|poison)\b/],
};

export function screenForRisk(text: string): RiskSignal | null {
  const t = normalise(text);
  if (!t) return null;
  for (const kind of Object.keys(PATTERNS) as RiskKind[]) {
    if (PATTERNS[kind].some((re) => re.test(t))) return { kind };
  }
  return null;
}

export const RISK_MESSAGE: Record<RiskKind, string> = {
  self_harm:
    "Thank you for telling me. What you're carrying sounds really heavy, and you deserve support from a person right now — not a website.",
  harm_from_others:
    'Thank you for telling me. Your safety matters most. If you are in danger, please reach out to people who can help you right now.',
  harm_to_others:
    "Thank you for being honest about how intense this feels. Before anything else, it's important to talk to someone who can help keep everyone safe right now.",
  medical: 'This sounds like it could be a medical emergency. Please contact emergency services or get to a hospital now.',
};
