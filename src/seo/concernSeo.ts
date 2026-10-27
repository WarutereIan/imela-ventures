/**
 * Search wording for each concern and support-area page.
 *
 * `kicker` is shown on the page as part of the main heading, so it must stay
 * honest: only say "counselling" where an available Imela service covers it,
 * and say "support", "guidance" or "referrals" where it does not yet.
 * Titles stay under ~60 characters before the brand suffix; descriptions under
 * ~158 characters so search results show them in full.
 */
export interface PageSeo {
  kicker: string;
  title: string;
  description: string;
}

export const CONCERN_SEO: Record<string, PageSeo> = {
  // Emotional wellbeing
  'anxiety-worry': {
    kicker: 'Anxiety counselling · Nairobi & online',
    title: 'Anxiety Counselling in Nairobi & Online',
    description:
      'Counselling for anxiety, panic and constant worry in Nairobi or online across Kenya. Understand what sets it off and learn calming tools with Imela Ventures.',
  },
  'low-mood': {
    kicker: 'Depression counselling · Nairobi & online',
    title: 'Depression & Low Mood Counselling in Kenya',
    description:
      'Feeling low, numb or hopeless? Confidential counselling for depression and low mood in Nairobi or online, with referral to medical care when it is needed.',
  },
  'stress-overwhelm': {
    kicker: 'Stress counselling · Nairobi & online',
    title: 'Stress Management Counselling in Nairobi',
    description:
      'Counselling for stress and emotional overwhelm in Nairobi and online. Make room to breathe, find what is driving the pressure and build ways to cope.',
  },
  burnout: {
    kicker: 'Burnout counselling · for individuals & workplaces',
    title: 'Burnout Counselling & Recovery Support in Kenya',
    description:
      'Exhausted, detached or running on empty? Burnout counselling in Nairobi and online, plus workplace burnout support for employers across Kenya.',
  },
  'self-esteem': {
    kicker: 'Self-esteem counselling · adults & teens',
    title: 'Self-Esteem & Confidence Counselling in Nairobi',
    description:
      'Quiet a harsh inner critic and build self-worth. Self-esteem and confidence counselling for adults and teenagers in Nairobi and online across Kenya.',
  },
  'anger-regulation': {
    kicker: 'Anger management counselling · Nairobi & online',
    title: 'Anger Management & Emotional Regulation Counselling',
    description:
      'When feelings come out bigger than you meant. Anger management and emotional regulation counselling for adults, teens and couples in Nairobi and online.',
  },
  loneliness: {
    kicker: 'Counselling for loneliness · Nairobi & online',
    title: 'Counselling for Loneliness & Isolation in Kenya',
    description:
      'Feeling alone, even around people? Confidential counselling for loneliness, isolation and belonging in Nairobi and online, at a pace that feels right.',
  },
  'life-transitions': {
    kicker: 'Life transitions counselling · Nairobi & online',
    title: 'Counselling for Life Transitions & Change',
    description:
      'A move, a new role, retirement or a relationship change. Counselling for life transitions in Nairobi and online to help you find your footing again.',
  },
  'personal-growth': {
    kicker: 'Personal growth counselling · Nairobi & online',
    title: 'Personal Growth & Self-Discovery Counselling',
    description:
      'Nothing has to be "wrong" to talk to someone. Counselling for personal growth and self-understanding with Imela Ventures, in Nairobi and online.',
  },

  // Relationships & family
  marriage: {
    kicker: 'Support for married couples · Nairobi',
    title: 'Marriage Counselling in Nairobi, Kenya',
    description:
      'Marriage counselling in Nairobi for couples in a hard season or wanting to grow stronger. Rebuild communication and trust with an experienced counsellor.',
  },
  couples: {
    kicker: 'Relationship therapy for partners · Nairobi',
    title: 'Couples Counselling & Relationship Therapy in Nairobi',
    description:
      'Couples counselling in Nairobi for partners who want to understand each other better, argue less and reconnect. Married or not, every couple is welcome.',
  },
  'communication-conflict': {
    kicker: 'Relationship conflict counselling · Nairobi',
    title: 'Counselling for Communication & Conflict',
    description:
      'When talking turns into arguing. Counselling for couples, families and individuals in Nairobi to communicate calmly and resolve conflict with care.',
  },
  'separation-divorce': {
    kicker: 'Divorce & separation counselling · Nairobi & online',
    title: 'Separation & Divorce Counselling in Kenya',
    description:
      'Deciding whether to stay, separating or rebuilding after divorce. Confidential separation and divorce counselling in Nairobi and online.',
  },
  'dating-relationships': {
    kicker: 'Relationship counselling · Nairobi & online',
    title: 'Dating & Relationship Counselling in Nairobi',
    description:
      'Finding, choosing and keeping healthy relationships. Relationship counselling in Nairobi and online for singles, dating partners and couples.',
  },
  'trust-intimacy': {
    kicker: 'Couples counselling for trust & intimacy',
    title: 'Counselling for Trust, Infidelity & Intimacy',
    description:
      'When closeness feels hard or trust has been broken by infidelity. Counselling for couples and individuals in Nairobi to rebuild trust and intimacy.',
  },
  'family-conflict': {
    kicker: 'Family counselling · Nairobi',
    title: 'Family Counselling for Conflict at Home',
    description:
      'When home has become a hard place to be. Family counselling in Nairobi for parents, teenagers and relatives to ease conflict and talk to each other again.',
  },
  parenting: {
    kicker: 'Parenting & co-parenting support · Nairobi',
    title: 'Parenting & Co-Parenting Counselling in Nairobi',
    description:
      'Support for parents and co-parents in Nairobi and online — through teenage years, separation, blended families and the everyday pressure of raising children.',
  },
  premarital: {
    kicker: 'Preparing for marriage · service being confirmed',
    title: 'Premarital Counselling in Nairobi',
    description:
      'Preparing for marriage together. Imela is confirming its premarital counselling programme; couples counselling in Nairobi is available now in the meantime.',
  },

  // Grief & loss
  bereavement: {
    kicker: 'Grief counselling · Nairobi & online',
    title: 'Grief & Bereavement Counselling in Kenya',
    description:
      'When someone you love has died. Gentle grief and bereavement counselling for adults, teens and families in Nairobi and online, at your own pace.',
  },
  'relationship-loss': {
    kicker: 'Counselling after a breakup · Nairobi & online',
    title: 'Counselling After a Breakup or Estrangement',
    description:
      'Grieving a person who is still alive — a breakup, divorce or family estrangement. Counselling for relationship loss in Nairobi and online.',
  },
  'life-changes': {
    kicker: 'Counselling for loss & change · Nairobi & online',
    title: 'Counselling for Job Loss & Major Life Changes',
    description:
      'Grieving a job, a home, a dream or a version of life you expected. Counselling for loss and significant life changes in Nairobi and online.',
  },
  'caregiver-stress': {
    kicker: 'Caregiver support counselling · Nairobi & online',
    title: 'Caregiver Stress & Burnout Counselling',
    description:
      'Caring for someone while no one cares for you? Counselling for caregiver stress and fatigue in Nairobi and online, for carers and their families.',
  },
  'illness-adjustment': {
    kicker: 'Counselling for living with illness · Nairobi & online',
    title: 'Counselling for Coping with Illness & Diagnosis',
    description:
      'Living with a diagnosis, yours or a loved one’s. Counselling to cope with chronic or serious illness in Nairobi and online, alongside medical care.',
  },

  // Trauma & personal history
  'trauma-informed': {
    kicker: 'Trauma-informed counselling · Nairobi & online',
    title: 'Trauma-Informed Counselling in Nairobi',
    description:
      'After something that still feels too big to hold. Trauma-informed counselling in Nairobi and online, at a pace that feels safe for you.',
  },
  'early-experiences': {
    kicker: 'Counselling for childhood experiences · Nairobi & online',
    title: 'Counselling for Difficult Childhood Experiences',
    description:
      'When the past still reaches into the present. Counselling for difficult early and childhood experiences in Nairobi and online, explored gently.',
  },
  'attachment-patterns': {
    kicker: 'Attachment-focused counselling · Nairobi & online',
    title: 'Counselling for Attachment & Relationship Patterns',
    description:
      'Anxious, avoidant or stuck in the same relationship patterns? Counselling in Nairobi and online to understand your attachment style.',
  },
  'family-dynamics': {
    kicker: 'Family dynamics counselling · Nairobi & online',
    title: 'Counselling for Family Dynamics & Roles',
    description:
      'The roles, rules and unspoken stories families pass on. Counselling in Nairobi and online to understand family dynamics and choose what you carry forward.',
  },
  'emotional-safety': {
    kicker: 'Counselling to rebuild emotional safety',
    title: 'Rebuilding Emotional Safety After Trauma',
    description:
      'Learning to feel safe again in your body and your relationships. Gentle, trauma-informed counselling in Nairobi and online, with referral where needed.',
  },

  // Addiction & behavioural patterns
  'alcohol-substance': {
    kicker: 'Alcohol & drug use support · Nairobi',
    title: 'Alcohol & Substance Use Support in Nairobi',
    description:
      'When drinking or drug use costs more than it gives. Confidential counselling conversations in Nairobi and online, with medical referral when it is needed.',
  },
  gambling: {
    kicker: 'Gambling & betting support · Nairobi & online',
    title: 'Help for Gambling & Betting Addiction in Kenya',
    description:
      'When betting stops being fun and starts being frightening. Confidential counselling support for gambling and sports betting problems in Nairobi and online.',
  },
  'compulsive-behaviours': {
    kicker: 'Support for compulsive behaviours · Nairobi & online',
    title: 'Counselling for Compulsive Behaviours',
    description:
      'Patterns that feel hard to stop, even when you want to. Confidential, non-judgemental counselling support for compulsive behaviours in Nairobi and online.',
  },
  'digital-habits': {
    kicker: 'Screen & gaming habits support · adults & teens',
    title: 'Help for Phone, Social Media & Gaming Overuse',
    description:
      'When scrolling, gaming or screens have taken over. Counselling support for adults and teenagers in Nairobi and online to build healthier digital habits.',
  },
  'recovery-relapse': {
    kicker: 'Recovery & relapse prevention support',
    title: 'Addiction Recovery & Relapse Prevention Support',
    description:
      'Staying on the path, and finding your way back after a slip. Counselling and group support for recovery and relapse prevention in Nairobi and online.',
  },

  // Identity & personal development
  'identity-exploration': {
    kicker: 'Identity counselling · adults & teens',
    title: 'Counselling for Identity & Self-Discovery',
    description:
      'Making sense of who you are and who you are becoming. Confidential, judgement-free identity counselling for adults and teenagers in Nairobi and online.',
  },
  boundaries: {
    kicker: 'Counselling for boundaries & people-pleasing',
    title: 'Counselling for Boundaries & People-Pleasing',
    description:
      'When you say yes and mean no. Counselling and workshops in Nairobi and online to set healthy boundaries without guilt and stop people-pleasing.',
  },
  'emotional-dependency': {
    kicker: 'Counselling for emotional dependency · Nairobi & online',
    title: 'Counselling for Emotional Dependency & Codependency',
    description:
      'When your sense of okay depends on someone else. Counselling for emotional dependency and codependent relationships in Nairobi and online.',
  },
  'shame-self-criticism': {
    kicker: 'Counselling for shame & self-criticism',
    title: 'Counselling for Shame, Guilt & Self-Criticism',
    description:
      'When the harshest voice in your life is your own. Compassionate counselling for shame, guilt and self-criticism in Nairobi and online.',
  },
  'purpose-decisions': {
    kicker: 'Counselling for purpose & big decisions',
    title: 'Counselling for Life Purpose & Big Decisions',
    description:
      'Standing at a crossroads in career, relationships or life direction? Counselling in Nairobi and online to clarify what matters and decide with confidence.',
  },

  // Students, young people & families
  'academic-stress': {
    kicker: 'Student counselling · exam stress',
    title: 'Exam Stress & Academic Pressure Counselling',
    description:
      'When exams, grades and expectations feel too heavy. Counselling for students and teenagers in Nairobi and online, plus school wellbeing workshops.',
  },
  'student-adjustment': {
    kicker: 'Student counselling · Nairobi & online',
    title: 'Counselling for University & Student Life',
    description:
      'Settling into a new school, campus or country. Counselling for students adjusting to university, boarding school or life away from home.',
  },
  'adolescent-wellbeing': {
    kicker: 'Teen counselling · Nairobi',
    title: 'Teen Counselling & Adolescent Mental Health in Nairobi',
    description:
      'Counselling for teenagers in Nairobi, and support for the parents who love them. Help with mood, stress, friendships, identity and family life.',
  },
  'family-communication': {
    kicker: 'Family counselling · parents & teens',
    title: 'Family Counselling for Parents & Teenagers',
    description:
      'Helping families talk, and listen, to each other. Family counselling sessions in Nairobi for parents and teenagers to rebuild understanding at home.',
  },

  // Workplace wellbeing
  'employee-counselling': {
    kicker: 'Employee assistance (EAP) · workplaces in Kenya',
    title: 'Employee Counselling & Assistance (EAP) in Kenya',
    description:
      'Confidential employee counselling arranged by your organisation. Employee assistance and wellbeing support for teams in Nairobi and across Kenya.',
  },
  'work-stress': {
    kicker: 'Work stress counselling · Nairobi & online',
    title: 'Work Stress Counselling in Nairobi',
    description:
      'When deadlines, workload or the workplace take a toll. Counselling for work-related stress in Nairobi and online, plus workplace wellness training for teams.',
  },
  'leadership-wellbeing': {
    kicker: 'Leadership wellbeing & development',
    title: 'Leadership Wellbeing & Executive Support in Kenya',
    description:
      'Leading others without losing yourself. Leadership development, executive wellbeing and confidential counselling for managers and leaders in Kenya.',
  },
  'team-conflict': {
    kicker: 'Workplace conflict resolution · Kenya',
    title: 'Workplace Conflict Resolution & Team Mediation',
    description:
      'When tension in a team affects everyone. Workplace conflict resolution support, team training and culture work for organisations in Nairobi and across Kenya.',
  },
  'psychological-safety': {
    kicker: 'Psychological safety at work · Kenya',
    title: 'Psychological Safety Training for Workplaces',
    description:
      'Build a workplace where people can speak up. Psychological safety, culture audits and leadership training for organisations in Nairobi and across Kenya.',
  },
  'organisational-transitions': {
    kicker: 'Change management wellbeing support · Kenya',
    title: 'Supporting Staff Through Restructuring & Change',
    description:
      'Supporting people through restructuring, mergers and redundancy. Employee counselling, leadership support and culture work for organisations in Kenya.',
  },

  // Specialist pathways
  sleep: {
    kicker: 'Support for sleep problems · Nairobi & online',
    title: 'Counselling for Sleep Problems & Insomnia',
    description:
      'When nights are long and mornings come too soon. Counselling for the stress and worry behind poor sleep and insomnia, with medical referral when needed.',
  },
  neurodiversity: {
    kicker: 'ADHD & autism · referrals and support',
    title: 'ADHD & Autism: Neurodiversity Support & Referrals',
    description:
      'Understanding how your mind works. Neurodiversity-informed counselling in Nairobi, with referral to specialists for ADHD and autism assessment.',
  },
  'psychological-assessment': {
    kicker: 'Structured assessment · service being confirmed',
    title: 'Psychological Assessment in Nairobi',
    description:
      'Structured psychological assessment interpreted by a qualified professional. Imela is confirming this service; book a consultation to discuss options.',
  },
  'specialist-referral': {
    kicker: 'Psychiatric & specialist referrals · Kenya',
    title: 'Referrals to Psychiatrists & Mental Health Specialists',
    description:
      'When the right next step is someone else. Imela helps you find psychiatric, medical and specialist mental health care in Kenya, and supports you meanwhile.',
  },
};

