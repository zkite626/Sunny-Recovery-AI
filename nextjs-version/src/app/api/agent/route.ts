import { NextRequest } from 'next/server';
import { resolveApiKey, buildPayload, fetchDeepSeek } from '@/lib/server-api';
import { AGENT_SYSTEM_PROMPT } from '@/lib/prompt';
import type { ChatMessage } from '@/lib/server-api';

export const runtime = 'nodejs';

interface ToolCall {
  name: string;
  params: Record<string, unknown>;
}

function parseToolCalls(text: string): { cleanText: string; toolCalls: ToolCall[] } {
  const calls: ToolCall[] = [];
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
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, memoryContext, historyContext, userApiKey } = body as {
      messages: ChatMessage[];
      memoryContext?: string;
      historyContext?: string;
      userApiKey?: string;
    };

    const systemPrompt = AGENT_SYSTEM_PROMPT
      .replace('{{MEMORY_CONTEXT}}', memoryContext || '（暂无记忆）')
      .replace('{{HISTORY_CONTEXT}}', historyContext || '（暂无历史记录）');

    const apiKey = resolveApiKey(userApiKey);
    const payload = buildPayload(systemPrompt, messages, { stream: true });
    const response = await fetchDeepSeek(payload, apiKey);

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: `API 调用失败: ${response.status} ${err}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 读取完整流式响应并解析工具调用
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
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
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', text: delta })}\n\n`));
                }
              } catch {
                // skip malformed chunks
              }
            }
          }

          // 流结束后解析工具调用
          const { cleanText, toolCalls } = parseToolCalls(fullText);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', cleanText, toolCalls })}\n\n`));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
