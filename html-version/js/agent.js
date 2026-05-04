/**
 * 晴愈AI智能体 — Agent Core
 * 基于标签协议的工具调用循环
 */

const PsyAgent = {
  messages: [],
  isProcessing: false,
  maxIterations: 8,
  onToken: null,
  onToolStart: null,
  onToolEnd: null,
  onMessage: null,
  onError: null,

  /**
   * 初始化智能体，加载记忆上下文
   */
  init(callbacks = {}) {
    this.onToken = callbacks.onToken || (() => {});
    this.onToolStart = callbacks.onToolStart || (() => {});
    this.onToolEnd = callbacks.onToolEnd || (() => {});
    this.onMessage = callbacks.onMessage || (() => {});
    this.onError = callbacks.onError || (() => {});
    this.messages = [];
    this.isProcessing = false;
  },

  /**
   * 发送用户消息，启动智能体循环
   */
  async send(userText) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.messages.push({ role: 'user', content: userText });

    try {
      for (let i = 0; i < this.maxIterations; i++) {
        // 构建系统提示词（含记忆上下文）
        const systemPrompt = this.buildSystemPrompt();

        // 流式调用LLM
        let fullReply = '';
        fullReply = await callAIStream(systemPrompt, this.messages, (token, full) => {
          this.onToken(token, full);
        });

        // 检测工具调用
        const { cleanText, toolCalls } = this.parseToolCalls(fullReply);

        if (toolCalls.length === 0) {
          // 无工具调用，这是最终回复
          this.messages.push({ role: 'assistant', content: cleanText });
          this.onMessage(cleanText, true);
          break;
        }

        // 有工具调用：先显示非工具部分
        if (cleanText.trim()) {
          this.messages.push({ role: 'assistant', content: cleanText });
          this.onMessage(cleanText, false);
        }

        // 执行所有工具
        let toolResults = '';
        for (const call of toolCalls) {
          this.onToolStart(call.name, call.params);
          const result = await PsyTools.execute(call.name, call.params);
          this.onToolEnd(call.name, result);
          toolResults += `\n[工具 ${call.name} 的结果]: ${JSON.stringify(result)}`;
        }

        // 将工具结果反馈给LLM
        this.messages.push({
          role: 'assistant',
          content: fullReply
        });
        this.messages.push({
          role: 'user',
          content: `[系统工具执行结果]${toolResults}\n请根据以上工具结果继续回复用户。`
        });
      }
    } catch (err) {
      this.onError(err.message);
    }

    this.isProcessing = false;
  },

  /**
   * 构建包含记忆上下文的系统提示词
   */
  buildSystemPrompt() {
    const memoryContext = PsyMemory.getContextString();
    const records = getRecords();
    const recentRecords = records.slice(-5);

    let historyContext = '';
    if (recentRecords.length > 0) {
      historyContext = '\n\n## 用户近期情绪记录\n';
      recentRecords.forEach(r => {
        const emo = EMOTION_TYPES.find(e => e.id === r.emotionType);
        const d = new Date(r.timestamp);
        historyContext += `- ${d.getMonth()+1}/${d.getDate()}: ${emo?.label || '未知'} 强度${r.intensityBefore||'?'}→${r.intensityAfter||'?'}`;
        if (r.emotionText) historyContext += ` "${r.emotionText.slice(0,30)}"`;
        historyContext += '\n';
      });
    }

    return AGENT_SYSTEM_PROMPT
      .replace('{{MEMORY_CONTEXT}}', memoryContext || '（暂无记忆）')
      .replace('{{HISTORY_CONTEXT}}', historyContext || '（暂无历史记录）');
  },

  /**
   * 从LLM回复中解析工具调用标签
   */
  parseToolCalls(text) {
    const calls = [];
    const regex = /<tool\s+name="([^"]+)"(?:\s+params='([^']*)')?>/g;
    let match;
    let cleanText = text;

    while ((match = regex.exec(text)) !== null) {
      const name = match[1];
      let params = {};
      try {
        params = match[2] ? JSON.parse(match[2]) : {};
      } catch (e) {
        params = {};
      }
      calls.push({ name, params });
      cleanText = cleanText.replace(match[0], '');
    }

    return { cleanText, toolCalls: calls };
  },

  /**
   * 清除对话历史（保留记忆）
   */
  clearChat() {
    this.messages = [];
  }
};
