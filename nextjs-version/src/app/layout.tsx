import type { Metadata, Viewport } from 'next';
import './globals.css';
import Background from '@/components/Background';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: '晴愈AI · 直面情绪 向阳而生',
  description: '基于 AI + 认知行为疗法(CBT) 的大学生心理健康辅助工具',
  authors: [{ name: '鸢.', url: 'https://github.com/zkite626' }],
  creator: '鸢.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '晴愈AI',
    startupImage: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Background />
        <div className="app">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
