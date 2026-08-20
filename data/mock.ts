export type Prompt = { q: string; a: string };

export type VerificationBadge = 'id' | 'phone' | 'social';

export type ConversationStarters = {
  askMeAbout: string;
  skillsToShare: string;
  neighborhoodLove: string;
};

export type User = {
  id: string;
  name: string;
  pronouns?: string;
  link?: string;
  avatar: string;
  coverImageUri?: string;
  tagline: string;
  bio: string;
  interests: string;
  values: string;
  prompts: Prompt[];
  tags: string[];
  neighborhood: string;
  crossStreets: string;
  yearsInArea: string;
  verifications: VerificationBadge[];
  conversationStarters: ConversationStarters;
  friendIds?: string[];
  // Baseline "free for a coffee or walk today" signal for other neighbors —
  // ME's own status lives in useAvailabilityStore instead, since it's
  // something ME actually toggles.
  available?: boolean;
  // Optional note attached to that availability signal (e.g. "free after
  // 3pm") — ME's own note lives in useAvailabilityStore.
  availableNote?: string;
  isNew?: boolean;
};

export const ME: User = {
  id: 'amara',
  name: 'Amara Ndlovu',
  avatar: 'https://i.pravatar.cc/300?img=47',
  tagline: 'Looking for friendship & activity partners',
  bio: "Grew up a couple blocks from here and never really left — now I'm usually the one organizing the porch hangouts. Always looking for people who show up.",
  interests: 'Hiking, pottery, board games, slow mornings, live music',
  values: 'Honesty, follow-through, showing up',
  prompts: [
    { q: 'How I recharge', a: 'A long walk with no destination and no phone.' },
    {
      q: 'A belief I hold that not everyone agrees with',
      a: 'Small dinners beat big parties, every time.',
    },
  ],
  tags: ['hiking', 'pottery', 'board games', 'live music'],
  neighborhood: 'Maple Hill',
  crossStreets: '5th & Sycamore',
  yearsInArea: '8 years',
  verifications: ['id', 'phone'],
  conversationStarters: {
    askMeAbout: 'Good porch snacks or where to find the best cornbread in town',
    skillsToShare: 'Basic pottery wheel throwing',
    neighborhoodLove: 'Everyone still waves from their porches here.',
  },
};

