import pptxgen from 'pptxgenjs';

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = '心晴小队';
pres.title = '晴愈AI — 大学生心理健康智能伙伴';

// Colors
const C = {
  cream: 'FDF8F0',
  gold: 'F6A623',
  green: '86C7A3',
  purple: 'A78BFA',
  peach: 'FDA085',
  sky: '7DD3FC',
  ink: '3D2E1F',
  muted: '7A6B5D',
  ghost: 'B8A99A',
  white: 'FFFFFF',
  cardBg: 'FFFFFF',
};

const makeShadow = () => ({ type: 'outer', blur: 6, offset: 2, angle: 135, color: '000000', opacity: 0.08 });

// ═══════════════════════════════════════
// Slide 1: 封面
// ═══════════════════════════════════════
let s1 = pres.addSlide();
s1.background = { color: C.cream };

// Decorative circles
s1.addShape(pres.shapes.OVAL, { x: 7.5, y: -1.2, w: 4, h: 4, fill: { color: C.gold, transparency: 90 } });
s1.addShape(pres.shapes.OVAL, { x: -0.5, y: 3.5, w: 2.5, h: 2.5, fill: { color: C.green, transparency: 90 } });

s1.addText('2026 应用心理学专业活动月', { x: 0.8, y: 0.6, w: 4, h: 0.4, fontSize: 10, color: C.gold, bold: true, letterSpacing: 2 });

s1.addText('晴愈AI', { x: 0.8, y: 1.2, w: 6, h: 1.2, fontSize: 54, fontFace: 'Noto Serif SC', bold: true, color: C.ink, margin: 0 });
s1.addText('大学生心理健康智能伙伴', { x: 0.8, y: 2.3, w: 6, h: 0.6, fontSize: 22, fontFace: 'Noto Serif SC', color: C.gold, margin: 0 });

s1.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.1, w: 1.2, h: 0.04, fill: { color: C.gold } });

s1.addText('直面情绪，向阳而生', { x: 0.8, y: 3.4, w: 4, h: 0.4, fontSize: 16, color: C.muted });

s1.addText('心晴小队 · 南宁师范大学', { x: 0.8, y: 4.5, w: 5, h: 0.3, fontSize: 12, color: C.ghost });
s1.addText('李悦（组长）  王梓 · 陈曦    2026年4月27日', { x: 0.8, y: 4.8, w: 5, h: 0.3, fontSize: 11, color: C.ghost });

// ═══════════════════════════════════════
// Slide 2: 问题分析
// ═══════════════════════════════════════
let s2 = pres.addSlide();
s2.background = { color: C.cream };
s2.addShape(pres.shapes.OVAL, { x: 8, y: -1, w: 3, h: 3, fill: { color: C.gold, transparency: 92 } });

s2.addText('背景分析', { x: 0.7, y: 0.4, w: 2, h: 0.35, fontSize: 10, color: C.gold, bold: true });
s2.addText('大学生心理健康，不容忽视', { x: 0.7, y: 0.75, w: 8, h: 0.6, fontSize: 28, fontFace: 'Noto Serif SC', bold: true, color: C.ink, margin: 0 });
s2.addText('焦虑、内耗、自我否定……这些情绪正在影响越来越多大学生的日常生活', { x: 0.7, y: 1.35, w: 8, h: 0.35, fontSize: 12, color: C.muted });

const pains = [
  { icon: '😰', title: '学业焦虑', desc: '考前反复焦虑\n复习效率低\n越拖越焦虑' },
  { icon: '😞', title: '自我否定', desc: '完美主义导致\n不敢开始\n反复自我批评' },
  { icon: '🥺', title: '社交压力', desc: '与同学对比进度\n产生自我怀疑\n回避社交' },
  { icon: '😶', title: '缺乏倾诉', desc: '心理咨询预约难\n不愿向身边人\n袒露脆弱' },
];

