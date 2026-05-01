'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getRecords, EmotionRecord } from '@/lib/storage';
import { EMOTION_TYPES } from '@/lib/emotion';

export default function DashboardPage() {
  const [records, setRecords] = useState<EmotionRecord[]>([]);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    setRecords(getRecords());
  }, []);

  useEffect(() => {
    if (records.length === 0 || !chartRef.current) return;

    import('chart.js').then((ChartModule) => {
      const {
        Chart,
        LineController,
        LineElement,
        PointElement,
        LinearScale,
        CategoryScale,
        Filler,
        Legend,
        Tooltip,
      } = ChartModule;

      Chart.register(
        LineController,
        LineElement,
        PointElement,
        LinearScale,
        CategoryScale,
        Filler,
        Legend,
        Tooltip,
      );

      if (chartInstanceRef.current) {
        (chartInstanceRef.current as InstanceType<typeof Chart>).destroy();
      }

      const sorted = [...records].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      const labels = sorted.map((r) => {
        const d = new Date(r.timestamp);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });

      const ctx = chartRef.current!.getContext('2d')!;

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: '体验前',
              data: sorted.map((r) => r.intensityBefore ?? null),
              borderColor: '#f87171',
              backgroundColor: 'rgba(248,113,113,0.1)',
              fill: true,
              tension: 0.3,
              pointRadius: 4,
            },
            {
              label: '体验后',
              data: sorted.map((r) => r.intensityAfter ?? null),
              borderColor: '#86c7a3',
              backgroundColor: 'rgba(134,199,163,0.1)',
              fill: true,
              tension: 0.3,
              pointRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 0, max: 10, ticks: { stepSize: 1 } },
          },
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      });
    });

    return () => {
      if (chartInstanceRef.current) {
        (chartInstanceRef.current as { destroy: () => void }).destroy();
      }
    };
  }, [records]);

  // Stats
  const total = records.length;

  const avgDrop =
    total > 0
      ? records.reduce(
          (sum, r) => sum + ((r.intensityBefore ?? 0) - (r.intensityAfter ?? 0)),
          0,
        ) / total
      : 0;

  const emotionFreq: Record<string, number> = {};
  records.forEach((r) => {
    if (r.emotionType) {
      emotionFreq[r.emotionType] = (emotionFreq[r.emotionType] || 0) + 1;
    }
  });
  const topEmotionId = Object.entries(emotionFreq).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topEmotion = EMOTION_TYPES.find((e) => e.id === topEmotionId);

  function handleClear() {
    if (window.confirm('确定要清除所有情绪记录吗？此操作不可撤销。')) {
      localStorage.removeItem('moodcoach_records');
      window.location.reload();
    }
  }

  const reversed = [...records].reverse();

  return (
    <div className="page page-enter">
      <nav className="nav-bar">
        <Link href="/" className="btn btn-ghost btn-sm">
          &larr; 返回首页
        </Link>
      </nav>

      <h1 className="heading-display text-center">我的情绪记录</h1>
      <p className="text-body text-center">回顾你的疗愈旅程</p>

      {total === 0 ? (
        <section className="section glass" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h2 className="heading-section">还没有情绪记录</h2>
          <p className="text-body" style={{ marginBottom: '1.5rem' }}>
            完成一次情绪疗愈流程后，你的记录会出现在这里。
          </p>
          <Link href="/step1" className="btn btn-sun">
            开始第一次疗愈
          </Link>
        </section>
      ) : (
        <>
          {/* Stats */}
          <div className="dashboard-stat-grid">
            <div className="glass dashboard-stat-card">
              <div className="dashboard-stat-number">{total}</div>
              <div className="dashboard-stat-label">总记录数</div>
            </div>
            <div className="glass dashboard-stat-card">
              <div className="dashboard-stat-number">
                {avgDrop > 0 ? '-' : ''}
                {avgDrop.toFixed(1)}
              </div>
              <div className="dashboard-stat-label">平均强度下降</div>
            </div>
            <div className="glass dashboard-stat-card">
              <div className="dashboard-stat-number">
                {topEmotion ? `${topEmotion.emoji} ${topEmotion.label}` : '-'}
              </div>
              <div className="dashboard-stat-label">最常见情绪</div>
            </div>
          </div>

          {/* Chart */}
          <section className="section">
            <h2 className="heading-section text-center">情绪趋势</h2>
            <div className="glass chart-container" style={{ position: 'relative', height: 300 }}>
              <canvas ref={chartRef} />
            </div>
          </section>

          {/* Records list */}
          <section className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="heading-section">记录列表</h2>
              <button className="btn btn-ghost btn-sm" onClick={handleClear}>
                清除全部
              </button>
            </div>

            {reversed.map((r) => {
              const emotion = EMOTION_TYPES.find((e) => e.id === r.emotionType);
              const drop = (r.intensityBefore ?? 0) - (r.intensityAfter ?? 0);
              const date = new Date(r.timestamp);

              return (
                <div key={r.id} className="glass dashboard-record">
                  <div className="dashboard-record-emoji">
                    {emotion?.emoji ?? '🌤️'}
                  </div>
                  <div className="dashboard-record-info">
                    <div className="dashboard-record-title">
                      {emotion?.label ?? '未命名情绪'}
                    </div>
                    <div className="dashboard-record-meta">
                      {date.toLocaleDateString('zh-CN')}{' '}
                      {date.toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      &nbsp;&middot;&nbsp; 强度 {r.intensityBefore ?? '?'} → {r.intensityAfter ?? '?'}
                    </div>
                    {drop > 0 && (
                      <span className="dashboard-record-badge">
                        -{drop}
                      </span>
                    )}
                    {r.emotionText && (
                      <div className="dashboard-record-text">
                        {r.emotionText.length > 80
                          ? r.emotionText.slice(0, 80) + '...'
                          : r.emotionText}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
