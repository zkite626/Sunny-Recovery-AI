'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrent, saveCurrent } from '@/lib/storage';
import { EMOTION_TYPES } from '@/lib/emotion';
import { getApiKey } from '@/lib/storage';
import ProgressBar from '@/components/ProgressBar';

export default function Step4Page() {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [literaryText, setLiteraryText] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const charsRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const mountedRef = useRef(false);

  const showToastMessage = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const animateChars = useCallback((text: string) => {
    const container = charsRef.current;
    if (!container) return;
    container.innerHTML = '';

    const chars = text.split('');
    let i = 0;

    const addNext = () => {
      if (i >= chars.length) return;
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = chars[i];
      span.style.animationDelay = `${i * 0.03}s`;
      container.appendChild(span);
      i++;
      animFrameRef.current = requestAnimationFrame(addNext);
    };

    animFrameRef.current = requestAnimationFrame(addNext);
  }, []);

  const generateLiterary = useCallback(async () => {
    setLoading(true);
    setLoaded(false);
    setError('');
    setLiteraryText('');

    try {
      const session = getCurrent();
      const emotion = EMOTION_TYPES.find((e) => e.id === session.emotionType);
      const emotionLabel = emotion ? `${emotion.emoji} ${emotion.label}` : '未指定';
      const intensity = session.intensity || 5;
      const description = session.emotionText || '';
      const aiReply = session.aiReply || '';

      const context = [
        `情绪：${emotionLabel}`,
        `强度：${intensity}/10`,
        description ? `描述：${description}` : '',
        aiReply ? `对话摘要：${aiReply.slice(0, 200)}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const res = await fetch('/api/comfort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, userApiKey: getApiKey() || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'API 调用失败' }));
        throw new Error(err.error || 'API 调用失败');
      }
      const data = await res.json();
      const text = data.text;

      setLiteraryText(text);
      setLoaded(true);
      setLoading(false);
      saveCurrent({ literaryText: text });

      // Defer animation to next frame so DOM is ready
      requestAnimationFrame(() => animateChars(text));
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [animateChars]);

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(literaryText);
      showToastMessage();
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = literaryText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToastMessage();
    }
  }, [literaryText]);

  const saveAsImage = useCallback(async () => {
    const card = document.querySelector('.literary-card') as HTMLElement;
    if (!card) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(card, {
        backgroundColor: '#fdf6ec',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = '晴愈-文学安慰.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // html2canvas not available, fallback to copy
      copyText();
    }
  }, [copyText]);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const session = getCurrent();
    if (session.literaryText) {
      setLiteraryText(session.literaryText);
      setLoaded(true);
      requestAnimationFrame(() => animateChars(session.literaryText!));
    } else {
      generateLiterary();
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [generateLiterary, animateChars]);

  return (
    <div className="page page-enter">
      <ProgressBar step={4} />

      <div className="nav-bar">
        <Link href="/" className="btn btn-ghost btn-sm">
          🏠 首页
        </Link>
        <Link href="/step3" className="btn btn-ghost btn-sm">
          ← 上一步
        </Link>
      </div>

      <div className="section text-center">
        <h2 className="heading-section">送你一段文字</h2>
        <p className="text-body" style={{ marginBottom: 'var(--sp-8)' }}>
          用温暖的文字，陪伴此刻的你
        </p>

        {/* Loading State */}
        {loading && (
          <div
            className="glass"
            style={{
              padding: 'var(--sp-12) var(--sp-6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--sp-4)',
            }}
          >
            <div className="spinner" />
            <p className="text-body">正在为你书写...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass" style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
            <p className="text-body" style={{ color: 'var(--coral)', marginBottom: 'var(--sp-4)' }}>
              {error}
            </p>
            <button className="btn btn-sun btn-lg" onClick={generateLiterary}>
              重新生成
            </button>
          </div>
        )}

        {/* Literary Content */}
        {loaded && !loading && (
          <>
            <div className="literary-card">
              <div className="literary-quote">&ldquo;</div>
              <div className="literary-text" ref={charsRef} />
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--sp-3)',
                justifyContent: 'center',
                flexWrap: 'wrap',
                margin: 'var(--sp-6) 0',
              }}
            >
              <button className="btn btn-sage btn-sm" onClick={copyText}>
                📋 复制文字
              </button>
              <button className="btn btn-sage btn-sm" onClick={saveAsImage}>
                🖼 保存为图片
              </button>
              <button className="btn btn-sage btn-sm" onClick={generateLiterary}>
                ✨ 再来一段
              </button>
            </div>

            {/* Next Step Button */}
            <div className="text-center" style={{ marginTop: 'var(--sp-4)' }}>
              <Link href="/step5" className="btn btn-sun btn-lg">
                查看我的情绪卡片 →
              </Link>
            </div>
          </>
        )}

        {/* Skip Link */}
        <div className="text-center" style={{ marginTop: 'var(--sp-8)' }}>
          <Link
            href="/step5"
            className="text-caption"
            style={{ opacity: 0.6, textDecoration: 'underline' }}
          >
            跳过，直接查看情绪卡片
          </Link>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast${showToast ? ' show' : ''}`}>
        已复制到剪贴板 ✓
      </div>
    </div>
  );
}
