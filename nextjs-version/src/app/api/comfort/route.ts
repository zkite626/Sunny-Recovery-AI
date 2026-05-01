import { NextRequest } from 'next/server';
import { resolveApiKey, buildPayload, fetchDeepSeek } from '@/lib/server-api';
import { LITERATURE_SYSTEM_PROMPT } from '@/lib/prompt';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { context, userApiKey } = body as { context: string; userApiKey?: string };

    const apiKey = resolveApiKey(userApiKey);
    const payload = buildPayload(LITERATURE_SYSTEM_PROMPT, [
      { role: 'user', content: context },
    ], { stream: false, maxTokens: 500 });
    const response = await fetchDeepSeek(payload, apiKey);

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: `API 调用失败: ${response.status} ${err}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return Response.json({ text });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
