import type { ConcernGroupId } from '../../data/types';

/** Persona's words. Kept apart from the state machine so tone can be reviewed by Imela's team in one place. */

export const OPENING = "Hi. I'm glad you made it here. What's been weighing on you lately?";
export const OPENING_HINT = "Type in your own words — there's no right way to say it. You can skip anything.";

export const OPENING_FEELINGS =
  "Hi. I'm glad you made it here. Feelings can be hard to name. Which of these feel close right now? Choose as many as you like — or describe it in your own words.";

export const OPENING_FIND =
  "Hi. I'm glad you made it here. Tell me a little about what you'd like support with, and I'll show you options that might fit. You can also choose an area below.";

export const ASK_MORE = 'Of course. Take your time — what else would you like me to know?';

export const ASK_CORRECTION =
  'Thank you for telling me — you know your situation best. Which of these feels closer? Or tell me in your own words.';

export const NO_MATCH_FIRST =
  "Thank you for sharing that. I'd rather understand than guess. Could you tell me a little more about what's been hardest — or choose an area below that feels close?";

export const NO_MATCH_FINAL =
  "Thank you. Some things don't fit neatly into a category — and that's completely okay. Talking it through with a counsellor is a good place to start. Here's what that could look like.";

export const RECOMMENDATIONS_INTRO =
  "Thank you for trusting me with this. Based on what you've shared, here are some options that might help. You can explore them, book, or keep talking — there's no pressure.";

export const AFTER_RECOMMENDATIONS = "Is there anything else on your mind, or would you like to pause here?";

export const CLOSING =
  "Thank you for taking this step. Whatever you decide, you're welcome back any time. If things get harder, urgent help is always at the top of the page.";

export const SAFE_CONTINUE =
  "Thank you for letting me know. I'm glad you're safe right now. We can keep going gently — and urgent contacts stay at the top of the page. Would you like to tell me a little more about what's been happening?";

export const NOT_SAFE =
  'Please contact emergency services now, or ask someone near you to help you call. You do not have to go through this moment alone.';

export const HOPELESS_NOTE =
  'If you ever feel you might not be able to keep yourself safe, urgent help is always one tap away at the top of the screen.';

export const GROUP_REFLECTION: Record<ConcernGroupId, string> = {
  'emotional-wellbeing': 'your mind and emotions have been carrying a lot lately',
  'relationships-family': 'things have been hard in a relationship that matters to you',
  'grief-loss': "you're living with a loss, and that can touch everything",
  'trauma-history': 'some past experiences are still affecting you now',
  'addiction-patterns': "a habit or pattern has started to feel hard to control",
  'identity-growth': "you're working through questions about who you are and what you need",
  'young-people-families': "there's real pressure on a young person or on your family",
  workplace: 'work has been taking a real toll',
  specialist: "you're looking for something quite specific",
};

export const GROUP_VALIDATION: Record<ConcernGroupId, string> = {
  'emotional-wellbeing': "That's tiring to live with, and it makes sense to want some support.",
  'relationships-family': 'When someone close is involved, it can affect everything else too.',
  'grief-loss': "There's no right way or right timeline to grieve.",
  'trauma-history': "You don't have to share more than you want to, here or anywhere.",
  'addiction-patterns': 'Noticing it and looking for support takes honesty and courage.',
  'identity-growth': "These are important questions, and it's okay not to have the answers yet.",
  'young-people-families': "Caring about how they're doing already says a lot.",
  workplace: "You're not the only one — and it's reasonable to want things to feel different.",
  specialist: "I'll show you what Imela offers and where we can point you elsewhere.",
};

export interface ClarifyOption {
  id: string;
  label: string;
}

export interface Clarification {
  question: string;
  options: ClarifyOption[];
}

/** At most one gentle follow-up question, chosen by the main concern area. Each answer changes what we recommend. */
export const CLARIFICATIONS: Partial<Record<ConcernGroupId, Clarification>> = {
  'relationships-family': {
    question: 'Are you looking for support for yourself, or together with someone else?',
    options: [
      { id: 'just-me', label: 'Just for me' },
      { id: 'together', label: 'Together with my partner' },
      { id: 'family', label: 'For our family' },
      { id: 'unsure', label: "I'm not sure yet" },
    ],
  },
  'young-people-families': {
    question: 'Is the support for you, or for a young person in your care?',
    options: [
      { id: 'just-me', label: 'For me' },
      { id: 'teen', label: 'For a young person (13–17)' },
      { id: 'family', label: 'For our family' },
    ],
  },
  'emotional-wellbeing': {
    question: 'Would you prefer to talk one-to-one, or might a small group appeal to you too?',
    options: [
      { id: 'one-to-one', label: 'One-to-one' },
      { id: 'group', label: 'A small group could help' },
      { id: 'unsure', label: "I'm not sure" },
    ],
  },
  'grief-loss': {
    question: 'Would you like support just for yourself, or is your family grieving together?',
    options: [
      { id: 'just-me', label: 'Just for me' },
      { id: 'family', label: 'For our family' },
    ],
  },
  workplace: {
    question: 'Is this about you personally, or are you exploring support for your organisation?',
    options: [
      { id: 'me', label: 'For me personally' },
      { id: 'organisation', label: 'For my organisation' },
    ],
  },
};

export interface Feeling {
  id: string;
  label: string;
  concerns: string[];
}

/** Everyday feeling words for the "help me understand what I'm feeling" path. */
export const FEELINGS: Feeling[] = [
  { id: 'overwhelmed', label: 'Overwhelmed', concerns: ['stress-overwhelm', 'burnout'] },
  { id: 'anxious', label: 'Anxious or on edge', concerns: ['anxiety-worry'] },
  { id: 'sad', label: 'Sad or low', concerns: ['low-mood'] },
  { id: 'numb', label: 'Numb or empty', concerns: ['low-mood', 'emotional-safety'] },
  { id: 'angry', label: 'Angry or irritable', concerns: ['anger-regulation'] },
  { id: 'lonely', label: 'Lonely', concerns: ['loneliness'] },
  { id: 'exhausted', label: 'Exhausted', concerns: ['burnout', 'sleep'] },
  { id: 'ashamed', label: 'Ashamed', concerns: ['shame-self-criticism'] },
  { id: 'grieving', label: 'Grieving', concerns: ['bereavement', 'relationship-loss'] },
  { id: 'stuck', label: 'Stuck', concerns: ['purpose-decisions', 'compulsive-behaviours'] },
  { id: 'confused', label: 'Confused about who I am', concerns: ['identity-exploration'] },
  { id: 'unworthy', label: 'Not good enough', concerns: ['self-esteem'] },
  { id: 'hopeless', label: 'Hopeless', concerns: ['low-mood'] },
  { id: 'unsafe', label: 'Unsafe', concerns: ['emotional-safety', 'trauma-informed'] },
];

export const SUGGESTED_PROMPTS = [
  "I can't switch my mind off",
  "Things are hard with my partner",
  'I lost someone close to me',
  "I'm exhausted by work",
  "I don't know where to start",
];