export const USERS: User[] = [
  {
    id: 'maya',
    name: 'Maya',
    pronouns: 'she/her',
    avatar: 'https://i.pravatar.cc/150?img=5',
    tagline: 'Looking for a hiking buddy and better coffee spots',
    bio: 'Moved here for grad school and stayed for the trails. Still figuring out the best coffee shop in walking distance — send recommendations.',
    interests: 'Trail running, ceramics, film photography, cold brew',
    values: 'Curiosity, patience, showing up on time',
    friendIds: ['amara', 'theo', 'sam'],
    prompts: [
      { q: 'How I recharge', a: 'Sitting on my fire escape with a bad reality show.' },
      { q: 'What I’m looking for', a: 'Friends who’ll actually text back and make plans.' },
    ],
    tags: ['trail running', 'pottery', 'photography', 'coffee'],
    neighborhood: 'Riverside',
    crossStreets: 'Elm & 3rd',
    yearsInArea: '2 years',
    verifications: ['phone'],
    conversationStarters: {
      askMeAbout: 'Trail recommendations within an hour of the city',
      skillsToShare: 'Film photography basics',
      neighborhoodLove: 'The farmers market every Sunday.',
    },
  },
  {
    id: 'theo',
    name: 'Theo Marsh',
    pronouns: 'he/him',
    avatar: 'https://i.pravatar.cc/150?img=33',
    tagline: 'Trail loops, board games, and slow Sunday breakfasts',
    bio: 'Third-generation neighbor — my grandfather used to run the hardware store on Main. Slow mornings, long trails, and a standing chess invite.',
    interests: 'Hiking, chess, home brewing, vinyl records',
    values: 'Directness, reliability, a good sense of humor',
    friendIds: ['amara', 'maya', 'priya', 'sam'],
    available: true,
    availableNote: 'Free after 3pm',
    prompts: [
      { q: 'How I recharge', a: 'A long trail run with no music, just thinking.' },
      { q: 'A belief I hold that not everyone agrees with', a: 'Board games are better than most parties.' },
    ],
    tags: ['hiking', 'chess', 'vinyl records'],
    neighborhood: 'Old Town',
    crossStreets: 'Main & Birch',
    yearsInArea: '12 years',
    verifications: ['id', 'phone', 'social'],
    conversationStarters: {
      askMeAbout: 'Chess openings or home brewing',
      skillsToShare: 'How to brew your first batch of beer',
      neighborhoodLove: 'How quiet it gets after 9pm.',
    },
  },
  {
    id: 'priya',
    name: 'Priya',
    avatar: 'https://i.pravatar.cc/150?img=48',
    tagline: 'New to the city, rebuilding my circle from scratch',
    bio: "New in town and rebuilding my circle one dinner party at a time. If you like good food and low-pressure hangs, say hi.",
    interests: 'Pottery, cooking for people, long walks, journaling',
    values: 'Warmth, honesty, low-pressure hangs',
    friendIds: ['amara', 'theo'],
    available: true,
    isNew: true,
    prompts: [
      { q: 'How I recharge', a: 'Cooking a big meal for people I love, even just a few.' },
      { q: 'What I’m looking for', a: 'Friendship first — no agenda, just consistency.' },
    ],
    tags: ['pottery', 'cooking', 'journaling'],
    neighborhood: 'Elm Street',
    crossStreets: 'Elm & 9th',
    yearsInArea: '6 months',
    verifications: ['phone'],
    conversationStarters: {
      askMeAbout: 'Easy weeknight recipes for one',
      skillsToShare: 'Basic knife skills in the kitchen',
      neighborhoodLove: 'The bakery on the corner that always smells like cinnamon.',
    },
  },
  {
    id: 'sam',
    name: 'Sam',
    avatar: 'https://i.pravatar.cc/150?img=15',
    tagline: 'Clay-covered and always down for something low-key',
    bio: 'Clay under my nails most days. Been in the neighborhood long enough to know every quiet bar worth visiting.',
    interests: 'Pottery, gardening, quiet bars, crosswords',
    values: 'Groundedness, follow-through, gentle honesty',
    friendIds: ['amara', 'maya', 'theo'],
    prompts: [
      { q: 'How I recharge', a: 'Hands in clay, no talking required.' },
      { q: 'A belief I hold that not everyone agrees with', a: 'Most plans are better with fewer people.' },
    ],
    tags: ['pottery', 'gardening', 'crosswords'],
    neighborhood: 'Southside',
    crossStreets: 'Cedar & 7th',
    yearsInArea: '5 years',
    verifications: ['id'],
    conversationStarters: {
      askMeAbout: 'Pottery glazing techniques',
      skillsToShare: 'Beginner-friendly wheel throwing lessons',
      neighborhoodLove: 'The quiet bar two blocks over — never crowded.',
    },
  },
];

