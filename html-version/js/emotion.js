/**
 * 情绪分析工具函数
 */

// 情绪类型配置
const EMOTION_TYPES = [
  { id: 'anxiety',     label: '焦虑',   emoji: '😰', color: '#f6a623' },
  { id: 'frustration', label: '烦躁',   emoji: '😤', color: '#f87171' },
  { id: 'sadness',     label: '低落',   emoji: '😢', color: '#a78bfa' },
  { id: 'loneliness',  label: '孤独',   emoji: '🥺', color: '#7dd3fc' },
  { id: 'anger',       label: '愤怒',   emoji: '😠', color: '#ef4444' },
  { id: 'self-doubt',  label: '自我怀疑', emoji: '😞', color: '#fda085' },
  { id: 'burnout',     label: '疲惫内耗', emoji: '😩', color: '#b8a99a' },
  { id: 'fear',        label: '恐惧',   emoji: '😨', color: '#86c7a3' }
];

// 身体紧张区域配置
const BODY_ZONES = [
  { id: 'head',    label: '头部',   desc: '头痛、思绪纷乱' },
  { id: 'eyes',    label: '眼睛',   desc: '眼眶发紧、想哭' },
  { id: 'throat',  label: '喉咙',   desc: '喉头哽住、说不出话' },
  { id: 'chest',   label: '胸口',   desc: '胸闷、心跳加速' },
  { id: 'stomach', label: '腹部',   desc: '胃痛、翻涌感' },
  { id: 'hands',   label: '双手',   desc: '手心出汗、发抖' },
  { id: 'back',    label: '肩背',   desc: '肩颈僵硬、酸痛' },
  { id: 'legs',    label: '双腿',   desc: '腿软、坐立不安' }
];

// 思维陷阱类型
const THINKING_TRAPS = [
  { id: 'catastrophizing', label: '灾难化思维', desc: '把事情往最坏的方向想', icon: '🌪️' },
  { id: 'black-white',     label: '非黑即白',   desc: '只有好和坏两个极端', icon: '⚖️' },
  { id: 'overgeneralize',  label: '过度概括',   desc: '一次失败就否定全部', icon: '🔗' },
  { id: 'should',          label: '应该思维',   desc: '对自己要求过于苛刻', icon: '📐' },
  { id: 'mind-reading',    label: '读心术',     desc: '猜测别人怎么看你', icon: '🔮' }
];

/**
 * 从AI回复中提取思维陷阱类型
 */
function extractThinkingTrap(aiReply) {
  for (const trap of THINKING_TRAPS) {
    if (aiReply.includes(trap.label) || aiReply.includes(trap.desc)) {
      return trap;
    }
  }
  return THINKING_TRAPS[0]; // 默认
}

/**
 * 从AI回复中提取认知重构
 */
function extractRestructure(aiReply) {
  // 尝试匹配 "旧想法→新想法" 或 "旧想法 → 新想法" 模式
  const arrowMatch = aiReply.match(/[「「"'](.*?)[」」"']\s*[→➣➡→]\s*[「「"'](.*?)[」」"']/);
  if (arrowMatch) {
    return { old: arrowMatch[1], new: arrowMatch[2] };
  }

  // 尝试匹配 "与其...不如..." 模式
  const yuBuRu = aiReply.match(/与其[想觉得]*(.*?)[，,]不如[想觉得]*(.*)/);
  if (yuBuRu) {
    return { old: yuBuRu[1], new: yuBuRu[2] };
  }

  return null;
}

/**
 * 生成情绪报告摘要（用于卡片）
 */
function generateSummary(sessionData) {
  const { emotionType, intensity, bodyZones, aiReply, newIntensity } = sessionData;
  const emotion = EMOTION_TYPES.find(e => e.id === emotionType);
  const trap = extractThinkingTrap(aiReply || '');

  return {
    emotionLabel: emotion?.label || '未指定',
    emotionEmoji: emotion?.emoji || '🌤️',
    intensityBefore: intensity || 5,
    intensityAfter: newIntensity || Math.max(1, (intensity || 5) - 2),
    thinkingTrap: trap.label,
    thinkingTrapIcon: trap.icon,
    bodyZones: (bodyZones || []).map(id =>
      BODY_ZONES.find(z => z.id === id)?.label || id
    ),
    date: new Date().toLocaleDateString('zh-CN'),
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  };
}