pains.forEach((p, i) => {
  const x = 0.7 + i * 2.2;
  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2, w: 2.05, h: 3, fill: { color: C.white, transparency: 30 }, line: { color: 'E0D5C5', width: 0.5 }, rectRadius: 0.15, shadow: makeShadow() });
  s2.addText(p.icon, { x, y: 2.2, w: 2.05, h: 0.6, fontSize: 32, align: 'center', valign: 'middle' });
  s2.addText(p.title, { x, y: 2.85, w: 2.05, h: 0.4, fontSize: 14, fontFace: 'Noto Serif SC', bold: true, color: C.ink, align: 'center' });
  s2.addText(p.desc, { x: x + 0.2, y: 3.3, w: 1.65, h: 1.4, fontSize: 11, color: C.muted, align: 'center', lineSpacingMultiple: 1.5 });
});

// ═══════════════════════════════════════
// Slide 3: 解决方案概述
// ═══════════════════════════════════════
let s3 = pres.addSlide();
s3.background = { color: C.cream };
s3.addShape(pres.shapes.OVAL, { x: -0.5, y: 3.5, w: 3, h: 3, fill: { color: C.green, transparency: 92 } });

s3.addText('解决方案', { x: 0.7, y: 0.4, w: 2, h: 0.35, fontSize: 10, color: C.gold, bold: true });
s3.addText('晴愈AI：AI + 心理学的疗愈伙伴', { x: 0.7, y: 0.75, w: 9, h: 0.6, fontSize: 28, fontFace: 'Noto Serif SC', bold: true, color: C.ink, margin: 0 });

// 5-step flow
const steps = [
  { num: '1', color: C.gold, label: '情绪觉察', desc: '识别情绪\n类型与强度' },
  { num: '2', color: C.peach, label: '身体扫描', desc: '觉察情绪的\n身体感受' },
  { num: '3', color: C.purple, label: 'AI对话', desc: 'CBT引导\n认知重构' },
  { num: '4', color: C.sky, label: '文学安慰', desc: 'AI创作\n治愈文字' },
  { num: '5', color: C.green, label: '情绪卡片', desc: '生成专属\n疗愈记录' },
];

steps.forEach((s, i) => {
  const x = 0.7 + i * 1.75;
  s3.addShape(pres.shapes.OVAL, { x: x + 0.5, y: 1.7, w: 0.65, h: 0.65, fill: { color: s.color } });
  s3.addText(s.num, { x: x + 0.5, y: 1.7, w: 0.65, h: 0.65, fontSize: 20, fontFace: 'Noto Serif SC', bold: true, color: C.white, align: 'center', valign: 'middle' });
  s3.addText(s.label, { x, y: 2.5, w: 1.6, h: 0.35, fontSize: 13, fontFace: 'Noto Serif SC', bold: true, color: C.ink, align: 'center' });
  s3.addText(s.desc, { x, y: 2.85, w: 1.6, h: 0.7, fontSize: 10, color: C.muted, align: 'center', lineSpacingMultiple: 1.4 });
  if (i < 4) {
    s3.addText('→', { x: x + 1.4, y: 1.8, w: 0.5, h: 0.5, fontSize: 18, color: C.gold, align: 'center', valign: 'middle' });
  }
});

// Summary stats
const stats = [
  { num: '10', label: '智能体工具' },
  { num: '5', label: '思维陷阱识别' },
  { num: '3', label: '呼吸模式' },
  { num: '24h', label: '随时可用' },
];

stats.forEach((st, i) => {
  const x = 0.7 + i * 2.2;
  s3.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 3.9, w: 2.05, h: 1.2, fill: { color: C.white, transparency: 40 }, line: { color: 'E0D5C5', width: 0.5 }, rectRadius: 0.1 });
  s3.addText(st.num, { x, y: 3.95, w: 2.05, h: 0.7, fontSize: 28, fontFace: 'Noto Serif SC', bold: true, color: C.gold, align: 'center', valign: 'middle' });
  s3.addText(st.label, { x, y: 4.6, w: 2.05, h: 0.35, fontSize: 10, color: C.ghost, align: 'center' });
});

// ═══════════════════════════════════════
// Slide 4: AI 智能体对话
// ═══════════════════════════════════════
let s4 = pres.addSlide();
s4.background = { color: C.cream };
s4.addShape(pres.shapes.OVAL, { x: -0.3, y: -0.5, w: 2.5, h: 2.5, fill: { color: C.purple, transparency: 92 } });