export const DISCOVER_USERS: User[] = [
  {
    id: 'jordan',
    name: 'Jordan',
    avatar: 'https://i.pravatar.cc/150?img=25',
    tagline: 'New to the neighborhood, looking for a regular board game night',
    bio: 'Just moved into the building on the corner. Looking to build a regular board game night from scratch — all are welcome.',
    interests: 'Board games, home brewing, quiet bars',
    values: 'Consistency, good humor, low drama',
    friendIds: ['theo'],
    isNew: true,
    prompts: [
      { q: 'What I’m looking for', a: 'A standing weekly game night, honestly.' },
      { q: 'How I recharge', a: 'Losing badly at Catan with people I like.' },
    ],
    tags: ['board games', 'coffee', 'chess'],
    neighborhood: 'Riverside',
    crossStreets: '2nd & Ash',
    yearsInArea: '3 months',
    verifications: [],
    conversationStarters: {
      askMeAbout: 'Good board games for 4+ players',
      skillsToShare: 'A mean home-brewed root beer recipe',
      neighborhoodLove: "Still figuring that out — tell me what I'm missing!",
    },
  },
  {
    id: 'nia',
    name: 'Nia',
    avatar: 'https://i.pravatar.cc/150?img=9',
    tagline: 'Always down for a concert or a long run',
    bio: "Between concerts and long runs, I'm usually recruiting people for one or the other. Say yes to spontaneous plans.",
    interests: 'Live music, trail running, journaling',
    values: 'Spontaneity, honesty, showing up energized',
    friendIds: ['maya', 'sam'],
    prompts: [
      { q: 'How I recharge', a: 'A sweaty run followed by a very loud show.' },
      { q: 'What I’m looking for', a: 'People who’ll say yes to a last-minute show.' },
    ],
    tags: ['live music', 'trail running', 'journaling'],
    neighborhood: 'Maple Hill',
    crossStreets: '5th & Poplar',
    yearsInArea: '4 years',
    verifications: ['phone', 'social'],
    conversationStarters: {
      askMeAbout: 'Upcoming shows worth catching',
      skillsToShare: 'Running form and pacing tips',
      neighborhoodLove: 'The open mic nights at the corner bar.',
    },
  },
  {
    id: 'kai',
    name: 'Kai',
    avatar: 'https://i.pravatar.cc/150?img=68',
    tagline: 'Chasing golden hour and quiet trails',
    bio: 'Chasing good light and quiet trails most weekends. Newer to the area but already know all the best sunrise spots.',
    interests: 'Photography, hiking, gardening',
    values: 'Patience, presence, low-key company',
    friendIds: ['theo', 'priya'],
    prompts: [
      { q: 'How I recharge', a: 'Golden hour, a trail, and no one talking.' },
      { q: 'A belief I hold that not everyone agrees with', a: 'The best conversations happen mid-hike.' },
    ],
    tags: ['photography', 'hiking', 'gardening'],
    neighborhood: 'Old Town',
    crossStreets: 'Main & Willow',
    yearsInArea: '1 year',
    verifications: ['id'],
    conversationStarters: {
      askMeAbout: 'Best sunrise spots for photos',
      skillsToShare: 'Basic photo editing and composition tips',
      neighborhoodLove: 'The community garden at the end of Willow.',
    },
  },
];

export function getUser(id: string): User | undefined {
  if (id === ME.id) return ME;
  return USERS.find((u) => u.id === id) ?? DISCOVER_USERS.find((u) => u.id === id);
}

export const MY_FRIEND_IDS = ['maya', 'theo', 'priya', 'sam'];

export type ReactionType = 'love' | 'haha' | 'wow' | 'sad' | 'clap';

export type PollOption = {
  id: string;
  label: string;
  // Baseline vote count from other neighbors, *not including* ME — same
  // pattern as event.spotsTaken / LendItem.helperCount.
  votes: number;
};

export type Poll = {
  options: PollOption[];
  closesAt?: number;
};

export type Post = {
  id: string;
  authorId: string;
  time: string;
  body: string;
  replies: number;
  imageUris?: string[];
  edited?: boolean;
  reactions?: Record<string, ReactionType>;
  poll?: Poll;
};

export const POSTS: Post[] = [
  {
    id: '1',
    authorId: 'amara',
    time: '2h ago',
    body: 'Porch hangout this Saturday if anyone wants to come sit, talk, and eat too much cornbread. No agenda, just company.',
    replies: 4,
    reactions: { maya: 'love', theo: 'haha', priya: 'love', sam: 'clap', jordan: 'love', nia: 'haha', kai: 'love' },
  },
  {
    id: '2',
    authorId: 'theo',
    time: '5h ago',
    body: "Finally finished the trail loop with the hiking circle. Nothing beats quiet company and switchbacks. Same time next week?",
    replies: 2,
    reactions: { maya: 'love', priya: 'clap', sam: 'love', jordan: 'wow', nia: 'love', kai: 'love' },
  },
  {
    id: '3',
    authorId: 'maya',
    time: '1d ago',
    body: 'Found a new trail with the best morning light for photos. Taking anyone who wants to come next weekend.',
    replies: 3,
    reactions: { theo: 'love', priya: 'wow', sam: 'love', jordan: 'love', nia: 'wow', kai: 'love' },
  },
  {
    id: '4',
    authorId: 'priya',
    time: '2d ago',
    body: "Made way too much soup again. If you're near Elm St today, come take a jar off my hands.",
    replies: 6,
    reactions: { maya: 'love', theo: 'love', sam: 'wow', jordan: 'clap', nia: 'love', kai: 'wow' },
  },
  {
    id: '5',
    authorId: 'sam',
    time: '3d ago',
    body: 'Finally got the garden beds weeded. Trading tomato starts for good company this weekend.',
    replies: 2,
    reactions: { maya: 'clap', theo: 'love', priya: 'love', jordan: 'love', nia: 'clap', kai: 'wow' },
  },
  {
    id: '6',
    authorId: 'amara',
    time: '4h ago',
    body: 'Planning the block party — best night for everyone?',
    replies: 0,
    poll: {
      options: [
        { id: 'fri', label: 'Friday', votes: 6 },
        { id: 'sat', label: 'Saturday', votes: 4 },
      ],
    },
  },
  {
    id: '7',
    authorId: 'priya',
    time: '1d ago',
    body: 'Quick one — what should the hiking circle tackle next?',
    replies: 1,
    poll: {
      options: [
        { id: 'ridge', label: 'Sunset Ridge again', votes: 2 },
        { id: 'creek', label: 'Willow Creek trail', votes: 5 },
        { id: 'summit', label: 'Try the summit route', votes: 1 },
      ],
    },
  },
];

