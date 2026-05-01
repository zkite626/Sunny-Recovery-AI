'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCurrent, saveRecord, getEmotionColor, getEmotionLabel } from '@/lib/storage';
import { EMOTION_TYPES, BODY_ZONES, generateSummary, extractThinkingTrap } from '@/lib/emotion';
import { generateEmotionCard, downloadCard } from '@/lib/card';
import ProgressBar from '@/components/ProgressBar';

interface JourneyStep {
  num: number;
  desc: string;
}

export default function Step5Page() {
  const [session, setSession] = useState<ReturnType<typeof getCurrent>>({});
  const [summary, setSummary] = useState<ReturnType<typeof generateSummary> | null>(null);
  const [oldThought, setOldThought] = useState('');
  const [newThought, setNewThought] = useState('');
  const [microAction, setMicroAction] = useState('');
  const [finalValue, setFinalValue] = useState(5);
  const [finalLabel, setFinalLabel] = useState('');
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  useEffect(() => {
    const data = getCurrent();
    setSession(data);

    const s = generateSummary(data);
    setSummary(s);

    // Extract old/new thoughts from aiReply
    const aiReply = data.aiReply || '';
    const arrowMatch = aiReply.match(
      /["「](.*?)["」]\s*[→➣➡→~～]+\s*["「](.*?)["」]/
    );
    if (arrowMatch) {
      setOldThought(arrowMatch[1]);
      setNewThought(arrowMatch[2]);
    }

    setMicroAction(data.microAction || '');

    // Generate emotion card on mount
    setTimeout(() => {
      generateEmotionCard('emotionCard', {
        emotionLabel: s.emotionLabel,
        emotionEmoji: s.emotionEmoji,
        intensityBefore: s.intensityBefore,
        intensityAfter: s.intensityAfter,
        thinkingTrap: s.thinkingTrap,
        thinkingTrapIcon: s.thinkingTrapIcon,
        date: s.date,
        time: s.time,
        oldThought: arrowMatch ? arrowMatch[1] : undefined,
        newThought: arrowMatch ? arrowMatch[2] : undefined,
        microAction: data.microAction || undefined,
      });
    }, 100);

    // Build journey steps
    const emotion = EMOTION_TYPES.find((e) => e.id === data.emotionType);
    const emotionLabel = emotion ? `${emotion.emoji} ${emotion.label}` : '未指定';
    const intensity = data.intensity || 5;
    const bodyZoneLabels = (data.bodyZones || [])
      .map((id) => BODY_ZONES.find((z) => z.id === id)?.label)
      .filter(Boolean)
      .join('、') || '未指定';
    const trap = extractThinkingTrap(aiReply);

    setJourneySteps([
      { num: 1, desc: `${emotionLabel}，强度 ${intensity}/10` },
      { num: 2, desc: bodyZoneLabels },
      { num: 3, desc: trap.label },
      { num: 4, desc: '获得了一段专属治愈文字' },
      { num: 5, desc: `${intensity} → ${data.newIntensity || Math.max(1, intensity - 2)}` },
    ]);

    // Init final slider
    const initFinal = data.newIntensity || Math.max(1, intensity - 2);
    setFinalValue(initFinal);
    setFinalLabel(getEmotionLabel(initFinal));
  }, []);

  const handleSliderChange = (val: number) => {
    setFinalValue(val);
    setFinalLabel(getEmotionLabel(val));
  };

  const saveAndFinish = () => {
    const intensity = session.intensity || 5;
    saveRecord({
      emotionType: session.emotionType,
      intensityBefore: intensity,
      intensityAfter: finalValue,
      emotionText: session.emotionText,
      bodyZones: session.bodyZones,
      thinkingTrap: summary?.thinkingTrap,
      literaryText: session.literaryText,
    });
    setSaved(true);
    showToast('记录已保存 ✓');
  };

  return (
    <div className="page page-enter">
      <ProgressBar step={5} />

      <div className="nav-bar">
        <Link href="/" className="btn btn-ghost btn-sm">
          🏠 首页
        </Link>
        <Link href="/step4" className="btn btn-ghost btn-sm">
          ← 上一步
        </Link>
      </div>

      <div className="heading-section text-center">
        <h2 className="heading-section">你的专属情绪卡</h2>
        <p className="text-body">这段旅程的完整记录</p>
      </div>

      {/* Emotion Card Canvas */}
      <div
        className="card-canvas-wrap"
        style={{
          maxWidth: 400,
          margin: '0 auto',
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(246,166,35,0.12)',
          animation: 'cardReveal 0.8s ease forwards',
        }}
      >
        <canvas id="emotionCard" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* Action Buttons */}
      <div
        className="card-actions"
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          margin: 'var(--sp-6) 0',
        }}
      >
        <button
          className="btn btn-sun btn-sm"
          onClick={() => downloadCard('emotionCard')}
        >
          💾 保存卡片
        </button>
        <button
          className="btn btn-peach btn-sm"
          onClick={saveAndFinish}
          disabled={saved}
        >
          📊 保存记录
        </button>
      </div>

      {/* Journey Map */}
      <div className="glass" style={{ marginTop: 'var(--sp-4)' }}>
        <p className="text-caption" style={{ marginBottom: 'var(--sp-4)' }}>
          你的治愈旅程
        </p>
        {journeySteps.map((step) => (
          <div
            key={step.num}
            className="journey-step"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '8px 0',
            }}
          >
            <div
              className="journey-dot"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--sun)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {step.num}
            </div>
            <div
              className="journey-info"
              style={{
                flex: 1,
                paddingTop: 4,
              }}
            >
              <p className="text-body" style={{ margin: 0 }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Final Emotion Slider */}
      <div className="glass" style={{ marginTop: 'var(--sp-4)' }}>
        <p className="text-caption" style={{ marginBottom: 'var(--sp-4)' }}>
          体验结束后，你的情绪状态
        </p>
        <div className="slider-value" style={{ color: getEmotionColor(finalValue) }}>
          {finalValue}
        </div>
        <div className="slider-label">{finalLabel}</div>
        <div className="slider-wrap">
          <div className="slider-track">
            <input
              type="range"
              min={1}
              max={10}
              value={finalValue}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="text-center" style={{ padding: 'var(--sp-8) 0' }}>
        <Link href="/" className="btn btn-ghost btn-sm" style={{ marginRight: 8 }}>
          🏠 首页
        </Link>
        <Link href="/step1" className="btn btn-sun btn-sm">
          🔄 再来一次
        </Link>
      </div>

      {/* Toast */}
      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
    </div>
  );
}
