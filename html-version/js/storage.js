/**
 * localStorage 数据管理
 * 管理用户情绪记录、对话历史、API设置
 */

const STORAGE_KEYS = {
  RECORDS: 'moodcoach_records',
  CURRENT: 'moodcoach_current',
  API_KEY: 'API_KEY'
};

/**
 * 保存一条情绪记录
 */
function saveRecord(record) {
  const records = getRecords();
  records.push({
    ...record,
    id: Date.now(),
    timestamp: new Date().toISOString()
  });
  // 最多保存30条
  if (records.length > 30) records.splice(0, records.length - 30);
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

/**
 * 获取所有情绪记录
 */
function getRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS)) || [];
  } catch {
    return [];
  }
}

/**
 * 获取最近N天的记录
 */
function getRecentRecords(days = 7) {
  const records = getRecords();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return records.filter(r => new Date(r.timestamp) >= cutoff);
}

/**
 * 保存当前会话数据
 */
function saveCurrent(data) {
  const existing = getCurrent();
  const merged = { ...existing, ...data };
  localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(merged));
}

/**
 * 获取当前会话数据
 */
function getCurrent() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT)) || {};
  } catch {
    return {};
  }
}

/**
 * 清除当前会话
 */
function clearCurrent() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT);
}

/**
 * 保存课堂模式数据（全班汇总）
 */
function saveClassroomData(studentData) {
  const key = 'moodcoach_classroom';
  const existing = getClassroomData();
  existing.push(studentData);
  localStorage.setItem(key, JSON.stringify(existing));
}

/**
 * 获取课堂模式数据
 */
function getClassroomData() {
  try {
    return JSON.parse(localStorage.getItem('moodcoach_classroom')) || [];
  } catch {
    return [];
  }
}

/**
 * 清除课堂数据
 */
function clearClassroomData() {
  localStorage.removeItem('moodcoach_classroom');
}

/**
 * 保存感恩日记
 */
function saveGratitude(items) {
  const key = 'moodcoach_gratitude';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push({
    id: Date.now(),
    items: items,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(key, JSON.stringify(existing.slice(-50)));
}

/**
 * 获取感恩日记
 */
function getGratitude() {
  try {
    return JSON.parse(localStorage.getItem('moodcoach_gratitude')) || [];
  } catch {
    return [];
  }
}

/**
 * 保存测评结果
 */
function saveAssessmentResult(result) {
  const key = 'moodcoach_assessments';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push({
    ...result,
    id: Date.now(),
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(key, JSON.stringify(existing.slice(-20)));
}

/**
 * 获取测评结果
 */
function getAssessmentResults() {
  try {
    return JSON.parse(localStorage.getItem('moodcoach_assessments')) || [];
  } catch {
    return [];
  }
}

/**
 * 获取情绪强度对应的颜色
 */
function getEmotionColor(intensity) {
  if (intensity <= 3) return '#86c7a3'; // sage calm
  if (intensity <= 5) return '#fcd34d'; // sun light
  if (intensity <= 7) return '#f6a623'; // sun core
  return '#f87171'; // ember
}

/**
 * 获取情绪强度对应的标签
 */
function getEmotionLabel(intensity) {
  if (intensity <= 2) return '平静';
  if (intensity <= 4) return '轻度不安';
  if (intensity <= 6) return '中度焦虑';
  if (intensity <= 8) return '较重困扰';
  return '严重困扰';
}
