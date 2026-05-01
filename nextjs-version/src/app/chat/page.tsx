'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import ApiKeyModal from '@/components/ApiKeyModal';
import { PsyAgent } from '@/lib/agent';
import { PsyMemory } from '@/lib/memory';
import { getRecords } from '@/lib/storage';
import { detectCrisis, getCrisisResponse } from '@/lib/prompt';

interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  text: string;
}

const TOOL_LABELS: Record<string, string> = {
  body_scan: '🫁 正在启动身体扫描...',
  generate_card: '🎨 正在生成情绪卡片...',
  generate_comfort: '📝 正在书写治愈文字...',
  start_breathing: '🫁 正在启动呼吸引导...',
  run_assessment: '📊 正在加载心理测评...',
  save_gratitude: '🌿 正在保存感恩日记...',
  save_memory: '💾 正在保存记忆...',
  read_memory: '📖 正在读取记忆...',
  show_history: '📈 正在查看历史...',
  quick_mood: '🌱 正在记录情绪...',
};

function showToast(msg: string) {
  let toast = document.querySelector('.toast') as HTMLDivElement | null;
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef<HTMLDivElement | null>(null);
  const streamStartedRef = useRef(false);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const toolRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    });
  }, []);

  const addBubble = useCallback(
    (role: 'user' | 'ai', text: string) => {
      setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role, text }]);
      setTimeout(scrollToBottom, 50);
    },
    [scrollToBottom]
  );

  const addLoading = useCallback(
    (scroll?: boolean) => {
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
      if (scroll !== false) scrollToBottom();
    },
    [scrollToBottom]
  );

  const removeLoading = useCallback(() => {
    if (loadingRef.current) {
      loadingRef.current.remove();
      loadingRef.current = null;
    }
  }, []);

  const ensureStreamingBubble = useCallback(() => {
    if (!streamingRef.current) {
      const container = messagesRef.current;
      if (!container) return;
      const div = document.createElement('div');
      div.className = 'chat-bubble chat-bubble--ai';
      div.innerHTML =
        '<span class="stream-text"></span><span class="typewriter-cursor"></span>';
      container.appendChild(div);
      streamingRef.current = div;
    }
    return streamingRef.current;
  }, []);

  const updateStreamingBubble = useCallback(
    (text: string) => {
      if (!streamStartedRef.current) {
        streamStartedRef.current = true;
        removeLoading();
        ensureStreamingBubble();
      }
      const span = streamingRef.current?.querySelector('.stream-text');
      if (span) span.textContent = text;
      scrollToBottom();
    },
    [removeLoading, ensureStreamingBubble, scrollToBottom]
  );

  const finalizeStreamingBubble = useCallback(() => {
    if (streamingRef.current) {
      const cursor = streamingRef.current.querySelector('.typewriter-cursor');
      if (cursor) cursor.remove();
      streamingRef.current = null;
    }
    streamStartedRef.current = false;
  }, []);

  const showToolIndicator = useCallback(
    (name: string) => {
      removeToolIndicator();
      const container = messagesRef.current;
      if (!container) return;
      const div = document.createElement('div');
      div.className = 'tool-indicator';
      div.id = 'toolIndicator';
      div.innerHTML = `<div class="spinner"></div> ${TOOL_LABELS[name] || '正在处理...'}`;
      container.appendChild(div);
      toolRef.current = div;
      scrollToBottom();
    },
    [scrollToBottom]
  );

  const removeToolIndicator = useCallback(() => {
    if (toolRef.current) {
      toolRef.current.remove();
      toolRef.current = null;
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (processing) return;
    const text = input.trim();
    if (!text) return;

    if (detectCrisis(text)) {
      addBubble('user', text);
      setInput('');
      setTimeout(() => addBubble('ai', getCrisisResponse()), 300);
      return;
    }

    addBubble('user', text);
    setInput('');
    setProcessing(true);

    addLoading();
    streamingRef.current = null;
    streamStartedRef.current = false;

    await PsyAgent.send(text);

    setProcessing(false);
  }, [processing, input, addBubble, addLoading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    PsyAgent.init({
      onToken(_token: string, full: string) {
        updateStreamingBubble(full);
      },
      onMessage(_text: string) {
        finalizeStreamingBubble();
      },
      onToolStart(name: string) {
        showToolIndicator(name);
      },
      onToolEnd() {
        removeToolIndicator();
      },
      onError(msg: string) {
        removeLoading();
        finalizeStreamingBubble();
        addBubble('ai', `出错了：${msg}`);
      },
    });

    // Welcome message incorporating memory and past records
    const records = getRecords();
    const memory = PsyMemory.recent(3);
    let welcome = '你好呀 👋 我是晴愈，你的心理健康伙伴。';

    if (memory.length > 0) {
      const last = memory[memory.length - 1];
      welcome += `我记得上次你说过：「${last.content.slice(0, 20)}...」。最近怎么样？`;
    } else if (records.length > 0) {
      welcome += '我看到你之前做过情绪记录，想聊聊最近的感受吗？';
    } else {
      welcome += '有什么想和我聊的吗？心情、压力、困惑都可以 ☀️';
    }

    addBubble('ai', welcome);
  }, [
    addBubble,
    updateStreamingBubble,
    finalizeStreamingBubble,
    showToolIndicator,
    removeToolIndicator,
    removeLoading,
  ]);

  return (
    <div className="page page-enter page--chat">
      {/* Navigation */}
      <div className="nav-bar">
        <Link href="/" className="btn btn-ghost btn-sm">
          🏠 首页
        </Link>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setApiKeyModalOpen(true)}
        >
          🔑 API Key
        </button>
      </div>

      {/* Chat header */}
      <div className="chat-header">
        <div className="chat-avatar">☀️</div>
        <div>
          <div className="chat-name">晴愈</div>
          <div className="chat-status">● 心理健康智能伙伴</div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="chat-messages" ref={messagesRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble chat-bubble--${msg.role}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="chat-input-bar">
        <input
          type="text"
          className="input-line"
          placeholder="说说你的感受..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          disabled={processing}
        />
        <button
          className="btn btn-sun btn-sm"
          onClick={handleSend}
          disabled={processing}
        >
          发送
        </button>
      </div>

      {/* API Key Modal (inline trigger version) */}
      {apiKeyModalOpen && (
        <div
          className="modal-overlay open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setApiKeyModalOpen(false);
          }}
        >
          <ApiKeyModal />
        </div>
      )}
    </div>
  );
}
