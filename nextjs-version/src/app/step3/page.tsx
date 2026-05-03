'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { getCurrent, saveCurrent } from '@/lib/storage';
import { EMOTION_TYPES, BODY_ZONES } from '@/lib/emotion';
import { detectCrisis, getCrisisResponse } from '@/lib/prompt';
import { getApiKey } from '@/lib/storage';
import ProgressBar from '@/components/ProgressBar';

const MAX_ROUNDS = 3;

export default function Step3Page() {
  const [completed, setCompleted] = useState(false);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef<HTMLDivElement | null>(null);
  const streamStartedRef = useRef(false);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const roundCountRef = useRef(0);
  const mountedRef = useRef(false);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    });
  };

  const addLoading = () => {
    removeLoading();
    const container = messagesRef.current;
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-bubble chat-bubble--ai';
    div.id = 'loadingBubble';
    div.innerHTML =
      '<div class="loading-dots"><span></span><span></span><span></span></div>';
    container.appendChild(div);
    loadingRef.current = div;
    scrollToBottom();
  };

  const removeLoading = () => {
    if (loadingRef.current) {
      loadingRef.current.remove();
      loadingRef.current = null;
    }
  };

  const addUserBubble = (text: string) => {
    const container = messagesRef.current;
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-bubble chat-bubble--user';
    div.textContent = text;
    container.appendChild(div);
    scrollToBottom();
  };

  const addAiBubble = (text: string) => {
    const container = messagesRef.current;
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-bubble chat-bubble--ai';
    div.textContent = text;
    container.appendChild(div);
    scrollToBottom();
  };

  const ensureStreamingBubble = () => {
    if (!streamingRef.current) {
      const container = messagesRef.current;
      if (!container) return null;
      const div = document.createElement('div');
      div.className = 'chat-bubble chat-bubble--ai';
      div.innerHTML =
        '<span class="stream-text"></span><span class="typewriter-cursor"></span>';
      container.appendChild(div);
      streamingRef.current = div;
    }
    return streamingRef.current;
  };

  const updateStreamingBubble = (text: string) => {
    if (!streamStartedRef.current) {
      streamStartedRef.current = true;
      removeLoading();
      ensureStreamingBubble();
    }
    const span = streamingRef.current?.querySelector('.stream-text');
    if (span) span.textContent = text;
    scrollToBottom();
  };

  const finalizeStreamingBubble = () => {
    if (streamingRef.current) {
      const cursor = streamingRef.current.querySelector('.typewriter-cursor');
      if (cursor) cursor.remove();
      streamingRef.current = null;
    }
    streamStartedRef.current = false;
  };

  const sendMessage = async () => {
    if (processing) return;
    const text = input.trim();
    if (!text) return;

    // Crisis detection
    if (detectCrisis(text)) {
      addUserBubble(text);
      setInput('');
      setTimeout(() => addAiBubble(getCrisisResponse()), 300);
      return;
    }

    addUserBubble(text);
    setInput('');
    setProcessing(true);

    roundCountRef.current += 1;

    // If we've reached max rounds, do a final non-streaming call
    if (roundCountRef.current >= MAX_ROUNDS) {
      addLoading();
      try {
        const session = getCurrent();
        const messages = buildMessages(session);
        messages.push({ role: 'user', content: text });
        const res = await fetch('/api/cbt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, userApiKey: getApiKey() || undefined }),
        });
        if (!res.ok) throw new Error('API 调用失败');
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let reply = '';
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const d = trimmed.slice(6);
            if (d === '[DONE]') continue;
            try {
              const parsed = JSON.parse(d);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) reply += delta;
            } catch { /* skip */ }
          }
        }
        removeLoading();
        addAiBubble(reply);
        saveCurrent({ aiReply: reply, chatHistory: messages });
      } catch (err: unknown) {
        removeLoading();
        addAiBubble(`出错了：${err instanceof Error ? err.message : String(err)}`);
      }
      setProcessing(false);
      setCompleted(true);
      return;
    }

    // Otherwise streaming
    streamingRef.current = null;
    streamStartedRef.current = false;
    addLoading();

    try {
      const session = getCurrent();
      const messages = buildMessages(session);
      messages.push({ role: 'user', content: text });
      const res = await fetch('/api/cbt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, userApiKey: getApiKey() || undefined }),
      });
      if (!res.ok) throw new Error('API 调用失败');
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let reply = '';
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const d = trimmed.slice(6);
          if (d === '[DONE]') continue;
          try {
            const parsed = JSON.parse(d);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              reply += delta;
              updateStreamingBubble(reply);
            }
          } catch { /* skip */ }
        }
      }
      finalizeStreamingBubble();
      addAiBubble(reply);
      saveCurrent({ aiReply: reply, chatHistory: messages });
    } catch (err: unknown) {
      removeLoading();
      finalizeStreamingBubble();
      addAiBubble(`出错了：${err instanceof Error ? err.message : String(err)}`);
    }
    setProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoResize = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    setInput(el.value);
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px';
  }, []);

  function buildMessages(session: ReturnType<typeof getCurrent>) {
    const msgs: Array<{ role: string; content: string }> = [];
    if (session.chatHistory && session.chatHistory.length > 0) {
      return session.chatHistory;
    }
    return msgs;
  }

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const session = getCurrent();
    const emotionType = session.emotionType || '';
    const bodyZones: string[] = session.bodyZones || [];

    // Build emotion label
    const emotion = EMOTION_TYPES.find((e) => e.id === emotionType);
    const emotionLabel = emotion ? `${emotion.emoji} ${emotion.label}` : '未指定';

    // Build body zone labels
    const zoneLabels = bodyZones
      .map((id) => BODY_ZONES.find((z) => z.id === id)?.label)
      .filter(Boolean)
      .join('、') || '未指定';

    const contextMsg = `我的情绪是${emotionLabel}，强度${session.intensity || 5}/10。${session.emotionText ? '我描述的感受：' + session.emotionText : ''} 身体感受部位：${zoneLabels}。请帮我进行CBT认知对话。`;

    addUserBubble(contextMsg);

    // First AI call (non-streaming via /api/cbt)
    (async () => {
      addLoading();
      try {
        const messages = [{ role: 'user', content: contextMsg }];
        const res = await fetch('/api/cbt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, userApiKey: getApiKey() || undefined }),
        });
        if (!res.ok) throw new Error('API 调用失败');
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let reply = '';
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const d = trimmed.slice(6);
            if (d === '[DONE]') continue;
            try {
              const parsed = JSON.parse(d);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) reply += delta;
            } catch { /* skip */ }
          }
        }
        removeLoading();
        addAiBubble(reply);
        roundCountRef.current = 1;
        saveCurrent({ aiReply: reply, chatHistory: messages });
      } catch (err: unknown) {
        removeLoading();
        addAiBubble(`出错了：${err instanceof Error ? err.message : String(err)}`);
      }
    })();
  }, []);

  return (
    <div className="page page-enter page--chat">
      <div className="progress-bar">
        <ProgressBar step={3} />
      </div>

      <div className="nav-bar">
        <Link href="/" className="btn btn-ghost btn-sm">
          🏠 首页
        </Link>
        <Link href="/step2" className="btn btn-ghost btn-sm">
          ← 上一步
        </Link>
      </div>

      <div className="chat-header">
        <div className="chat-avatar">☀️</div>
        <div>
          <div className="chat-name">晴愈教练</div>
          <div className="chat-status">● 在线陪伴中</div>
        </div>
      </div>

      <div className="chat-messages" ref={messagesRef} />

      {!completed ? (
        <div className="chat-input-bar">
          <textarea
            className="input-line"
            placeholder="说说你的想法..."
            value={input}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            disabled={processing}
            rows={1}
          />
          <button
            className="btn btn-sun btn-sm"
            onClick={sendMessage}
            disabled={processing}
          >
            发送
          </button>
        </div>
      ) : (
        <div className="text-center" style={{ padding: 'var(--sp-8) 0' }}>
          <p className="text-body" style={{ marginBottom: 'var(--sp-6)' }}>
            ✨ 对话已完成，你已经迈出了很重要的一步！
          </p>
          <Link href="/step4" className="btn btn-peach btn-lg">
            进入下一步 →
          </Link>
        </div>
      )}
    </div>
  );
}
