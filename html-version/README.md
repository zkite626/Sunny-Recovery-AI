<p align="center">
  <img src="logo.png" alt="晴愈AI" width="280">
</p>

# 晴愈AI — HTML 版

纯静态 HTML + CSS + JavaScript 实现，无需构建工具，浏览器直接打开即可使用。

## 快速开始

1. 用浏览器打开 `index.html`
2. 在首页设置 DeepSeek API Key（可选，服务器已配置默认 Key）
3. 开始使用

## 文件结构

```
├── index.html          # 首页模块中心
├── chat.html           # AI智能对话（智能体工具调用）
├── step1.html          # 步骤1：情绪输入
├── step2.html          # 步骤2：身体扫描
├── step3.html          # 步骤3：AI CBT对话
├── step4.html          # 步骤4：文学安慰
├── step5.html          # 步骤5：情绪卡片生成
├── assessment.html     # 心理测评（PHQ-9 / GAD-7）
├── breathe.html        # 正念呼吸练习
├── gratitude.html      # 感恩日记
├── dashboard.html      # 情绪记录仪表盘
├── calm.html           # 沉浸式流场粒子互动
├── meditation.html     # AI 正念冥想引导
├── art.html            # 情绪涂鸦 / 艺术疗愈
├── calendar.html       # 情绪日历 + 打卡成就
├── css/
│   └── style.css       # 设计系统（暖阳治愈风）
└── js/
    ├── agent.js        # 智能体核心（工具调用循环）
    ├── api.js          # DeepSeek API 封装
    ├── card.js         # Canvas 情绪卡片生成
    ├── dashboard.js    # Chart.js 课堂看板
    ├── emotion.js      # 情绪/身体/思维陷阱数据模型
    ├── memory.js       # 跨会话记忆系统
    ├── prompt.js       # 提示词系统 + 量表数据
    ├── storage.js      # localStorage 持久化
    └── tools.js        # 智能体工具注册表（14种工具）
```

## 技术栈

- 纯 HTML5 / CSS3 / ES6+
- Google Fonts (Noto Serif SC, ZCOOL XiaoWei)
- Chart.js 4.4.4（情绪趋势图）
- DeepSeek V4 Flash API

## 特点

- 零依赖，无需 npm / 构建工具
- 所有数据保存在浏览器 localStorage
- 完整的暖阳治愈风设计系统
- 响应式布局（移动端适配 + 底部导航）
- 新增数字媒体艺术功能（粒子互动、冥想、涂鸦、日历）
