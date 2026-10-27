import type { Resource, ResourceCategory } from './types';

/**
 * Resource categories and starter guides.
 *
 * Starter guides are general wellbeing material written as a starting point
 * for Imela's library. They are NOT clinically reviewed: every one has
 * `reviewStatus: 'draft'` and the UI labels it "Draft · awaiting review by an
 * Imela counsellor" until a counsellor reviews it and it is republished
 * through the CMS.
 */
export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { id: 'anxiety', label: 'Anxiety & worry', tone: 'lavender' },
  { id: 'stress', label: 'Stress & burnout', tone: 'coral' },
  { id: 'grief', label: 'Grief & loss', tone: 'sky' },
  { id: 'relationships', label: 'Relationships', tone: 'rose' },
  { id: 'family', label: 'Family wellbeing', tone: 'butter' },
  { id: 'addiction', label: 'Addiction & habits', tone: 'lime' },
  { id: 'identity', label: 'Identity & growth', tone: 'clay' },
  { id: 'workplace', label: 'Workplace wellbeing', tone: 'sage' },
  { id: 'coping', label: 'Coping skills', tone: 'lavender' },
];

export const CATEGORY_BY_ID: Record<string, ResourceCategory> = Object.fromEntries(RESOURCE_CATEGORIES.map((c) => [c.id, c]));

const starter = (r: Omit<Resource, 'author' | 'publishedAt' | 'reviewStatus' | 'source'>): Resource => ({
  ...r,
  author: 'Imela Ventures',
  publishedAt: null,
  reviewStatus: 'draft',
  source: 'starter',
});

