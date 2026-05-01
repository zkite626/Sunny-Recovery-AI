/**
 * 晴愈AI智能体 — Agent Core
 * 通过 API Route 代理的工具调用循环
 */

import { getApiKey, getRecords } from './storage';
import { PsyMemory } from './memory';
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
        const { memoryContext, historyContext } = this.buildContext();
        const userApiKey = getApiKey() || undefined;

        const response = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: this.messages,
            memoryContext,
            historyContext,
            userApiKey,
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(err.error || `API 调用失败: ${response.status}`);
        }

        // 解析 SSE 流
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let cleanText = '';
        let toolCalls: Array<{ name: string; params: Record<string, unknown> }> = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            try {
              const event = JSON.parse(data);
              if (event.type === 'token') {
                this.onToken?.(event.text, '');
              } else if (event.type === 'done') {
                cleanText = event.cleanText;
                toolCalls = event.toolCalls;
              }
            } catch {
              // skip
            }
          }
        }

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

        this.messages.push({ role: 'assistant', content: cleanText });
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

  buildContext() {
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

    return {
      memoryContext: memoryContext || '（暂无记忆）',
      historyContext: historyContext || '（暂无历史记录）',
    };
  },

  clearChat() {
    this.messages = [];
  },
};
