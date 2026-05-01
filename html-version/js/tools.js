/**
 * 晴愈AI智能体 — 工具注册表
 * 每个工具是一个 async 函数，接收 params，返回结果对象
 */

const PsyTools = {
  _registry: {},

  register(name, handler) {
    this._registry[name] = handler;
  },

  async execute(name, params) {
    const handler = this._registry[name];
    if (!handler) return { error: `未知工具: ${name}` };
    try {
      return await handler(params);
    } catch (err) {
      return { error: err.message };
    }
  },

  list() {
    return Object.keys(this._registry);
  }
};

// ── 工具定义 ──

// 1. 身体扫描
PsyTools.register('body_scan', async (params) => {
  // 跳转到身体扫描页面，传递上下文
  const session = getCurrent();
  saveCurrent({ agentContext: params.context || '' });
  window.location.href = 'step2.html?from=agent';
  return { status: 'redirected', page: 'body_scan' };
});

// 2. 生成情绪卡片
PsyTools.register('generate_card', async (params) => {
  const session = getCurrent();
  const summary = generateSummary(session);
  saveCurrent({
    oldThought: params.old_thought || summary.oldThought || '我什么都做不好',
    newThought: params.new_thought || summary.newThought || '我可以从一件小事开始',
    microAction: params.micro_action || '深呼吸三次，然后写下一件今天完成的事'
  });
  window.location.href = 'step5.html?from=agent';
  return { status: 'redirected', page: 'emotion_card' };
});

// 3. 生成文学安慰
PsyTools.register('generate_comfort', async (params) => {
  const session = getCurrent();
  const emotion = EMOTION_TYPES.find(e => e.id === session.emotionType);
  const context = `用户情绪：${emotion?.label || '未指定'}，强度${session.intensity || 5}/10。${session.emotionText || ''}`;

  try {
    const text = await callAI(LITERATURE_SYSTEM_PROMPT, [
      { role: 'user', content: `请为用户创作一段治愈文字。${context}。${params.theme ? '主题偏好：' + params.theme : ''}` }
    ]);
    saveCurrent({ literaryText: text });
    return { status: 'success', text: text };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
});

// 4. 正念呼吸引导
PsyTools.register('start_breathing', async (params) => {
  window.location.href = `breathe.html?cycles=${params.cycles || 4}&pattern=${params.pattern || '478'}`;
  return { status: 'redirected', page: 'breathing' };
});

// 5. 心理测评
PsyTools.register('run_assessment', async (params) => {
  const type = params.type || 'phq9';
  window.location.href = `assessment.html?type=${type}`;
  return { status: 'redirected', page: 'assessment', type: type };
});

// 6. 保存记忆
PsyTools.register('save_memory', async (params) => {
  PsyMemory.save(params.content, params.category || 'insight');
  return { status: 'saved', content: params.content };
});

// 7. 读取记忆
PsyTools.register('read_memory', async (params) => {
  const items = PsyMemory.query(params.category, params.keyword);
  return { status: 'success', memories: items };
});

// 8. 查看情绪历史
PsyTools.register('show_history', async (params) => {
  const records = getRecords();
  const days = params.days || 7;
  const recent = records.filter(r => {
    const age = (Date.now() - new Date(r.timestamp).getTime()) / (1000*60*60*24);
    return age <= days;
  }).map(r => {
    const emo = EMOTION_TYPES.find(e => e.id === r.emotionType);
    return {
      date: r.timestamp,
      emotion: emo?.label || '未知',
      intensity: `${r.intensityBefore}→${r.intensityAfter}`,
      text: r.emotionText?.slice(0, 50) || ''
    };
  });
  return { status: 'success', count: recent.length, records: recent };
});

// 9. 感恩日记
PsyTools.register('save_gratitude', async (params) => {
  const items = params.items || [];
  const existing = JSON.parse(localStorage.getItem('moodcoach_gratitude') || '[]');
  existing.push({
    id: Date.now(),
    items: items,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('moodcoach_gratitude', JSON.stringify(existing.slice(-50)));
  return { status: 'saved', count: items.length };
});

// 10. 情绪标签（快速记录当前状态）
PsyTools.register('quick_mood', async (params) => {
  saveCurrent({
    emotionType: params.emotion,
    intensity: params.intensity,
    emotionText: params.note || '',
    startTime: new Date().toISOString()
  });
  return { status: 'recorded', emotion: params.emotion, intensity: params.intensity };
});

// 11. 开始冥想
PsyTools.register('start_meditation', async (params) => {
  window.location.href = 'meditation.html';
  return { status: 'redirected', page: 'meditation' };
});

// 12. 情绪涂鸦
PsyTools.register('start_art', async (params) => {
  window.location.href = 'art.html';
  return { status: 'redirected', page: 'art' };
});

// 13. 沉浸式互动
PsyTools.register('start_calm', async (params) => {
  window.location.href = 'calm.html';
  return { status: 'redirected', page: 'calm' };
});

// 14. 查看情绪日历
PsyTools.register('show_calendar', async (params) => {
  window.location.href = 'calendar.html';
  return { status: 'redirected', page: 'calendar' };
});