s4.addText('核心功能一', { x: 0.7, y: 0.4, w: 2, h: 0.35, fontSize: 10, color: C.gold, bold: true });
s4.addText('AI 智能体对话', { x: 0.7, y: 0.75, w: 5, h: 0.55, fontSize: 28, fontFace: 'Noto Serif SC', bold: true, color: C.ink, margin: 0 });
s4.addText('不只是聊天——AI 能自主调用工具，主动提供帮助', { x: 0.7, y: 1.3, w: 5, h: 0.3, fontSize: 12, color: C.muted });

// Features list
const features = [
  { color: C.gold, title: '自主判断', desc: 'AI 根据用户表达，自主选择最合适的支持方式' },
  { color: C.green, title: '工具调用', desc: '10种工具：身体扫描、呼吸引导、心理测评等' },
  { color: C.purple, title: '跨会话记忆', desc: '记住用户分享过的事情，体现持续关心' },
  { color: C.peach, title: '危机检测', desc: '识别自伤关键词，立即提供心理援助热线' },
];

features.forEach((f, i) => {
  const y = 1.8 + i * 0.8;
  s4.addShape(pres.shapes.OVAL, { x: 0.7, y: y + 0.08, w: 0.18, h: 0.18, fill: { color: f.color } });
  s4.addText(f.title, { x: 1.05, y, w: 2, h: 0.3, fontSize: 13, fontFace: 'Noto Serif SC', bold: true, color: C.ink, margin: 0 });
  s4.addText(f.desc, { x: 1.05, y: y + 0.3, w: 3.5, h: 0.3, fontSize: 10, color: C.muted, margin: 0 });
});

// Chat demo
s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.2, y: 1.6, w: 4.2, h: 3.5, fill: { color: C.white, transparency: 20 }, line: { color: 'E0D5C5', width: 0.5 }, rectRadius: 0.15, shadow: makeShadow() });

const chatLines = [
  { text: '你好呀 👋 我是晴愈，你的心理健康伙伴', ai: true },
  { text: '明天就要考试了，我觉得自己什么都没准备好……', ai: false },
  { text: '听起来你有些考前焦虑呢 😰 这种「来不及了」的想法，是不是让你更难开始？', ai: true },
];

chatLines.forEach((c, i) => {
  const y = 1.85 + i * 0.75;
  if (c.ai) {
    s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.5, y, w: 3.2, h: 0.55, fill: { color: C.white }, line: { color: 'E8E0D5', width: 0.5 }, rectRadius: 0.1 });
    s4.addText(c.text, { x: 5.65, y: y + 0.05, w: 2.9, h: 0.45, fontSize: 9, color: C.ink });
  } else {
    s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.2, y, w: 3, h: 0.55, fill: { color: 'FEF3C7' }, line: { color: 'FDE2CA', width: 0.5 }, rectRadius: 0.1 });
    s4.addText(c.text, { x: 6.35, y: y + 0.05, w: 2.7, h: 0.45, fontSize: 9, color: C.ink, align: 'right' });
  }
});

s4.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.5, y: 4.2, w: 2.5, h: 0.35, fill: { color: 'D4EDDA' }, line: { color: '86C7A3', width: 0.5 }, rectRadius: 0.2 });
s4.addText('正在启动正念呼吸...', { x: 5.6, y: 4.22, w: 2.3, h: 0.3, fontSize: 9, color: C.green });

// ═══════════════════════════════════════
// Slide 5: 5步CBT疗愈
// ═══════════════════════════════════════
let s5 = pres.addSlide();
s5.background = { color: C.cream };
s5.addShape(pres.shapes.OVAL, { x: -0.3, y: 3, w: 2, h: 2, fill: { color: C.gold, transparency: 92 } });

