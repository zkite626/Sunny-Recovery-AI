/**
 * 服务端 API 工具库 — 仅供 API Route 使用
 */

export interface ChatMessage {
  role: string;
  content: string;
}

export function resolveApiKey(userKey?: string): string {
  const key = userKey || process.env.API_KEY;
  if (!key) throw new Error('未配置 DeepSeek API Key：请在 .env.local 中设置 API_KEY 或在前端输入');
  return key;
}

export function getModel(): string {
  return process.env.MODEL || 'deepseek-v4-flash';
}

export function getBaseUrl(): string {
  return process.env.BASE_URL || 'https://api.deepseek.com/v1';
}

export function buildPayload(
  systemPrompt: string,
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number; stream?: boolean } = {}
) {
  return {
    model: getModel(),
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: opts.temperature ?? 0.8,
    max_tokens: opts.maxTokens ?? 1024,
    stream: opts.stream ?? false,
  };
}

export async function fetchDeepSeek(payload: object, apiKey: string): Promise<Response> {
  return fetch(`${getBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
}
