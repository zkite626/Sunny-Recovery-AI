'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CalendarGrid from '@/components/CalendarGrid';
import { getRecords, getGratitude, getAssessmentResults } from '@/lib/storage';
import { calculateStreak, getMeditationTimestamps, getGratitudeTimestamps } from '@/lib/streak';
import { getAllAchievements, checkAchievements, getEarnedAchievementIds, buildAchievementData } from '@/lib/achievements';
import { EMOTION_TYPES } from '@/lib/emotion';
import type { EmotionRecord } from '@/lib/storage';

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<EmotionRecord[]>([]);
  const [showBadges, setShowBadges] = useState(false);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const touchStartX = useRef(0);

  const records = useMemo(() => getRecords(), []);

  const streak = useMemo(() => {
    const recordTs = records.map((r) => r.timestamp);
    const medTs = getMeditationTimestamps();
    const gratTs = getGratitudeTimestamps();
    return calculateStreak(recordTs, medTs, gratTs);
  }, [records]);

  const gratitudeCount = useMemo(() => getGratitude().length, []);
  const assessmentCount = useMemo(() => getAssessmentResults().length, []);

  // Check achievements on mount
  useEffect(() => {
    const artCount = (() => {
      try { return JSON.parse(localStorage.getItem('moodcoach_art_gallery') || '[]').length; }
      catch { return 0; }
    })();
    const meditationCount = getMeditationTimestamps().length;

    const data = buildAchievementData(
      streak.current, streak.longest,
      records.length, meditationCount,
      gratitudeCount, assessmentCount, artCount
    );
    const newlyEarned = checkAchievements(data);
    if (newlyEarned.length > 0) {
      setNewBadge(newlyEarned[0].icon + ' ' + newlyEarned[0].title);
      setTimeout(() => setNewBadge(null), 3000);
    }
  }, []);

  const earnedIds = useMemo(() => getEarnedAchievementIds(), []);
  const allAchievements = getAllAchievements();

  // Month emotion distribution
  const emotionDist = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of records) {
      const d = new Date(r.timestamp);
      if (d.getFullYear() === year && d.getMonth() === month && r.emotionType) {
        counts[r.emotionType] = (counts[r.emotionType] || 0) + 1;
      }
    }
    return EMOTION_TYPES
      .filter((e) => counts[e.id])
      .map((e) => ({ ...e, count: counts[e.id] }))
      .sort((a, b) => b.count - a.count);
  }, [records, year, month]);

  const goPrev = useCallback(() => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
    setSelectedDay(null);
  }, [year, month]);

  const goNext = useCallback(() => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
    setSelectedDay(null);
  }, [year, month]);

  const handleDayClick = useCallback((dateKey: string, dayRecords: EmotionRecord[]) => {
    setSelectedDay(dateKey);
    setSelectedRecords(dayRecords);
  }, []);

  // Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) {
      if (dx > 0) goPrev();
      else goNext();
    }
  };

  return (
    <div className="page page-enter" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="nav-bar">
        <Link href="/" className="btn btn-ghost btn-sm">🏠 首页</Link>
        <Link href="/dashboard" className="btn btn-ghost btn-sm">📈 记录</Link>
      </div>

      <h2 className="heading-section text-center" style={{ marginBottom: 'var(--sp-2)' }}>
        📅 情绪日历
      </h2>

      {/* Streak */}
      <div className="glass" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--sun-core)' }}>
            {streak.current}
          </div>
          <div className="text-caption">当前连续</div>
        </div>
        <div style={{ width: 1, background: 'var(--glass-border)' }} />
        <div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--coral)' }}>
            {streak.longest}
          </div>
          <div className="text-caption">最长连续</div>
        </div>
        <div style={{ width: 1, background: 'var(--glass-border)' }} />
        <div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            {records.length}
          </div>
          <div className="text-caption">总记录</div>
        </div>
      </div>

      {/* Month navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
        <button className="btn btn-ghost btn-sm" onClick={goPrev}>←</button>
        <span style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>
          {year}年{month + 1}月
        </span>
        <button className="btn btn-ghost btn-sm" onClick={goNext}>→</button>
      </div>

      {/* Calendar */}
      <div className="glass" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
        <CalendarGrid year={year} month={month} records={records} onDayClick={handleDayClick} />
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="glass" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
          <div style={{ fontWeight: 600, marginBottom: 'var(--sp-3)' }}>{selectedDay}</div>
          {selectedRecords.length === 0 ? (
            <p className="text-caption">这天没有记录</p>
          ) : (
            selectedRecords.map((r, i) => {
              const emo = EMOTION_TYPES.find((e) => e.id === r.emotionType);
              return (
                <div key={i} style={{ marginBottom: 'var(--sp-2)', fontSize: 'var(--text-sm)' }}>
                  {emo?.emoji} {emo?.label || '未知'} · 强度 {r.intensityBefore}→{r.intensityAfter}
                  {r.emotionText && <span style={{ opacity: 0.7 }}> · {r.emotionText.slice(0, 30)}</span>}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Emotion distribution */}
      {emotionDist.length > 0 && (
        <div className="glass" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
          <div style={{ fontWeight: 600, marginBottom: 'var(--sp-3)' }}>本月情绪分布</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
            {emotionDist.map((e) => (
              <span key={e.id} className="tag" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: e.color }} />
                {e.emoji} {e.label} ×{e.count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ width: '100%', marginBottom: 'var(--sp-3)' }}
        onClick={() => setShowBadges(!showBadges)}
      >
        🏆 成就徽章 ({earnedIds.length}/{allAchievements.length})
      </button>

      {showBadges && (
        <div className="glass" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-3)' }}>
            {allAchievements.map((ach) => {
              const earned = earnedIds.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className="glass"
                  style={{
                    padding: 'var(--sp-3)',
                    textAlign: 'center',
                    opacity: earned ? 1 : 0.4,
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <div style={{ fontSize: '1.5rem' }}>{ach.icon}</div>
                  <div style={{ fontWeight: 600, marginTop: 'var(--sp-1)' }}>{ach.title}</div>
                  <div className="text-caption">{ach.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New badge toast */}
      {newBadge && (
        <div className="toast show">
          🎉 解锁成就：{newBadge}
        </div>
      )}
    </div>
  );
}
