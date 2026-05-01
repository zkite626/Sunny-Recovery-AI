# 晴愈AI — Next.js 版

基于 Next.js App Router + TypeScript + Tailwind CSS 的版本，保留全部功能。

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + 自定义设计系统 (globals.css)
- **图表**: Chart.js 4
- **AI**: DeepSeek V4 Flash API

## 项目结构

```
src/
├── app/
│   ├── layout.tsx        # 根布局
│   ├── page.tsx          # 首页
│   ├── globals.css       # 全局样式（暖阳治愈风设计系统）
│   ├── chat/page.tsx     # AI智能对话
│   ├── step1/page.tsx    # 情绪输入
│   ├── step2/page.tsx    # 身体扫描
│   ├── step3/page.tsx    # AI CBT对话
│   ├── step4/page.tsx    # 文学安慰
│   ├── step5/page.tsx    # 情绪卡片
│   ├── assessment/page.tsx  # 心理测评
│   ├── breathe/page.tsx  # 正念呼吸
│   ├── gratitude/page.tsx   # 感恩日记
│   └── dashboard/page.tsx   # 情绪记录
├── components/
│   ├── Background.tsx    # 阳光背景动画
│   ├── Nav.tsx           # 导航栏
│   ├── ApiKeyModal.tsx   # API Key 设置弹窗
│   ├── ProgressBar.tsx   # 步骤进度条
│   └── Toast.tsx         # Toast 提示
└── lib/
    ├── agent.ts          # 智能体核心
    ├── api.ts            # DeepSeek API 封装
    ├── card.ts           # Canvas 情绪卡片
    ├── emotion.ts        # 情绪数据模型
    ├── memory.ts         # 跨会话记忆
    ├── prompt.ts         # 提示词系统
    ├── storage.ts        # localStorage 持久化
    └── tools.ts          # 智能体工具注册表
```

## 部署

```bash
npm run build
npm start
```

支持部署到 Vercel、Netlify 等平台。
