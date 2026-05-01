'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const FlowFieldSketch = dynamic(() => import('@/components/FlowFieldSketch'), { ssr: false });
const HandTracker = dynamic(() => import('@/components/HandTracker'), { ssr: false });

type Mode = 'mouse' | 'touch' | 'camera';
type Mood = 'calm' | 'energetic' | 'melancholy' | 'joyful';

const MOOD_OPTIONS: { id: Mood; label: string; color: string }[] = [
  { id: 'calm', label: '平静', color: '#86c7a3' },
  { id: 'energetic', label: '活力', color: '#f6a623' },
  { id: 'melancholy', label: '忧郁', color: '#a78bfa' },
  { id: 'joyful', label: '喜悦', color: '#fcd34d' },
];

export default function CalmPage() {
  const [mode, setMode] = useState<Mode>('mouse');
  const [mood, setMood] = useState<Mood>('calm');
  const [particleCount, setParticleCount] = useState(300);
  const [interactionPoint, setInteractionPoint] = useState<{
    x: number; y: number; vx: number; vy: number;
  } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    const updateSize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-hide controls after 5s of no interaction
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 5000);
  }, []);

  useEffect(() => {
    showControlsTemporarily();
    return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
  }, [showControlsTemporarily]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (mode === 'camera') return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setInteractionPoint((prev) => ({
      x,
      y,
      vx: prev ? (x - prev.x) * 0.3 : 0,
      vy: prev ? (y - prev.y) * 0.3 : 0,
    }));
    showControlsTemporarily();
  }, [mode, showControlsTemporarily]);

  const handlePointerLeave = useCallback(() => {
    if (mode !== 'camera') setInteractionPoint(null);
  }, [mode]);

  const handleHandMove = useCallback((point: { x: number; y: number; vx: number; vy: number }) => {
    setInteractionPoint(point);
  }, []);

  const handlePermissionDenied = useCallback(() => {
    setMode('mouse');
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#fdf8f0',
        overflow: 'hidden',
        touchAction: 'none',
        cursor: mode === 'camera' ? 'default' : 'none',
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={showControlsTemporarily}
    >
      {/* Flow field canvas */}
      <FlowFieldSketch
        interactionPoint={interactionPoint}
        mood={mood}
        particleCount={particleCount}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Hand tracker (camera mode) */}
      {mode === 'camera' && (
        <HandTracker
          onHandMove={handleHandMove}
          onPermissionDenied={handlePermissionDenied}
          width={dimensions.width}
          height={dimensions.height}
        />
      )}

      {/* Controls overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'var(--sp-4) var(--sp-4) var(--sp-8)',
          background: 'linear-gradient(transparent, rgba(253,248,240,0.9))',
          transform: showControls ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.5s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-3)',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {/* Back button */}
        <Link
          href="/"
          className="btn btn-ghost btn-sm"
          style={{ position: 'absolute', top: 'var(--sp-4)', left: 'var(--sp-4)', zIndex: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          ← 返回
        </Link>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          {(['mouse', 'touch', 'camera'] as Mode[]).map((m) => (
            <button
              key={m}
              className={`tag${mode === m ? ' active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setMode(m); }}
            >
              {m === 'mouse' ? '🖱 鼠标' : m === 'touch' ? '👆 触摸' : '📷 手势'}
            </button>
          ))}
        </div>

        {/* Mood selector */}
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m.id}
              className={`tag${mood === m.id ? ' active' : ''}`}
              style={mood === m.id ? { background: m.color, color: '#fff' } : {}}
              onClick={(e) => { e.stopPropagation(); setMood(m.id); }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Particle count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--text-sm)' }}>
          <span>粒子数</span>
          <input
            type="range"
            min={100}
            max={800}
            step={50}
            value={particleCount}
            onChange={(e) => setParticleCount(Number(e.target.value))}
            style={{ width: 120 }}
            onClick={(e) => e.stopPropagation()}
          />
          <span>{particleCount}</span>
        </div>
      </div>

      {/* Top controls hint */}
      {showControls && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--sp-4)',
            right: 'var(--sp-4)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-ghost)',
            zIndex: 10,
          }}
        >
          {mode === 'camera' ? '手掌在摄像头前移动' : '移动鼠标或手指与粒子互动'}
        </div>
      )}
    </div>
  );
}
