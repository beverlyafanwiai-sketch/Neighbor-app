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
  tags: string[];
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
  tags: ['hiking', 'pottery', 'board games', 'live music'],
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
    tags: ['trail running', 'pottery', 'photography', 'coffee'],
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
    tags: ['hiking', 'chess', 'vinyl records'],
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
    tags: ['pottery', 'cooking', 'journaling'],
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
    tags: ['pottery', 'gardening', 'crosswords'],
  },
];

export const DISCOVER_USERS: User[] = [
  {
    id: 'jordan',
    name: 'Jordan',
    avatar: 'https://i.pravatar.cc/150?img=25',
    tagline: 'New to the neighborhood, looking for a regular board game night',
    interests: 'Board games, home brewing, quiet bars',
    values: 'Consistency, good humor, low drama',
    trust: 'No mutual friends yet · nearby',
    prompts: [
      { q: 'What I’m looking for', a: 'A standing weekly game night, honestly.' },
      { q: 'How I recharge', a: 'Losing badly at Catan with people I like.' },
    ],
    photoSeeds: [14, 26, 37, 48],
    tags: ['board games', 'coffee', 'chess'],
  },
  {
    id: 'nia',
    name: 'Nia',
    avatar: 'https://i.pravatar.cc/150?img=9',
    tagline: 'Always down for a concert or a long run',
    interests: 'Live music, trail running, journaling',
    values: 'Spontaneity, honesty, showing up energized',
    trust: 'No mutual friends yet · nearby',
    prompts: [
      { q: 'How I recharge', a: 'A sweaty run followed by a very loud show.' },
      { q: 'What I’m looking for', a: 'People who’ll say yes to a last-minute show.' },
    ],
    photoSeeds: [21, 32, 43, 54],
    tags: ['live music', 'trail running', 'journaling'],
  },
  {
    id: 'kai',
    name: 'Kai',
    avatar: 'https://i.pravatar.cc/150?img=68',
    tagline: 'Chasing golden hour and quiet trails',
    interests: 'Photography, hiking, gardening',
    values: 'Patience, presence, low-key company',
    trust: 'No mutual friends yet · nearby',
    prompts: [
      { q: 'How I recharge', a: 'Golden hour, a trail, and no one talking.' },
      { q: 'A belief I hold that not everyone agrees with', a: 'The best conversations happen mid-hike.' },
    ],
    photoSeeds: [59, 63, 77, 88],
    tags: ['photography', 'hiking', 'gardening'],
  },
];

export function getUser(id: string): User | undefined {
  if (id === ME.id) return ME;
  return USERS.find((u) => u.id === id) ?? DISCOVER_USERS.find((u) => u.id === id);
}

export const MY_FRIEND_IDS = ['maya', 'theo', 'priya', 'sam'];

export type Post = {
  id: string;
  authorId: string;
  time: string;
  body: string;
  loves: number;
  replies: number;
};

export const POSTS: Post[] = [
  {
    id: '1',
    authorId: 'amara',
    time: '2h ago',
    body: 'Porch hangout this Saturday if anyone wants to come sit, talk, and eat too much cornbread. No agenda, just company.',
    loves: 12,
    replies: 4,
  },
  {
    id: '2',
    authorId: 'theo',
    time: '5h ago',
    body: "Finally finished the trail loop with the hiking circle. Nothing beats quiet company and switchbacks. Same time next week?",
    loves: 8,
    replies: 2,
  },
  {
    id: '3',
    authorId: 'maya',
    time: '1d ago',
    body: 'Found a new trail with the best morning light for photos. Taking anyone who wants to come next weekend.',
    loves: 6,
    replies: 3,
  },
  {
    id: '4',
    authorId: 'priya',
    time: '2d ago',
    body: "Made way too much soup again. If you're near Elm St today, come take a jar off my hands.",
    loves: 15,
    replies: 6,
  },
  {
    id: '5',
    authorId: 'sam',
    time: '3d ago',
    body: 'Finally got the garden beds weeded. Trading tomato starts for good company this weekend.',
    loves: 9,
    replies: 2,
  },
];

export type CommentItem = { id: string; authorId: string; text: string; time: string };

export const COMMENTS: Record<string, CommentItem[]> = {
  '1': [
    { id: 'c1', authorId: 'theo', text: "Count me in, I'll bring a salad to balance out the cornbread.", time: '1h ago' },
    { id: 'c2', authorId: 'priya', text: 'This is exactly the kind of no-agenda thing I need this week.', time: '45m ago' },
  ],
  '4': [
    { id: 'c1', authorId: 'sam', text: "I'll swing by after work, save me a jar!", time: '2d ago' },
  ],
};

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
  createdBy?: string;
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
  hostId?: string;
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
    hostId: 'amara',
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

export type NotificationTarget =
  | { kind: 'profile'; id: string }
  | { kind: 'event'; id: string }
  | { kind: 'group'; id: string }
  | { kind: 'chat'; id: string }
  | { kind: 'group-chat'; id: string };

export type NotificationItem = {
  id: string;
  type: 'friend' | 'event' | 'group' | 'message';
  actorId?: string;
  text: string;
  time: string;
  read: boolean;
  target?: NotificationTarget;
};

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'message',
    actorId: 'priya',
    text: 'Priya sent you a new message',
    time: '10m ago',
    read: false,
    target: { kind: 'chat', id: 'convo-priya' },
  },
  {
    id: '2',
    type: 'event',
    actorId: 'maya',
    text: 'Maya RSVP’d to Porch Potluck',
    time: '1h ago',
    read: false,
    target: { kind: 'event', id: 'porch-potluck' },
  },
  {
    id: '3',
    type: 'group',
    text: 'Weekend Hikers has new messages',
    time: '3h ago',
    read: false,
    target: { kind: 'group-chat', id: 'weekend-hikers' },
  },
  {
    id: '4',
    type: 'event',
    text: 'Trail Loop: Sunset Ridge is tomorrow',
    time: '5h ago',
    read: true,
    target: { kind: 'event', id: 'sunset-ridge-hike' },
  },
  {
    id: '5',
    type: 'group',
    actorId: 'sam',
    text: 'Sam joined Pottery Wheel Beginners',
    time: 'Yesterday',
    read: true,
    target: { kind: 'group', id: 'pottery-beginners' },
  },
  {
    id: '6',
    type: 'friend',
    actorId: 'theo',
    text: 'Theo Marsh loved your post',
    time: '2d ago',
    read: true,
    target: { kind: 'profile', id: 'theo' },
  },
];
