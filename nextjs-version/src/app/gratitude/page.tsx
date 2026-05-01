'use client'

import Link from 'next/link'
import { useState } from 'react'
import { saveGratitude, getGratitude, type GratitudeEntry } from '@/lib/storage'

function showToast(message: string) {
  let el = document.querySelector('.toast') as HTMLElement
  if (!el) {
    el = document.createElement('div')
    el.className = 'toast'
    document.body.appendChild(el)
  }
  el.textContent = message
  el.classList.add('show')
  setTimeout(() => el.classList.remove('show'), 2000)
}

export default function GratitudePage() {
  const [inputs, setInputs] = useState(['', '', ''])
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState<GratitudeEntry[]>(() =>
    getGratitude().reverse().slice(0, 10)
  )

  const updateInput = (index: number, value: string) => {
    setInputs((prev) => prev.map((v, i) => (i === index ? value : v)))
  }

  const handleSave = () => {
    const items = inputs.map((v) => v.trim()).filter((v) => v.length > 0)
    if (items.length === 0) {
      showToast('请至少写一件感恩的事')
      return
    }
    saveGratitude(items)
    setInputs(['', '', ''])
    setSaved(true)
    setHistory(getGratitude().reverse().slice(0, 10))
    showToast('🌿 感恩日记已保存')
  }

  const formatDate = (timestamp: string) => {
    const d = new Date(timestamp)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  return (
    <div className="page page-enter">
      <nav className="nav-bar">
        <Link href="/" className="btn btn-ghost btn-sm">
          返回首页
        </Link>
        <Link href="/chat" className="btn btn-ghost btn-sm">
          AI 对话
        </Link>
      </nav>

      <div className="heading-section">
        <h1>感恩日记</h1>
        <p className="text-body text-center">写下今天让你感恩的3件小事</p>
      </div>

      {!saved ? (
        <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="gratitude-input-group">
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="gratitude-num">{i + 1}</span>
                <input
                  className="gratitude-input"
                  type="text"
                  placeholder="今天我感恩..."
                  value={inputs[i]}
                  onChange={(e) => updateInput(i, e.target.value)}
                />
              </div>
            ))}
          </div>
          <button className="btn btn-sun" onClick={handleSave} style={{ marginTop: '1rem', width: '100%' }}>
            🌿 保存今天
          </button>
        </div>
      ) : (
        <div className="glass" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌿</p>
          <h2 style={{ marginBottom: '0.5rem' }}>已记录</h2>
          <p className="text-body text-caption">
            感恩练习可以提升幸福感，帮助你看到生活中美好的一面。每天坚持记录，你会发现自己越来越快乐。
          </p>
          <button
            className="btn btn-ghost"
            style={{ marginTop: '1rem' }}
            onClick={() => setSaved(false)}
          >
            继续记录
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 className="text-body" style={{ marginBottom: '1rem' }}>历史记录</h3>
          {history.map((entry) => (
            <div key={entry.id} className="gratitude-history-item glass" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <p className="gratitude-date text-caption">{formatDate(entry.timestamp)}</p>
              <ul className="gratitude-list">
                {entry.items.map((item, idx) => (
                  <li key={idx}>🌿 {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
