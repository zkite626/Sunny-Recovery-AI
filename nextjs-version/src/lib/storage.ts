/**
 * localStorage 数据管理
 * 管理用户情绪记录、对话历史、API设置
 */

const STORAGE_KEYS = {
  RECORDS: 'moodcoach_records',
  CURRENT: 'moodcoach_current',
  API_KEY: 'API_KEY',
};

export interface EmotionRecord {
  id: number;
  timestamp: string;
  emotionType?: string;
  intensityBefore?: number;
  intensityAfter?: number;
  emotionText?: string;
  bodyZones?: string[];
  thinkingTrap?: string;
  literaryText?: string;
}

export interface SessionData {
  mode?: string;
  emotionType?: string;
  intensity?: number;
  emotionText?: string;
  startTime?: string;
  bodyZones?: string[];
  aiReply?: string;
  chatHistory?: Array<{ role: string; content: string }>;
  literaryText?: string;
  oldThought?: string;
  newThought?: string;
  microAction?: string;
  agentContext?: string;
  newIntensity?: number;
}

export function saveRecord(record: Omit<EmotionRecord, 'id' | 'timestamp'>) {
  const records = getRecords();
  records.push({
    ...record,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  });
  if (records.length > 30) records.splice(0, records.length - 30);
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

export function getRecords(): EmotionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS) || '[]');
  } catch {
    return [];
  }
}

export function getRecentRecords(days = 7): EmotionRecord[] {
  const records = getRecords();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return records.filter((r) => new Date(r.timestamp) >= cutoff);
}

export function saveCurrent(data: Partial<SessionData>) {
  const existing = getCurrent();
  const merged = { ...existing, ...data };
  localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(merged));
}

export function getCurrent(): SessionData {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT) || '{}');
  } catch {
    return {};
  }
}

export function clearCurrent() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT);
}

export function saveClassroomData(studentData: Record<string, unknown>) {
  const key = 'moodcoach_classroom';
  const existing = getClassroomData();
  existing.push(studentData);
  localStorage.setItem(key, JSON.stringify(existing));
}

export function getClassroomData(): Record<string, unknown>[] {
  try {
    return JSON.parse(localStorage.getItem('moodcoach_classroom') || '[]');
  } catch {
    return [];
  }
}

export function clearClassroomData() {
  localStorage.removeItem('moodcoach_classroom');
}

export function saveGratitude(items: string[]) {
  const key = 'moodcoach_gratitude';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push({
    id: Date.now(),
    items,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(key, JSON.stringify(existing.slice(-50)));
}

export interface GratitudeEntry {
  id: number;
  items: string[];
  timestamp: string;
}

export function getGratitude(): GratitudeEntry[] {
  try {
    return JSON.parse(localStorage.getItem('moodcoach_gratitude') || '[]');
  } catch {
    return [];
  }
}

export interface AssessmentResult {
  id: number;
  timestamp: string;
  type: string;
  score: number;
  maxScore: number;
  level: string;
  answers: number[];
}

export function saveAssessmentResult(result: Omit<AssessmentResult, 'id' | 'timestamp'>) {
  const key = 'moodcoach_assessments';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push({
    ...result,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(key, JSON.stringify(existing.slice(-20)));
}

export function getAssessmentResults(): AssessmentResult[] {
  try {
    return JSON.parse(localStorage.getItem('moodcoach_assessments') || '[]');
  } catch {
    return [];
  }
}

export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
}

export function setApiKey(key: string) {
  localStorage.setItem(STORAGE_KEYS.API_KEY, key);
}

export function getEmotionColor(intensity: number): string {
  if (intensity <= 3) return '#86c7a3';
  if (intensity <= 5) return '#fcd34d';
  if (intensity <= 7) return '#f6a623';
  return '#f87171';
}

export function getEmotionLabel(intensity: number): string {
  if (intensity <= 2) return '平静';
  if (intensity <= 4) return '轻度不安';
  if (intensity <= 6) return '中度焦虑';
  if (intensity <= 8) return '较重困扰';
  return '严重困扰';
}
