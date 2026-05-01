import type { Metadata } from 'next';
import './globals.css';
import Background from '@/components/Background';

export const metadata: Metadata = {
  title: '晴愈AI · 直面情绪 向阳而生',
  description: '基于 AI + 认知行为疗法(CBT) 的大学生心理健康辅助工具',
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
      </body>
    </html>
  );
}
