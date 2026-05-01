'use client';

import { useMemo } from 'react';
import { EMOTION_TYPES } from '@/lib/emotion';
import type { EmotionRecord } from '@/lib/storage';

interface Props {
  year: number;
  month: number; // 0-indexed
  records: EmotionRecord[];
  onDayClick?: (date: string, records: EmotionRecord[]) => void;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarGrid({ year, month, records, onDayClick }: Props) {
  const todayKey = toDateKey(new Date());

  const recordsByDay = useMemo(() => {
    const map: Record<string, EmotionRecord[]> = {};
    for (const r of records) {
      const d = new Date(r.timestamp);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = toDateKey(d);
        if (!map[key]) map[key] = [];
        map[key].push(r);
      }
    }
    return map;
  }, [records, year, month]);

  const weeks = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = (firstDay.getDay() + 6) % 7; // Mon=0
    const totalDays = lastDay.getDate();

    const rows: (number | null)[][] = [];
    let row: (number | null)[] = new Array(startWeekday).fill(null);

    for (let day = 1; day <= totalDays; day++) {
      row.push(day);
      if (row.length === 7) {
        rows.push(row);
        row = [];
      }
    }
    if (row.length > 0) {
      while (row.length < 7) row.push(null);
      rows.push(row);
    }
    return rows;
  }, [year, month]);

  const getEmotionColor = (dayRecords: EmotionRecord[]): string | null => {
    if (dayRecords.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const r of dayRecords) {
      if (r.emotionType) {
        counts[r.emotionType] = (counts[r.emotionType] || 0) + 1;
      }
    }
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const emo = EMOTION_TYPES.find((e) => e.id === topId);
    return emo?.color || '#d1d5db';
  };

  const getIntensity = (dayRecords: EmotionRecord[]): number => {
    if (dayRecords.length === 0) return 0;
    const avg = dayRecords.reduce((s, r) => s + (r.intensityBefore || 5), 0) / dayRecords.length;
    return Math.max(0.3, avg / 10);
  };

  return (
    <div className="calendar-grid">
      <div className="calendar-weekdays">
        {WEEKDAYS.map((d) => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="calendar-week">
          {week.map((day, di) => {
            if (day === null) return <div key={di} className="calendar-day calendar-day--empty" />;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayRecords = recordsByDay[dateKey] || [];
            const color = getEmotionColor(dayRecords);
            const intensity = getIntensity(dayRecords);
            const isToday = dateKey === todayKey;

            return (
              <div
                key={di}
                className={`calendar-day${isToday ? ' calendar-day--today' : ''}${dayRecords.length > 0 ? ' calendar-day--has-record' : ''}`}
                style={color ? { backgroundColor: color, opacity: intensity } : undefined}
                onClick={() => onDayClick?.(dateKey, dayRecords)}
              >
                <span className="calendar-day-num">{day}</span>
                {dayRecords.length > 0 && (
                  <span className="calendar-day-dot" />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
