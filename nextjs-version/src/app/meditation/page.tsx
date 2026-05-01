'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import BreathingGuide from '@/components/BreathingGuide';
import { createAmbientSound } from '@/lib/ambient-sound';
import { getApiKey } from '@/lib/storage';
import type { AmbientSound } from '@/lib/ambient-sound';

type MeditationType = 'body_scan' | 'breath' | 'loving_kindness' | 'sleep';
type Phase = 'select' | 'config' | 'active' | 'completed';
type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const TYPES: { id: MeditationType; icon: string; title: string; desc: string }[] = [
  { id: 'body_scan', icon: '🧘', title: '身体扫描', desc: '引导你关注身体的每个部位' },
  { id: 'breath', icon: '🌬', title: '呼吸专注', desc: '专注于呼吸的节奏' },
  { id: 'loving_kindness', icon: '💚', title: '慈心冥想', desc: '培养对自己和他人的善意' },
  { id: 'sleep', icon: '🌙', title: '助眠冥想', desc: '帮助你在平静中入睡' },
];

const DURATIONS = [5, 10, 15, 20];

const SOUNDS: { id: string; label: string }[] = [
  { id: 'none', label: '无' },
  { id: 'rain', label: '🌧 雨声' },
  { id: 'ocean', label: '🌊 海浪' },
  { id: 'forest', label: '🌲 森林' },
];

