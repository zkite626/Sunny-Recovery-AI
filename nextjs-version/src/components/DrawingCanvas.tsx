'use client';

import { useRef, useEffect, useCallback } from 'react';

type BrushType = 'watercolor' | 'oil' | 'crayon' | 'pencil';

interface DrawingCanvasProps {
  brush: BrushType;
  color: string;
  brushSize: number;
  onStrokeEnd?: () => void;
  width: number;
  height: number;
}

export default function DrawingCanvas({
  brush,
  color,
  brushSize,
  onStrokeEnd,
  width,
  height,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const brushRef = useRef(brush);
  const colorRef = useRef(color);
  const sizeRef = useRef(brushSize);

  useEffect(() => { brushRef.current = brush; }, [brush]);
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { sizeRef.current = brushSize; }, [brushSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  const drawWatercolor = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, lastX: number, lastY: number) => {
    const size = sizeRef.current;
    const col = colorRef.current;
    // Multiple semi-transparent layers with jitter
    for (let i = 0; i < 6; i++) {
      const jx = (Math.random() - 0.5) * size * 0.4;
      const jy = (Math.random() - 0.5) * size * 0.4;
      ctx.beginPath();
      ctx.moveTo(lastX + jx, lastY + jy);
      ctx.lineTo(x + jx, y + jy);
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.03 + Math.random() * 0.02;
      ctx.lineWidth = size * (0.8 + Math.random() * 0.4);
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, []);

  const drawOil = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, lastX: number, lastY: number) => {
    const size = sizeRef.current;
    const col = colorRef.current;
    // Thick strokes with slight color variation
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    // Slight brightness variation
    const variation = Math.random() * 20 - 10;
    ctx.strokeStyle = col;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = size * 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, []);

  const drawCrayon = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, lastX: number, lastY: number) => {
    const size = sizeRef.current;
    const col = colorRef.current;
    // Textured dashes
    const dx = x - lastX;
    const dy = y - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.floor(dist / 3));

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const px = lastX + dx * t + (Math.random() - 0.5) * 2;
      const py = lastY + dy * t + (Math.random() - 0.5) * 2;

      if (Math.random() > 0.3) {
        ctx.beginPath();
        ctx.arc(px, py, size * 0.3 * (0.5 + Math.random() * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.4 + Math.random() * 0.3;
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }, []);

  const drawPencil = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, lastX: number, lastY: number) => {
    const size = sizeRef.current;
    const col = colorRef.current;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = col;
    ctx.globalAlpha = 0.6 + Math.random() * 0.3;
    ctx.lineWidth = Math.max(1, size * 0.3);
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, []);

  const drawSegment = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    const last = lastPosRef.current;
    if (!canvas || !last) return;
    const ctx = canvas.getContext('2d')!;

    switch (brushRef.current) {
      case 'watercolor': drawWatercolor(ctx, x, y, last.x, last.y); break;
      case 'oil': drawOil(ctx, x, y, last.x, last.y); break;
      case 'crayon': drawCrayon(ctx, x, y, last.x, last.y); break;
      case 'pencil': drawPencil(ctx, x, y, last.x, last.y); break;
    }

    lastPosRef.current = { x, y };
  }, [drawWatercolor, drawOil, drawCrayon, drawPencil]);

  const getPos = useCallback((e: React.PointerEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pos = getPos(e);
    lastPosRef.current = pos;
  }, [getPos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawingRef.current) return;
    const pos = getPos(e);
    drawSegment(pos.x, pos.y);
  }, [getPos, drawSegment]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPosRef.current = null;
    onStrokeEnd?.();
  }, [onStrokeEnd]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'none',
        cursor: 'crosshair',
        borderRadius: 'var(--radius-lg)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
}
