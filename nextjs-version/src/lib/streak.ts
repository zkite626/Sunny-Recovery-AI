/**
 * 连续打卡天数计算
 */

interface StreakResult {
  current: number;
  longest: number;
}

function toDateKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getActiveDays(timestamps: string[]): Set<string> {
  const days = new Set<string>();
  for (const ts of timestamps) {
    days.add(toDateKey(ts));
  }
  return days;
}

export function calculateStreak(
  recordTimestamps: string[],
  meditationTimestamps: string[] = [],
  gratitudeTimestamps: string[] = []
): StreakResult {
  const allDays = new Set<string>();
  for (const d of getActiveDays(recordTimestamps)) allDays.add(d);
  for (const d of getActiveDays(meditationTimestamps)) allDays.add(d);
  for (const d of getActiveDays(gratitudeTimestamps)) allDays.add(d);

  if (allDays.size === 0) return { current: 0, longest: 0 };

  const sorted = Array.from(allDays).sort().reverse();
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));

  let current = 0;
  if (sorted[0] === today || sorted[0] === yesterday) {
    let checkDate = sorted[0] === today ? new Date() : new Date(Date.now() - 86400000);
    for (let i = 0; i < 365; i++) {
      const key = toDateKey(checkDate);
      if (allDays.has(key)) {
        current++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  }

  // Longest streak
  const ascending = Array.from(allDays).sort();
  let longest = 1;
  let streak = 1;
  for (let i = 1; i < ascending.length; i++) {
    const prev = new Date(ascending[i - 1]).getTime();
    const curr = new Date(ascending[i]).getTime();
    if (curr - prev === 86400000) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 1;
    }
  }
  longest = Math.max(longest, current);

  return { current, longest };
}

export function getMeditationTimestamps(): string[] {
  try {
    const data = JSON.parse(localStorage.getItem('moodcoach_meditations') || '[]');
    return data.map((m: { completedAt: string }) => m.completedAt);
  } catch {
    return [];
  }
}

export function getGratitudeTimestamps(): string[] {
  try {
    const data = JSON.parse(localStorage.getItem('moodcoach_gratitude') || '[]');
    return data.map((g: { timestamp: string }) => g.timestamp);
  } catch {
    return [];
  }
}
