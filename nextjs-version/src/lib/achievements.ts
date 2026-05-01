/**
 * 成就徽章系统
 */

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface AchievementData {
  streakCurrent: number;
  streakLongest: number;
  recordCount: number;
  meditationCount: number;
  gratitudeCount: number;
  assessmentCount: number;
  artCount: number;
  intensityDecreases: number;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'streak_3', icon: '🔥', title: '三日坚持', description: '连续3天记录情绪' },
  { id: 'streak_7', icon: '⭐', title: '一周达人', description: '连续7天记录情绪' },
  { id: 'streak_30', icon: '👑', title: '月度冠军', description: '连续30天记录情绪' },
  { id: 'first_assessment', icon: '🔍', title: '初识自我', description: '完成第一次心理测评' },
  { id: 'first_meditation', icon: '🧘', title: '冥想入门', description: '完成第一次冥想' },
  { id: 'first_art', icon: '🎨', title: '艺术之心', description: '创作第一幅情绪涂鸦' },
  { id: 'mood_improver', icon: '📈', title: '情绪提升者', description: '10次情绪强度下降' },
  { id: 'gratitude_master', icon: '🌿', title: '感恩达人', description: '记录30条感恩日记' },
];

export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENTS;
}

function evaluateConditions(data: AchievementData): Record<string, boolean> {
  return {
    streak_3: data.streakCurrent >= 3 || data.streakLongest >= 3,
    streak_7: data.streakCurrent >= 7 || data.streakLongest >= 7,
    streak_30: data.streakCurrent >= 30 || data.streakLongest >= 30,
    first_assessment: data.assessmentCount >= 1,
    first_meditation: data.meditationCount >= 1,
    first_art: data.artCount >= 1,
    mood_improver: data.intensityDecreases >= 10,
    gratitude_master: data.gratitudeCount >= 30,
  };
}

function getEarnedBadges(): string[] {
  try {
    return JSON.parse(localStorage.getItem('moodcoach_achievements') || '[]');
  } catch {
    return [];
  }
}

function saveEarnedBadges(badges: string[]) {
  localStorage.setItem('moodcoach_achievements', JSON.stringify(badges));
}

export function checkAchievements(data: AchievementData): Achievement[] {
  const conditions = evaluateConditions(data);
  const earned = new Set(getEarnedBadges());
  const newlyEarned: Achievement[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (conditions[ach.id] && !earned.has(ach.id)) {
      earned.add(ach.id);
      newlyEarned.push(ach);
    }
  }

  if (newlyEarned.length > 0) {
    saveEarnedBadges(Array.from(earned));
  }

  return newlyEarned;
}

export function getEarnedAchievementIds(): string[] {
  return getEarnedBadges();
}

export function buildAchievementData(
  streakCurrent: number,
  streakLongest: number,
  recordCount: number,
  meditationCount: number,
  gratitudeCount: number,
  assessmentCount: number,
  artCount: number
): AchievementData {
  // Count intensity decreases from records
  let intensityDecreases = 0;
  try {
    const records = JSON.parse(localStorage.getItem('moodcoach_records') || '[]');
    for (const r of records) {
      if (r.intensityBefore && r.intensityAfter && r.intensityAfter < r.intensityBefore) {
        intensityDecreases++;
      }
    }
  } catch { /* ignore */ }

  return {
    streakCurrent,
    streakLongest,
    recordCount,
    meditationCount,
    gratitudeCount,
    assessmentCount,
    artCount,
    intensityDecreases,
  };
}
