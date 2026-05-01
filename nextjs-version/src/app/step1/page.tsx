'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { EMOTION_TYPES } from '@/lib/emotion';
import { saveCurrent, getEmotionColor, getEmotionLabel } from '@/lib/storage';
import ProgressBar from '@/components/ProgressBar';
import ApiKeyModal from '@/components/ApiKeyModal';
import { useToast } from '@/components/Toast';

export default function Step1Page() {
  return (
    <Suspense fallback={<div className="page text-center text-body">加载中...</div>}>
      <Step1Content />
    </Suspense>
  );
}

function Step1Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'personal';
  const { showToast } = useToast();

  const [intensity, setIntensity] = useState(5);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [emotionText, setEmotionText] = useState('');

  function handleNext() {
    if (!selectedEmotion) {
      showToast('请先选择一个情绪标签');
      return;
    }
    if (!emotionText.trim()) {
      showToast('请写下你的感受');
      return;
    }

    saveCurrent({
      mode,
      emotionType: selectedEmotion,
      intensity,
      emotionText: emotionText.trim(),
      startTime: new Date().toISOString(),
    });

    router.push(`/step2?mode=${mode}`);
  }

  return (
    <div className="page page-enter">
      <ProgressBar step={1} />

      <div className="nav-bar">
        <Link href="/" className="btn btn-ghost btn-sm">🏠 首页</Link>
        <ApiKeyModal />
      </div>

      <div className="section">
        <div className="heading-section text-center">
          <h2 className="heading-section">此刻，你的心情是？</h2>
          <p className="text-body">花一分钟感受自己，诚实面对内心</p>
        </div>

        {/* Emotion Intensity Slider */}
        <div className="glass">
          <p className="text-caption" style={{ marginBottom: 'var(--sp-4)' }}>情绪强度</p>
          <div className="slider-value" style={{ color: getEmotionColor(intensity) }}>
            {intensity}
          </div>
          <div className="slider-label">{getEmotionLabel(intensity)}</div>
          <div className="slider-wrap">
            <div className="slider-track">
              <input
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-ghost)', marginTop: 'var(--sp-2)' }}>
            <span>平静</span>
            <span>严重困扰</span>
          </div>
        </div>

        {/* Emotion Type Tags */}
        <div className="glass">
          <p className="text-caption" style={{ marginBottom: 'var(--sp-4)' }}>选择最接近的情绪</p>
          <div className="tag-grid">
            {EMOTION_TYPES.map((emo) => (
              <div
                key={emo.id}
                className={`tag${selectedEmotion === emo.id ? ' active' : ''}`}
                onClick={() => setSelectedEmotion(emo.id)}
              >
                {emo.emoji} {emo.label}
              </div>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="glass">
          <p className="text-caption" style={{ marginBottom: 'var(--sp-4)' }}>
            写下你的感受（想到什么写什么）
          </p>
          <textarea
            className="input-area"
            placeholder="比如：明天就要考试了，我觉得自己什么都没准备好，脑子里乱糟糟的..."
            value={emotionText}
            onChange={(e) => setEmotionText(e.target.value)}
          />
        </div>

        {/* Next Button */}
        <div className="text-center">
          <button className="btn btn-sun btn-lg" onClick={handleNext}>
            继续，探索身体感受 →
          </button>
        </div>
      </div>
    </div>
  );
}