export const STARTER_RESOURCES: Resource[] = [
  starter({
    slug: 'grounding-when-worry-spirals',
    title: 'Grounding when worry spirals',
    category: 'anxiety',
    excerpt: 'Small, practical ways to bring your attention back to the present when your thoughts start racing ahead.',
    readMinutes: 3,
    body: `Worry has a way of pulling us into the future. One thought leads to the next, and before long your body is reacting to things that haven't happened. Grounding is a simple idea: gently bringing your attention back to where you are, right now.

## Try the 5-4-3-2-1 pause

Wherever you are, slowly notice:

- five things you can see
- four things you can feel — your feet on the floor, the chair behind you
- three things you can hear
- two things you can smell
- one thing you can taste

There's no right way to do it. The point isn't to make worry disappear, only to give your mind somewhere steadier to rest for a moment.

## Slow the breath, not the thoughts

Trying to stop thoughts usually makes them louder. Instead, try breathing out a little longer than you breathe in — for example, in for a count of four and out for a count of six. Do this for a minute or two and notice what changes, even slightly.

## Name it kindly

Sometimes it helps to say to yourself, "This is worry." Naming what is happening can create a little distance from it. You are the person noticing the worry, not the worry itself.

## When it keeps coming back

Grounding is a tool for difficult moments, not a cure for everything underneath. If worry is affecting your sleep, work or relationships, or you feel on edge most days, talking it through with someone can help you understand what keeps it going.

You can [explore support for anxiety and worry](/support/anxiety-worry), or [start a private conversation with Imela](/persona) if you're not sure where to begin.`,
  }),
  starter({
    slug: 'grief-has-no-timetable',
    title: 'Grief has no timetable',
    category: 'grief',
    excerpt: "There is no correct way or length of time to grieve. A few gentle thoughts for the days that feel heaviest.",
    readMinutes: 3,
    body: `People often expect grief to move in neat stages, or to be "over" after a certain time. In reality, grief tends to come in waves. Some days feel almost ordinary; others arrive heavy without warning — an anniversary, a song, an empty chair at a family gathering.

## Whatever you are feeling is allowed

Sadness, anger, relief, guilt, numbness and even moments of laughter can all sit side by side. None of these mean you loved the person less, or that you are grieving "wrongly".

## Grief is not only about death

We also grieve the end of a relationship, a job, our health, a home, or a future we had imagined. These losses are real and deserve care too.

## Small things that can help

- Keep some routine — regular meals and rest give your body something steady.
- Let people help in practical ways. Saying yes to a meal or a lift is enough.
- Make space to remember, in a way that feels right to you and your family.
- Be gentle with yourself on difficult dates.

## When to reach out

If, after some time, grief is making it very hard to get through the day, or you feel alone with it, speaking to a counsellor can offer a space to carry it differently. You don't need to "be ready" or have the right words.

You can [read more about bereavement support](/support/bereavement), or [talk to Imela privately](/persona).`,
  }),
  starter({
    slug: 'talking-when-things-feel-tense',
    title: 'Talking to your partner when things feel tense',
    category: 'relationships',
    excerpt: 'When the same arguments keep coming back, a few small shifts in how you talk can make it easier to hear each other.',
    readMinutes: 4,
    body: `Most couples argue. What often hurts more than the disagreement itself is the feeling of not being heard. When the same argument keeps returning, it can help to look at how you talk, not only at what you're talking about.

## Choose the moment

Hard conversations rarely go well late at night, when one of you is rushing out, or in the middle of a disagreement. It's okay to say, "This matters to me. Can we talk about it this evening?"

## Start with yourself

Sentences that begin with "You always…" tend to make the other person defend themselves. Try describing your own experience instead: "I feel lonely when we don't talk in the evenings."

## Listen to understand, not to reply

Before responding, try repeating back what you heard: "So you feel I don't notice how much you do at home?" It can feel awkward at first, but it shows you're really listening.

## Take a pause when it gets heated

If voices are rising, agree to stop for twenty minutes and come back to it. A pause is not giving up — it gives both of you time to calm down.

## When you feel stuck

Sometimes patterns are hard to change on your own, and that's normal. Couples counselling offers a space where both of you can be heard with the help of someone outside the relationship.

If you ever feel afraid of your partner or unsafe at home, your safety comes first — please use the urgent help link at the top of this page.

You can [explore support for communication and conflict](/support/communication-conflict) or [couples counselling](/support/couples).`,
  }),
  starter({
    slug: 'noticing-burnout-early',
    title: 'Noticing burnout early',
    category: 'stress',
    excerpt: 'Burnout tends to build quietly. Recognising the early signs gives you more choices about what to do next.',
    readMinutes: 3,
    body: `Burnout rarely arrives all at once. It usually builds slowly, as demands keep outweighing the time and energy you have to recover. Noticing it early gives you more room to make changes.

## Some common early signs

- Feeling tired even after rest or a weekend off
- Dreading tasks you used to manage easily
- Becoming more irritable or withdrawn with people around you
- Finding it hard to concentrate or switch off in the evening
- Feeling that nothing you do makes much difference

Everyone experiences these sometimes. It's when they become the norm that it's worth paying attention.

## Small steps that help

- Notice where your energy goes — and what gives some back.
- Protect one small daily recovery habit: a walk, a meal away from your screen, an earlier night.
- Say what you need. A conversation with a manager about priorities can be more useful than pushing through silently.
- Stay connected. Burnout often makes us pull away from the people who help us feel like ourselves.

## You don't have to wait until it's serious

Talking with a counsellor can help you understand what's driving the exhaustion and what you'd like to change — at work and beyond it.

You can [explore support for burnout](/support/burnout). If you lead a team, you might also look at [workplace wellbeing support for organisations](/organisations).`,
  }),
  starter({
    slug: 'supporting-a-teenager-through-exam-pressure',
    title: 'Supporting a teenager through exam pressure',
    category: 'family',
    excerpt: 'Exams can bring stress to the whole household. Some ideas for parents and carers who want to help without adding pressure.',
    readMinutes: 3,
    body: `Exam seasons can be intense, both for young people and the families around them. As a parent or carer, it's natural to want them to do well. The most helpful thing is often less about results and more about how supported they feel.

## Notice how they're really doing

Changes in sleep, appetite, mood or friendships can be signs that pressure is building. A short, calm check-in — "You seem tired lately. How are you finding it?" — can open a door.

## Keep expectations human

Let them know that your care for them doesn't depend on their grades. Many young people carry worries about disappointing their families that they never say out loud.

## Protect the basics

- Regular sleep matters more than late-night cramming.
- Meals, movement and short breaks help concentration.
- Time with friends is not wasted time.

## Listen more than you advise

When they share something difficult, try to listen first before offering solutions. Sometimes they simply need to feel understood.

## When to look for support

If stress seems to be affecting them most days, or they talk about feeling hopeless, it may help to speak with someone. Support can be for them, for you as a parent, or for the family together.

You can [explore support for academic stress](/support/academic-stress) or [adolescent wellbeing](/support/adolescent-wellbeing).`,
  }),
  starter({
    slug: 'when-a-habit-takes-more-than-it-gives',
    title: 'When a habit starts taking more than it gives',
    category: 'addiction',
    excerpt: "Drinking, betting, scrolling — many habits start as a way to cope. A few honest questions can help you see where you are.",
    readMinutes: 3,
    body: `Many habits begin as ways of coping: a drink to unwind, a bet for excitement, scrolling to switch off. Over time, some of them can start to take more from our lives than they give back.

## A few honest questions

- Do you find it hard to stop once you've started?
- Have you tried to cut down and found it difficult?
- Is it affecting your money, work, sleep or relationships?
- Do you hide how much you do it from people close to you?

Answering "yes" to any of these doesn't put a label on you. It may simply be a sign that this habit deserves some attention.

## Look underneath

Habits often meet a need — rest, relief, connection, escape. Getting curious about what it's doing for you can be more useful than criticising yourself.

## Small steps

- Notice the times and feelings that come before the urge.
- Tell one person you trust what's going on.
- Make it slightly harder: delete the app, keep less at home, plan different evenings.

## You don't have to do it alone

Change is often easier with support. Talking with a counsellor can help you understand the pattern and plan the next step at your own pace.

If you have used substances and feel physically unwell, please seek medical help urgently.

You can [explore support for alcohol and substance use](/support/alcohol-substance), [gambling](/support/gambling), or [digital habits](/support/digital-habits).`,
  }),
  starter({
    slug: 'setting-boundaries-without-guilt',
    title: 'Setting boundaries without guilt',
    category: 'identity',
    excerpt: 'Boundaries are not walls — they are a way of looking after relationships and yourself at the same time.',
    readMinutes: 3,
    body: `If you're used to putting others first, saying no can feel uncomfortable, even selfish. But boundaries aren't about pushing people away. They are about being honest about what you can give, so your relationships can stay healthy.

## Notice where you feel stretched

Resentment, exhaustion or dread before seeing someone can be signs that a boundary is needed. These feelings are information, not failures.

## Start small

You don't have to change everything at once. Practise in lower-stakes situations:

- "I can't this weekend, but I'd love to next week."
- "I need some time to think before I answer."
- "I'm not able to lend money right now."

## Expect some discomfort

When you start setting boundaries, guilt often shows up. That doesn't mean you're doing something wrong — it often means you're doing something new.

## Cultural and family expectations

In many families and communities, there are strong expectations about duty and generosity. Boundaries can respect those values while still protecting your wellbeing. Finding that balance is personal, and it's okay to take time.

## Support can help

Talking things through can help you understand where people-pleasing comes from and how to say what you need with confidence.

You can [explore support for boundaries and people-pleasing](/support/boundaries) or [start a private conversation with Imela](/persona).`,
  }),
  starter({
    slug: 'psychological-safety-at-work',
    title: 'Psychological safety at work',
    category: 'workplace',
    excerpt: 'Teams do their best work when people feel able to speak up. What psychological safety means and how leaders can encourage it.',
    readMinutes: 3,
    body: `Psychological safety describes a shared belief within a team that it's okay to speak up — to ask questions, admit mistakes or raise concerns — without fear of being embarrassed or punished.

## Why it matters

When people don't feel safe, problems stay hidden, ideas go unspoken and stress builds quietly. When they do, teams can learn from mistakes and support one another through change.

## What leaders can do

- Ask for input and mean it: "What am I missing?"
- Respond to mistakes with curiosity rather than blame.
- Acknowledge your own mistakes openly.
- Make sure quieter voices are heard in meetings.
- Follow up on concerns so people see that speaking up leads somewhere.

## What everyone can do

- Listen without interrupting.
- Give credit generously.
- Raise disagreements about ideas, not about people.

## It takes time

Trust is built through repeated small experiences. One workshop alone rarely changes a culture, but consistent behaviour from leaders and teams can.

## Support for organisations

Imela works with organisations on culture, leadership and wellbeing — starting with understanding your current culture.

You can [learn about workplace support](/organisations) or [explore support for psychological safety](/support/psychological-safety).`,
  }),
];
