'use client';

import { useEffect, useState, useRef } from 'react';

interface BreathingGuideProps {
  phase: 'inhale' | 'hold' | 'exhale' | 'rest';
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  restTime?: number;
  size?: number;
}

const PHASE_LABELS: Record<string, string> = {
  inhale: '吸气...',
  hold: '屏住...',
  exhale: '呼气...',
  rest: '放松...',
};

export default function BreathingGuide({
  phase,
  inhaleTime,
  holdTime,
  exhaleTime,
  restTime = 0,
  size = 200,
}: BreathingGuideProps) {
  const [scale, setScale] = useState(0.6);
  const [glowIntensity, setGlowIntensity] = useState(0.3);
  const timerRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const duration =
      phase === 'inhale' ? inhaleTime * 1000 :
      phase === 'hold' ? holdTime * 1000 :
      phase === 'exhale' ? exhaleTime * 1000 :
      restTime * 1000;

    if (phase === 'inhale') {
      setScale(1);
      setGlowIntensity(0.8);
    } else if (phase === 'hold') {
      setScale(1);
      setGlowIntensity(0.6);
    } else if (phase === 'exhale') {
      setScale(0.6);
      setGlowIntensity(0.3);
    } else {
      setScale(0.6);
      setGlowIntensity(0.2);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, inhaleTime, holdTime, exhaleTime, restTime]);

  const transitionDuration =
    phase === 'inhale' ? inhaleTime :
    phase === 'hold' ? 0.3 :
    phase === 'exhale' ? exhaleTime :
    0.5;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer glow ring */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(134,199,163,${glowIntensity * 0.3}) 0%, transparent 70%)`,
          transform: `scale(${scale * 1.3})`,
          transition: `transform ${transitionDuration}s ease-in-out, background ${transitionDuration}s ease-in-out`,
        }}
      />

      {/* Middle ring - semi-transparent */}
      <div
        style={{
          position: 'absolute',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          background: `rgba(134,199,163,${glowIntensity * 0.2})`,
          border: `2px solid rgba(134,199,163,${glowIntensity * 0.4})`,
          transform: `scale(${scale})`,
          transition: `transform ${transitionDuration}s ease-in-out`,
        }}
      />

      {/* Inner circle - solid */}
      <div
        style={{
          position: 'absolute',
          width: '55%',
          height: '55%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 40% 40%, rgba(134,199,163,${glowIntensity * 0.6}), rgba(134,199,163,${glowIntensity * 0.3}))`,
          transform: `scale(${scale})`,
          transition: `transform ${transitionDuration}s ease-in-out`,
          boxShadow: `0 0 ${glowIntensity * 40}px rgba(134,199,163,${glowIntensity * 0.5})`,
        }}
      />

      {/* Center label */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          color: 'var(--text-primary)',
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          opacity: 0.8,
        }}
      >
        {PHASE_LABELS[phase]}
      </div>
    </div>
  );
}
