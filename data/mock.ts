export type Prompt = { q: string; a: string };

export type User = {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  interests: string;
  values: string;
  trust: string;
  prompts: Prompt[];
  photoSeeds: number[];
};

export const ME: User = {
  id: 'amara',
  name: 'Amara Ndlovu',
  avatar: 'https://i.pravatar.cc/300?img=47',
  tagline: 'Looking for friendship & activity partners',
  interests: 'Hiking, pottery, board games, slow mornings, live music',
  values: 'Honesty, follow-through, showing up',
  trust: '6 mutual friends · 3 shared groups · attended 4 events',
  prompts: [
    { q: 'How I recharge', a: 'A long walk with no destination and no phone.' },
    {
      q: 'A belief I hold that not everyone agrees with',
      a: 'Small dinners beat big parties, every time.',
    },
  ],
  photoSeeds: [18, 24, 31, 44, 52, 61],
};

export const USERS: User[] = [
  {
    id: 'maya',
    name: 'Maya',
    avatar: 'https://i.pravatar.cc/150?img=5',
    tagline: 'Looking for a hiking buddy and better coffee spots',
    interests: 'Trail running, ceramics, film photography, cold brew',
    values: 'Curiosity, patience, showing up on time',
    trust: '4 mutual friends · 2 shared groups · attended 3 events',
    prompts: [
      { q: 'How I recharge', a: 'Sitting on my fire escape with a bad reality show.' },
      { q: 'What I’m looking for', a: 'Friends who’ll actually text back and make plans.' },
    ],
    photoSeeds: [11, 22, 33, 44],
  },
  {
    id: 'theo',
    name: 'Theo Marsh',
    avatar: 'https://i.pravatar.cc/150?img=33',
    tagline: 'Trail loops, board games, and slow Sunday breakfasts',
    interests: 'Hiking, chess, home brewing, vinyl records',
    values: 'Directness, reliability, a good sense of humor',
    trust: '5 mutual friends · 2 shared groups · attended 6 events',
    prompts: [
      { q: 'How I recharge', a: 'A long trail run with no music, just thinking.' },
      { q: 'A belief I hold that not everyone agrees with', a: 'Board games are better than most parties.' },
    ],
    photoSeeds: [55, 62, 71, 83],
  },
  {
    id: 'priya',
    name: 'Priya',
    avatar: 'https://i.pravatar.cc/150?img=48',
    tagline: 'New to the city, rebuilding my circle from scratch',
    interests: 'Pottery, cooking for people, long walks, journaling',
    values: 'Warmth, honesty, low-pressure hangs',
    trust: '3 mutual friends · 1 shared group · attended 2 events',
    prompts: [
      { q: 'How I recharge', a: 'Cooking a big meal for people I love, even just a few.' },
      { q: 'What I’m looking for', a: 'Friendship first — no agenda, just consistency.' },
    ],
    photoSeeds: [7, 19, 28, 39],
  },
  {
    id: 'sam',
    name: 'Sam',
    avatar: 'https://i.pravatar.cc/150?img=15',
    tagline: 'Clay-covered and always down for something low-key',
    interests: 'Pottery, gardening, quiet bars, crosswords',
    values: 'Groundedness, follow-through, gentle honesty',
    trust: '2 mutual friends · 1 shared group · attended 1 event',
    prompts: [
      { q: 'How I recharge', a: 'Hands in clay, no talking required.' },
      { q: 'A belief I hold that not everyone agrees with', a: 'Most plans are better with fewer people.' },
    ],
    photoSeeds: [64, 75, 86, 97],
  },
];

export function getUser(id: string): User | undefined {
  if (id === ME.id) return ME;
  return USERS.find((u) => u.id === id);
}

export const MY_FRIEND_IDS = ['maya', 'theo', 'priya', 'sam'];

export type Tone = 'Casual' | 'Structured' | 'Activity-focused';

export type Group = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  tone: Tone;
  unread: number;
  kind: 'circle' | 'discover';
  tag?: string;
  memberIds: string[];
  joined: boolean;
};

export const GROUPS: Group[] = [
  {
    id: 'weekend-hikers',
    name: 'Weekend Hikers',
    description:
      'A small circle for people who’d rather talk on a trail than at a bar. We plan a loop most Saturdays — all paces welcome, no one gets left behind.',
    memberCount: 8,
    tone: 'Casual',
    unread: 3,
    kind: 'circle',
    memberIds: ['theo', 'sam', 'maya'],
    joined: true,
  },
  {
    id: 'book-bourbon',
    name: 'Book & Bourbon',
    description:
      'One book a month, one night to talk about it over a good pour. Structured enough that everyone actually finishes the book.',
    memberCount: 6,
    tone: 'Casual',
    unread: 0,
    kind: 'circle',
    memberIds: ['priya', 'maya'],
    joined: true,
  },
  {
    id: 'pottery-beginners',
    name: 'Pottery Wheel Beginners',
    description:
      'Learning to throw pots together, badly, on purpose. Studio time every other Sunday — activity-focused, low pressure, lots of ruined bowls.',
    memberCount: 11,
    tone: 'Activity-focused',
    unread: 1,
    kind: 'circle',
    memberIds: ['sam', 'theo', 'priya'],
    joined: true,
  },
  {
    id: 'uptown-neighbors',
    name: 'Uptown Neighbors',
    description:
      'The neighborhood-wide group for anything local — events, recommendations, borrowing a ladder. Structured tone, larger group for coordination.',
    memberCount: 142,
    tone: 'Structured',
    unread: 0,
    kind: 'discover',
    tag: 'Neighborhood',
    memberIds: ['theo', 'maya', 'priya', 'sam'],
    joined: false,
  },
  {
    id: 'remote-workers',
    name: 'Remote Workers Collective',
    description:
      'For people whose coworkers are houseplants. Coffee meetups, co-working days, and the occasional Tuesday hike.',
    memberCount: 58,
    tone: 'Casual',
    unread: 0,
    kind: 'discover',
    tag: 'Interest',
    memberIds: ['priya', 'sam'],
    joined: false,
  },
  {
    id: 'sunday-supper',
    name: 'Sunday Supper Club',
    description:
      'A rotating dinner table — someone hosts, everyone brings a dish, no phones at the table. Activity-focused and intentionally small each week.',
    memberCount: 24,
    tone: 'Activity-focused',
    unread: 0,
    kind: 'discover',
    tag: 'Interest',
    memberIds: ['maya', 'theo'],
    joined: false,
  },
];

