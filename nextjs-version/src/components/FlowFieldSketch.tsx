'use client';

import { useEffect, useRef, useCallback } from 'react';

interface InteractionPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface FlowFieldSketchProps {
  interactionPoint: InteractionPoint | null;
  mood: string;
  particleCount: number;
  width: number;
  height: number;
}

const MOOD_PALETTES: Record<string, { colors: string[]; bg: string }> = {
  calm: {
    colors: ['#86c7a3', '#7dd3fc', '#a78bfa', '#d4edda'],
    bg: 'rgba(253,248,240,0.03)',
  },
  energetic: {
    colors: ['#f6a623', '#fda085', '#fcd34d', '#f87171'],
    bg: 'rgba(253,248,240,0.03)',
  },
  melancholy: {
    colors: ['#a78bfa', '#7dd3fc', '#818cf8', '#c4b5fd'],
    bg: 'rgba(248,240,253,0.03)',
  },
  joyful: {
    colors: ['#fcd34d', '#86c7a3', '#f6a623', '#fda085'],
    bg: 'rgba(254,243,199,0.03)',
  },
};

class Particle {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  color: string;
  alpha: number;
  size: number;
  maxSpeed: number;

  constructor(w: number, h: number, colors: string[]) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.alpha = Math.random() * 0.5 + 0.3;
    this.size = Math.random() * 2 + 1;
    this.maxSpeed = Math.random() * 1.5 + 1;
  }

  update(
    flowAngle: number,
    interaction: InteractionPoint | null,
    w: number,
    h: number
  ) {
    // Flow field force
    const fx = Math.cos(flowAngle) * 0.3;
    const fy = Math.sin(flowAngle) * 0.3;
    this.vx += fx;
    this.vy += fy;

    // Interaction force
    if (interaction) {
      const dx = this.x - interaction.x;
      const dy = this.y - interaction.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = 150;
      if (dist < radius && dist > 0) {
        const force = (1 - dist / radius) * 2;
        // Push particles in the direction of hand movement
        this.vx += (interaction.vx * force * 0.1) + (dx / dist * force * 0.5);
        this.vy += (interaction.vy * force * 0.1) + (dy / dist * force * 0.5);
      }
    }

    // Speed limit
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }

    // Damping
    this.vx *= 0.98;
    this.vy *= 0.98;

    this.x += this.vx;
    this.y += this.vy;

    // Wrap around
    if (this.x < 0) this.x = w;
    if (this.x > w) this.x = 0;
    if (this.y < 0) this.y = h;
    if (this.y > h) this.y = 0;
  }
}

export default function FlowFieldSketch({
  interactionPoint,
  mood,
  particleCount,
  width,
  height,
}: FlowFieldSketchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const paletteRef = useRef(MOOD_PALETTES.calm);
  const interactionRef = useRef<InteractionPoint | null>(null);
  const frameRef = useRef(0);
  const noiseOffsetRef = useRef(0);
  const animIdRef = useRef(0);

  // Update refs on prop change
  useEffect(() => {
    paletteRef.current = MOOD_PALETTES[mood] || MOOD_PALETTES.calm;
  }, [mood]);

  useEffect(() => {
    interactionRef.current = interactionPoint;
  }, [interactionPoint]);

  // Resize particles on count change
  useEffect(() => {
    const palette = paletteRef.current;
    const current = particlesRef.current;
    if (current.length < particleCount) {
      for (let i = current.length; i < particleCount; i++) {
        current.push(new Particle(width, height, palette.colors));
      }
    } else if (current.length > particleCount) {
      particlesRef.current = current.slice(0, particleCount);
    }
  }, [particleCount, width, height]);

  // Simple noise function (value noise)
  const noise = useCallback((x: number, y: number): number => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;

    const hash = (a: number, b: number) => {
      let h = (a * 374761393 + b * 668265263 + 1274126177) | 0;
      h = ((h ^ (h >> 13)) * 1274126177) | 0;
      return (h & 0x7fffffff) / 0x7fffffff;
    };

    const v00 = hash(ix, iy);
    const v10 = hash(ix + 1, iy);
    const v01 = hash(ix, iy + 1);
    const v11 = hash(ix + 1, iy + 1);

    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);

    return v00 * (1 - sx) * (1 - sy) + v10 * sx * (1 - sy) + v01 * (1 - sx) * sy + v11 * sx * sy;
  }, []);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Init particles
    const palette = paletteRef.current;
    particlesRef.current = Array.from(
      { length: particleCount },
      () => new Particle(width, height, palette.colors)
    );

    const scale = 20; // flow field grid size
    const cols = Math.ceil(width / scale);
    const rows = Math.ceil(height / scale);

    const animate = () => {
      frameRef.current++;
      noiseOffsetRef.current += 0.003;

      // Semi-transparent overlay for trails
      ctx.fillStyle = paletteRef.current.bg || 'rgba(253,248,240,0.03)';
      ctx.fillRect(0, 0, width, height);

      const interaction = interactionRef.current;
      const offset = noiseOffsetRef.current;

      // Update and draw particles
      for (const p of particlesRef.current) {
        const col = Math.floor(p.x / scale);
        const row = Math.floor(p.y / scale);
        const angle = noise(col * 0.1 + offset, row * 0.1 + offset) * Math.PI * 4;

        p.update(angle, interaction, width, height);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // Draw interaction indicator
      if (interaction) {
        ctx.beginPath();
        ctx.arc(interaction.x, interaction.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(246, 166, 35, 0.4)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(interaction.x, interaction.y, 30, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(246, 166, 35, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animIdRef.current);
    };
  }, [width, height, particleCount, noise]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    />
  );
}