s5.addText('核心功能二', { x: 0.7, y: 0.4, w: 2, h: 0.35, fontSize: 10, color: C.gold, bold: true });
s5.addText('5 步 CBT 情绪疗愈流程', { x: 0.7, y: 0.75, w: 8, h: 0.55, fontSize: 28, fontFace: 'Noto Serif SC', bold: true, color: C.ink, margin: 0 });
s5.addText('基于认知行为疗法的结构化引导，每一步都有科学依据', { x: 0.7, y: 1.3, w: 8, h: 0.3, fontSize: 12, color: C.muted });

const cbtSteps = [
  { badge: '步骤 1-2', badgeColor: 'FEF3C7', badgeText: C.gold, title: '情绪觉察 + 身体扫描', desc: '滑动选择情绪强度，选择情绪标签，写下感受。交互式人体图引导觉察身体紧张部位。' },
  { badge: '步骤 3', badgeColor: 'EDE9FE', badgeText: C.purple, title: 'AI CBT 对话', desc: '3轮引导：共情识别思维陷阱 → 分离想法与事实 → 认知重构 + 微行动建议。' },
  { badge: '步骤 4-5', badgeColor: 'D4EDDA', badgeText: C.green, title: '文学安慰 + 情绪卡片', desc: 'AI 创作专属治愈文字，生成精美疗愈卡片，记录完整旅程。' },
];

cbtSteps.forEach((s, i) => {
  const x = 0.7 + i * 2.9;
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.8, w: 2.7, h: 2.2, fill: { color: C.white, transparency: 30 }, line: { color: 'E0D5C5', width: 0.5 }, rectRadius: 0.15, shadow: makeShadow() });
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.2, y: 2, w: 1.2, h: 0.35, fill: { color: s.badgeColor }, rectRadius: 0.2 });
  s5.addText(s.badge, { x: x + 0.2, y: 2, w: 1.2, h: 0.35, fontSize: 9, color: s.badgeText, bold: true, align: 'center', valign: 'middle' });
  s5.addText(s.title, { x: x + 0.2, y: 2.5, w: 2.3, h: 0.35, fontSize: 14, fontFace: 'Noto Serif SC', bold: true, color: C.ink, margin: 0 });
  s5.addText(s.desc, { x: x + 0.2, y: 2.9, w: 2.3, h: 0.9, fontSize: 10, color: C.muted, lineSpacingMultiple: 1.5 });
});

// Restructure example
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 4.2, w: 3.8, h: 0.8, fill: { color: 'FEE2E2', transparency: 50 }, line: { color: 'FCA5A5', width: 0.5 }, rectRadius: 0.1 });
s5.addText('旧想法', { x: 0.9, y: 4.25, w: 1, h: 0.25, fontSize: 9, color: 'EF4444', bold: true, margin: 0 });
s5.addText('「我必须完美，做不好就完蛋」', { x: 0.9, y: 4.55, w: 3.4, h: 0.3, fontSize: 12, color: C.ink, margin: 0 });

s5.addText('→', { x: 4.6, y: 4.3, w: 0.5, h: 0.6, fontSize: 22, color: C.gold, align: 'center', valign: 'middle' });

s5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.2, y: 4.2, w: 3.8, h: 0.8, fill: { color: 'D1FAE5', transparency: 50 }, line: { color: '6EE7B7', width: 0.5 }, rectRadius: 0.1 });
s5.addText('新想法', { x: 5.4, y: 4.25, w: 1, h: 0.25, fontSize: 9, color: '10B981', bold: true, margin: 0 });
s5.addText('「先完成，再完善，每天进步一点」', { x: 5.4, y: 4.55, w: 3.4, h: 0.3, fontSize: 12, color: C.ink, margin: 0 });

// ═══════════════════════════════════════
// Slide 6: 多维辅助工具
// ═══════════════════════════════════════
let s6 = pres.addSlide();
s6.background = { color: C.cream };
s6.addShape(pres.shapes.OVAL, { x: 8, y: -0.8, w: 2.5, h: 2.5, fill: { color: C.green, transparency: 92 } });

