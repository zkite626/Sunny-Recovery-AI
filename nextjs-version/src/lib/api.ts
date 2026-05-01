/**
 * API 调用封装 — 通过 Next.js API Route 代理
 */

import { getApiKey } from './storage';

export async function callAI(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const userApiKey = getApiKey() || undefined;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, messages, userApiKey, stream: false }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || `API 调用失败: ${response.status}`);
  }

  // 读取 SSE 流并收集完整文本
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

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
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) fullText += delta;
      } catch {
        // skip malformed chunks
      }
    }
  }

  return fullText;
}

export async function callAIStream(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  onToken: (token: string, full: string) => void
): Promise<string> {
  const userApiKey = getApiKey() || undefined;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, messages, userApiKey }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || `API 调用失败: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

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
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          onToken(delta, fullText);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  return fullText;
}
