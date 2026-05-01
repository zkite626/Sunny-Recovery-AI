'use client';

export default function ProgressBar({ step }: { step: number }) {
  const dots = [1, 2, 3, 4, 5];
  return (
    <div className="progress-bar">
      {dots.map((s, i) => (
        <span key={s}>
          <div
            className={`progress-dot${s === step ? ' active' : ''}${s < step ? ' done' : ''}`}
          />
          {i < dots.length - 1 && (
            <div className={`progress-line${s < step ? ' done' : ''}`} />
          )}
        </span>
      ))}
    </div>
  );
}