s6.addText('核心功能三', { x: 0.7, y: 0.4, w: 2, h: 0.35, fontSize: 10, color: C.gold, bold: true });
s6.addText('多维辅助工具', { x: 0.7, y: 0.75, w: 8, h: 0.55, fontSize: 28, fontFace: 'Noto Serif SC', bold: true, color: C.ink, margin: 0 });
s6.addText('正念呼吸、心理测评、感恩日记、情绪记录——全方位心理健康守护', { x: 0.7, y: 1.3, w: 8, h: 0.3, fontSize: 12, color: C.muted });

const tools = [
  { icon: '🫁', name: '正念呼吸', desc: '4-7-8 / 方形 / 共振\n3种科学呼吸引导\n动画可视化辅助' },
  { icon: '📊', name: '心理测评', desc: 'PHQ-9 抑郁筛查\nGAD-7 焦虑筛查\nAI 个性化分析报告' },
  { icon: '🌿', name: '感恩日记', desc: '每天记录 3 件\n感恩的小事\n培养积极心态' },
  { icon: '🎨', name: '情绪卡片', desc: 'Canvas 精美渲染\n记录完整疗愈旅程\n可保存为图片分享' },
];

tools.forEach((t, i) => {
  const x = 0.7 + i * 2.2;
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.9, w: 2.05, h: 3, fill: { color: C.white, transparency: 30 }, line: { color: 'E0D5C5', width: 0.5 }, rectRadius: 0.15, shadow: makeShadow() });
  s6.addText(t.icon, { x, y: 2.1, w: 2.05, h: 0.7, fontSize: 36, align: 'center', valign: 'middle' });
  s6.addText(t.name, { x, y: 2.85, w: 2.05, h: 0.4, fontSize: 14, fontFace: 'Noto Serif SC', bold: true, color: C.ink, align: 'center' });
  s6.addText(t.desc, { x: x + 0.2, y: 3.35, w: 1.65, h: 1.3, fontSize: 10, color: C.muted, align: 'center', lineSpacingMultiple: 1.5 });
});

// ═══════════════════════════════════════
// Slide 7: 理论依据
// ═══════════════════════════════════════
let s7 = pres.addSlide();
s7.background = { color: C.cream };
s7.addShape(pres.shapes.OVAL, { x: 7, y: 3, w: 3.5, h: 3.5, fill: { color: C.purple, transparency: 92 } });

s7.addText('理论依据', { x: 0.7, y: 0.4, w: 2, h: 0.35, fontSize: 10, color: C.gold, bold: true });
s7.addText('循证心理学基础', { x: 0.7, y: 0.75, w: 8, h: 0.55, fontSize: 28, fontFace: 'Noto Serif SC', bold: true, color: C.ink, margin: 0 });
s7.addText('每一项功能都有扎实的理论支撑', { x: 0.7, y: 1.3, w: 8, h: 0.3, fontSize: 12, color: C.muted });

const theories = [
  { num: '1', color: C.gold, name: '情绪ABC理论', desc: '事件A不直接导致情绪C\n不合理信念B才是内耗根源', app: '→ 识别不合理信念' },
  { num: '2', color: C.purple, name: '认知行为疗法', desc: '想法—情绪—行为形成循环\n通过认知重构打破负向循环', app: '→ 3轮CBT对话引导' },
  { num: '3', color: C.green, name: '正念减压', desc: '提升当下觉察\n停止思维反刍，调节自主神经', app: '→ 3种呼吸引导模式' },
  { num: '4', color: C.peach, name: '积极心理学', desc: '感恩练习帮助大脑\n关注积极面，提升幸福感', app: '→ 感恩日记功能' },
];

theories.forEach((t, i) => {
  const x = 0.7 + i * 2.2;
  s7.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.9, w: 2.05, h: 3.1, fill: { color: C.white, transparency: 30 }, line: { color: 'E0D5C5', width: 0.5 }, rectRadius: 0.15, shadow: makeShadow() });
  s7.addShape(pres.shapes.OVAL, { x: x + 0.7, y: 2.1, w: 0.55, h: 0.55, fill: { color: t.color } });
  s7.addText(t.num, { x: x + 0.7, y: 2.1, w: 0.55, h: 0.55, fontSize: 18, fontFace: 'Noto Serif SC', bold: true, color: C.white, align: 'center', valign: 'middle' });
  s7.addText(t.name, { x: x + 0.15, y: 2.8, w: 1.75, h: 0.35, fontSize: 13, fontFace: 'Noto Serif SC', bold: true, color: C.ink, align: 'center' });
  s7.addText(t.desc, { x: x + 0.15, y: 3.2, w: 1.75, h: 0.8, fontSize: 10, color: C.muted, align: 'center', lineSpacingMultiple: 1.5 });
  s7.addText(t.app, { x: x + 0.15, y: 4.1, w: 1.75, h: 0.3, fontSize: 10, color: C.gold, align: 'center', bold: true });
});

