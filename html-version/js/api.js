/**
 * DeepSeek API 调用封装
 * 兼容 OpenAI Chat Completions 格式，支持流式输出
 */

const API_KEY = localStorage.getItem('API_KEY') || '';

const API_BASE = 'https://api.deepseek.com/v1';
const MODEL = 'deepseek-v4-flash';

/**
 * 设置 API Key（首次使用时调用）
 */
function setApiKey(key) {
  localStorage.setItem('API_KEY', key);
}

/**
 * 获取 API Key
 */
function getApiKey() {
  return localStorage.getItem('API_KEY') || '';
}

/**
 * 调用 DeepSeek API（非流式）
 * @param {string} systemPrompt - 系统提示词
 * @param {Array} messages - 对话历史 [{role, content}]
 * @returns {Promise<string>} AI 回复文本
 */
async function callAI(systemPrompt, messages) {
  const key = getApiKey();
  if (!key) throw new Error('请先设置 DeepSeek API Key');

  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API 调用失败: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * 调用 DeepSeek API（流式输出）
 * @param {string} systemPrompt - 系统提示词
 * @param {Array} messages - 对话历史
 * @param {function} onToken - 每收到一个 token 时回调 (text)
 * @returns {Promise<string>} 完整回复文本
 */
async function callAIStream(systemPrompt, messages, onToken) {
  const key = getApiKey();
  if (!key) throw new Error('请先设置 DeepSeek API Key');

  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 1024,
      stream: true
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API 调用失败: ${response.status} ${err}`);
  }

  const reader = response.body.getReader();
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
          if (onToken) onToken(delta, fullText);
        }
      } catch (e) {
        // skip malformed chunks
      }
    }
  }

  return fullText;
}
