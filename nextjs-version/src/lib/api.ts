/**
 * DeepSeek API 调用封装
 * 兼容 OpenAI Chat Completions 格式，支持流式输出
 */

import { getApiKey } from './storage';

const API_BASE = 'https://api.deepseek.com/v1';
const MODEL = 'deepseek-v4-flash';

export async function callAI(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const key = getApiKey();
  if (!key) throw new Error('请先设置 DeepSeek API Key');

  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.8,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API 调用失败: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function callAIStream(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  onToken: (token: string, full: string) => void
): Promise<string> {
  const key = getApiKey();
  if (!key) throw new Error('请先设置 DeepSeek API Key');

  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.8,
      max_tokens: 500,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API 调用失败: ${response.status} ${err}`);
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
