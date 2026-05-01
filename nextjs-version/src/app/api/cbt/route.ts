import { NextRequest } from 'next/server';
import { resolveApiKey, buildPayload, fetchDeepSeek } from '@/lib/server-api';
import { CBT_SYSTEM_PROMPT } from '@/lib/prompt';
import type { ChatMessage } from '@/lib/server-api';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, temperature, maxTokens, userApiKey } = body as {
      messages: ChatMessage[];
      temperature?: number;
      maxTokens?: number;
      userApiKey?: string;
    };

    const apiKey = resolveApiKey(userApiKey);
    const payload = buildPayload(CBT_SYSTEM_PROMPT, messages, { temperature, maxTokens, stream: true });
    const response = await fetchDeepSeek(payload, apiKey);

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: `API 调用失败: ${response.status} ${err}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
