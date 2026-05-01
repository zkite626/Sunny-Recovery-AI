'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useRef, useEffect, useCallback, Suspense } from 'react'

const PATTERNS = {
  '478': { inhale: 4, hold: 7, exhale: 8, name: '4-7-8 呼吸法', desc: '吸气4秒 · 屏息7秒 · 呼气8秒' },
  'box': { inhale: 4, hold: 4, exhale: 4, holdAfter: 4, name: '方形呼吸', desc: '吸气4秒 · 屏息4秒 · 呼气4秒 · 屏息4秒' },
  'coherence': { inhale: 5, hold: 0, exhale: 5, name: '共振呼吸', desc: '吸气5秒 · 呼气5秒' },
} as const

type PatternKey = keyof typeof PATTERNS

function BreatheContent() {
  const searchParams = useSearchParams()

  const initialPattern = (searchParams.get('pattern') || '478') as PatternKey
  const initialCycles = Number(searchParams.get('cycles')) || 4

  const [currentPattern, setCurrentPattern] = useState<PatternKey>(
    PATTERNS[initialPattern] ? initialPattern : '478'
  )
  const [totalCycles] = useState(initialCycles)
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<string>('')
  const [countdown, setCountdown] = useState<number>(0)
  const [currentCycle, setCurrentCycle] = useState<number>(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cancelledRef = useRef(false)

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const sleep = (seconds: number) =>
    new Promise<void>((resolve) => {
      let remaining = seconds
      setCountdown(remaining)
      timerRef.current = setInterval(() => {
        remaining -= 1
        setCountdown(remaining)
        if (remaining <= 0) {
          clearTimer()
          resolve()
        }
      }, 1000)
    })

  const runBreathingCycle = useCallback(
    async () => {
      const pattern = PATTERNS[currentPattern]

      setPhase('inhale')
      await sleep(pattern.inhale)
      if (cancelledRef.current) return

      if (pattern.hold > 0) {
        setPhase('hold')
        await sleep(pattern.hold)
        if (cancelledRef.current) return
      }

      setPhase('exhale')
      await sleep(pattern.exhale)
      if (cancelledRef.current) return

      if ('holdAfter' in pattern && pattern.holdAfter && pattern.holdAfter > 0) {
        setPhase('hold')
        await sleep(pattern.holdAfter)
        if (cancelledRef.current) return
      }
    },
    [currentPattern]
  )

  const startBreathing = useCallback(async () => {
    cancelledRef.current = false
    setRunning(true)

    for (let i = 1; i <= totalCycles; i++) {
      setCurrentCycle(i)
      await runBreathingCycle()
      if (cancelledRef.current) break
    }

    if (!cancelledRef.current) {
      setPhase('done')
    }
    setRunning(false)
    setCountdown(0)
  }, [totalCycles, runBreathingCycle])

  const stopBreathing = () => {
    cancelledRef.current = true
    clearTimer()
    setRunning(false)
    setPhase('')
    setCountdown(0)
    setCurrentCycle(0)
  }

  useEffect(() => {
    return () => {
      cancelledRef.current = true
      clearTimer()
    }
  }, [])

  const patternInfo = PATTERNS[currentPattern]

  return (
    <>
      <div className="text-center">
        <h2 className="heading-section">正念呼吸</h2>
        <p className="text-body">{patternInfo.desc}</p>
      </div>

      {/* Mode selection */}
      {!running && phase !== 'done' && (
        <div className="glass">
          <p className="text-caption" style={{ marginBottom: 'var(--sp-4)' }}>选择呼吸模式</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {(Object.keys(PATTERNS) as PatternKey[]).map((key) => (
              <button
                key={key}
                className={`assess-option${currentPattern === key ? ' selected' : ''}`}
                onClick={() => { if (!running) setCurrentPattern(key) }}
              >
                <strong>{PATTERNS[key].name}</strong> — {PATTERNS[key].desc}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Breathing animation */}
      {(running || phase === 'done') && (
        <div>
          <div className="breathe-phase">
            {phase === 'done' ? '练习完成 🌿' : phase === 'inhale' ? '吸气...' : phase === 'hold' ? '屏住...' : '呼气...'}
          </div>
          <div className={`breathe-circle${phase && phase !== 'done' ? ` ${phase}` : ''}`}>
            <span>
              {phase === 'done' ? '完成' : phase === 'inhale' ? '吸气' : phase === 'hold' ? '屏住' : '呼气'}
            </span>
          </div>
          {running && <div className="breathe-counter">{countdown}</div>}
          <div className="breathe-cycles">
            {running ? `第 ${currentCycle} / ${totalCycles} 轮` : ''}
          </div>

          <div className="text-center" style={{ marginTop: 'var(--sp-6)' }}>
            {running ? (
              <button className="btn btn-ghost" onClick={stopBreathing}>停止</button>
            ) : (
              <button className="btn btn-ghost" onClick={stopBreathing}>返回</button>
            )}
          </div>
        </div>
      )}

      {/* Start button */}
      {!running && phase !== 'done' && (
        <div className="text-center">
          <button className="btn btn-sun btn-lg" onClick={startBreathing}>开始呼吸练习</button>
          <p className="text-caption" style={{ marginTop: 'var(--sp-3)' }}>建议练习 4-6 个循环</p>
        </div>
      )}
    </>
  )
}

export default function BreathePage() {
  return (
    <div className="page page-enter">
      <div className="nav-bar">
        <Link href="/" className="btn btn-ghost btn-sm">首页</Link>
        <Link href="/chat" className="btn btn-ghost btn-sm">AI对话</Link>
      </div>

      <Suspense fallback={<div className="text-center text-body">加载中...</div>}>
        <BreatheContent />
      </Suspense>
    </div>
  )
}