export const GROUP_SEO: Record<string, PageSeo> = {
  'emotional-wellbeing': {
    kicker: 'Mental health counselling · Nairobi & online',
    title: 'Counselling for Anxiety, Depression & Stress',
    description:
      'Confidential counselling in Nairobi and online for anxiety, depression, stress, burnout, anger, loneliness and low self-esteem.',
  },
  'relationships-family': {
    kicker: 'Marriage, couples & family counselling · Nairobi',
    title: 'Marriage, Couples & Family Counselling in Nairobi',
    description:
      'Marriage counselling, couples therapy and family counselling in Nairobi. Support for conflict, trust, separation, parenting and communication.',
  },
  'grief-loss': {
    kicker: 'Grief counselling · Nairobi & online',
    title: 'Grief, Loss & Bereavement Counselling in Kenya',
    description:
      'Grief and bereavement counselling in Nairobi and online — after a death, a breakup, job loss or illness. There is no right way or timeline to grieve.',
  },
  'trauma-history': {
    kicker: 'Trauma-informed counselling · Nairobi & online',
    title: 'Trauma Counselling & Support in Nairobi',
    description:
      'Trauma-informed counselling in Nairobi and online for difficult experiences, childhood trauma, attachment and emotional safety, explored at your pace.',
  },
  'addiction-patterns': {
    kicker: 'Addiction & habit support · Nairobi & online',
    title: 'Addiction Support: Alcohol, Gambling & Habits',
    description:
      'Confidential support in Nairobi and online for alcohol and drug use, gambling, compulsive behaviours, screen habits and relapse prevention.',
  },
  'identity-growth': {
    kicker: 'Personal development counselling · Nairobi & online',
    title: 'Counselling for Self-Worth, Boundaries & Growth',
    description:
      'Counselling for identity, boundaries, people-pleasing, shame, self-esteem and life purpose. Personal development support in Nairobi and online.',
  },
  'young-people-families': {
    kicker: 'Teen, student & family counselling · Nairobi',
    title: 'Counselling for Teenagers, Students & Families',
    description:
      'Teen counselling, student support and family sessions in Nairobi and online — exam stress, adolescent wellbeing, parenting and family communication.',
  },
  workplace: {
    kicker: 'Workplace mental health · Kenya',
    title: 'Workplace Mental Health & Employee Wellbeing',
    description:
      'Employee counselling, burnout prevention, leadership wellbeing, conflict resolution and psychological safety for workplaces in Nairobi and across Kenya.',
  },
  specialist: {
    kicker: 'Specialist mental health pathways · Kenya',
    title: 'Sleep, ADHD, Assessment & Specialist Referrals',
    description:
      'Support for sleep problems, neurodiversity (ADHD and autism), psychological assessment and referrals to psychiatrists and specialists in Kenya.',
  },
};
