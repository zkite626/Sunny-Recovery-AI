'use client';

import Link from 'next/link';
import ApiKeyModal from '@/components/ApiKeyModal';

const modules = [
  { href: '/step1', icon: '🌱', title: '情绪疗愈', desc: '4步引导流程' },
  { href: '/assessment', icon: '📊', title: '心理测评', desc: 'PHQ-9 · GAD-7' },
  { href: '/breathe', icon: '🫁', title: '正念呼吸', desc: '3种呼吸引导' },
  { href: '/gratitude', icon: '🌿', title: '感恩日记', desc: '记录美好瞬间' },
  { href: '/dashboard', icon: '📈', title: '我的记录', desc: '情绪变化趋势' },
  { href: '/calendar', icon: '📅', title: '情绪日历', desc: '记录与回顾每一天' },
  { href: '/step5', icon: '🎨', title: '情绪卡片', desc: '专属疗愈记录' },
  { href: '/calm', icon: '🌊', title: '沉浸式互动', desc: '流动粒子冥想空间' },
  { href: '/meditation', icon: '🧘', title: '正念冥想', desc: 'AI引导冥想练习' },
  { href: '/art', icon: '🎨', title: '情绪涂鸦', desc: '用画笔表达内心' },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <span className="hero-badge"><img src="/logo.png" alt="晴愈AI" className="hero-logo" /></span>
        <h1 className="hero-title">
          直面情绪<br /><em>向阳而生</em>
        </h1>
        <p className="hero-subtitle">
          结合 AI 与心理学，陪你觉察情绪、<br />
          拆解负面想法、找到内心力量。
        </p>
      </section>

      <div className="page" style={{ paddingTop: 0 }}>
        <Link
          href="/chat"
          className="glass"
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)', textDecoration: 'none', color: 'inherit', animation: 'fadeUp 0.8s 0.2s var(--ease-out-expo) both' }}
        >
          <span style={{ fontSize: '2.5rem' }}>💬</span>
          <div>
            <div className="module-title">AI智能对话</div>
            <div className="module-desc" style={{ textAlign: 'left' }}>
              和晴愈聊聊，它会根据你的情绪自动选择最合适的方式帮助你
            </div>
          </div>
        </Link>

        <div className="module-grid stagger">
          {modules.map((m) => (
            <Link key={m.href} href={m.href} className="module-card glass">
              <span className="module-icon">{m.icon}</span>
              <div className="module-title">{m.title}</div>
              <div className="module-desc">{m.desc}</div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <ApiKeyModal />
        </div>
      </div>

      <div className="disclaimer">
        本工具基于认知行为疗法（CBT）原理设计，仅供情绪觉察与自我探索参考，<br />
        不能替代专业心理咨询。如遇严重心理困扰，请联系学校心理咨询中心。
      </div>
    </>
  );
}
