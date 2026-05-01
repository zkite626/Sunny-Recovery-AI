/**
 * 晴愈AI智能体 — 记忆系统
 * 跨会话持久化记忆，存在 localStorage
 */

const PsyMemory = {
  KEY: 'moodcoach_memory',
  MAX_ITEMS: 50,

  /**
   * 保存一条记忆
   */
  save(content, category = 'insight') {
    const items = this._load();
    items.push({
      id: Date.now(),
      content: content,
      category: category,
      timestamp: new Date().toISOString()
    });
    // 保留最新的 MAX_ITEMS 条
    if (items.length > this.MAX_ITEMS) items.splice(0, items.length - this.MAX_ITEMS);
    this._save(items);
  },

  /**
   * 查询记忆
   */
  query(category, keyword) {
    let items = this._load();
    if (category) items = items.filter(i => i.category === category);
    if (keyword) items = items.filter(i => i.content.includes(keyword));
    return items;
  },

  /**
   * 获取最近N条记忆
   */
  recent(n = 10) {
    return this._load().slice(-n);
  },

  /**
   * 构建记忆上下文字符串，用于注入系统提示词
   */
  getContextString() {
    const items = this._load();
    if (items.length === 0) return '';

    const recent = items.slice(-15);
    const categories = {
      insight: '认知发现',
      event: '生活事件',
      preference: '个人偏好',
      progress: '成长进展'
    };

    let ctx = '';
    recent.forEach(item => {
      const cat = categories[item.category] || item.category;
      const d = new Date(item.timestamp);
      ctx += `- [${cat}] ${d.getMonth()+1}/${d.getDate()}: ${item.content}\n`;
    });
    return ctx;
  },

  /**
   * 清除所有记忆
   */
  clear() {
    localStorage.removeItem(this.KEY);
  },

  _load() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch {
      return [];
    }
  },

  _save(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
  }
};
