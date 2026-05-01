'use client';

interface PaletteProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const PALETTE_GROUPS = [
  {
    label: '平静',
    colors: ['#86c7a3', '#a8d8c0', '#7dd3fc', '#bae6fd', '#e0f2fe'],
  },
  {
    label: '活力',
    colors: ['#f6a623', '#fcd34d', '#fda085', '#f87171', '#fde2ca'],
  },
  {
    label: '忧郁',
    colors: ['#a78bfa', '#818cf8', '#7c3aed', '#6366f1', '#c4b5fd'],
  },
  {
    label: '温暖',
    colors: ['#ef4444', '#f97316', '#f59e0b', '#d97706', '#b45309'],
  },
  {
    label: '中性',
    colors: ['#1f2937', '#4b5563', '#9ca3af', '#d1d5db', '#f9fafb'],
  },
];

export default function EmotionColorPalette({ selectedColor, onColorSelect }: PaletteProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
      {PALETTE_GROUPS.map((group) => (
        <div key={group.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <span className="text-caption" style={{ minWidth: 28, fontSize: 'var(--text-xs)' }}>
            {group.label}
          </span>
          <div style={{ display: 'flex', gap: 'var(--sp-1)' }}>
            {group.colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorSelect(color)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: color,
                  border: selectedColor === color ? '3px solid var(--text-primary)' : '2px solid rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                  transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