export type CommentItem = {
  id: string;
  authorId: string;
  text: string;
  time: string;
  edited?: boolean;
  reactions?: Record<string, ReactionType>;
  parentId?: string;
};

export const COMMENTS: Record<string, CommentItem[]> = {
  '1': [
    {
      id: 'c1',
      authorId: 'theo',
      text: "Count me in, I'll bring a salad to balance out the cornbread.",
      time: '1h ago',
      reactions: { maya: 'haha', priya: 'love' },
    },
    { id: 'c2', authorId: 'priya', text: 'This is exactly the kind of no-agenda thing I need this week.', time: '45m ago' },
    { id: 'c3', authorId: 'priya', text: 'deal 🤝', time: '40m ago', parentId: 'c1' },
    { id: 'c4', authorId: 'amara', text: 'perfect, see you both', time: '35m ago', parentId: 'c1' },
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
  coAdminIds?: string[];
  coverImageUri?: string;
  // Absent/'public' circles are browsable in Discover. 'private' circles are
  // only joinable via invite code and never show up in Discover browse or search.
  privacy?: 'public' | 'private';
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
    createdBy: 'amara',
    coAdminIds: ['theo'],
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
    privacy: 'private',
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

export type EventCategory = 'Outdoors' | 'Social' | 'Learning' | 'Creative' | 'Fitness' | 'Kids';

export const EVENT_CATEGORIES: EventCategory[] = [
  'Outdoors',
  'Social',
  'Learning',
  'Creative',
  'Fitness',
  'Kids',
];

export type EventRecurrence = 'weekly' | 'biweekly';

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
  hostGroupId?: string;
  coHostIds?: string[];
  description: string;
  category: EventCategory;
  spotsTaken: number;
  spotsTotal: number;
  attendeeIds: string[];
  status: 'upcoming' | 'past';
  // A cancelled event keeps its 'upcoming' status (so it stays visible in
  // the same lists) but is flagged separately, distinct from deleteEvent
  // which removes it entirely.
  cancelled?: boolean;
  cancelReason?: string;
  // Baseline "who's checked in" list from other attendees — ME's own
  // check-in lives in useCheckInStore instead, since it's something ME
  // actually toggles.
  checkedInIds?: string[];
  coverImageUri?: string;
  recurrence?: EventRecurrence;
  // Number of upcoming occurrences the host has skipped — advances the
  // computed "next occurrence" schedule without deleting the series.
  skipCount?: number;
  // Baseline star ratings from other neighbors, *not including* ME —
  // same "baseline + mine" pattern as spotsTaken / helperCount.
  // Baseline ratings from other neighbors, *not including* ME — same
  // "baseline + mine" pattern as attendeeIds/agreedByIds.
  ratingBaseline?: { userId: string; stars: number; comment: string }[];
  // Baseline ids of other neighbors already on the waitlist ahead of ME —
  // same "baseline + mine" pattern as attendeeIds/checkedInIds.
  waitlistBaseline?: string[];
  // Host-authored "what to bring" checklist — the list itself is shared,
  // but each attendee's checked-off state is personal (kept separately in
  // useEventChecklistStore).
  checklist?: string[];
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
    category: 'Social',
    spotsTaken: 6,
    spotsTotal: 8,
    attendeeIds: ['maya', 'theo', 'priya'],
    status: 'upcoming',
    checklist: ['A dish to share', 'A folding chair if you have one', 'Something to drink'],
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
    hostGroupId: 'weekend-hikers',
    description:
      'An easy 4-mile loop with a view worth the climb. All paces welcome — we regroup at every junction.',
    category: 'Outdoors',
    spotsTaken: 5,
    spotsTotal: 6,
    attendeeIds: ['sam', 'theo'],
    status: 'upcoming',
    recurrence: 'weekly',
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
    category: 'Learning',
    spotsTaken: 6,
    spotsTotal: 6,
    attendeeIds: ['maya', 'priya', 'theo'],
    status: 'past',
    checkedInIds: ['maya', 'priya'],
    ratingBaseline: [
      { userId: 'maya', stars: 5, comment: 'Loved this month’s pick, discussion ran long in the best way.' },
      { userId: 'priya', stars: 4, comment: 'Good talk, though we could’ve used more snacks.' },
      { userId: 'theo', stars: 5, comment: 'Best one yet, already excited for next month.' },
      { userId: 'sam', stars: 4, comment: 'Solid pick, would come again.' },
    ],
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
    category: 'Creative',
    spotsTaken: 9,
    spotsTotal: 10,
    attendeeIds: ['sam'],
    status: 'past',
    checkedInIds: ['sam'],
    ratingBaseline: [
      { userId: 'sam', stars: 4, comment: 'Relaxing afternoon, good music playing too.' },
      { userId: 'maya', stars: 4, comment: 'Great studio space, plenty of wheels open.' },
      { userId: 'theo', stars: 3, comment: 'A bit crowded when I went, but still fun.' },
      { userId: 'priya', stars: 5, comment: 'Loved it, staff were really patient with beginners.' },
      { userId: 'nia', stars: 4, comment: 'Fun way to spend a Sunday, would do again.' },
      { userId: 'kai', stars: 4, comment: 'Good vibe, made a very lopsided bowl.' },
    ],
  },
];