// ═══════════════════════════════════════
// Slide 8: 创新亮点
// ═══════════════════════════════════════
let s8 = pres.addSlide();
s8.background = { color: C.cream };
s8.addShape(pres.shapes.OVAL, { x: -0.5, y: -0.8, w: 3, h: 3, fill: { color: C.gold, transparency: 92 } });

s8.addText('创新亮点', { x: 0.7, y: 0.4, w: 2, h: 0.35, fontSize: 10, color: C.gold, bold: true });
s8.addText('五大创新亮点', { x: 0.7, y: 0.75, w: 8, h: 0.55, fontSize: 28, fontFace: 'Noto Serif SC', bold: true, color: C.ink, margin: 0 });

const innovations = [
  { num: '1', color: C.gold, title: 'AI 智能体架构', desc: 'AI 自主判断用户需要，主动调用 10 种工具，从「被动回答」到「主动支持」' },
  { num: '2', color: C.purple, title: '结构化疗愈流程', desc: '5步引导整合循证心理学方法，用户跟随引导即可完成认知重构' },
  { num: '3', color: C.green, title: '多模态情绪表达', desc: '文字、身体、呼吸、创作四维感知，多维度覆盖情绪感知通道' },
  { num: '4', color: C.peach, title: '可视化情绪卡片', desc: 'Canvas 生成精美卡片，记录思维陷阱→认知重构→微行动，可保存分享' },
  { num: '5', color: C.sky, title: '隐私优先 + 零门槛', desc: '数据保存在浏览器本地，不上传服务器，无需注册，设置 API Key 即可使用' },
];

innovations.forEach((inn, i) => {
  const y = 1.5 + i * 0.75;
  s8.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y, w: 0.55, h: 0.55, fill: { color: inn.color }, rectRadius: 0.08 });
  s8.addText(inn.num, { x: 0.7, y, w: 0.55, h: 0.55, fontSize: 18, fontFace: 'Noto Serif SC', bold: true, color: C.white, align: 'center', valign: 'middle' });
  s8.addText(inn.title, { x: 1.45, y, w: 3, h: 0.3, fontSize: 14, fontFace: 'Noto Serif SC', bold: true, color: C.ink, margin: 0 });
  s8.addText(inn.desc, { x: 1.45, y: y + 0.28, w: 7.5, h: 0.3, fontSize: 11, color: C.muted, margin: 0 });
});

// ═══════════════════════════════════════
// Slide 9: 实践成果
// ═══════════════════════════════════════
let s9 = pres.addSlide();
s9.background = { color: C.cream };
s9.addShape(pres.shapes.OVAL, { x: 8, y: -0.5, w: 2.5, h: 2.5, fill: { color: C.green, transparency: 92 } });

s9.addText('实践成果', { x: 0.7, y: 0.4, w: 2, h: 0.35, fontSize: 10, color: C.gold, bold: true });
s9.addText('连续 7 天实践，效果显著', { x: 0.7, y: 0.75, w: 8, h: 0.55, fontSize: 28, fontFace: 'Noto Serif SC', bold: true, color: C.ink, margin: 0 });
s9.addText('小组成员亲身实践数据', { x: 0.7, y: 1.3, w: 8, h: 0.3, fontSize: 12, color: C.muted });

const results = [
  { num: '65%', color: C.green, label: '内耗频率下降', desc: '从每天多次内耗\n减少到偶尔发生' },
  { num: '↑', color: C.gold, label: '任务启动速度提升', desc: '拖延时间明显缩短\n行动力增强' },
  { num: '↓', color: C.purple, label: '焦虑自评分数降低', desc: '自我报告焦虑水平\n持续下降' },
];

