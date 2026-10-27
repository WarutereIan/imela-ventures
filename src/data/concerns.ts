import type { Concern, ConcernGroup, ConcernGroupId, CharacterTheme } from './types';

/**
 * Discovery categories for the support directory, the speciality pages and the
 * matching engine. These describe experiences people bring — they are not
 * diagnoses, and listing a concern here does not mean every related service is
 * currently offered. Service availability always comes from services.ts.
 */

const t = (
  variant: CharacterTheme['variant'],
  mood: CharacterTheme['mood'],
  pose: CharacterTheme['pose'],
  tone: CharacterTheme['tone'],
  environment: CharacterTheme['environment'],
): CharacterTheme => ({ variant, mood, pose, tone, environment });

export const CONCERN_GROUPS: ConcernGroup[] = [
  {
    id: 'emotional-wellbeing',
    title: 'Emotional wellbeing',
    blurb: 'Worry, low mood, stress and the everyday weight of feeling. Room to slow down and understand what is going on inside.',
    character: t('pebble', 'calm', 'hug', 'lavender', 'scribble'),
    surface: 'bg-lavender-soft',
    crossLinks: ['sleep'],
  },
  {
    id: 'relationships-family',
    title: 'Relationships & family',
    blurb: 'Partners, marriage, family and the people closest to you — when connection feels strained, or you want it to grow.',
    character: t('heart', 'hopeful', 'hold', 'rose', 'sunrise'),
    surface: 'bg-rose-soft',
    crossLinks: ['family-communication'],
  },
  {
    id: 'grief-loss',
    title: 'Grief & loss',
    blurb: 'Losing someone, something or a version of life you expected. There is no right way or timeline to grieve.',
    character: t('cloud', 'grieving', 'hug', 'sky', 'dusk'),
    surface: 'bg-sky-soft',
    crossLinks: ['separation-divorce'],
  },
  {
    id: 'trauma-history',
    title: 'Trauma & personal history',
    blurb: 'Difficult experiences and the patterns they can leave behind — explored gently, at a pace that feels safe.',
    character: t('drift', 'calm', 'hold', 'sage', 'meadow'),
    surface: 'bg-sage',
    crossLinks: ['emotional-dependency'],
  },
  {
    id: 'addiction-patterns',
    title: 'Addiction & behavioural patterns',
    blurb: 'Drinking, substances, betting or habits that have started to take more than they give. Change can begin with one honest conversation.',
    character: t('sprout', 'recovering', 'reach', 'lime', 'meadow'),
    surface: 'bg-butter',
  },
  {
    id: 'identity-growth',
    title: 'Identity & personal development',
    blurb: 'Who you are, what you need and where you are going — boundaries, self-worth, purpose and becoming more yourself.',
    character: t('bloom', 'curious', 'wave', 'butter', 'sunrise'),
    surface: 'bg-ivory-deep',
    crossLinks: ['self-esteem', 'personal-growth'],
  },
  {
    id: 'young-people-families',
    title: 'Students, young people & families',
    blurb: 'Exams, growing up, fitting in and family life. Support for young people and the adults who care about them.',
    character: t('sprout', 'joyful', 'wave', 'sky', 'sky'),
    surface: 'bg-sky-soft',
    crossLinks: ['parenting', 'self-esteem'],
  },
  {
    id: 'workplace',
    title: 'Workplace wellbeing',
    blurb: 'Pressure at work, leadership, team conflict and culture — support for employees, leaders and whole organisations.',
    character: t('cloud', 'tired', 'idle', 'clay', 'room'),
    surface: 'bg-clay',
    crossLinks: ['burnout'],
  },
  {
    id: 'specialist',
    title: 'Additional specialist pathways',
    blurb: 'Sleep, health, neurodiversity and assessment — including honest guidance when the right support is a specialist referral.',
    character: t('drift', 'uncertain', 'idle', 'lavender', 'dusk'),
    surface: 'bg-lavender-soft',
    crossLinks: ['illness-adjustment'],
  },
];

