import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

const FAQS: FaqItem[] = [
  {
    id: 'location-set',
    category: 'Location',
    question: 'How do I set my neighborhood location?',
    answer:
      "Neighbor uses your phone's GPS to set your neighborhood and cross streets — go to Edit Profile and tap \"Use my current location.\" This keeps addresses honest, so there's no way to type in a neighborhood manually.",
  },
  {
    id: 'location-change',
    category: 'Location',
    question: 'Can I update my location later, like after I move?',
    answer:
      'Yes. Open Edit Profile and tap "Use my current location" again — it will re-check your GPS position and refresh your neighborhood and cross streets.',
  },
  {
    id: 'location-share',
    category: 'Location',
    question: 'Do other neighbors see my exact address?',
    answer:
      "No. Neighbor only shows your neighborhood name and nearest cross streets, never a precise address or GPS coordinates. See the Privacy Policy for the full breakdown of what's stored and shown.",
  },
  {
    id: 'location-denied',
    category: 'Location',
    question: "What happens if I don't want to share my location?",
    answer:
      'You can decline the location permission, but Neighbor needs an approximate location to place you in the right neighborhood, so profile setup won\'t be able to continue without it.',
  },
  {
    id: 'block-vs-mute',
    category: 'Privacy & Safety',
    question: "What's the difference between muting and blocking someone?",
    answer:
      "Muting hides a person's posts and messages from your feed and pop-up notifications, but they can still see you and reach out. Blocking is mutual and total — you won't see each other's posts, profiles, or messages anywhere in the app.",
  },
  {
    id: 'unblock',
    category: 'Privacy & Safety',
    question: 'How do I unblock or unmute someone?',
    answer:
      'Go to Settings — you\'ll find "Muted accounts" and "Blocked accounts" sections listing everyone you\'ve muted or blocked, each with a one-tap toggle to reverse it.',
  },
  {
    id: 'report',
    category: 'Privacy & Safety',
    question: 'What happens when I report a post, comment, or message?',
    answer:
      "Your report is recorded with the reason you selected so it can be reviewed. Reporting doesn't notify the person you reported, and it doesn't automatically hide their content from you — mute or block them for that.",
  },
  {
    id: 'data-export',
    category: 'Privacy & Safety',
    question: 'Can I download or delete my data?',
    answer:
      'Yes, both live in Settings. "Export my data" downloads a JSON file of your profile, and "Delete account" under Account permanently removes your data from the app.',
  },
  {
    id: 'alerts-expire',
    category: 'Alerts',
    question: 'How long do neighborhood alerts stay up?',
    answer:
      "Alerts expire on their own after a set window so the board doesn't fill up with stale posts. If you need more time, open the alert and tap the clock icon to extend it before it expires.",
  },
  {
    id: 'alerts-resolve',
    category: 'Alerts',
    question: 'How do I mark my alert as resolved?',
    answer:
      'On an alert you posted, tap the checkmark icon to mark it resolved (say, "found the dog!"). You can add a short note, and you can reopen it later if needed.',
  },
  {
    id: 'alerts-mute-category',
    category: 'Alerts',
    question: "I don't care about road-work alerts. Can I hide a whole category?",
    answer:
      'Yes — tap the filter icon on the Alerts screen and mute any category you want to stop seeing. Muted categories stay muted until you turn them back on.',
  },
  {
    id: 'posts-schedule',
    category: 'Posts',
    question: 'Can I schedule a post to go up later?',
    answer:
      'Yes. When composing a post, tap "Post now" near the top to pick a future date and time instead. You can view and cancel anything scheduled from Scheduled Posts in your profile menu.',
  },
  {
    id: 'posts-draft',
    category: 'Posts',
    question: 'Where do my unfinished posts go?',
    answer:
      'Closing a post, event, rec, or listing you were writing offers to save it as a draft. Drafts are saved per content type and are all reachable from Drafts in your profile menu.',
  },
  {
    id: 'posts-poll',
    category: 'Posts',
    question: 'How do I add a poll to a post?',
    answer:
      'While composing a post, tap the poll icon in the toolbar (only available before you add photos). Add up to four options and, optionally, a closing time — neighbors vote right from the feed.',
  },
  {
    id: 'events-carpool',
    category: 'Events',
    question: 'How does carpooling work for an event?',
    answer:
      'On an event with carpooling enabled, you can offer to drive with a seat count and optional cost split, or request a ride if you need one. Drivers offer seats to specific riders from the request list.',
  },
  {
    id: 'events-recurring',
    category: 'Events',
    question: 'Can I make an event repeat weekly or monthly?',
    answer:
      'Yes — set a recurrence when creating the event. You can skip a single upcoming occurrence or edit the whole series from the event page without recreating it.',
  },
  {
    id: 'groups-admin',
    category: 'Circles',
    question: 'How do I become a co-admin of a circle?',
    answer:
      "Only the circle's creator can promote members. From the member list, the creator taps \"Make co-admin\" next to a member's name. Co-admins can post announcements, edit the circle, and manage the welcome message.",
  },
  {
    id: 'groups-leave',
    category: 'Circles',
    question: 'If I leave a circle, do I lose access to the neighborhood app?',
    answer:
      "No — circles are optional interest-based groups within your neighborhood. Leaving one just removes you from that circle's chat and posts; your neighborhood account is unaffected.",
  },
  {
    id: 'sale-offer',
    category: 'Buy, Sell & Lend',
    question: 'Can I negotiate the price on a For Sale listing?',
    answer:
      'Yes. If the seller allows offers, you can propose a price, and the seller can counter back with their own number before either of you commits.',
  },
  {
    id: 'sale-sold',
    category: 'Buy, Sell & Lend',
    question: 'What happens when a listing is marked sold?',
    answer:
      'A sold listing is greyed out and hidden from new browsers by default (there\'s a "Hide sold items" toggle if you\'d rather not see them at all), but it stays visible to anyone who already showed interest.',
  },
  {
    id: 'lend-due-date',
    category: 'Buy, Sell & Lend',
    question: 'How does the due-back date work for borrowed items?',
    answer:
      'When you lend an item to a neighbor, you can set an expected return date and edit it any time from the listing. Mark it "Returned" once you have it back.',
  },
  {
    id: 'read-receipts',
    category: 'Messages',
    question: 'Can people see when I\'ve read their group messages?',
    answer:
      'By default, yes — group chats show "Seen by" under your last read message. You can turn this off under Settings → Privacy → Read receipts; note that turning it off also hides other people\'s read receipts from you.',
  },
  {
    id: 'quiet-hours',
    category: 'Messages',
    question: 'What are Quiet Hours?',
    answer:
      "Quiet Hours silence notification pop-ups during a window you set (like overnight), without turning notifications off entirely. Anything you missed is still waiting in your Notifications list when Quiet Hours ends.",
  },
  {
    id: 'saved-searches',
    category: 'Search',
    question: 'How do saved searches work?',
    answer:
      'After typing a search or setting filters on screens like Alerts, Events, or For Sale, tap the bookmark icon that appears to save it. Saved searches show up as chips you can tap to instantly re-apply, rename, or delete.',
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(FAQS.map((f) => f.category)))];