export default function MeditationPage() {
  const [type, setType] = useState<MeditationType>('breath');
  const [duration, setDuration] = useState(10);
  const [phase, setPhase] = useState<Phase>('select');
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [elapsed, setElapsed] = useState(0);
  const [soundType, setSoundType] = useState('none');
  const [aiGuidance, setAiGuidance] = useState('');
  const [loadingGuidance, setLoadingGuidance] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout>(undefined);
  const breathTimerRef = useRef<NodeJS.Timeout>(undefined);
  const ambientRef = useRef<AmbientSound | null>(null);
  const guidanceIntervalRef = useRef<NodeJS.Timeout>(undefined);

  const totalSeconds = duration * 60;

  // Breathing pattern based on meditation type
  const getPattern = useCallback(() => {
    if (type === 'breath') return { inhale: 4, hold: 7, exhale: 8, rest: 0 };
    if (type === 'sleep') return { inhale: 4, hold: 2, exhale: 6, rest: 2 };
    return { inhale: 4, hold: 4, exhale: 4, rest: 0 }; // default box breathing
  }, [type]);

  // Start meditation
  const startMeditation = useCallback(() => {
    setPhase('active');
    setElapsed(0);
    setBreathPhase('inhale');

    // Start ambient sound
    if (soundType !== 'none') {
      const sound = createAmbientSound(soundType as 'rain' | 'ocean' | 'forest');
      sound.start();
      ambientRef.current = sound;
    }

    // Timer
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= totalSeconds) {
          clearInterval(intervalRef.current);
          setPhase('completed');
          saveSession();
          return prev + 1;
        }
        return prev + 1;
      });
    }, 1000);

    // Fetch initial AI guidance
    fetchGuidance();

    // Periodic AI guidance
    guidanceIntervalRef.current = setInterval(() => {
      fetchGuidance();
    }, 150000); // every 2.5 minutes
  }, [soundType, totalSeconds, type]);

  // Breathing cycle
  useEffect(() => {
    if (phase !== 'active') return;

    const pattern = getPattern();
    const phases: { phase: BreathPhase; duration: number }[] = [
      { phase: 'inhale', duration: pattern.inhale },
      { phase: 'hold', duration: pattern.hold },
      { phase: 'exhale', duration: pattern.exhale },
    ];
    if (pattern.rest > 0) phases.push({ phase: 'rest', duration: pattern.rest });

    let currentIdx = 0;

    const nextPhase = () => {
      const p = phases[currentIdx % phases.length];
      setBreathPhase(p.phase);
      currentIdx++;
      breathTimerRef.current = setTimeout(nextPhase, p.duration * 1000);
    };

    nextPhase();

    return () => { if (breathTimerRef.current) clearTimeout(breathTimerRef.current); };
  }, [phase, getPattern]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      if (guidanceIntervalRef.current) clearInterval(guidanceIntervalRef.current);
      ambientRef.current?.stop();
    };
  }, []);

  const fetchGuidance = useCallback(async () => {
    setLoadingGuidance(true);
    try {
      const typeName = TYPES.find((t) => t.id === type)?.title || '冥想';
      const prompt = `你是一位温柔的冥想引导师。用户正在进行${typeName}冥想，已进行了${Math.floor(elapsed / 60)}分钟。请用简短温暖的一句话（30字以内）给予引导，不要加称呼和问候。`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: prompt,
          messages: [{ role: 'user', content: '请给我一句冥想引导语' }],
          userApiKey: getApiKey() || undefined,
          maxTokens: 100,
        }),
      });

      if (res.ok) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let text = '';
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
              if (delta) text += delta;
            } catch { /* skip */ }
          }
        }
        if (text) setAiGuidance(text);
      }
    } catch { /* ignore */ }
    setLoadingGuidance(false);
  }, [type, elapsed]);

  const saveSession = useCallback(() => {
    const key = 'moodcoach_meditations';
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({
        id: Date.now(),
        type,
        duration,
        completedAt: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(existing.slice(-50)));
    } catch { /* ignore */ }
  }, [type, duration]);

  const stopMeditation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    if (guidanceIntervalRef.current) clearInterval(guidanceIntervalRef.current);
    ambientRef.current?.stop();
    ambientRef.current = null;
    setPhase('completed');
    saveSession();
  }, [saveSession]);

  const resetAll = useCallback(() => {
    setPhase('select');
    setElapsed(0);
    setAiGuidance('');
    ambientRef.current?.stop();
    ambientRef.current = null;
  }, []);

  const progressPercent = (elapsed / totalSeconds) * 100;
  const remaining = totalSeconds - elapsed;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="page page-enter" style={{ minHeight: '100dvh' }}>
      <div className="nav-bar">
        <Link href="/" className="btn btn-ghost btn-sm">🏠 首页</Link>
      </div>

      {/* Phase: Select type */}
      {phase === 'select' && (
        <div>
          <h2 className="heading-section text-center" style={{ marginBottom: 'var(--sp-2)' }}>
            🧘 正念冥想
          </h2>
          <p className="text-body text-center" style={{ marginBottom: 'var(--sp-6)', color: 'var(--text-secondary)' }}>
            选择冥想类型
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
            {TYPES.map((t) => (
              <div
                key={t.id}
                className="glass"
                style={{
                  padding: 'var(--sp-5)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  outline: type === t.id ? '2px solid var(--sun-core)' : 'none',
                  transition: 'outline 0.2s',
                }}
                onClick={() => setType(t.id)}
              >
                <div style={{ fontSize: '2rem' }}>{t.icon}</div>
                <div style={{ fontWeight: 600, marginTop: 'var(--sp-2)' }}>{t.title}</div>
                <div className="text-caption" style={{ marginTop: 'var(--sp-1)' }}>{t.desc}</div>
              </div>
            ))}
          </div>

          <button className="btn btn-sun btn-lg" style={{ width: '100%' }} onClick={() => setPhase('config')}>
            继续 →
          </button>
        </div>
      )}

      {/* Phase: Config duration & sound */}
      {phase === 'config' && (
        <div>
          <h2 className="heading-section text-center" style={{ marginBottom: 'var(--sp-6)' }}>
            {TYPES.find((t) => t.id === type)?.icon} {TYPES.find((t) => t.id === type)?.title}
          </h2>

          <div className="glass" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
            <div style={{ fontWeight: 600, marginBottom: 'var(--sp-3)' }}>时长</div>
            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  className={`tag${duration === d ? ' active' : ''}`}
                  onClick={() => setDuration(d)}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  {d}分钟
                </button>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
            <div style={{ fontWeight: 600, marginBottom: 'var(--sp-3)' }}>环境音</div>
            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              {SOUNDS.map((s) => (
                <button
                  key={s.id}
                  className={`tag${soundType === s.id ? ' active' : ''}`}
                  onClick={() => setSoundType(s.id)}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setPhase('select')}>
              ← 返回
            </button>
            <button className="btn btn-sun btn-lg" style={{ flex: 2 }} onClick={startMeditation}>
              开始冥想
            </button>
          </div>
        </div>
      )}

      {/* Phase: Active meditation */}
      {phase === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80dvh', gap: 'var(--sp-6)' }}>
          {/* Progress */}
          <div style={{ width: '100%', maxWidth: 300 }}>
            <div className="assess-progress-bar">
              <div className="assess-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-ghost)', marginTop: 'var(--sp-1)' }}>
              <span>{formatTime(elapsed)}</span>
              <span>-{formatTime(Math.max(0, remaining))}</span>
            </div>
          </div>

          {/* Breathing guide */}
          <BreathingGuide
            phase={breathPhase}
            inhaleTime={getPattern().inhale}
            holdTime={getPattern().hold}
            exhaleTime={getPattern().exhale}
            restTime={getPattern().rest}
            size={Math.min(250, window.innerWidth * 0.6)}
          />

          {/* AI guidance */}
          {aiGuidance && (
            <div style={{ textAlign: 'center', maxWidth: 280, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontStyle: 'italic', opacity: loadingGuidance ? 0.5 : 0.8, transition: 'opacity 0.5s' }}>
              {aiGuidance}
            </div>
          )}

          {/* Stop button */}
          <button className="btn btn-ghost btn-sm" onClick={stopMeditation}>
            结束冥想
          </button>
        </div>
      )}

      {/* Phase: Completed */}
      {phase === 'completed' && (
        <div style={{ textAlign: 'center', paddingTop: 'var(--sp-12)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--sp-4)' }}>✨</div>
          <h2 className="heading-section" style={{ marginBottom: 'var(--sp-3)' }}>
            冥想完成
          </h2>
          <p className="text-body" style={{ marginBottom: 'var(--sp-2)' }}>
            {TYPES.find((t) => t.id === type)?.title} · {duration} 分钟
          </p>
          <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-8)' }}>
            你为自己留出了一段安静的时光，这很棒 🌿
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', maxWidth: 280, margin: '0 auto' }}>
            <button className="btn btn-sun btn-lg" onClick={resetAll}>
              再来一次
            </button>
            <Link href="/" className="btn btn-ghost">
              返回首页
            </Link>
            <Link href="/calendar" className="btn btn-ghost btn-sm">
              查看日历记录
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
