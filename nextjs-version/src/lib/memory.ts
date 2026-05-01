/**
 * 晴愈AI智能体 — 记忆系统
 * 跨会话持久化记忆，存在 localStorage
 */

export interface MemoryItem {
  id: number;
  content: string;
  category: string;
  timestamp: string;
}

const KEY = 'moodcoach_memory';
const MAX_ITEMS = 50;

export const PsyMemory = {
  save(content: string, category = 'insight') {
    const items = this._load();
    items.push({
      id: Date.now(),
      content,
      category,
      timestamp: new Date().toISOString(),
    });
    if (items.length > MAX_ITEMS) items.splice(0, items.length - MAX_ITEMS);
    this._save(items);
  },

  query(category?: string, keyword?: string): MemoryItem[] {
    let items = this._load();
    if (category) items = items.filter((i) => i.category === category);
    if (keyword) items = items.filter((i) => i.content.includes(keyword));
    return items;
  },

  recent(n = 10): MemoryItem[] {
    return this._load().slice(-n);
  },

  getContextString(): string {
    const items = this._load();
    if (items.length === 0) return '';

    const recent = items.slice(-15);
    const categories: Record<string, string> = {
      insight: '认知发现',
      event: '生活事件',
      preference: '个人偏好',
      progress: '成长进展',
    };

    let ctx = '';
    recent.forEach((item) => {
      const cat = categories[item.category] || item.category;
      const d = new Date(item.timestamp);
      ctx += `- [${cat}] ${d.getMonth() + 1}/${d.getDate()}: ${item.content}\n`;
    });
    return ctx;
  },

  clear() {
    localStorage.removeItem(KEY);
  },

  _load(): MemoryItem[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  },

  _save(items: MemoryItem[]) {
    localStorage.setItem(KEY, JSON.stringify(items));
  },
};