export type Message = {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
  seen?: boolean;
  imageUri?: string;
  deleted?: boolean;
  edited?: boolean;
  reactions?: Record<string, ReactionType>;
  forwardedFrom?: string;
  replyToId?: string;
};

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
  | { kind: 'group-chat'; id: string }
  | { kind: 'post'; id: string }
  | { kind: 'lend'; id: string }
  | { kind: 'rec'; id: string }
  | { kind: 'sale'; id: string }
  | { kind: 'alert'; id: string };

export type NotificationItem = {
  id: string;
  type:
    | 'friend'
    | 'friend_request'
    | 'event'
    | 'group'
    | 'message'
    | 'mention'
    | 'lend'
    | 'rec'
    | 'welcome'
    | 'sale'
    | 'carpool';
  actorId?: string;
  text: string;
  time: string;
  read: boolean;
  target?: NotificationTarget;
  createdAt: number;
};

const notifSeedNow = Date.now();

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '0',
    type: 'friend_request',
    actorId: 'nia',
    text: 'Nia wants to be friends',
    time: '20m ago',
    read: false,
    target: { kind: 'profile', id: 'nia' },
    createdAt: notifSeedNow - 20 * 60 * 1000,
  },
  {
    id: '1',
    type: 'message',
    actorId: 'priya',
    text: 'Priya sent you a new message',
    time: '10m ago',
    read: false,
    target: { kind: 'chat', id: 'convo-priya' },
    createdAt: notifSeedNow - 10 * 60 * 1000,
  },
  {
    id: '2',
    type: 'event',
    actorId: 'maya',
    text: 'Maya RSVP’d to Porch Potluck',
    time: '1h ago',
    read: false,
    target: { kind: 'event', id: 'porch-potluck' },
    createdAt: notifSeedNow - 60 * 60 * 1000,
  },
  {
    id: '3',
    type: 'group',
    text: 'Weekend Hikers has new messages',
    time: '3h ago',
    read: false,
    target: { kind: 'group-chat', id: 'weekend-hikers' },
    createdAt: notifSeedNow - 3 * 60 * 60 * 1000,
  },
  {
    id: '4',
    type: 'event',
    text: 'Trail Loop: Sunset Ridge is tomorrow',
    time: '5h ago',
    read: true,
    target: { kind: 'event', id: 'sunset-ridge-hike' },
    createdAt: notifSeedNow - 5 * 60 * 60 * 1000,
  },
  {
    id: '5',
    type: 'group',
    actorId: 'sam',
    text: 'Sam joined Pottery Wheel Beginners',
    time: 'Yesterday',
    read: true,
    target: { kind: 'group', id: 'pottery-beginners' },
    createdAt: notifSeedNow - 30 * 60 * 60 * 1000,
  },
  {
    id: '6',
    type: 'friend',
    actorId: 'theo',
    text: 'Theo Marsh loved your post',
    time: '2d ago',
    read: true,
    target: { kind: 'profile', id: 'theo' },
    createdAt: notifSeedNow - 2 * 24 * 60 * 60 * 1000,
  },
];

