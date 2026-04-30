# 晴愈AI — 心理健康智能伙伴（0.1.0）

基于 AI + 认知行为疗法(CBT) 的大学生心理健康辅助工具。

## 功能模块

| 模块 | 文件 | 说明 |
|------|------|------|
| AI智能对话 | `chat.html` | 智能体根据情绪自主调用工具，支持记忆和多轮对话 |
| 情绪疗愈 | `step1-5.html` | 4步引导流程：情绪输入→身体扫描→AI对话→文学安慰→情绪卡片 |
| 心理测评 | `assessment.html` | PHQ-9抑郁筛查 / GAD-7焦虑筛查，AI分析报告 |
| 正念呼吸 | `breathe.html` | 3种呼吸引导（4-7-8/方形/共振），动画可视化 |
| 感恩日记 | `gratitude.html` | 每天记录3件感恩的事 |
| 情绪记录 | `dashboard.html` | 情绪变化趋势图、历史记录 |
| 情绪卡片 | `step5.html` | 生成专属情绪疗愈卡片，支持保存为图片 |

## 技术架构

```
├── index.html          # 模块功能中心首页
├── chat.html           # 智能体对话页
├── assessment.html     # 心理测评页
├── breathe.html        # 正念呼吸页
├── gratitude.html      # 感恩日记页
├── dashboard.html      # 情绪记录页
├── step1-5.html        # 情绪疗愈流程
├── css/
│   └── style.css       # 设计系统（暖阳治愈风）
└── js/
    ├── agent.js        # 智能体核心（工具调用循环）
    ├── tools.js        # 工具注册表（10个工具）
    ├── memory.js       # 跨会话记忆系统
    ├── prompt.js       # 提示词系统 + 量表数据
    ├── api.js          # DeepSeek API 封装
    ├── storage.js      # localStorage 持久化
    ├── emotion.js      # 情绪数据模型
    └── card.js         # 情绪卡片 Canvas 生成
```

## 智能体工具

| 工具 | 说明 |
|------|------|
| `deepseek-v4-flash` | DeepSeek最新款大模型 |
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

## 使用方式

1. 直接用浏览器打开 `index.html` 即可使用
2. 需要 DeepSeek API Key（在首页设置）
3. 所有数据保存在浏览器 localStorage，不上传服务器

## 心理学原理

- **认知行为疗法(CBT)**：识别5种思维陷阱，完成认知重构
- **正念减压**：呼吸练习帮助调节自主神经系统
- **积极心理学**：感恩练习提升幸福感
- **情绪聚焦疗法**：身体扫描觉察情绪的身体感受
- **文学疗愈**：通过诗意文字获得情感共鸣和安慰

## 安全声明

本工具仅供情绪觉察与自我探索参考，不能替代专业心理咨询。
如遇严重心理困扰，请联系学校心理咨询中心或拨打：
- 24小时心理援助热线：400-161-9995
- 生命热线：400-821-1215