export const CONCERNS: Concern[] = [
  // ---------------------------------------------------------------- Emotional wellbeing
  {
    slug: 'anxiety-worry',
    group: 'emotional-wellbeing',
    title: 'Anxiety & excessive worry',
    tagline: "When your mind won't slow down and the 'what ifs' keep coming.",
    intro: [
      'Worry is a normal part of being human, but sometimes it grows louder than everything else — showing up in your body, your sleep and the way you move through the day.',
      'Talking it through with someone can make the noise easier to understand. You do not need to have the right words; starting with what you notice is enough.',
    ],
    feelsLike: [
      "My thoughts race, especially at night.",
      "I feel tense or on edge even when nothing is wrong.",
      "I keep imagining the worst and can't switch it off.",
      "I avoid things because I'm afraid of how I'll feel.",
    ],
    howSupportHelps: [
      'Noticing what tends to set the worry off and what keeps it going.',
      'Practising grounding and calming approaches that fit your daily life.',
      'Building gradual confidence to face what you have been avoiding.',
    ],
    reflections: [
      'When do you notice the worry most during your day?',
      'Where do you feel it in your body?',
      'What has helped, even a little, in the past?',
    ],
    serviceIds: ['individual-adult', 'individual-teen', 'group-workshop', 'consultation'],
    resourceCategories: ['anxiety', 'coping'],
    keywords: [
      'anxiety', 'anxious', 'worry', 'worried', 'worrying', 'overthinking', 'overthink', 'panic', 'panic attack',
      'racing thoughts', 'mind won\'t slow down', 'on edge', 'nervous', 'fear', 'scared', 'what if', 'heart racing',
    ],
    character: t('pebble', 'anxious', 'idle', 'lavender', 'scribble'),
  },
  {
    slug: 'low-mood',
    group: 'emotional-wellbeing',
    title: 'Depression & low mood',
    tagline: 'When everything feels heavy, grey or far away.',
    intro: [
      'Low mood can creep in slowly or arrive all at once. Things you used to enjoy may feel flat, and even small tasks can take a lot of energy.',
      'You do not have to wait until things are "bad enough" to reach out. A conversation can be a first step toward understanding what you are carrying.',
    ],
    feelsLike: [
      "I don't enjoy things the way I used to.",
      "Getting out of bed feels like a huge effort.",
      "I feel empty, numb or tearful a lot of the time.",
      "I've been pulling away from people.",
    ],
    howSupportHelps: [
      'A steady, non-judgemental space to talk about how things really are.',
      'Gently exploring what might be contributing to how you feel.',
      'Finding small, manageable steps — and knowing when extra medical support may help.',
    ],
    reflections: [
      'How long have things felt this way?',
      'Is there a time of day that feels a little lighter?',
      'Who, if anyone, knows how you have been feeling?',
    ],
    serviceIds: ['individual-adult', 'individual-teen', 'psychiatric-referral', 'consultation'],
    resourceCategories: ['coping', 'anxiety'],
    keywords: [
      'depressed', 'depression', 'low mood', 'sad', 'sadness', 'hopeless', 'empty', 'numb', 'no motivation',
      'can\'t get out of bed', 'crying', 'tearful', 'down', 'nothing matters', 'no energy', 'feel worthless',
    ],
    character: t('cloud', 'lonely', 'hug', 'sky', 'dusk'),
    safetyNote: true,
  },
  {
    slug: 'stress-overwhelm',
    group: 'emotional-wellbeing',
    title: 'Stress & emotional overwhelm',
    tagline: 'When there is too much, all at once, and no room to breathe.',
    intro: [
      'Bills, family, work, expectations — sometimes pressure piles up faster than you can process it. Overwhelm is often a sign you have been carrying a lot for a long time.',
      'Support can help you untangle what is in your control, what is not, and what you need right now.',
    ],
    feelsLike: [
      "I'm stretched in every direction.",
      "Small things make me snap or cry.",
      "I can't think clearly or decide anything.",
      "I never get a moment for myself.",
    ],
    howSupportHelps: [
      'Sorting the pressures into something more manageable.',
      'Learning practical stress-management skills.',
      'Making room for rest without guilt.',
    ],
    reflections: [
      'What are the biggest pressures on you right now?',
      'When did you last have a moment to yourself?',
      'What would "a little less" look like this week?',
    ],
    serviceIds: ['individual-adult', 'group-workshop', 'consultation'],
    resourceCategories: ['stress', 'coping'],
    keywords: [
      'stress', 'stressed', 'overwhelmed', 'overwhelm', 'pressure', 'too much', 'can\'t cope', 'cannot cope',
      'exhausted', 'snapping', 'no time', 'juggling', 'stretched', 'breaking point', 'drowning',
    ],
    character: t('bloom', 'anxious', 'reach', 'coral', 'scribble'),
  },
  {
    slug: 'burnout',
    group: 'emotional-wellbeing',
    title: 'Burnout',
    tagline: 'When rest no longer refills you.',
    intro: [
      'Burnout often comes after a long stretch of giving more than you have — at work, at home or in caring for others. It can show up as exhaustion, cynicism or feeling detached.',
      'Recovering usually means more than a holiday. Talking with someone may help you understand how you got here and what needs to change.',
    ],
    feelsLike: [
      "I'm tired all the time, even after sleeping.",
      "I've stopped caring about things I used to care about.",
      "Monday feels unbearable before it even starts.",
      "I'm going through the motions.",
    ],
    howSupportHelps: [
      'Recognising the patterns and pressures behind the exhaustion.',
      'Rebuilding boundaries around work and responsibility.',
      'Reconnecting with what gives you energy and meaning.',
    ],
    reflections: [
      'When did you last feel properly rested?',
      'What takes the most out of you each week?',
      'What used to give you energy that has gone quiet?',
    ],
    serviceIds: ['individual-adult', 'employee-counselling', 'group-workshop', 'consultation'],
    resourceCategories: ['stress', 'workplace'],
    keywords: [
      'burnout', 'burnt out', 'burned out', 'exhausted', 'drained', 'running on empty', 'tired all the time',
      'no energy', 'overworked', 'going through the motions', 'can\'t switch off', 'fatigue',
    ],
    character: t('cloud', 'tired', 'idle', 'clay', 'room'),
  },
  {
    slug: 'self-esteem',
    group: 'emotional-wellbeing',
    title: 'Self-esteem & confidence',
    tagline: 'When the voice in your head is harder on you than anyone else.',
    intro: [
      'How we see ourselves shapes how we speak up, the relationships we accept and the chances we take. Low self-esteem can be quiet and persistent.',
      'Counselling offers space to notice where those beliefs came from and to practise a kinder, more balanced view of yourself.',
    ],
    feelsLike: [
      "I don't feel good enough.",
      "I compare myself to everyone.",
      "I hold back from speaking up or trying new things.",
      "Compliments feel uncomfortable or untrue.",
    ],
    howSupportHelps: [
      'Exploring where critical beliefs about yourself began.',
      'Practising self-compassion and realistic self-talk.',
      'Taking small, confidence-building steps.',
    ],
    reflections: [
      'What do you most often say to yourself when things go wrong?',
      'Whose voice does that sound like?',
      'What is one thing you quietly appreciate about yourself?',
    ],
    serviceIds: ['individual-adult', 'individual-teen', 'group-workshop', 'consultation'],
    resourceCategories: ['identity', 'coping'],
    keywords: [
      'self esteem', 'self-esteem', 'confidence', 'not good enough', 'insecure', 'insecurity', 'worthless',
      'compare myself', 'comparing', 'shy', 'hate myself', 'self worth', 'self-worth', 'imposter',
    ],
    character: t('sprout', 'uncertain', 'hug', 'butter', 'sunrise'),
  },
  {
    slug: 'anger-regulation',
    group: 'emotional-wellbeing',
    title: 'Anger & emotional regulation',
    tagline: 'When feelings come out bigger than you meant them to.',
    intro: [
      'Anger is a valid emotion — it often signals hurt, unfairness or exhaustion underneath. It becomes painful when it damages relationships or leaves you full of regret.',
      'Support can help you understand your triggers and find ways to respond rather than react.',
    ],
    feelsLike: [
      "I lose my temper and regret it later.",
      "Small things set me off.",
      "People around me seem to walk on eggshells.",
      "I bottle things up until I explode.",
    ],
    howSupportHelps: [
      'Understanding what sits underneath the anger.',
      'Noticing early warning signs in your body.',
      'Practising calmer ways to express needs and frustration.',
    ],
    reflections: [
      'What tends to happen just before you feel angry?',
      'How do you feel afterwards?',
      'What would you like people close to you to understand?',
    ],
    serviceIds: ['individual-adult', 'individual-teen', 'couples-therapy', 'consultation'],
    resourceCategories: ['coping', 'relationships'],
    keywords: [
      'anger', 'angry', 'temper', 'rage', 'lose my temper', 'shouting', 'yelling', 'irritable', 'frustrated',
      'frustration', 'explode', 'short-tempered', 'mood swings', 'snap at',
    ],
    character: t('pebble', 'frustrated', 'idle', 'coral', 'sunrise'),
  },
  {
    slug: 'loneliness',
    group: 'emotional-wellbeing',
    title: 'Loneliness & belonging',
    tagline: 'When you feel alone, even in a full room.',
    intro: [
      'Loneliness is not only about being by yourself. You can feel unseen in a busy household, a new city or a crowded office.',
      'Talking with someone can be a first step toward feeling heard — and toward building connections that feel more genuine.',
    ],
    feelsLike: [
      "Nobody really knows what I'm going through.",
      "I feel like I don't belong anywhere.",
      "I've moved and haven't found my people.",
      "I'm surrounded by people but still feel alone.",
    ],
    howSupportHelps: [
      'Being genuinely listened to without judgement.',
      'Understanding what makes connection feel difficult.',
      'Exploring small, realistic ways to build belonging.',
    ],
    reflections: [
      'When do you feel most alone?',
      'Who, past or present, has made you feel understood?',
      'What kind of connection are you missing most?',
    ],
    serviceIds: ['individual-adult', 'group-workshop', 'individual-teen', 'consultation'],
    resourceCategories: ['coping', 'relationships'],
    keywords: [
      'lonely', 'loneliness', 'alone', 'isolated', 'isolation', 'no friends', 'don\'t belong', 'left out',
      'disconnected', 'nobody understands', 'no one to talk to', 'new city', 'moved',
    ],
    character: t('drift', 'lonely', 'hug', 'sky', 'dusk'),
  },
  {
    slug: 'life-transitions',
    group: 'emotional-wellbeing',
    title: 'Life transitions',
    tagline: 'When one chapter ends and the next is not yet clear.',
    intro: [
      'Marriage, a new baby, relocating, retirement, starting or leaving a job — even welcome changes can shake our sense of who we are and where we stand.',
      'Counselling can offer steadiness while you adjust, grieve what has changed and step into what comes next.',
    ],
    feelsLike: [
      "Everything has changed and I'm still catching up.",
      "I thought I'd be happier about this.",
      "I don't recognise my life right now.",
      "I'm not sure what comes next.",
    ],
    howSupportHelps: [
      'Making sense of mixed feelings about change.',
      'Holding on to what matters while things shift.',
      'Planning your next steps at a pace that feels right.',
    ],
    reflections: [
      'What has changed most recently?',
      'What are you missing from before?',
      'What are you hoping for in this next season?',
    ],
    serviceIds: ['individual-adult', 'consultation'],
    resourceCategories: ['coping', 'identity'],
    keywords: [
      'transition', 'change', 'new job', 'relocating', 'relocation', 'moving', 'retirement', 'retired', 'new baby',
      'empty nest', 'graduated', 'new chapter', 'starting over', 'quarter life', 'midlife',
    ],
    character: t('sprout', 'curious', 'wave', 'sage', 'meadow'),
  },
  {
    slug: 'personal-growth',
    group: 'emotional-wellbeing',
    title: 'Personal growth & self-understanding',
    tagline: 'For when nothing is "wrong" — you simply want to understand yourself better.',
    intro: [
      'You do not need a crisis to benefit from counselling. Many people come simply to reflect, understand their patterns and grow with intention.',
      'This can be a space to explore your values, relationships and goals with someone alongside you.',
    ],
    feelsLike: [
      "I want to understand why I do what I do.",
      "I keep repeating the same patterns.",
      "I'm ready to grow but don't know where to start.",
      "I want to live more in line with my values.",
    ],
    howSupportHelps: [
      'Reflecting on patterns in your thoughts, feelings and relationships.',
      'Clarifying what matters most to you.',
      'Setting and reviewing meaningful personal goals.',
    ],
    reflections: [
      'What would you like to understand better about yourself?',
      'What pattern would you most like to change?',
      'What does growth look like for you this year?',
    ],
    serviceIds: ['individual-adult', 'group-workshop', 'consultation'],
    resourceCategories: ['identity', 'coping'],
    keywords: [
      'personal growth', 'self development', 'self-development', 'self awareness', 'self-awareness',
      'understand myself', 'grow', 'growth', 'patterns', 'values', 'goals', 'better version', 'self discovery',
    ],
    character: t('bloom', 'joyful', 'reach', 'butter', 'sunrise'),
  },

  // ---------------------------------------------------------------- Relationships & family
  {
    slug: 'marriage',
    group: 'relationships-family',
    title: 'Marriage counselling',
    tagline: 'For marriages going through a hard season — or wanting to grow stronger.',
    intro: [
      'Marriage brings together two histories, two families and many expectations. Strain can build quietly through busy years, money pressure, children or unspoken hurt.',
      'Couples counselling offers a neutral space where both of you can be heard and begin to understand each other again.',
    ],
    feelsLike: [
      "We keep having the same argument.",
      "We live together but feel like strangers.",
      "There's tension with in-laws or extended family.",
      "I'm not sure we can fix this.",
    ],
    howSupportHelps: [
      'Creating space where both partners feel heard.',
      'Understanding the patterns behind recurring conflict.',
      'Rebuilding communication, respect and closeness where possible.',
    ],
    reflections: [
      'What first drew you to each other?',
      'What do you wish your partner understood?',
      'What would a better week together look like?',
    ],
    serviceIds: ['couples-therapy', 'individual-adult', 'family-session', 'consultation'],
    resourceCategories: ['relationships', 'family'],
    keywords: [
      'marriage', 'married', 'my wife', 'my husband', 'spouse', 'wife', 'husband', 'in-laws', 'in laws',
      'marital', 'marriage problems', 'save my marriage', 'married life',
    ],
    character: t('heart', 'hopeful', 'hold', 'rose', 'sunrise'),
  },
  {
    slug: 'couples',
    group: 'relationships-family',
    title: 'Couples counselling',
    tagline: 'For partners who want to understand each other better.',
    intro: [
      'Whether you are dating seriously, living together or long-term partners, every relationship meets moments where you feel stuck.',
      'Working through things together, with a neutral person in the room, can help you each feel heard and find a way forward that suits you both.',
    ],
    feelsLike: [
      "We love each other but keep hurting each other.",
      "We don't talk the way we used to.",
      "We want different things and don't know how to meet in the middle.",
      "Small disagreements turn into big fights.",
    ],
    howSupportHelps: [
      'Improving how you listen and speak to each other.',
      'Exploring needs and expectations openly.',
      'Deciding together what you want for your relationship.',
    ],
    reflections: [
      'What is working well between you, even a little?',
      'What does each of you need more of?',
      'What would you like to be different in three months?',
    ],
    serviceIds: ['couples-therapy', 'consultation'],
    resourceCategories: ['relationships'],
    keywords: [
      'couple', 'couples', 'partner', 'my partner', 'boyfriend', 'girlfriend', 'relationship problems',
      'arguing', 'fighting', 'relationship', 'together', 'living together', 'my boyfriend', 'my girlfriend',
    ],
    character: t('heart', 'calm', 'hug', 'coral', 'sunrise'),
  },
  {
    slug: 'communication-conflict',
    group: 'relationships-family',
    title: 'Communication & conflict',
    tagline: "When talking turns into arguing, or doesn't happen at all.",
    intro: [
      'Most conflict is not about the dishes or the money — it is about feeling unheard, misunderstood or unimportant.',
      'Support can help you notice the patterns that keep conversations stuck and practise new ways of speaking and listening.',
    ],
    feelsLike: [
      "Every conversation becomes an argument.",
      "I shut down or go silent when things get tense.",
      "I don't feel heard.",
      "We avoid talking about the important things.",
    ],
    howSupportHelps: [
      'Recognising the cycle that conversations fall into.',
      'Learning to express needs without blame.',
      'Practising listening that helps the other person feel understood.',
    ],
    reflections: [
      'How do your arguments usually start?',
      'What do you do when you feel unheard?',
      'What is one conversation you have been avoiding?',
    ],
    serviceIds: ['couples-therapy', 'family-session', 'group-workshop', 'individual-adult', 'consultation'],
    resourceCategories: ['relationships', 'family'],
    keywords: [
      'communication', 'communicate', 'arguing', 'argument', 'arguments', 'fights', 'fighting', 'conflict',
      'not listening', 'don\'t listen', 'silent treatment', 'misunderstood', 'not heard', 'shouting at each other',
    ],
    character: t('cloud', 'frustrated', 'idle', 'sky', 'sky'),
  },
  {
    slug: 'separation-divorce',
    group: 'relationships-family',
    title: 'Separation & divorce',
    tagline: 'When a relationship is ending, or you are deciding whether it should.',
    intro: [
      'Separation can bring grief, relief, anger and fear all at once — alongside practical decisions about home, money and children.',
      'Counselling can support you through the emotional side of an ending, whether the decision is made, uncertain or not yours.',
    ],
    feelsLike: [
      "I'm not sure whether to stay or leave.",
      "The divorce is final but I'm still not okay.",
      "I'm worried about how this will affect the children.",
      "I don't know who I am outside this marriage.",
    ],
    howSupportHelps: [
      'Thinking through decisions without pressure.',
      'Grieving what has ended and rebuilding your footing.',
      'Supporting children and co-parenting through change.',
    ],
    reflections: [
      'What feels hardest about this right now?',
      'What support do you have around you?',
      'What would help you feel a little more steady?',
    ],
    serviceIds: ['individual-adult', 'couples-therapy', 'family-session', 'consultation'],
    resourceCategories: ['relationships', 'grief', 'family'],
    keywords: [
      'divorce', 'divorced', 'separation', 'separated', 'separating', 'leaving my husband', 'leaving my wife',
      'break up marriage', 'custody', 'stay or leave', 'ex-husband', 'ex-wife', 'ex husband', 'ex wife',
    ],
    character: t('drift', 'grieving', 'idle', 'lavender', 'dusk'),
  },
  {
    slug: 'dating-relationships',
    group: 'relationships-family',
    title: 'Dating & relationship concerns',
    tagline: 'Finding, choosing and keeping healthy relationships.',
    intro: [
      'Dating can be exciting and exhausting. You may notice repeating patterns, worry about commitment, or wonder why relationships keep ending the same way.',
      'Reflecting with someone can help you understand what you want, what you deserve and what you bring.',
    ],
    feelsLike: [
      "I keep choosing the wrong people.",
      "I get anxious when someone gets close.",
      "I'm tired of dating and starting over.",
      "I'm not sure if this relationship is healthy.",
    ],
    howSupportHelps: [
      'Recognising patterns in who you choose and how you attach.',
      'Clarifying your needs, values and boundaries.',
      'Building confidence in healthy connection.',
    ],
    reflections: [
      'What patterns do you notice across your relationships?',
      'What does a healthy relationship look like to you?',
      'What do you need to feel safe with someone?',
    ],
    serviceIds: ['individual-adult', 'couples-therapy', 'consultation'],
    resourceCategories: ['relationships', 'identity'],
    keywords: [
      'dating', 'date', 'single', 'commitment', 'situationship', 'heartbreak', 'breakup', 'break up',
      'toxic relationship', 'red flags', 'wrong people', 'fear of commitment', 'jealous', 'jealousy',
    ],
    character: t('heart', 'curious', 'wave', 'lavender', 'sunrise'),
  },
  {
    slug: 'trust-intimacy',
    group: 'relationships-family',
    title: 'Trust & intimacy',
    tagline: 'When closeness feels hard, or trust has been broken.',
    intro: [
      'Infidelity, secrets, emotional distance or past hurts can leave a relationship feeling unsafe. Intimacy — emotional and physical — often suffers too.',
      'A careful, confidential space can help partners talk about painful things honestly and decide what rebuilding might involve.',
    ],
    feelsLike: [
      "I found out something and can't stop thinking about it.",
      "We're close on the surface but not underneath.",
      "I find it hard to let anyone in.",
      "Physical closeness has become difficult between us.",
    ],
    howSupportHelps: [
      'Talking through betrayal or distance safely.',
      'Understanding what each partner needs to feel secure.',
      'Exploring whether and how trust can be rebuilt.',
    ],
    reflections: [
      'What would help you feel safer in this relationship?',
      'When did you last feel truly close?',
      'What are you afraid might happen if you open up?',
    ],
    serviceIds: ['couples-therapy', 'individual-adult', 'consultation'],
    resourceCategories: ['relationships'],
    keywords: [
      'trust', 'cheating', 'cheated', 'affair', 'unfaithful', 'infidelity', 'betrayal', 'betrayed', 'lied to me',
      'intimacy', 'sex', 'sexual', 'distance between us', 'side chick', 'secrets',
    ],
    character: t('heart', 'lonely', 'hug', 'rose', 'dusk'),
  },
  {
    slug: 'family-conflict',
    group: 'relationships-family',
    title: 'Family conflict',
    tagline: 'When home has become a hard place to be.',
    intro: [
      'Families carry long histories, strong loyalties and different expectations across generations. Conflict with parents, siblings or extended family can be painful and draining.',
      'Support can help you understand the dynamics at play and find ways to protect your wellbeing while staying connected where you choose.',
    ],
    feelsLike: [
      "There's constant tension at home.",
      "I'm caught in the middle of family fights.",
      "My family doesn't accept my choices.",
      "Family gatherings fill me with dread.",
    ],
    howSupportHelps: [
      'Understanding family roles and patterns.',
      'Finding ways to communicate and set boundaries.',
      'Bringing family members together where that feels right.',
    ],
    reflections: [
      'Which relationship in your family feels hardest right now?',
      'What role do you tend to play in family conflict?',
      'What would "better" look like at home?',
    ],
    serviceIds: ['family-session', 'individual-adult', 'individual-teen', 'consultation'],
    resourceCategories: ['family', 'relationships'],
    keywords: [
      'family', 'family conflict', 'parents', 'my mother', 'my father', 'my mum', 'my dad', 'siblings', 'brother',
      'sister', 'relatives', 'family fights', 'home tension', 'inheritance', 'extended family',
    ],
    character: t('pebble', 'frustrated', 'hug', 'clay', 'room'),
  },
  {
    slug: 'parenting',
    group: 'relationships-family',
    title: 'Parenting & co-parenting',
    tagline: 'Supporting the people who are raising the next generation.',
    intro: [
      'Parenting can be joyful and deeply demanding. Behaviour struggles, teenage years, single parenting or co-parenting after separation all bring their own pressures.',
      'Support for parents can help you understand your child, care for yourself and work with a co-parent more calmly.',
    ],
    feelsLike: [
      "I don't know how to reach my child anymore.",
      "I feel like I'm failing as a parent.",
      "Co-parenting with my ex is a constant battle.",
      "I'm parenting alone and running on empty.",
    ],
    howSupportHelps: [
      "Understanding what may be behind a child's behaviour.",
      'Developing consistent, calm approaches together.',
      "Making co-parenting arrangements less stressful for everyone, especially the children.",
    ],
    reflections: [
      'What is the hardest moment in your parenting week?',
      'What do you want your child to feel at home?',
      'Who supports you as a parent?',
    ],
    serviceIds: ['family-session', 'individual-adult', 'individual-teen', 'consultation'],
    resourceCategories: ['family'],
    keywords: [
      'parenting', 'parent', 'co-parenting', 'co parenting', 'my child', 'my son', 'my daughter', 'my kids',
      'children', 'single mother', 'single father', 'single parent', 'baby daddy', 'baby mama', 'tantrums',
    ],
    character: t('bloom', 'hopeful', 'hold', 'butter', 'meadow'),
  },
  {
    slug: 'premarital',
    group: 'relationships-family',
    title: 'Premarital counselling',
    tagline: 'Preparing for marriage, together.',
    intro: [
      'Before a wedding there is a lot to plan — but the conversations about expectations, money, family, faith and children matter most.',
      'Premarital counselling offers couples a structured space to talk these through, so you can build your marriage on shared understanding.',
    ],
    feelsLike: [
      "We're engaged and want to start well.",
      "We haven't talked about the big things yet.",
      "Our families have very different expectations.",
      "I want to avoid the mistakes I've seen around me.",
    ],
    howSupportHelps: [
      'Talking openly about expectations and roles.',
      'Building communication and conflict-resolution habits early.',
      'Discussing family, culture, faith and finances with care.',
    ],
    reflections: [
      'What do you each imagine married life will look like?',
      'Which topic feels hardest to raise?',
      'What did you learn about marriage growing up?',
    ],
    serviceIds: ['premarital', 'couples-therapy', 'consultation'],
    resourceCategories: ['relationships'],
    keywords: [
      'premarital', 'pre-marital', 'engaged', 'engagement', 'getting married', 'wedding', 'before marriage',
      'fiance', 'fiancé', 'fiancee', 'dowry', 'ruracio', 'marriage preparation',
    ],
    character: t('heart', 'joyful', 'wave', 'rose', 'sunrise'),
  },

  // ---------------------------------------------------------------- Grief & loss
  {
    slug: 'bereavement',
    group: 'grief-loss',
    title: 'Bereavement',
    tagline: "When someone you love has died.",
    intro: [
      'Grief after a death can feel overwhelming and unpredictable. It may come in waves, show up as numbness, or surface long after the funeral when others have moved on.',
      'There is no correct way to grieve. A counsellor can walk alongside you as you remember, feel and slowly find a way to carry the loss.',
    ],
    feelsLike: [
      "I can't believe they're gone.",
      "Everyone has moved on and I'm still stuck.",
      "I feel guilty about things I did or didn't say.",
      "Some days I'm fine, then it hits me all over again.",
    ],
    howSupportHelps: [
      'A safe place to talk about the person you lost.',
      'Making space for difficult feelings like guilt or anger.',
      'Finding ways to remember them while continuing to live.',
    ],
    reflections: [
      'Who have you lost, and what were they like?',
      'When does the grief feel strongest?',
      'Who has been able to sit with you in it?',
    ],
    serviceIds: ['individual-adult', 'individual-teen', 'family-session', 'consultation'],
    resourceCategories: ['grief', 'coping'],
    keywords: [
      'grief', 'grieving', 'bereavement', 'bereaved', 'died', 'death', 'passed away', 'passed on', 'funeral',
      'lost my mother', 'lost my father', 'lost my child', 'lost my husband', 'lost my wife', 'mourning', 'rip',
    ],
    character: t('cloud', 'grieving', 'hug', 'sky', 'dusk'),
    safetyNote: true,
  },
  {
    slug: 'relationship-loss',
    group: 'grief-loss',
    title: 'Relationship loss',
    tagline: 'Grieving a person who is still alive.',
    intro: [
      'Breakups, estrangement or a friendship ending can hurt as deeply as other losses — yet are often given less room to be grieved.',
      'Support can help you make sense of what happened, process the loss and rebuild a sense of yourself.',
    ],
    feelsLike: [
      "I keep replaying what went wrong.",
      "I miss them even though it wasn't good for me.",
      "People expect me to be over it by now.",
      "I don't know who I am without them.",
    ],
    howSupportHelps: [
      'Acknowledging this loss as real grief.',
      'Making sense of the ending without blaming yourself.',
      'Rebuilding identity, routine and connection.',
    ],
    reflections: [
      'What do you miss most?',
      'What are you relieved to leave behind, if anything?',
      'What would help you feel more like yourself?',
    ],
    serviceIds: ['individual-adult', 'individual-teen', 'consultation'],
    resourceCategories: ['grief', 'relationships'],
    keywords: [
      'breakup', 'break up', 'broke up', 'dumped', 'heartbroken', 'heartbreak', 'estranged', 'lost a friend',
      'friendship ended', 'they left me', 'ex', 'moving on', 'can\'t get over',
    ],
    character: t('heart', 'grieving', 'idle', 'lavender', 'dusk'),
  },
  {
    slug: 'life-changes',
    group: 'grief-loss',
    title: 'Significant life changes',
    tagline: 'Grieving a job, a home, a dream or a version of life.',
    intro: [
      'Losing a job, a home, a pregnancy, your health or a plan you held for years can bring real grief, even when no one has died.',
      'Talking it through can help you honour what was lost and gradually adjust to a different path.',
    ],
    feelsLike: [
      "This isn't how my life was supposed to go.",
      "I lost my job and part of my identity with it.",
      "I'm mourning something others don't understand.",
      "I feel stuck between the old life and the new one.",
    ],
    howSupportHelps: [
      'Naming and making room for the loss.',
      'Working through anger, disappointment or shame.',
      'Finding meaning and direction again over time.',
    ],
    reflections: [
      'What exactly feels lost?',
      'What has this change taken from you — and anything it has given?',
      'What small part of the old life could you keep?',
    ],
    serviceIds: ['individual-adult', 'consultation'],
    resourceCategories: ['grief', 'coping'],
    keywords: [
      'lost my job', 'retrenched', 'retrenchment', 'fired', 'laid off', 'redundancy', 'miscarriage', 'pregnancy loss',
      'lost my home', 'business failed', 'dream', 'plans fell apart', 'infertility', 'not what i expected',
    ],
    character: t('drift', 'uncertain', 'idle', 'clay', 'room'),
  },
  {
    slug: 'caregiver-stress',
    group: 'grief-loss',
    title: 'Caregiver stress',
    tagline: 'When you are caring for someone and no one is caring for you.',
    intro: [
      'Looking after an ill, elderly or disabled loved one can be an act of deep love — and an exhausting, often invisible load.',
      'Support can offer a place to set that load down for a while, acknowledge mixed feelings, and protect your own wellbeing.',
    ],
    feelsLike: [
      "I'm always on call and never rest.",
      "I feel guilty for wanting a break.",
      "I'm grieving the person they used to be.",
      "My own life has been put on hold.",
    ],
    howSupportHelps: [
      'Acknowledging the emotional and physical weight of caring.',
      'Making space for guilt, resentment or anticipatory grief.',
      'Finding sustainable support and boundaries.',
    ],
    reflections: [
      'Who are you caring for, and for how long?',
      'When did you last do something just for you?',
      'Who could share part of the load?',
    ],
    serviceIds: ['individual-adult', 'family-session', 'consultation'],
    resourceCategories: ['stress', 'family', 'grief'],
    keywords: [
      'caregiver', 'carer', 'caring for', 'looking after my mother', 'looking after my father', 'sick parent',
      'dementia', 'disabled child', 'nursing', 'taking care of', 'elderly parent', 'caregiving',
    ],
    character: t('bloom', 'tired', 'hold', 'butter', 'room'),
  },
  {
    slug: 'illness-adjustment',
    group: 'grief-loss',
    title: 'Emotional adjustment to illness',
    tagline: 'Living with a diagnosis — yours or someone close to you.',
    intro: [
      'A new or long-term diagnosis can change routines, relationships and plans. Fear, frustration and grief are common, alongside the physical side of illness.',
      'Counselling works alongside — never instead of — your medical care, offering space for the emotional side of living with illness.',
    ],
    feelsLike: [
      "My diagnosis changed everything.",
      "I'm scared about what's ahead.",
      "People don't understand how hard this is day to day.",
      "I'm angry at my body.",
    ],
    howSupportHelps: [
      'Processing the emotional impact of a diagnosis.',
      'Coping with uncertainty, pain or fatigue.',
      'Talking about how illness affects relationships and identity.',
    ],
    reflections: [
      'What has changed most since the diagnosis?',
      'What worries you most right now?',
      'What helps you get through difficult days?',
    ],
    serviceIds: ['individual-adult', 'psychiatric-referral', 'consultation'],
    resourceCategories: ['coping', 'grief'],
    keywords: [
      'diagnosis', 'diagnosed', 'illness', 'chronic illness', 'cancer', 'hiv', 'diabetes', 'chronic pain',
      'hospital', 'sick', 'health condition', 'treatment', 'terminal', 'surgery',
    ],
    character: t('pebble', 'recovering', 'hold', 'sage', 'meadow'),
  },

  // ---------------------------------------------------------------- Trauma & personal history
  {
    slug: 'trauma-informed',
    group: 'trauma-history',
    title: 'Trauma-informed support',
    tagline: 'After something happened that still feels too big to hold.',
    intro: [
      'Accidents, violence, abuse or other frightening events can leave lasting effects — on sleep, trust, mood and the sense of being safe in the world.',
      'Trauma-informed counselling moves at your pace. You stay in control of what you share, and safety comes first. Specialist trauma therapy is also available.',
    ],
    feelsLike: [
      "Memories or images come back when I don't want them.",
      "I'm always on guard, waiting for something bad.",
      "I avoid places or people that remind me of it.",
      "I feel disconnected, as if I'm watching my life from outside.",
    ],
    howSupportHelps: [
      'Building a sense of safety and stability first.',
      "Understanding the body's responses to trauma without judgement.",
      'Gently processing experiences when, and only if, you are ready.',
    ],
    reflections: [
      'What helps you feel even slightly safer?',
      'What do you need from someone supporting you?',
      'What would you like to be able to do again?',
    ],
    serviceIds: ['individual-adult', 'trauma-therapy', 'individual-teen', 'consultation'],
    resourceCategories: ['coping', 'anxiety'],
    keywords: [
      'trauma', 'traumatic', 'traumatised', 'abuse', 'abused', 'assault', 'attacked', 'accident', 'violence',
      'flashbacks', 'nightmares', 'ptsd', 'robbed', 'carjacked', 'rape', 'gbv',
    ],
    character: t('drift', 'calm', 'hold', 'sage', 'meadow'),
    safetyNote: true,
  },
  {
    slug: 'early-experiences',
    group: 'trauma-history',
    title: 'Difficult early experiences',
    tagline: 'When the past still reaches into the present.',
    intro: [
      'Experiences in childhood — neglect, harshness, instability, loss or simply not feeling seen — can shape how we feel about ourselves and others long after.',
      'Not every difficulty starts in childhood, and you never have to revisit the past to receive support. If you choose to, counselling offers a safe place to explore it.',
    ],
    feelsLike: [
      "I didn't have the childhood other people had.",
      "Some of my reactions don't make sense to me.",
      "I still feel like a scared child in certain situations.",
      "I want to break cycles from my family.",
    ],
    howSupportHelps: [
      'Understanding links between past experiences and present patterns.',
      'Offering yourself care that may have been missing.',
      'Choosing different patterns going forward.',
    ],
    reflections: [
      'What do you wish you had received growing up?',
      'Which reactions surprise you in yourself today?',
      'What cycle would you like to end with you?',
    ],
    serviceIds: ['individual-adult', 'trauma-therapy', 'consultation'],
    resourceCategories: ['identity', 'family'],
    keywords: [
      'childhood', 'growing up', 'my childhood', 'inner child', 'neglect', 'neglected', 'abandoned',
      'strict parents', 'beaten as a child', 'absent father', 'absent mother', 'generational', 'break the cycle',
    ],
    character: t('sprout', 'lonely', 'hug', 'lavender', 'dusk'),
  },
  {
    slug: 'attachment-patterns',
    group: 'trauma-history',
    title: 'Attachment & relationship patterns',
    tagline: 'Understanding why closeness feels the way it does.',
    intro: [
      'Some of us cling, some of us pull away, many of us do both. The ways we attach to others often formed early and repeat in adult relationships.',
      'Exploring these patterns can bring compassion for yourself and more freedom in how you relate to others.',
    ],
    feelsLike: [
      "I panic when someone doesn't reply quickly.",
      "I push people away when they get close.",
      "I end up in the same kind of relationship every time.",
      "I need constant reassurance.",
    ],
    howSupportHelps: [
      'Noticing your patterns in relationships with curiosity.',
      'Understanding where they may have come from.',
      'Practising more secure ways of connecting.',
    ],
    reflections: [
      'What happens inside you when someone gets close?',
      'What happens when they pull back?',
      'What would feeling secure with someone be like?',
    ],
    serviceIds: ['individual-adult', 'couples-therapy', 'consultation'],
    resourceCategories: ['relationships', 'identity'],
    keywords: [
      'attachment', 'attachment style', 'clingy', 'needy', 'fear of abandonment', 'abandonment',
      'push people away', 'avoidant', 'reassurance', 'same pattern', 'insecure attachment',
    ],
    character: t('heart', 'uncertain', 'hug', 'sky', 'sky'),
  },
  {
    slug: 'family-dynamics',
    group: 'trauma-history',
    title: 'Family dynamics',
    tagline: 'The roles, rules and unspoken stories families pass on.',
    intro: [
      'Every family has its own rules — spoken and unspoken — about feelings, success, money, gender and loyalty. Some help us; others hold us back.',
      'Understanding these dynamics can make it easier to keep what nourishes you and gently change what does not.',
    ],
    feelsLike: [
      "I'm expected to be the strong one for everyone.",
      "In my family we don't talk about feelings.",
      "I'm still trying to make my parents proud.",
      "I carry responsibilities that were never mine.",
    ],
    howSupportHelps: [
      'Mapping family roles and expectations.',
      'Exploring the impact on your adult life.',
      'Deciding which patterns to keep and which to let go.',
    ],
    reflections: [
      'What role were you given in your family?',
      'What was never talked about at home?',
      'What would you like to do differently?',
    ],
    serviceIds: ['individual-adult', 'family-session', 'consultation'],
    resourceCategories: ['family', 'identity'],
    keywords: [
      'family dynamics', 'firstborn', 'first born', 'black tax', 'family expectations', 'eldest child',
      'favourite child', 'family secrets', 'family roles', 'provide for family', 'family pressure',
    ],
    character: t('cloud', 'curious', 'idle', 'clay', 'room'),
  },
  {
    slug: 'emotional-safety',
    group: 'trauma-history',
    title: 'Rebuilding emotional safety',
    tagline: 'Learning to feel safe again — in your body, your relationships and your life.',
    intro: [
      'After harmful relationships or experiences, the world can feel unpredictable. You may find it hard to relax, trust or believe that things can be different.',
      'If you are not safe right now, please reach emergency or crisis support first. When you are ready, counselling can help you rebuild safety step by step.',
    ],
    feelsLike: [
      "I'm always waiting for something to go wrong.",
      "I don't trust my own judgement anymore.",
      "I left a harmful relationship but still feel afraid.",
      "Calm feels unfamiliar.",
    ],
    howSupportHelps: [
      'Creating predictability and safety in sessions.',
      'Learning grounding and self-soothing approaches.',
      'Rebuilding trust in yourself at your own pace.',
    ],
    reflections: [
      'Where or with whom do you feel safest?',
      'What does your body do when you feel unsafe?',
      'What would one calm moment look like today?',
    ],
    serviceIds: ['individual-adult', 'trauma-therapy', 'consultation'],
    resourceCategories: ['coping', 'relationships'],
    keywords: [
      'unsafe', 'not safe', 'feel unsafe', 'abusive relationship', 'domestic violence', 'controlling partner',
      'scared at home', 'afraid of my partner', 'hypervigilant', 'on guard', 'toxic', 'manipulated',
    ],
    character: t('drift', 'hopeful', 'hold', 'sage', 'meadow'),
    safetyNote: true,
  },

  // ---------------------------------------------------------------- Addiction & behavioural patterns
  {
    slug: 'alcohol-substance',
    group: 'addiction-patterns',
    title: 'Alcohol & substance use',
    tagline: 'When drinking or using has started to cost more than it gives.',
    intro: [
      'Many people drink or use substances to cope with stress, pain or social pressure. Over time it can begin to affect health, work, money and relationships.',
      'You do not need to label yourself to talk about it. A non-judgemental conversation can help you understand your relationship with alcohol or substances and what you want to change.',
    ],
    feelsLike: [
      "I drink more than I mean to.",
      "I need something to relax or sleep.",
      "People close to me are worried about my use.",
      "I've tried to cut down and it hasn't lasted.",
    ],
    howSupportHelps: [
      'Exploring what drinking or using does for you, honestly and without shame.',
      'Planning realistic changes and handling cravings.',
      'Knowing when medical support for withdrawal may be needed.',
    ],
    reflections: [
      'When do you most want a drink or to use?',
      'What has it cost you recently?',
      'What would you like to be different?',
    ],
    serviceIds: ['individual-adult', 'addiction-support', 'psychiatric-referral', 'consultation'],
    resourceCategories: ['addiction', 'coping'],
    keywords: [
      'alcohol', 'drinking', 'drink too much', 'drunk', 'beer', 'alcoholic', 'drugs', 'substance', 'weed', 'bhang',
      'khat', 'miraa', 'cocaine', 'pills', 'hangover', 'addicted', 'addiction', 'chang\'aa',
    ],
    character: t('sprout', 'recovering', 'reach', 'lime', 'meadow'),
    safetyNote: true,
  },
  {
    slug: 'gambling',
    group: 'addiction-patterns',
    title: 'Gambling',
    tagline: 'When betting stops being fun and starts being frightening.',
    intro: [
      'Betting apps and online gambling are everywhere. What starts as entertainment can become a cycle of chasing losses, secrecy and debt.',
      'Talking with someone can help you understand the pull of gambling and take practical steps to regain control.',
    ],
    feelsLike: [
      "I keep chasing my losses.",
      "I've borrowed money or used rent money to bet.",
      "I hide how much I gamble.",
      "I can't stop checking the odds.",
    ],
    howSupportHelps: [
      'Understanding the triggers and thinking traps behind gambling.',
      'Putting practical barriers and plans in place.',
      'Addressing the shame, stress and relationship strain that often follow.',
    ],
    reflections: [
      'When do you feel the urge to bet most strongly?',
      'Who knows about the gambling?',
      'What would a first step look like for you?',
    ],
    serviceIds: ['individual-adult', 'addiction-support', 'consultation'],
    resourceCategories: ['addiction'],
    keywords: [
      'gambling', 'gamble', 'betting', 'bet', 'betting app', 'odds', 'jackpot', 'casino', 'aviator',
      'chasing losses', 'lost money betting', 'sports betting', 'multibet', 'debt from betting',
    ],
    character: t('pebble', 'anxious', 'idle', 'butter', 'scribble'),
  },
  {
    slug: 'compulsive-behaviours',
    group: 'addiction-patterns',
    title: 'Compulsive behaviours',
    tagline: 'Patterns that feel hard to stop, even when you want to.',
    intro: [
      'Shopping, eating, pornography, checking or other behaviours can become ways of managing difficult feelings — and then a source of distress in themselves.',
      'Counselling can help you understand what the pattern does for you and find other ways to meet those needs.',
    ],
    feelsLike: [
      "I do it even though I promise myself I won't.",
      "I feel relief, then shame.",
      "It's taking more and more of my time or money.",
      "I hide it from people close to me.",
    ],
    howSupportHelps: [
      'Understanding triggers and the feelings underneath.',
      'Interrupting the cycle with practical strategies.',
      'Reducing shame so change becomes possible.',
    ],
    reflections: [
      'What usually happens just before the urge?',
      'How do you feel afterwards?',
      'What need might the behaviour be meeting?',
    ],
    serviceIds: ['individual-adult', 'addiction-support', 'consultation'],
    resourceCategories: ['addiction', 'coping'],
    keywords: [
      'compulsive', 'compulsion', 'can\'t stop', 'porn', 'pornography', 'shopping addiction', 'binge',
      'binge eating', 'overspending', 'urges', 'habit', 'obsessive', 'checking',
    ],
    character: t('cloud', 'frustrated', 'idle', 'lavender', 'scribble'),
  },
  {
    slug: 'digital-habits',
    group: 'addiction-patterns',
    title: 'Digital habits affecting daily life',
    tagline: 'When the scroll, the game or the screen has taken over.',
    intro: [
      'Phones, social media and gaming are part of everyday life. For some people, use starts crowding out sleep, study, work or relationships.',
      'Support can help you — or your teenager — understand the pull and build a healthier balance without shame.',
    ],
    feelsLike: [
      "I lose hours scrolling without noticing.",
      "I feel anxious when I'm away from my phone.",
      "Social media makes me feel worse about myself.",
      "Gaming is affecting my sleep or studies.",
    ],
    howSupportHelps: [
      'Understanding what screen time is helping you avoid or feel.',
      'Setting realistic limits that stick.',
      'Reconnecting with offline activities and people.',
    ],
    reflections: [
      'When do you reach for your phone most?',
      'How do you feel after a long scroll?',
      'What would you do with an extra hour a day?',
    ],
    serviceIds: ['individual-adult', 'individual-teen', 'addiction-support', 'consultation'],
    resourceCategories: ['addiction', 'coping'],
    keywords: [
      'phone', 'screen time', 'social media', 'scrolling', 'tiktok', 'instagram', 'gaming', 'video games',
      'addicted to my phone', 'online all the time', 'doomscrolling', 'internet addiction',
    ],
    character: t('sprout', 'tired', 'idle', 'sky', 'dusk'),
  },
  {
    slug: 'recovery-relapse',
    group: 'addiction-patterns',
    title: 'Recovery & relapse prevention',
    tagline: 'Staying on the path — and finding your way back after a slip.',
    intro: [
      'Recovery is rarely a straight line. Slips can bring shame, but they are also information about what support you need.',
      'Addiction and recovery counselling at Imela helps you understand your triggers, plan for difficult moments and protect your progress.',
    ],
    feelsLike: [
      "I've been doing well but I'm scared of slipping.",
      "I relapsed and feel like I've failed.",
      "Old friends and places pull me back.",
      "Life feels empty without the thing I gave up.",
    ],
    howSupportHelps: [
      'Identifying high-risk situations and planning for them.',
      'Responding to slips with understanding rather than shame.',
      'Building a fuller life that supports recovery.',
    ],
    reflections: [
      'What has helped you stay on track so far?',
      'What situations feel riskiest right now?',
      'Who is in your corner?',
    ],
    serviceIds: ['individual-adult', 'addiction-support', 'group-workshop', 'consultation'],
    resourceCategories: ['addiction', 'coping'],
    keywords: [
      'recovery', 'relapse', 'relapsed', 'sober', 'sobriety', 'clean', 'rehab', 'cravings', 'stay sober',
      'after rehab', 'slipped', 'aa meetings', 'staying clean',
    ],
    character: t('sprout', 'recovering', 'hold', 'sage', 'sunrise'),
    safetyNote: true,
  },

  // ---------------------------------------------------------------- Identity & personal development
  {
    slug: 'identity-exploration',
    group: 'identity-growth',
    title: 'Identity exploration',
    tagline: 'Making sense of who you are and who you are becoming.',
    intro: [
      'Questions about identity — culture, faith, sexuality, gender, career or belonging — can be exciting, confusing or painful, especially when others have strong expectations.',
      'Counselling offers a confidential, respectful space to explore these questions without pressure toward any particular answer.',
    ],
    feelsLike: [
      "I don't know who I really am.",
      "I feel torn between what I want and what's expected.",
      "Parts of me feel hidden from the people around me.",
      "I've changed and the people around me haven't.",
    ],
    howSupportHelps: [
      'Exploring identity questions with curiosity rather than judgement.',
      'Navigating expectations from family, culture or faith.',
      'Building self-acceptance at your own pace.',
    ],
    reflections: [
      'Which parts of yourself feel most like "you"?',
      'Where do you feel you have to hide?',
      'What would being more yourself look like?',
    ],
    serviceIds: ['individual-adult', 'individual-teen', 'consultation'],
    resourceCategories: ['identity'],
    keywords: [
      'identity', 'who am i', 'who i am', 'sexuality', 'gender', 'faith questions', 'culture', 'belonging',
      'expectations', 'finding myself', 'lost myself', 'true self', 'coming out',
    ],
    character: t('bloom', 'curious', 'wave', 'lavender', 'scribble'),
  },
  {
    slug: 'boundaries',
    group: 'identity-growth',
    title: 'Boundaries & people-pleasing',
    tagline: "When you say yes and mean no.",
    intro: [
      'Being kind and generous is a strength — until it leaves no room for your own needs. People-pleasing often grows from wanting to keep the peace or be accepted.',
      'Support can help you understand where the pattern comes from and practise healthy boundaries without guilt.',
    ],
    feelsLike: [
      "I can't say no.",
      "Everyone comes to me for money, favours or advice.",
      "I feel resentful but stay silent.",
      "I'm exhausted from keeping everyone happy.",
    ],
    howSupportHelps: [
      'Understanding what makes boundaries feel risky.',
      'Practising clear, kind ways to say no.',
      'Coping with others’ reactions when you start to change.',
    ],
    reflections: [
      'Where do you most often say yes when you mean no?',
      'What do you fear might happen if you said no?',
      'What would you do with the time and energy you got back?',
    ],
    serviceIds: ['individual-adult', 'group-workshop', 'consultation'],
    resourceCategories: ['identity', 'relationships'],
    keywords: [
      'boundaries', 'boundary', 'people pleaser', 'people-pleaser', 'people pleasing', 'can\'t say no',
      'saying no', 'taken advantage of', 'doormat', 'guilt', 'everyone asks me for money', 'resentful',
    ],
    character: t('pebble', 'frustrated', 'idle', 'butter', 'sunrise'),
  },
  {
    slug: 'emotional-dependency',
    group: 'identity-growth',
    title: 'Emotional dependency',
    tagline: 'When your sense of okay depends on someone else.',
    intro: [
      'Leaning on people we love is healthy. Sometimes, though, our mood, worth or choices start depending almost entirely on one person or relationship.',
      'Counselling can help you understand this pattern gently and build a steadier sense of yourself.',
    ],
    feelsLike: [
      "I can't make decisions without them.",
      "When they're upset, I fall apart.",
      "I lose myself in relationships.",
      "Being alone feels unbearable.",
    ],
    howSupportHelps: [
      'Exploring what makes independence feel frightening.',
      'Strengthening your own sense of worth and judgement.',
      'Building a wider network of support.',
    ],
    reflections: [
      'Who do you rely on most, and for what?',
      'What happens inside when they are unavailable?',
      'What could you start doing just for yourself?',
    ],
    serviceIds: ['individual-adult', 'consultation'],
    resourceCategories: ['relationships', 'identity'],
    keywords: [
      'dependent', 'dependency', 'codependent', 'co-dependent', 'can\'t live without', 'need them',
      'lose myself', 'obsessed with', 'can\'t be alone', 'emotionally dependent',
    ],
    character: t('heart', 'lonely', 'hug', 'lavender', 'dusk'),
  },
  {
    slug: 'shame-self-criticism',
    group: 'identity-growth',
    title: 'Shame & self-criticism',
    tagline: 'When the harshest voice in your life is your own.',
    intro: [
      'Shame says "I am bad", not just "I did something bad". It can keep us hidden, silent and stuck.',
      'Counselling offers a place where shame can be spoken about safely — often the first step in loosening its hold.',
    ],
    feelsLike: [
      "I'm constantly criticising myself.",
      "If people really knew me, they'd leave.",
      "One mistake ruins my whole day.",
      "I can't forgive myself for something in the past.",
    ],
    howSupportHelps: [
      'Naming shame and understanding where it comes from.',
      'Practising self-compassion in realistic, practical ways.',
      'Separating what you did from who you are.',
    ],
    reflections: [
      'What do you find hardest to forgive in yourself?',
      'How would you speak to a friend in your situation?',
      'What might change if you were a little kinder to yourself?',
    ],
    serviceIds: ['individual-adult', 'consultation'],
    resourceCategories: ['identity', 'coping'],
    keywords: [
      'shame', 'ashamed', 'self-critical', 'self critical', 'self criticism', 'hate myself', 'guilt', 'guilty',
      'perfectionist', 'perfectionism', 'can\'t forgive myself', 'embarrassed', 'failure',
    ],
    character: t('cloud', 'lonely', 'hug', 'clay', 'room'),
  },
  {
    slug: 'purpose-decisions',
    group: 'identity-growth',
    title: 'Purpose & decision-making',
    tagline: 'When you are standing at a crossroads.',
    intro: [
      'Career changes, relationships, moving abroad, studying — big decisions can feel paralysing, especially when many people have opinions.',
      'Talking things through can help you clarify your values and make choices that feel like your own.',
    ],
    feelsLike: [
      "I'm stuck and can't decide.",
      "I've achieved a lot but feel unfulfilled.",
      "Everyone has an opinion about my life.",
      "I'm searching for meaning.",
    ],
    howSupportHelps: [
      'Clarifying values and priorities.',
      'Exploring options without pressure.',
      'Building confidence in your own judgement.',
    ],
    reflections: [
      'What decision is weighing on you?',
      'What matters most to you in the long run?',
      'Whose voice is loudest when you think about it?',
    ],
    serviceIds: ['individual-adult', 'consultation'],
    resourceCategories: ['identity'],
    keywords: [
      'purpose', 'meaning', 'direction', 'decision', 'decide', 'career change', 'crossroads', 'stuck in life',
      'unfulfilled', 'what to do with my life', 'calling', 'next step', 'move abroad',
    ],
    character: t('sprout', 'curious', 'reach', 'butter', 'sunrise'),
  },

  // ---------------------------------------------------------------- Students, young people & families
  {
    slug: 'academic-stress',
    group: 'young-people-families',
    title: 'Academic stress',
    tagline: 'When exams, grades and expectations feel too heavy.',
    intro: [
      'National exams, university pressure and high expectations from family and school can weigh heavily on students of every age.',
      'Support can help with stress, motivation and the feelings behind the grades — not just the study timetable.',
    ],
    feelsLike: [
      "I'm terrified of failing my exams.",
      "No matter how hard I study, it's never enough.",
      "My parents expect so much from me.",
      "I freeze or go blank in tests.",
    ],
    howSupportHelps: [
      'Managing exam stress and worry.',
      'Exploring pressure from expectations — your own and others’.',
      'Building study and rest routines that are sustainable.',
    ],
    reflections: [
      'What is the biggest pressure on you right now?',
      'Who are you studying for?',
      'What helps you feel calmer before exams?',
    ],
    serviceIds: ['individual-teen', 'individual-adult', 'group-workshop', 'consultation'],
    resourceCategories: ['stress', 'anxiety'],
    keywords: [
      'exams', 'exam', 'kcse', 'kcpe', 'kjsea', 'cbc', 'grades', 'school pressure', 'failing', 'revision',
      'studying', 'university', 'campus', 'results', 'test anxiety', 'homework',
    ],
    character: t('pebble', 'anxious', 'idle', 'sky', 'sky'),
  },
  {
    slug: 'student-adjustment',
    group: 'young-people-families',
    title: 'Student adjustment',
    tagline: 'Settling into a new school, campus or country.',
    intro: [
      'Starting boarding school, university or studying abroad can bring freedom alongside homesickness, loneliness and new pressures.',
      'Counselling can help you settle, manage change and find your footing.',
    ],
    feelsLike: [
      "I'm homesick and can't settle.",
      "I haven't made friends yet.",
      "Campus life is more overwhelming than I expected.",
      "I'm struggling to manage on my own.",
    ],
    howSupportHelps: [
      'Talking through the ups and downs of change.',
      'Building routines, confidence and connections.',
      'Managing money, time and independence.',
    ],
    reflections: [
      'What has been hardest about this change?',
      'What do you miss most from home?',
      'What has gone better than expected?',
    ],
    serviceIds: ['individual-adult', 'individual-teen', 'consultation'],
    resourceCategories: ['stress', 'coping'],
    keywords: [
      'boarding school', 'first year', 'fresher', 'campus', 'university', 'college', 'homesick', 'studying abroad',
      'new school', 'hostel', 'roommate', 'transfer', 'international student',
    ],
    character: t('sprout', 'uncertain', 'wave', 'lime', 'meadow'),
  },
  {
    slug: 'adolescent-wellbeing',
    group: 'young-people-families',
    title: 'Adolescent wellbeing',
    tagline: 'Support for teenagers — and the adults who love them.',
    intro: [
      'The teenage years bring big changes in body, friendships, identity and independence. Moods can shift quickly, and it is not always easy to know what is normal.',
      'Teen counselling is arranged with a parent or guardian, while giving young people a respectful space of their own.',
    ],
    feelsLike: [
      "Nobody gets me.",
      "My teen has gone quiet and withdrawn.",
      "Friend drama takes over everything.",
      "I'm worried about what my child is doing online.",
    ],
    howSupportHelps: [
      'A confidential space for young people to talk.',
      'Building emotional skills and confidence.',
      'Helping parents and teens understand each other.',
    ],
    reflections: [
      'What has changed recently for the young person?',
      'Who do they talk to when things are hard?',
      'What would help home feel calmer?',
    ],
    serviceIds: ['individual-teen', 'family-session', 'consultation'],
    resourceCategories: ['family', 'identity'],
    keywords: [
      'teenager', 'teen', 'teens', 'adolescent', 'my teenager', 'high school', 'peer pressure', 'bullying',
      'bullied', 'puberty', 'rebellious', 'withdrawn', 'form three', 'form four',
    ],
    character: t('bloom', 'curious', 'wave', 'coral', 'sky'),
  },
  {
    slug: 'family-communication',
    group: 'young-people-families',
    title: 'Family communication',
    tagline: 'Helping families talk — and listen — to each other.',
    intro: [
      'Generational differences, busy schedules and screens can leave families sharing a home but not really talking.',
      'Family sessions can help everyone feel heard and find better ways to connect and solve problems together.',
    ],
    feelsLike: [
      "We only talk when something's wrong.",
      "My kids won't open up to me.",
      "My parents don't understand my world.",
      "Dinner is silent or ends in an argument.",
    ],
    howSupportHelps: [
      'Creating space where every family member gets heard.',
      'Practising listening and problem-solving together.',
      'Bridging generational and cultural differences.',
    ],
    reflections: [
      'When does your family connect best?',
      'What is hardest to talk about at home?',
      'What would you like each person to understand?',
    ],
    serviceIds: ['family-session', 'individual-teen', 'consultation'],
    resourceCategories: ['family', 'relationships'],
    keywords: [
      'family communication', 'won\'t talk to me', 'don\'t talk at home', 'generation gap', 'my kids won\'t listen',
      'parents don\'t understand', 'family meeting', 'talk to my children', 'talk to my parents',
    ],
    character: t('cloud', 'hopeful', 'hug', 'sky', 'sunrise'),
  },

  // ---------------------------------------------------------------- Workplace wellbeing
  {
    slug: 'employee-counselling',
    group: 'workplace',
    title: 'Employee counselling',
    tagline: 'Confidential support for your people, arranged by your organisation.',
    intro: [
      'Employees bring their whole lives to work — family pressures, grief, money worries and stress. Access to confidential counselling can make a real difference to wellbeing.',
      'Imela provides personalised employee counselling for organisations. Individual conversations remain confidential and are never shared with employers.',
    ],
    feelsLike: [
      "Our staff are struggling and we want to help.",
      "Personal issues are spilling into work.",
      "We need a confidential option for our team.",
      "We've had a difficult event at work.",
    ],
    howSupportHelps: [
      'Confidential sessions for employees on personal and work concerns.',
      'Support after difficult events affecting a team.',
      'Aggregated, anonymous insight for organisations — never individual details.',
    ],
    reflections: [
      'What is your team going through right now?',
      'How do employees currently access support?',
      'What would a healthier workplace look like?',
    ],
    serviceIds: ['employee-counselling', 'corporate-training', 'individual-adult'],
    resourceCategories: ['workplace', 'stress'],
    keywords: [
      'employee counselling', 'staff counselling', 'eap', 'employee assistance', 'our staff', 'our employees',
      'hr', 'human resources', 'staff wellbeing', 'employee wellbeing', 'workforce',
    ],
    character: t('pebble', 'calm', 'hold', 'clay', 'room'),
  },
  {
    slug: 'work-stress',
    group: 'workplace',
    title: 'Work-related stress',
    tagline: 'When deadlines, workload or the workplace itself take a toll.',
    intro: [
      'Heavy workloads, difficult managers, job insecurity and long commutes can all build into stress that follows you home.',
      'Imela supports both individuals dealing with work stress and organisations wanting to reduce it at the source.',
    ],
    feelsLike: [
      "I dread going to work.",
      "My boss makes my life difficult.",
      "I can't keep up with the workload.",
      "I'm worried about losing my job.",
    ],
    howSupportHelps: [
      'Individual counselling to manage pressure and protect wellbeing.',
      'Stress-management training for teams.',
      'Practical changes organisations can make.',
    ],
    reflections: [
      'What part of work drains you most?',
      'How does work stress show up at home?',
      'What one change would make the biggest difference?',
    ],
    serviceIds: ['individual-adult', 'employee-counselling', 'corporate-training', 'consultation'],
    resourceCategories: ['workplace', 'stress'],
    keywords: [
      'work stress', 'job', 'my job', 'boss', 'manager', 'workload', 'deadlines', 'office', 'colleagues',
      'toxic workplace', 'overtime', 'job insecurity', 'promotion', 'performance review', 'work pressure',
    ],
    character: t('cloud', 'tired', 'idle', 'clay', 'room'),
  },
  {
    slug: 'leadership-wellbeing',
    group: 'workplace',
    title: 'Leadership wellbeing',
    tagline: 'Leading others without losing yourself.',
    intro: [
      'Leaders carry responsibility for people, results and decisions — often while feeling they cannot show strain. Isolation at the top is common.',
      'Leadership development and confidential individual support can help leaders lead with clarity, empathy and resilience.',
    ],
    feelsLike: [
      "Everyone depends on me and I can't show weakness.",
      "I'm making hard decisions alone.",
      "I want to lead with more empathy.",
      "I'm newly promoted and out of my depth.",
    ],
    howSupportHelps: [
      'Leadership training and coaching rooted in emotional intelligence.',
      'Confidential space to reflect on pressure and decisions.',
      'Building adaptive, resilient leadership habits.',
    ],
    reflections: [
      'What kind of leader do you want to be?',
      'Where do you get support as a leader?',
      'What pressure are you carrying silently?',
    ],
    serviceIds: ['leadership-development', 'individual-adult', 'employee-counselling'],
    resourceCategories: ['workplace'],
    keywords: [
      'leader', 'leadership', 'manager', 'managing a team', 'ceo', 'executive', 'director', 'promoted',
      'new manager', 'lonely at the top', 'executive coaching', 'leading people', 'supervisor',
    ],
    character: t('bloom', 'hopeful', 'reach', 'butter', 'sunrise'),
  },
  {
    slug: 'team-conflict',
    group: 'workplace',
    title: 'Team conflict',
    tagline: 'When tension in a team is affecting everyone.',
    intro: [
      'Unresolved conflict in teams drains energy, trust and productivity — and affects people well beyond those directly involved.',
      'Imela offers conflict resolution support that is fair, respectful and focused on restoring healthy working relationships.',
    ],
    feelsLike: [
      "Our team has split into camps.",
      "Two colleagues can't work together.",
      "People avoid meetings because of the tension.",
      "We've had a complaint we need to handle carefully.",
    ],
    howSupportHelps: [
      'Neutral guidance through workplace disputes.',
      'Rebuilding communication and trust in teams.',
      'Training that helps prevent future conflict.',
    ],
    reflections: [
      'How long has the tension been building?',
      'Who is most affected?',
      'What would resolution look like for your team?',
    ],
    serviceIds: ['conflict-resolution', 'corporate-training', 'culture-audit'],
    resourceCategories: ['workplace', 'relationships'],
    keywords: [
      'team conflict', 'conflict at work', 'workplace conflict', 'colleagues fighting', 'dispute', 'grievance',
      'complaint', 'mediation', 'toxic team', 'office politics', 'disciplinary',
    ],
    character: t('pebble', 'frustrated', 'idle', 'coral', 'scribble'),
  },
  {
    slug: 'psychological-safety',
    group: 'workplace',
    title: 'Psychological safety',
    tagline: 'Building workplaces where people can speak up.',
    intro: [
      'When people fear blame or ridicule, they stay silent about mistakes, ideas and concerns. Psychological safety is the foundation of learning and trust.',
      'Imela works with organisations to understand their culture and design training that helps people feel safe to contribute.',
    ],
    feelsLike: [
      "Nobody speaks up in meetings.",
      "Mistakes get hidden instead of fixed.",
      "Our culture feels fearful.",
      "We want people to bring their best ideas.",
    ],
    howSupportHelps: [
      'A culture audit to understand current beliefs and behaviours.',
      'Tailor-made training for leaders and staff.',
      'Measuring progress over time.',
    ],
    reflections: [
      'What happens in your organisation when someone makes a mistake?',
      'Who feels free to speak up — and who does not?',
      'What would you like your culture to feel like?',
    ],
    serviceIds: ['culture-audit', 'leadership-development', 'corporate-training'],
    resourceCategories: ['workplace'],
    keywords: [
      'psychological safety', 'speak up', 'workplace culture', 'company culture', 'culture', 'blame culture',
      'fear at work', 'trust in team', 'staff engagement', 'engagement', 'morale',
    ],
    character: t('drift', 'calm', 'hold', 'sage', 'meadow'),
  },
  {
    slug: 'organisational-transitions',
    group: 'workplace',
    title: 'Organisational transitions',
    tagline: 'Supporting people through restructuring, mergers and change.',
    intro: [
      'Restructures, mergers, leadership changes and redundancies unsettle even resilient teams. Uncertainty affects wellbeing and performance.',
      'Imela helps organisations support people through change with counselling, training and attention to culture.',
    ],
    feelsLike: [
      "We're restructuring and morale has dropped.",
      "People are anxious about the future.",
      "We've merged and the cultures are clashing.",
      "We need to support staff through redundancies.",
    ],
    howSupportHelps: [
      'Counselling for employees affected by change.',
      'Leadership support to communicate change well.',
      'Culture work to bring teams together afterwards.',
    ],
    reflections: [
      'What change is your organisation going through?',
      'How are people responding?',
      'What support exists for those most affected?',
    ],
    serviceIds: ['culture-audit', 'employee-counselling', 'leadership-development'],
    resourceCategories: ['workplace', 'stress'],
    keywords: [
      'restructuring', 'restructure', 'merger', 'acquisition', 'redundancies', 'downsizing', 'change management',
      'organisational change', 'organizational change', 'reorganisation', 'new leadership', 'layoffs',
    ],
    character: t('sprout', 'uncertain', 'idle', 'lavender', 'room'),
  },

  // ---------------------------------------------------------------- Specialist pathways
  {
    slug: 'sleep',
    group: 'specialist',
    title: 'Sleep-related concerns',
    tagline: 'When nights are long and mornings come too soon.',
    intro: [
      'Sleep difficulties often travel with stress, worry, low mood or grief. They can also have physical causes worth checking with a doctor.',
      'Counselling can help with the thoughts and habits that keep you awake, alongside medical advice where needed.',
    ],
    feelsLike: [
      "I lie awake with my mind racing.",
      "I wake at 3am and can't get back to sleep.",
      "I'm exhausted but still can't sleep.",
      "Nightmares wake me up.",
    ],
    howSupportHelps: [
      'Exploring the worries and habits affecting sleep.',
      'Practising wind-down and relaxation approaches.',
      'Knowing when to see a doctor about sleep.',
    ],
    reflections: [
      'What goes through your mind at bedtime?',
      'How long has sleep been difficult?',
      'What does your evening routine look like?',
    ],
    serviceIds: ['individual-adult', 'psychiatric-referral', 'consultation'],
    resourceCategories: ['anxiety', 'coping'],
    keywords: [
      'sleep', 'insomnia', 'can\'t sleep', 'cannot sleep', 'awake at night', 'nightmares', 'sleepless',
      'wake up at night', 'tired', 'sleeping pills', 'no sleep', 'restless',
    ],
    character: t('cloud', 'tired', 'hug', 'lavender', 'dusk'),
  },
  {
    slug: 'neurodiversity',
    group: 'specialist',
    title: 'Neurodiversity-informed support',
    tagline: 'Understanding how your mind works — ADHD, autism and neurodiversity.',
    intro: [
      'Many people wonder whether ADHD, autism or a learning difference might explain lifelong struggles with focus, sensory overwhelm or social situations.',
      'Imela offers neurodiversity assessment for ADHD and autism, and space to talk about the emotional side of what you are experiencing — before, during and after an assessment.',
    ],
    feelsLike: [
      "I've always felt my brain works differently.",
      "I struggle to focus no matter how hard I try.",
      "Busy places overwhelm me.",
      "I think my child might be neurodivergent.",
    ],
    howSupportHelps: [
      'An assessment for ADHD or autism, and help making sense of the results.',
      'Space to talk about the feelings that come with these questions.',
      'Support for families navigating a diagnosis.',
    ],
    reflections: [
      'What has led you to wonder about this?',
      'What would an assessment help you understand?',
      'What support would make daily life easier?',
    ],
    serviceIds: ['neurodiversity-assessment', 'individual-adult', 'consultation'],
    resourceCategories: ['identity'],
    keywords: [
      'adhd', 'add', 'autism', 'autistic', 'asd', 'neurodivergent', 'neurodiversity', 'dyslexia',
      'learning difficulty', 'can\'t focus', 'attention', 'sensory', 'spectrum',
    ],
    character: t('bloom', 'curious', 'idle', 'sky', 'sky'),
  },
  {
    slug: 'psychological-assessment',
    group: 'specialist',
    title: 'Psychological assessment',
    tagline: 'Structured assessment, interpreted by a qualified professional.',
    intro: [
      'Psychological assessments use properly licensed instruments to understand patterns in more depth and inform a support plan. They must be selected, administered and interpreted by qualified professionals.',
      'Imela offers psychological assessment. Online checklists and this website are not assessments and cannot give a diagnosis.',
    ],
    feelsLike: [
      "I want to understand myself in more depth.",
      "I've been asked to get an assessment.",
      "I want a clearer picture before deciding on support.",
      "I'm curious about my personality and patterns.",
    ],
    howSupportHelps: [
      'Talking through whether an assessment is right for you.',
      'Clarity about what an assessment can and cannot tell you.',
      'Linking results to a meaningful support plan.',
    ],
    reflections: [
      'What do you hope an assessment would help you understand?',
      'Who suggested an assessment, if anyone?',
      'What would you do with the results?',
    ],
    serviceIds: ['psychological-assessment', 'consultation', 'individual-adult'],
    resourceCategories: ['identity'],
    keywords: [
      'assessment', 'psychological assessment', 'test', 'personality test', 'evaluation', 'psychometric',
      'diagnose me', 'diagnosis', 'what is wrong with me', 'assessed',
    ],
    character: t('drift', 'curious', 'idle', 'lavender', 'scribble'),
  },
  {
    slug: 'specialist-referral',
    group: 'specialist',
    title: 'Specialist referrals',
    tagline: 'When the right next step is someone else — and that is okay.',
    intro: [
      'Some needs are best met by medical doctors, psychiatrists or other specialists — for example medication, diagnosis or intensive treatment.',
      'Imela can talk with you about your situation and offer guidance on where to seek further help. If you are in immediate danger, please contact emergency services.',
    ],
    feelsLike: [
      "I think I might need medication.",
      "I've tried counselling and need something more.",
      "I need a formal diagnosis.",
      "I'm not sure which professional I need.",
    ],
    howSupportHelps: [
      'Talking through what kind of professional fits your needs.',
      'Guidance on referral pathways.',
      'Continued counselling alongside specialist care where appropriate.',
    ],
    reflections: [
      'What kind of help are you looking for?',
      'Have you seen other professionals before?',
      'What would make reaching out easier?',
    ],
    serviceIds: ['psychiatric-referral', 'consultation', 'individual-adult'],
    resourceCategories: ['coping'],
    keywords: [
      'psychiatrist', 'medication', 'meds', 'antidepressants', 'referral', 'refer me', 'specialist',
      'hospital admission', 'doctor', 'prescription', 'mental hospital',
    ],
    character: t('sprout', 'hopeful', 'wave', 'sage', 'meadow'),
  },
];

export const CONCERN_BY_SLUG: Record<string, Concern> = Object.fromEntries(CONCERNS.map((c) => [c.slug, c]));

export function getConcern(slug: string | null | undefined): Concern | undefined {
  return slug ? CONCERN_BY_SLUG[slug] : undefined;
}

export function getGroup(id: string | null | undefined): ConcernGroup | undefined {
  return id ? CONCERN_GROUPS.find((g) => g.id === id) : undefined;
}

/** Concerns belonging to a group, followed by its cross-linked concerns. */
export function concernsInGroup(groupId: ConcernGroupId): Concern[] {
  const own = CONCERNS.filter((c) => c.group === groupId);
  const group = getGroup(groupId);
  const linked = (group?.crossLinks ?? [])
    .map((slug) => CONCERN_BY_SLUG[slug])
    .filter((c): c is Concern => Boolean(c) && c.group !== groupId);
  return [...own, ...linked];
}
