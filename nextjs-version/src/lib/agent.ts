/**
 * 晴愈AI智能体 — Agent Core
 * 基于标签协议的工具调用循环
 */

import { callAIStream } from './api';
import { AGENT_SYSTEM_PROMPT } from './prompt';
import { PsyMemory } from './memory';
import { getRecords } from './storage';
import { EMOTION_TYPES } from './emotion';
import { PsyTools } from './tools';

export const PsyAgent = {
  messages: [] as Array<{ role: string; content: string }>,
  isProcessing: false,
  maxIterations: 8,
  onToken: null as ((token: string, full: string) => void) | null,
  onToolStart: null as ((name: string, params: Record<string, unknown>) => void) | null,
  onToolEnd: null as ((name: string, result: unknown) => void) | null,
  onMessage: null as ((text: string) => void) | null,
  onError: null as ((msg: string) => void) | null,

  init(callbacks: {
    onToken?: (token: string, full: string) => void;
    onToolStart?: (name: string, params: Record<string, unknown>) => void;
    onToolEnd?: (name: string, result: unknown) => void;
    onMessage?: (text: string) => void;
    onError?: (msg: string) => void;
  } = {}) {
    this.onToken = callbacks.onToken || (() => {});
    this.onToolStart = callbacks.onToolStart || (() => {});
    this.onToolEnd = callbacks.onToolEnd || (() => {});
    this.onMessage = callbacks.onMessage || (() => {});
    this.onError = callbacks.onError || (() => {});
    this.messages = [];
    this.isProcessing = false;
  },

  async send(userText: string) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.messages.push({ role: 'user', content: userText });

    try {
      for (let i = 0; i < this.maxIterations; i++) {
        const systemPrompt = this.buildSystemPrompt();

        let fullReply = '';
        fullReply = await callAIStream(systemPrompt, this.messages, (token, full) => {
          this.onToken?.(token, full);
        });

        const { cleanText, toolCalls } = this.parseToolCalls(fullReply);

        if (toolCalls.length === 0) {
          this.messages.push({ role: 'assistant', content: cleanText });
          this.onMessage?.(cleanText);
          break;
        }

        if (cleanText.trim()) {
          this.messages.push({ role: 'assistant', content: cleanText });
          this.onMessage?.(cleanText);
        }

        let toolResults = '';
        for (const call of toolCalls) {
          this.onToolStart?.(call.name, call.params);
          const result = await PsyTools.execute(call.name, call.params);
          this.onToolEnd?.(call.name, result);
          toolResults += `\n[工具 ${call.name} 的结果]: ${JSON.stringify(result)}`;
        }

        this.messages.push({ role: 'assistant', content: fullReply });
        this.messages.push({
          role: 'user',
          content: `[系统工具执行结果]${toolResults}\n请根据以上工具结果继续回复用户。`,
        });
      }
    } catch (err) {
      this.onError?.((err as Error).message);
    }

    this.isProcessing = false;
  },

  buildSystemPrompt(): string {
    const memoryContext = PsyMemory.getContextString();
    const records = getRecords();
    const recentRecords = records.slice(-5);

    let historyContext = '';
    if (recentRecords.length > 0) {
      historyContext = '\n\n## 用户近期情绪记录\n';
      recentRecords.forEach((r) => {
        const emo = EMOTION_TYPES.find((e) => e.id === r.emotionType);
        const d = new Date(r.timestamp);
        historyContext += `- ${d.getMonth() + 1}/${d.getDate()}: ${emo?.label || '未知'} 强度${r.intensityBefore || '?'}→${r.intensityAfter || '?'}`;
        if (r.emotionText) historyContext += ` "${r.emotionText.slice(0, 30)}"`;
        historyContext += '\n';
      });
    }

    return AGENT_SYSTEM_PROMPT.replace(
      '{{MEMORY_CONTEXT}}',
      memoryContext || '（暂无记忆）'
    ).replace('{{HISTORY_CONTEXT}}', historyContext || '（暂无历史记录）');
  },

  parseToolCalls(text: string) {
    const calls: Array<{ name: string; params: Record<string, unknown> }> = [];
    const regex = /<tool\s+name="([^"]+)"(?:\s+params='([^']*)')?>/g;
    let match;
    let cleanText = text;

    while ((match = regex.exec(text)) !== null) {
      const name = match[1];
      let params = {};
      try {
        params = match[2] ? JSON.parse(match[2]) : {};
      } catch {
        params = {};
      }
      calls.push({ name, params });
      cleanText = cleanText.replace(match[0], '');
    }

    return { cleanText, toolCalls: calls };
  },

  clearChat() {
    this.messages = [];
  },
};
