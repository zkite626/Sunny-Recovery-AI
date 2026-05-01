<p align="center">
  <img src="/assets/logo.png" alt="晴愈AI" width="280">
</p>

# 晴愈AI — 大学生心理健康智能伙伴（0.3.0）

基于 AI + 认知行为疗法(CBT) 的大学生心理健康辅助工具。帮助学生觉察情绪、识别思维陷阱、完成认知重构。

## 项目版本

| 版本 | 目录 | 说明 |
|------|------|------|
| **HTML 版** | [`html-version/`](html-version/) | 纯静态 HTML/CSS/JS，浏览器直接打开 |
| **Next.js 版** | [`nextjs-version/`](nextjs-version/) | Next.js 16 + TypeScript + Tailwind CSS |

## 核心功能

| 模块 | 说明 |
|------|------|
| AI智能对话 | 基于智能体架构，AI 自主调用 14 种工具，支持记忆和多轮对话 |
| 情绪疗愈 | 5步引导流程：情绪输入 → 身体扫描 → AI对话 → 文学安慰 → 情绪卡片 |
| 心理测评 | PHQ-9 抑郁筛查 / GAD-7 焦虑筛查，支持 AI 分析报告 |
| 正念呼吸 | 3种呼吸引导（4-7-8 / 方形 / 共振），动画可视化 |
| 感恩日记 | 每天记录 3 件感恩的事 |
| 情绪记录 | Chart.js 趋势图，回顾疗愈旅程 |
| 情绪卡片 | Canvas 生成专属疗愈卡片，支持保存为图片 |
| **沉浸式互动** | 手势/触摸驱动的 Flow Field 粒子系统，4种情绪主题 |
| **AI 正念冥想** | 4种冥想类型 + 呼吸动画 + 环境音（雨声/海浪/森林）+ AI引导 |
| **情绪涂鸦** | 4种画笔（水彩/油画/蜡笔/铅笔）+ AI 色绪分析 + 画廊 |
| **情绪日历** | 日历可视化 + 连续打卡 + 8个成就徽章 + 月度分布 |

## 心理学原理

- **认知行为疗法 (CBT)**：识别 5 种思维陷阱，完成认知重构
- **正念减压**：呼吸练习调节自主神经系统，AI引导冥想
- **积极心理学**：感恩练习提升幸福感，打卡激励正向循环
- **情绪聚焦疗法**：身体扫描觉察情绪的身体感受
- **文学疗愈**：通过诗意文字获得情感共鸣和安慰
- **艺术疗愈**：通过绘画表达和释放情绪，AI共情解读

## 快速使用

### HTML 版
```bash
# 直接用浏览器打开
open html-version/index.html
```

### Next.js 版
```bash
cd nextjs-version
cp .env.example .env.local  # 填入 DeepSeek API Key
npm install
npm run dev
```

## 技术架构

```
晴愈AI
├── 前端界面（暖阳治愈风设计系统，响应式适配）
├── Next.js API Route 代理（保护 API Key）
├── 智能体引擎（工具调用循环 + 记忆系统）
├── DeepSeek V4 Flash API
├── 数字媒体艺术（p5.js 流场粒子 / Canvas 绘画 / Web Audio 环境音）
├── 心理学数据模型（情绪/身体/思维陷阱）
└── 本地存储（localStorage，隐私优先）
```

### 智能体工具（14种）

| 工具 | 说明 |
|------|------|
| `quick_mood` | 快速记录当前情绪 |
| `body_scan` | 引导身体扫描 |
| `start_breathing` | 启动正念呼吸 |
| `run_assessment` | 运行心理测评 |
| `generate_comfort` | 生成文学安慰 |
| `generate_card` | 生成情绪卡片 |
| `save_gratitude` | 保存感恩日记 |
| `save_memory` | 保存长期记忆 |
| `read_memory` | 读取记忆 |
| `show_history` | 查看情绪历史 |
| `start_meditation` | 引导正念冥想 |
| `start_art` | 引导情绪涂鸦 |
| `start_calm` | 引导沉浸式粒子互动 |
| `show_calendar` | 查看情绪日历 |

## 配置说明

### 环境变量（Next.js 版）

```env
API_KEY=sk-your-key-here    # 必填
BASE_URL=https://api.deepseek.com/v1  # 可选
MODEL=deepseek-v4-flash     # 可选
```

API Key 优先从 `.env.local` 读取，用户也可在前端输入自己的 Key 覆盖。

### 新增依赖

```
p5                        # 流场粒子系统（~800KB，动态导入）
@mediapipe/tasks-vision   # 手势追踪（~4MB WASM，动态导入）
chart.js                  # 数据可视化
```

## 使用方式

1. 配置 `.env.local` 或在首页设置 API Key
2. 所有数据保存在浏览器 localStorage，不上传服务器
3. 移动端自适应，支持底部导航栏和触摸手势

## 安全声明

本工具仅供情绪觉察与自我探索参考，不能替代专业心理咨询。
如遇严重心理困扰，请联系学校心理咨询中心或拨打：
- 24小时心理援助热线：400-161-9995
- 生命热线：400-821-1215

## 方案文档

详见 [`docs/`](docs/) 目录下的方案设计文档和演示文稿。
