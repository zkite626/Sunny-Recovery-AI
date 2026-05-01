/**
 * 晴愈AI智能体 — 工具注册表
 */

import { getCurrent, saveCurrent, saveGratitude, getRecords, getApiKey } from './storage';
import { generateSummary, EMOTION_TYPES } from './emotion';
import { PsyMemory } from './memory';

type ToolHandler = (params: Record<string, unknown>) => Promise<Record<string, unknown>>;

export const PsyTools = {
  _registry: {} as Record<string, ToolHandler>,

  register(name: string, handler: ToolHandler) {
    this._registry[name] = handler;
  },

  async execute(name: string, params: Record<string, unknown>) {
    const handler = this._registry[name];
    if (!handler) return { error: `未知工具: ${name}` };
    try {
      return await handler(params);
    } catch (err) {
      return { error: (err as Error).message };
    }
  },

  list() {
    return Object.keys(this._registry);
  },
};

// 1. 身体扫描
PsyTools.register('body_scan', async (params) => {
  saveCurrent({ agentContext: (params.context as string) || '' });
  if (typeof window !== 'undefined') window.location.href = '/step2?from=agent';
  return { status: 'redirected', page: 'body_scan' };
});

// 2. 生成情绪卡片
PsyTools.register('generate_card', async (params) => {
  const session = getCurrent();
  generateSummary(session);
  saveCurrent({
    oldThought: (params.old_thought as string) || '我什么都做不好',
    newThought: (params.new_thought as string) || '我可以从一件小事开始',
    microAction: (params.micro_action as string) || '深呼吸三次，然后写下一件今天完成的事',
  });
  if (typeof window !== 'undefined') window.location.href = '/step5?from=agent';
  return { status: 'redirected', page: 'emotion_card' };
});

// 3. 生成文学安慰
PsyTools.register('generate_comfort', async (params) => {
  const session = getCurrent();
  const emotion = EMOTION_TYPES.find((e) => e.id === session.emotionType);
  const context = `请为用户创作一段治愈文字。用户情绪：${emotion?.label || '未指定'}，强度${session.intensity || 5}/10。${session.emotionText || ''}。${params.theme ? '主题偏好：' + params.theme : ''}`;

  try {
    const res = await fetch('/api/comfort', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context, userApiKey: getApiKey() || undefined }),
    });
    if (!res.ok) throw new Error('API 调用失败');
    const data = await res.json();
    const text = data.text;
    saveCurrent({ literaryText: text });
    return { status: 'success', text };
  } catch (err) {
    return { status: 'error', message: (err as Error).message };
  }
});

// 4. 正念呼吸引导
PsyTools.register('start_breathing', async (params) => {
  if (typeof window !== 'undefined')
    window.location.href = `/breathe?cycles=${params.cycles || 4}&pattern=${params.pattern || '478'}`;
  return { status: 'redirected', page: 'breathing' };
});

// 5. 心理测评
PsyTools.register('run_assessment', async (params) => {
  const type = params.type || 'phq9';
  if (typeof window !== 'undefined') window.location.href = `/assessment?type=${type}`;
  return { status: 'redirected', page: 'assessment', type };
});

// 6. 保存记忆
PsyTools.register('save_memory', async (params) => {
  PsyMemory.save(params.content as string, (params.category as string) || 'insight');
  return { status: 'saved', content: params.content };
});

// 7. 读取记忆
PsyTools.register('read_memory', async (params) => {
  const items = PsyMemory.query(params.category as string, params.keyword as string);
  return { status: 'success', memories: items };
});

// 8. 查看情绪历史
PsyTools.register('show_history', async (params) => {
  const records = getRecords();
  const days = (params.days as number) || 7;
  const recent = records
    .filter((r) => {
      const age = (Date.now() - new Date(r.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return age <= days;
    })
    .map((r) => {
      const emo = EMOTION_TYPES.find((e) => e.id === r.emotionType);
      return {
        date: r.timestamp,
        emotion: emo?.label || '未知',
        intensity: `${r.intensityBefore}→${r.intensityAfter}`,
        text: r.emotionText?.slice(0, 50) || '',
      };
    });
  return { status: 'success', count: recent.length, records: recent };
});

// 9. 感恩日记
PsyTools.register('save_gratitude', async (params) => {
  const items = (params.items as string[]) || [];
  saveGratitude(items);
  return { status: 'saved', count: items.length };
});

// 10. 情绪标签
PsyTools.register('quick_mood', async (params) => {
  saveCurrent({
    emotionType: params.emotion as string,
    intensity: params.intensity as number,
    emotionText: (params.note as string) || '',
    startTime: new Date().toISOString(),
  });
  return { status: 'recorded', emotion: params.emotion, intensity: params.intensity };
});

// 11. 开始冥想
PsyTools.register('start_meditation', async () => {
  if (typeof window !== 'undefined') window.location.href = '/meditation';
  return { status: 'redirected', page: 'meditation' };
});

// 12. 情绪涂鸦
PsyTools.register('start_art', async () => {
  if (typeof window !== 'undefined') window.location.href = '/art';
  return { status: 'redirected', page: 'art' };
});

// 13. 沉浸式互动
PsyTools.register('start_calm', async () => {
  if (typeof window !== 'undefined') window.location.href = '/calm';
  return { status: 'redirected', page: 'calm' };
});

// 14. 查看情绪日历
PsyTools.register('show_calendar', async () => {
  if (typeof window !== 'undefined') window.location.href = '/calendar';
  return { status: 'redirected', page: 'calendar' };
});
