'use client';

import Link from 'next/link';

export default function Nav({ back }: { back?: { href: string; label: string } }) {
  return (
    <div className="nav-bar">
      <Link href="/" className="btn btn-ghost btn-sm">首页</Link>
      <Link href="/chat" className="btn btn-ghost btn-sm">AI对话</Link>
      {back && (
        <Link href={back.href} className="btn btn-ghost btn-sm">
          {back.label}
        </Link>
      )}
    </div>
  );
}