export type EventItem = {
  id: string;
  title: string;
  day: string;
  month: string;
  time: string;
  date: string;
  location: string;
  hostLabel: string;
  description: string;
  spotsTaken: number;
  spotsTotal: number;
  attendeeIds: string[];
  status: 'upcoming' | 'past';
  metIds?: string[];
};

export const EVENTS: EventItem[] = [
  {
    id: 'porch-potluck',
    title: 'Porch Potluck',
    day: '15',
    month: 'AUG',
    time: 'Sat, 6:00 PM',
    date: 'August 15',
    location: "Amara's place",
    hostLabel: 'Hosted by Amara',
    description:
      'Bring a dish, take a seat on the porch, no agenda. Just good food and slow conversation with a small group.',
    spotsTaken: 6,
    spotsTotal: 8,
    attendeeIds: ['maya', 'theo', 'priya'],
    status: 'upcoming',
  },
  {
    id: 'sunset-ridge-hike',
    title: 'Trail Loop: Sunset Ridge',
    day: '16',
    month: 'AUG',
    time: 'Sun, 9:00 AM',
    date: 'August 16',
    location: 'Sunset Ridge Trailhead',
    hostLabel: 'Weekend Hikers',
    description:
      'An easy 4-mile loop with a view worth the climb. All paces welcome — we regroup at every junction.',
    spotsTaken: 5,
    spotsTotal: 6,
    attendeeIds: ['sam', 'theo'],
    status: 'upcoming',
  },
  {
    id: 'book-club-aug',
    title: 'Kitchen Table Book Club',
    day: '2',
    month: 'AUG',
    time: '7:00 PM',
    date: 'Aug 2',
    location: "Theo's place",
    hostLabel: 'Hosted by Theo',
    description: 'This month’s pick, discussed around a kitchen table with too much wine.',
    spotsTaken: 6,
    spotsTotal: 6,
    attendeeIds: ['maya', 'priya', 'theo'],
    status: 'past',
    metIds: ['maya', 'priya'],
  },
  {
    id: 'pottery-open-studio',
    title: 'Pottery Open Studio',
    day: '28',
    month: 'JUL',
    time: '2:00 PM',
    date: 'Jul 28',
    location: 'Clay & Co Studio',
    hostLabel: 'Pottery Wheel Beginners',
    description: 'Open studio time — bring your own project or start something new.',
    spotsTaken: 9,
    spotsTotal: 10,
    attendeeIds: ['sam'],
    status: 'past',
    metIds: ['sam'],
  },
];

export function getEvent(id: string): EventItem | undefined {
  return EVENTS.find((e) => e.id === id);
}

export function getGroup(id: string): Group | undefined {
  return GROUPS.find((g) => g.id === id);
}

export type Message = { id: string; from: 'me' | 'them'; text: string; time: string };

export type Conversation = {
  id: string;
  userId: string;
  messages: Message[];
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'convo-maya',
    userId: 'maya',
    messages: [
      { id: '1', from: 'them', text: 'Hey! Are we still on for coffee Saturday?', time: '9:02 AM' },
      { id: '2', from: 'me', text: 'Yes! I was just thinking about that porch place.', time: '9:05 AM' },
      { id: '3', from: 'them', text: 'Perfect, I love that spot. 10am work?', time: '9:06 AM' },
      {
        id: '4',
        from: 'me',
        text: "10 is great, see you then — can't wait to catch up properly.",
        time: '9:07 AM',
      },
    ],
  },
  {
    id: 'convo-theo',
    userId: 'theo',
    messages: [
      { id: '1', from: 'them', text: 'That trail loop Sunday — you in?', time: 'Yesterday' },
      { id: '2', from: 'me', text: 'Wouldn’t miss it. 9am at the trailhead?', time: 'Yesterday' },
      { id: '3', from: 'them', text: 'Yep, I’ll bring extra water.', time: 'Yesterday' },
    ],
  },
  {
    id: 'convo-priya',
    userId: 'priya',
    messages: [
      { id: '1', from: 'them', text: 'Thanks again for having me over Saturday!', time: 'Mon' },
      { id: '2', from: 'me', text: 'Of course, come by anytime.', time: 'Mon' },
    ],
  },
];

export function getConversation(id: string): Conversation | undefined {
  return CONVERSATIONS.find((c) => c.id === id);
}

export function getConversationForUser(userId: string): Conversation | undefined {
  return CONVERSATIONS.find((c) => c.userId === userId);
}
