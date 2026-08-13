import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { EventItem } from '../data/mock';
import { getEventOccurrencesInRange } from '../lib/recurrence';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MAX_MONTHS_AHEAD = 5;

type Props = {
  events: EventItem[];
  onSelectEvent: (eventId: string) => void;
};

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function EventCalendar({ events, onSelectEvent }: Props) {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const viewedMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewedMonth.getFullYear();
  const monthIndex = viewedMonth.getMonth();
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 1);

  const eventsByDay = new Map<string, EventItem[]>();
  for (const event of events) {
    const occurrences = getEventOccurrencesInRange(event, now, monthStart, monthEnd);
    for (const date of occurrences) {
      const key = dateKey(date);
      const list = eventsByDay.get(key) ?? [];
      list.push(event);
      eventsByDay.set(key, list);
    }
  }

  const firstWeekday = monthStart.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayKey = dateKey(now);
  const selectedKey = selectedDate ? dateKey(selectedDate) : null;
  const selectedEvents = selectedKey ? (eventsByDay.get(selectedKey) ?? []) : [];

  return (
    <View>
      <View className="flex-row items-center justify-between px-1 pb-3">
        <Pressable
          onPress={() => {
            if (monthOffset === 0) return;
            setMonthOffset((o) => o - 1);
            setSelectedDate(null);
          }}
          disabled={monthOffset === 0}
          className="h-8 w-8 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons
            name="chevron-back"
            size={16}
            className={monthOffset === 0 ? 'text-charcoal/20' : 'text-charcoal'}
          />
        </Pressable>
        <Text className="text-sm font-semibold text-charcoal">
          {viewedMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </Text>
        <Pressable
          onPress={() => {
            if (monthOffset === MAX_MONTHS_AHEAD) return;
            setMonthOffset((o) => o + 1);
            setSelectedDate(null);
          }}
          disabled={monthOffset === MAX_MONTHS_AHEAD}
          className="h-8 w-8 items-center justify-center rounded-full bg-cream"
        >
          <Ionicons
            name="chevron-forward"
            size={16}
            className={monthOffset === MAX_MONTHS_AHEAD ? 'text-charcoal/20' : 'text-charcoal'}
          />
        </Pressable>
      </View>

      <View className="flex-row">
        {WEEKDAY_LABELS.map((w, i) => (
          <View key={i} className="flex-1 items-center pb-1.5">
            <Text className="text-[11px] font-semibold text-charcoal/40">{w}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {cells.map((date, i) => {
          if (!date) {
            return <View key={i} style={{ width: `${100 / 7}%` }} className="aspect-square" />;
          }
          const key = dateKey(date);
          const hasEvents = eventsByDay.has(key);
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          return (
            <Pressable
              key={i}
              onPress={() => hasEvents && setSelectedDate(isSelected ? null : date)}
              style={{ width: `${100 / 7}%` }}
              className="aspect-square items-center justify-center"
            >
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  isSelected ? 'bg-terracotta' : isToday ? 'border border-terracotta' : ''
                }`}
              >
                <Text
                  className={`text-xs ${
                    isSelected
                      ? 'font-bold text-paper'
                      : hasEvents
                        ? 'font-semibold text-charcoal'
                        : 'text-charcoal/40'
                  }`}
                >
                  {date.getDate()}
                </Text>
              </View>
              {hasEvents && !isSelected && <View className="mt-0.5 h-1 w-1 rounded-full bg-terracotta" />}
            </Pressable>
          );
        })}
      </View>

      {selectedDate && (
        <View className="mt-4 gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
            {selectedDate.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          {selectedEvents.length === 0 ? (
            <Text className="text-sm text-charcoal/50">No events this day.</Text>
          ) : (
            selectedEvents.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => onSelectEvent(e.id)}
                className="flex-row items-center gap-3 rounded-2xl bg-cream p-3 active:opacity-80"
              >
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-terracotta">
                  <Text className="text-[10px] font-semibold text-paper">{e.month}</Text>
                  <Text className="text-sm font-bold text-paper">{e.day}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-charcoal">{e.title}</Text>
                  <Text className="text-xs text-charcoal/50">
                    {e.time} · {e.location}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}
