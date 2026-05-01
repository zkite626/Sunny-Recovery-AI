import { NextRequest } from 'next/server';
import { resolveApiKey, buildPayload, fetchDeepSeek } from '@/lib/server-api';
import { ASSESSMENT_ANALYSIS_PROMPT } from '@/lib/prompt';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, score, maxScore, level, answers, userApiKey } = body as {
      type: string;
      score: number;
      maxScore: number;
      level: string;
      answers: number[];
      userApiKey?: string;
    };

    const typeName = type === 'phq9' ? 'PHQ-9 抑郁筛查' : 'GAD-7 焦虑筛查';
    const userContent = `量表：${typeName}\n总分：${score}/${maxScore}\n等级：${level}\n作答详情：${JSON.stringify(answers)}`;

    const apiKey = resolveApiKey(userApiKey);
    const payload = buildPayload(ASSESSMENT_ANALYSIS_PROMPT, [
      { role: 'user', content: userContent },
    ], { stream: false, maxTokens: 800 });
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