results.forEach((r, i) => {
  const x = 0.7 + i * 2.9;
  s9.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.8, w: 2.7, h: 1.8, fill: { color: C.white, transparency: 20 }, line: { color: 'E0D5C5', width: 0.5 }, rectRadius: 0.15, shadow: makeShadow() });
  s9.addText(r.num, { x, y: 1.9, w: 2.7, h: 0.8, fontSize: 40, fontFace: 'Noto Serif SC', bold: true, color: r.color, align: 'center', valign: 'middle' });
  s9.addText(r.label, { x, y: 2.7, w: 2.7, h: 0.35, fontSize: 13, fontFace: 'Noto Serif SC', bold: true, color: C.ink, align: 'center' });
  s9.addText(r.desc, { x, y: 3.05, w: 2.7, h: 0.5, fontSize: 10, color: C.muted, align: 'center', lineSpacingMultiple: 1.4 });
});

// Quote
s9.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 3.9, w: 8.6, h: 1.2, fill: { color: 'FEF3C7', transparency: 50 }, line: { color: 'FDE68A', width: 0.5 }, rectRadius: 0.12 });
s9.addText('"', { x: 0.9, y: 3.95, w: 0.5, h: 0.5, fontSize: 36, fontFace: 'Noto Serif SC', color: C.gold });
s9.addText('做完 5 步疗愈流程后，我发现自己「来不及了」的想法变少了，开始做事变得更果断了。', { x: 1.4, y: 4.1, w: 7.5, h: 0.4, fontSize: 13, fontFace: 'Noto Serif SC', color: C.ink });
s9.addText('—— 实践参与者反馈', { x: 1.4, y: 4.55, w: 3, h: 0.3, fontSize: 10, color: C.ghost });

// ═══════════════════════════════════════
// Slide 10: 结尾
// ═══════════════════════════════════════
let s10 = pres.addSlide();
s10.background = { color: C.cream };

s10.addShape(pres.shapes.OVAL, { x: 6, y: -1.5, w: 5, h: 5, fill: { color: C.gold, transparency: 90 } });
s10.addShape(pres.shapes.OVAL, { x: -0.5, y: 3.5, w: 2.5, h: 2.5, fill: { color: C.green, transparency: 90 } });
s10.addShape(pres.shapes.OVAL, { x: 0.5, y: 0.3, w: 2, h: 2, fill: { color: C.purple, transparency: 95 } });

s10.addText('直面情绪', { x: 1.5, y: 1.2, w: 7, h: 1, fontSize: 52, fontFace: 'Noto Serif SC', bold: true, color: C.ink, align: 'center' });
s10.addText('向阳而生', { x: 1.5, y: 2.1, w: 7, h: 1, fontSize: 52, fontFace: 'Noto Serif SC', bold: true, color: C.gold, align: 'center' });

s10.addText('让每一个大学生，都能拥有一个温暖的心理健康伙伴', { x: 1.5, y: 3.2, w: 7, h: 0.5, fontSize: 15, color: C.muted, align: 'center' });

s10.addShape(pres.shapes.RECTANGLE, { x: 4.2, y: 3.9, w: 1.6, h: 0.04, fill: { color: C.gold } });

s10.addText('晴愈AI · 心理健康智能伙伴', { x: 1.5, y: 4.1, w: 7, h: 0.35, fontSize: 12, color: C.ghost, align: 'center' });
s10.addText('心晴小队 · 南宁师范大学 · 2026年4月', { x: 1.5, y: 4.5, w: 7, h: 0.3, fontSize: 11, color: C.ghost, align: 'center' });
s10.addText('李悦（组长）  王梓 · 陈曦', { x: 1.5, y: 4.8, w: 7, h: 0.3, fontSize: 10, color: C.ghost, align: 'center' });

// Save
const outPath = '/Users/yuan/项目/Sunny-Recovery-AI/docs/晴愈AI-决赛演示.pptx';
await pres.writeFile({ fileName: outPath });
console.log('PPTX saved to:', outPath);