export default function HelpCenter() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = FAQS.filter((f) => {
    const matchesCategory = category === 'All' || f.category === category;
    const matchesQuery =
      q.length === 0 ||
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top']}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons name="chevron-back" size={22} className="text-charcoal" />
        </Pressable>
        <Text className="text-base font-bold text-charcoal">Help Center</Text>
      </View>

      <View className="px-5 pb-3">
        <View className="flex-row items-center rounded-full bg-cream px-4 py-2.5">
          <Ionicons name="search" size={18} className="text-charcoal/50" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search help articles..."
            placeholderTextColor="#3D3D3D80"
            className="ml-2 flex-1 text-charcoal"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={18} className="text-charcoal/50" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-5 pb-3"
      >
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            className={`rounded-full px-3.5 py-1.5 ${category === c ? 'bg-terracotta' : 'bg-cream'}`}
          >
            <Text
              className={`text-xs font-medium ${category === c ? 'text-paper' : 'text-charcoal/60'}`}
            >
              {c}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <View className="gap-2.5">
          {filtered.map((item) => {
            const expanded = expandedId === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setExpandedId(expanded ? null : item.id)}
                accessibilityLabel={item.question}
                accessibilityRole="button"
                className="rounded-2xl bg-cream p-4 active:opacity-80"
              >
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="flex-1 text-sm font-semibold text-charcoal">
                    {item.question}
                  </Text>
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    className="text-charcoal/40"
                  />
                </View>
                {expanded && (
                  <Text className="mt-2.5 text-sm leading-6 text-charcoal/70">{item.answer}</Text>
                )}
              </Pressable>
            );
          })}
          {filtered.length === 0 && (
            <View className="mt-10 items-center px-6">
              <Ionicons name="help-circle-outline" size={32} className="text-charcoal/30" />
              <Text className="mt-3 text-center text-sm text-charcoal/50">
                No help articles match "{query.trim()}".
              </Text>
            </View>
          )}
        </View>

        <View className="mt-6 gap-2 rounded-2xl bg-terracotta/10 p-4">
          <Text className="text-sm font-semibold text-charcoal">Still stuck?</Text>
          <Text className="text-xs leading-5 text-charcoal/70">
            Head back to Settings and tap "Send feedback" to tell us what's going on — we read
            every note.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
