'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import EmotionColorPalette from '@/components/EmotionColorPalette';
import { analyzeCanvasMood } from '@/lib/canvas-mood';
import { getApiKey } from '@/lib/storage';

const DrawingCanvas = dynamic(() => import('@/components/DrawingCanvas'), { ssr: false });

type BrushType = 'watercolor' | 'oil' | 'crayon' | 'pencil';

const BRUSHES: { id: BrushType; icon: string; label: string }[] = [
  { id: 'watercolor', icon: '💧', label: '水彩' },
  { id: 'oil', icon: '🖌', label: '油画' },
  { id: 'crayon', icon: '🖍', label: '蜡笔' },
  { id: 'pencil', icon: '✏️', label: '铅笔' },
];

interface ArtEntry {
  id: number;
  timestamp: string;
  imageData: string;
  mood?: string;
}

const MAX_GALLERY = 10;

export default function ArtPage() {
  const [brush, setBrush] = useState<BrushType>('watercolor');
  const [color, setColor] = useState('#a78bfa');
  const [brushSize, setBrushSize] = useState(12);
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [gallery, setGallery] = useState<ArtEntry[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => {
    const updateSize = () => {
      const w = Math.min(window.innerWidth - 32, 800);
      const h = Math.min(window.innerHeight * 0.55, 500);
      setDimensions({ width: w, height: h });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Load gallery
  useEffect(() => {
    try {
      setGallery(JSON.parse(localStorage.getItem('moodcoach_art_gallery') || '[]'));
    } catch { /* ignore */ }
  }, []);

  const getCanvas = useCallback((): HTMLCanvasElement | null => {
    return document.querySelector('canvas');
  }, []);

  const handleSave = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const entry: ArtEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      imageData: dataUrl,
      mood: analysis || undefined,
    };

    const updated = [entry, ...gallery].slice(0, MAX_GALLERY);
    setGallery(updated);
    localStorage.setItem('moodcoach_art_gallery', JSON.stringify(updated));
  }, [gallery, analysis, getCanvas]);

  const handleAnalyze = useCallback(async () => {
    const canvas = getCanvas();
    if (!canvas) return;

    setAnalyzing(true);
    try {
      const result = analyzeCanvasMood(canvas);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: '你是一位温暖的心理艺术疗愈师。根据用户画作的颜色分析结果，用温暖共情的语言（60-100字）解读画作传达的情绪，给予温柔的肯定和鼓励。不要诊断，只做情绪感知。',
          messages: [{ role: 'user', content: `画作色彩分析：${result.description}` }],
          userApiKey: getApiKey() || undefined,
          maxTokens: 200,
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
        if (text) setAnalysis(text);
      }
    } catch { /* ignore */ }
    setAnalyzing(false);
  }, [getCanvas]);

  const handleClear = useCallback(() => {
    setCanvasKey((k) => k + 1);
    setAnalysis('');
  }, []);

  const handleDeleteGallery = useCallback((id: number) => {
    const updated = gallery.filter((g) => g.id !== id);
    setGallery(updated);
    localStorage.setItem('moodcoach_art_gallery', JSON.stringify(updated));
  }, [gallery]);

  return (
    <div className="page page-enter">
      <div className="nav-bar">
        <Link href="/" className="btn btn-ghost btn-sm">🏠 首页</Link>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowGallery(!showGallery)}>
          🖼 画廊 ({gallery.length})
        </button>
      </div>

      <h2 className="heading-section text-center" style={{ marginBottom: 'var(--sp-3)' }}>
        🎨 情绪涂鸦
      </h2>
      <p className="text-body text-center" style={{ marginBottom: 'var(--sp-4)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
        用画笔表达内心的感受
      </p>

      {/* Brush selector */}
      <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)', justifyContent: 'center' }}>
        {BRUSHES.map((b) => (
          <button
            key={b.id}
            className={`tag${brush === b.id ? ' active' : ''}`}
            onClick={() => setBrush(b.id)}
          >
            {b.icon} {b.label}
          </button>
        ))}
      </div>

      {/* Color palette */}
      <div className="glass" style={{ padding: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
        <EmotionColorPalette selectedColor={color} onColorSelect={setColor} />
      </div>

      {/* Brush size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)', justifyContent: 'center', fontSize: 'var(--text-sm)' }}>
        <span>笔触大小</span>
        <input
          type="range"
          min={2}
          max={40}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          style={{ width: 120 }}
        />
        <span style={{ minWidth: 24, textAlign: 'center' }}>{brushSize}</span>
        <span
          style={{
            display: 'inline-block',
            width: brushSize,
            height: brushSize,
            borderRadius: '50%',
            background: color,
            verticalAlign: 'middle',
          }}
        />
      </div>

      {/* Canvas */}
      <div
        className="glass"
        style={{
          padding: 'var(--sp-2)',
          marginBottom: 'var(--sp-3)',
          overflow: 'hidden',
        }}
      >
        <DrawingCanvas
          key={canvasKey}
          brush={brush}
          color={color}
          brushSize={brushSize}
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--sp-4)' }}>
        <button className="btn btn-sage btn-sm" onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? '分析中...' : '🔍 AI 情绪分析'}
        </button>
        <button className="btn btn-sun btn-sm" onClick={handleSave}>
          💾 保存到画廊
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleClear}>
          🗑 清空画布
        </button>
      </div>

      {/* Analysis result */}
      {analysis && (
        <div className="glass" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--sun-core)', marginBottom: 'var(--sp-2)' }}>
            AI 情绪解读
          </div>
          <p className="text-body" style={{ fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>
            {analysis}
          </p>
        </div>
      )}

      {/* Gallery */}
      {showGallery && (
        <div className="glass" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
          <div style={{ fontWeight: 600, marginBottom: 'var(--sp-3)' }}>
            🖼 我的画廊 ({gallery.length}/{MAX_GALLERY})
          </div>
          {gallery.length === 0 ? (
            <p className="text-caption">还没有保存的画作</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-3)' }}>
              {gallery.map((entry) => (
                <div key={entry.id} style={{ position: 'relative' }}>
                  <img
                    src={entry.imageData}
                    alt="情绪涂鸦"
                    style={{
                      width: '100%',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--glass-border)',
                    }}
                  />
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-ghost)', marginTop: 'var(--sp-1)' }}>
                    {new Date(entry.timestamp).toLocaleDateString('zh-CN')}
                    {entry.mood && ` · ${entry.mood.slice(0, 20)}...`}
                  </div>
                  <button
                    onClick={() => handleDeleteGallery(entry.id)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