export type WelcomeNote = {
  id: string;
  toUserId: string;
  fromUserId: string;
  text: string;
  edited?: boolean;
  reactions?: Record<string, ReactionType>;
};

export const WELCOME_NOTES: WelcomeNote[] = [
  {
    id: 'w1',
    toUserId: 'jordan',
    fromUserId: 'sam',
    text: 'The coffee shop on 5th does a great oat milk latte — good spot to work from too.',
  },
  {
    id: 'w2',
    toUserId: 'jordan',
    fromUserId: 'amara',
    text: 'Porch potlucks are a great way to meet folks around here. Come by the next one!',
  },
  {
    id: 'w3',
    toUserId: 'priya',
    fromUserId: 'theo',
    text: 'Welcome to the block! The farmers market on Sundays is not to be missed.',
    reactions: { maya: 'love' },
  },
];

export type EventPhoto = {
  id: string;
  eventId: string;
  uploaderId: string;
  uri: string;
};

export const EVENT_PHOTOS: EventPhoto[] = [
  {
    id: 'ep1',
    eventId: 'book-club-aug',
    uploaderId: 'theo',
    uri: 'https://picsum.photos/seed/bookclub-table/500/500',
  },
  {
    id: 'ep2',
    eventId: 'book-club-aug',
    uploaderId: 'priya',
    uri: 'https://picsum.photos/seed/bookclub-wine/500/500',
  },
  {
    id: 'ep3',
    eventId: 'pottery-open-studio',
    uploaderId: 'sam',
    uri: 'https://picsum.photos/seed/pottery-wheel/500/500',
  },
  {
    id: 'ep4',
    eventId: 'pottery-open-studio',
    uploaderId: 'sam',
    uri: 'https://picsum.photos/seed/pottery-hands/500/500',
  },
  {
    id: 'ep5',
    eventId: 'pottery-open-studio',
    uploaderId: 'sam',
    uri: 'https://picsum.photos/seed/pottery-shelf/500/500',
  },
];

export type GroupPhoto = {
  id: string;
  groupId: string;
  uploaderId: string;
  uri: string;
};

export const GROUP_PHOTOS: GroupPhoto[] = [
  {
    id: 'gp1',
    groupId: 'weekend-hikers',
    uploaderId: 'sam',
    uri: 'https://picsum.photos/seed/hikers-summit/500/500',
  },
  {
    id: 'gp2',
    groupId: 'weekend-hikers',
    uploaderId: 'theo',
    uri: 'https://picsum.photos/seed/hikers-trailhead/500/500',
  },
  {
    id: 'gp3',
    groupId: 'weekend-hikers',
    uploaderId: 'sam',
    uri: 'https://picsum.photos/seed/hikers-view/500/500',
  },
];

export type LendItemKind = 'have' | 'want';

export type LendItem = {
  id: string;
  ownerId: string;
  kind: LendItemKind;
  emoji: string;
  title: string;
  note: string;
  imageUris?: string[];
  // Baseline ids of other neighbors already offering to help, for 'want'
  // items — mirrors event.attendeeIds as a "before ME" list.
  helperIds?: string[];
  // Baseline signal that another neighbor currently has this 'have' item —
  // independent of ME's own borrow status. Cleared when "available again" is
  // simulated after ME asks to be notified.
  unavailableNote?: string;
  pickupLocation?: string;
  // Baseline ratings from other neighbors who've borrowed this item before,
  // *not including* ME — same "baseline + mine" pattern as event ratings.
  ratingBaseline?: { userId: string; stars: number; comment: string }[];
};

