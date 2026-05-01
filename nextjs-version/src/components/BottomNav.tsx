'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', icon: '🏠', label: '首页' },
  { href: '/chat', icon: '💬', label: '对话' },
  { href: '/calm', icon: '🌊', label: '沉浸' },
  { href: '/calendar', icon: '📅', label: '日历' },
  { href: '/meditation', icon: '🧘', label: '冥想' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="bottom-nav-item"
            style={{
              color: active ? 'var(--sun-core)' : 'var(--text-secondary)',
              fontWeight: active ? 600 : 400,
            }}
          >
            <span className="bottom-nav-icon">{tab.icon}</span>
            <span className="bottom-nav-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