export const LEND_ITEMS: LendItem[] = [
  {
    id: 'ladder',
    ownerId: 'sam',
    kind: 'have',
    emoji: '🪜',
    title: 'Ladder',
    note: '6ft, good for gutters or trimming the hedge. Happy to lend for a weekend.',
  },
  {
    id: 'stand-mixer',
    ownerId: 'theo',
    kind: 'want',
    emoji: '🥧',
    title: 'Stand mixer',
    note: 'Baking a big batch of bread for the block party — anyone have one I could borrow for a day?',
    helperIds: ['maya', 'sam'],
  },
  {
    id: 'drill',
    ownerId: 'priya',
    kind: 'have',
    emoji: '🔧',
    title: 'Power drill',
    note: 'Cordless, comes with a basic bit set. Just charge it up before you bring it back.',
    unavailableNote: 'Out with a neighbor until later this week',
  },
  {
    id: 'folding-tables',
    ownerId: 'maya',
    kind: 'have',
    emoji: '🪑',
    title: '2 folding tables',
    note: "Good for a yard sale or a party. They're in my garage, easy pickup.",
  },
  {
    id: 'pressure-washer',
    ownerId: 'nia',
    kind: 'want',
    emoji: '💦',
    title: 'Pressure washer',
    note: 'My driveway needs a good clean before fall. Willing to fill up your tank as thanks.',
    helperIds: ['priya'],
  },
  {
    id: 'kids-bike',
    ownerId: 'theo',
    kind: 'want',
    emoji: '🚲',
    title: "Kids' bike (age 6-8)",
    note: 'My nephew is visiting for a week and wants to ride around with the other kids.',
  },
];

export type SaleCondition = 'New' | 'Like new' | 'Good' | 'Well loved';

export const SALE_CONDITIONS: SaleCondition[] = ['New', 'Like new', 'Good', 'Well loved'];

export type SaleItem = {
  id: string;
  ownerId: string;
  emoji: string;
  title: string;
  price: string;
  note: string;
  imageUris?: string[];
  condition?: SaleCondition;
  pickupLocation?: string;
  priceFlexibility?: 'Firm' | 'Negotiable';
  // Baseline ids of other neighbors already interested — mirrors
  // LendItem.helperIds as a "before ME" list.
  interestedByIds?: string[];
  // Baseline offers from other neighbors, keyed by userId, *not including*
  // ME — only set for interested neighbors who proposed a specific price.
  offerBaseline?: Record<string, string>;
  // Set the first time the owner drops the price — the pre-drop price, kept
  // for a strikethrough "price drop" display. Never overwritten by later
  // drops, so it always reflects the original listing price.
  originalPrice?: string;
  // Baseline ratings from other neighbors who've bought this item before,
  // *not including* ME — same "baseline + mine" pattern as event ratings.
  ratingBaseline?: { userId: string; stars: number; comment: string }[];
};

export const SALE_ITEMS: SaleItem[] = [
  {
    id: 'kids-bike-16',
    ownerId: 'sam',
    emoji: '🚲',
    title: "Kids' bike (16in)",
    price: '$25',
    note: 'Barely used, outgrown it fast. Blue, good tires, minor scuffs.',
    interestedByIds: ['maya'],
    condition: 'Like new',
  },
  {
    id: 'standing-desk',
    ownerId: 'theo',
    emoji: '🪑',
    title: 'Standing desk',
    price: '$60',
    note: 'Manual crank, sturdy top. Downsizing my home office, works great.',
    priceFlexibility: 'Negotiable',
  },
  {
    id: 'record-player',
    ownerId: 'maya',
    emoji: '🎵',
    title: 'Record player',
    price: '$40',
    note: 'Portable, built-in speakers. Selling since I upgraded to a proper turntable.',
    interestedByIds: ['theo', 'priya'],
    offerBaseline: { theo: '$35' },
  },
  {
    id: 'patio-chairs',
    ownerId: 'priya',
    emoji: '🪴',
    title: '2 patio chairs',
    price: '$15',
    note: 'Moving out of state, need these gone by the end of the month.',
  },
];

export type RecEntryKind = 'rec' | 'ask';

export type RecEntry = {
  id: string;
  authorId: string;
  kind: RecEntryKind;
  emoji: string;
  category: string;
  name?: string;
  note: string;
  imageUris?: string[];
  // Baseline ids of other neighbors already agreeing (rec) or already
  // having a suggestion (ask), *not including* ME — same pattern as
  // event.attendeeIds / event.checkedInIds.
  agreedByIds?: string[];
  // Only meaningful for kind 'ask' — marks that the author found what
  // they needed, without deleting the record.
  resolved?: boolean;
  resolvedNote?: string;
  // Only meaningful for kind 'ask' — flags a time-sensitive ask.
  urgent?: boolean;
};

export const REC_ENTRIES: RecEntry[] = [
  {
    id: 'rosas-plumbing',
    authorId: 'sam',
    kind: 'rec',
    emoji: '🔧',
    category: 'Plumber',
    name: "Rosa's Plumbing",
    note: 'Fixed our water heater same day and charged less than she quoted. Straightforward and fast.',
    agreedByIds: ['theo', 'maya', 'priya'],
  },
  {
    id: 'dog-groomer-ask',
    authorId: 'nia',
    kind: 'ask',
    emoji: '🐕',
    category: 'Dog groomer',
    note: "New puppy, badly needs a first trim. Anyone have someone they trust nearby?",
  },
  {
    id: 'green-thumb-landscaping',
    authorId: 'theo',
    kind: 'rec',
    emoji: '🌿',
    category: 'Landscaper',
    name: 'Green Thumb Landscaping',
    note: 'Redid our whole front yard in a weekend. Showed up on time both days, which honestly is the bar.',
    agreedByIds: ['sam'],
  },
  {
    id: 'electrician-ask',
    authorId: 'priya',
    kind: 'ask',
    emoji: '💡',
    category: 'Electrician',
    note: 'Need an outlet added in the garage. Nothing urgent, just want someone reliable.',
    agreedByIds: ['maya', 'nia'],
  },
  {
    id: 'maya-babysitter',
    authorId: 'maya',
    kind: 'rec',
    emoji: '🧸',
    category: 'Babysitter',
    name: 'Elena R.',
    note: "My kids adore her and she's never once been late. Books up fast though.",
  },
];

export type AlertCategoryValue = 'lost-pet' | 'road' | 'safety' | 'free' | 'other';

export const ALERT_CATEGORIES: { value: AlertCategoryValue; label: string; emoji: string }[] = [
  { value: 'lost-pet', label: 'Lost pet', emoji: '🐕' },
  { value: 'road', label: 'Road & traffic', emoji: '🚧' },
  { value: 'safety', label: 'Safety', emoji: '⚠️' },
  { value: 'free', label: 'Free stuff', emoji: '🎁' },
  { value: 'other', label: 'Other', emoji: '📢' },
];

export type NeighborhoodAlert = {
  id: string;
  authorId: string;
  category: AlertCategoryValue;
  text: string;
  postedAt: number;
  expiresAt: number;
  confirmedByIds?: string[];
  resolved?: boolean;
  resolvedNote?: string;
  imageUris?: string[];
  location?: string;
};

const alertSeedNow = Date.now();

export const NEIGHBORHOOD_ALERTS: NeighborhoodAlert[] = [
  {
    id: 'alert-1',
    authorId: 'nia',
    category: 'lost-pet',
    text: 'Lost dog near 5th & Elm — a friendly golden retriever, answers to Biscuit. Please reach out if you spot him!',
    postedAt: alertSeedNow - 2 * 60 * 60 * 1000,
    expiresAt: alertSeedNow + 22 * 60 * 60 * 1000,
  },
  {
    id: 'alert-2',
    authorId: 'sam',
    category: 'road',
    text: 'Water main work on Birch St today — expect lane closures and some noise through the afternoon.',
    postedAt: alertSeedNow - 24 * 60 * 60 * 1000,
    expiresAt: alertSeedNow + 6 * 60 * 60 * 1000,
    confirmedByIds: ['maya'],
  },
];
