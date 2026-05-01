'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PHQ9_QUESTIONS,
  PHQ9_OPTIONS,
  GAD7_QUESTIONS,
  GAD7_OPTIONS,
  ASSESSMENT_ANALYSIS_PROMPT,
} from '@/lib/prompt';
import { getApiKey, saveAssessmentResult } from '@/lib/storage';
import { callAI } from '@/lib/api';

type AssessmentType = 'phq9' | 'gad7';

interface Question {
  id: number;
  text: string;
}

interface Option {
  value: number;
  label: string;
}

const LEVEL_CONFIG: Record<
  string,
  { label: string; cssClass: string; descriptions: Record<string, string> }
> = {
  none: {
    label: '无/极轻微',
    cssClass: 'assess-level--mild',
    descriptions: {
      phq9: '你的情绪状态良好，没有明显的抑郁症状。继续保持积极的生活方式和良好的心态！',
      gad7: '你的焦虑水平很低，心态平稳。继续保持当下的生活节奏，适当运动和社交。',
    },
  },
  mild: {
    label: '轻度',
    cssClass: 'assess-level--mild',
    descriptions: {
      phq9: '你可能存在轻度抑郁情绪。建议关注自己的情绪变化，尝试运动、社交和规律作息来调节。',
      gad7: '你可能存在轻度焦虑。建议尝试正念呼吸、适度运动，以及与信任的人倾诉来缓解。',
    },
  },
  moderate: {
    label: '中度',
    cssClass: 'assess-level--moderate',
    descriptions: {
      phq9: '你可能存在中度抑郁症状。建议认真关注自己的状态，考虑向学校心理咨询中心寻求帮助。',
      gad7: '你可能存在中度焦虑。建议向学校心理咨询中心咨询，学习一些情绪管理的技巧。',
    },
  },
  moderate_severe: {
    label: '中重度',
    cssClass: 'assess-level--moderate',
    descriptions: {
      phq9: '你的抑郁症状可能处于中重度水平。强烈建议尽快寻求专业心理咨询或医疗帮助，你不需独自面对。',
      gad7: '',
    },
  },
  severe: {
    label: '重度',
    cssClass: 'assess-level--severe',
    descriptions: {
      phq9: '你的抑郁症状可能处于较高水平。请务必尽快联系专业心理医生或精神科医生，及时获得专业帮助很重要。',
      gad7: '你的焦虑水平较高。请尽快寻求专业心理咨询或医疗帮助，专业支持可以帮助你改善现状。',
    },
  },
};

function getLevel(type: AssessmentType, score: number): string {
  if (type === 'phq9') {
    if (score <= 4) return 'none';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    if (score <= 19) return 'moderate_severe';
    return 'severe';
  } else {
    if (score <= 4) return 'none';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    return 'severe';
  }
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="page text-center text-body">加载中...</div>}>
      <AssessmentContent />
    </Suspense>
  );
}

function AssessmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type: AssessmentType =
    searchParams.get('type') === 'gad7' ? 'gad7' : 'phq9';

  const questions: Question[] = type === 'phq9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const options: Option[] = type === 'phq9' ? PHQ9_OPTIONS : GAD7_OPTIONS;

  const [phase, setPhase] = useState<'quiz' | 'result'>('quiz');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleSelect = useCallback(
    (value: number) => {
      const newAnswers = [...answers, value];
      setAnswers(newAnswers);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const totalScore = newAnswers.reduce((sum, v) => sum + v, 0);
        const maxScore = questions.length * 3;
        const resultLevel = getLevel(type, totalScore);

        setScore(totalScore);
        setLevel(resultLevel);
        setPhase('result');

        saveAssessmentResult({
          type,
          score: totalScore,
          maxScore,
          level: resultLevel,
          answers: newAnswers,
        });

        const apiKey = getApiKey();
        if (apiKey) {
          setAnalyzing(true);
          const title = type === 'phq9' ? 'PHQ-9 抑郁筛查' : 'GAD-7 焦虑筛查';
          const levelLabel = LEVEL_CONFIG[resultLevel]?.label || '';
          callAI(ASSESSMENT_ANALYSIS_PROMPT, [
            {
              role: 'user',
              content: `量表：${title}\n总分：${totalScore} / ${maxScore}\n等级：${levelLabel}\n各题作答：${newAnswers.join(', ')}`,
            },
          ])
            .then((text) => setAiAnalysis(text))
            .catch(() => {})
            .finally(() => setAnalyzing(false));
        }
      }
    },
    [answers, currentIndex, questions, type]
  );

  const handleRetry = useCallback(() => {
    setPhase('quiz');
    setCurrentIndex(0);
    setAnswers([]);
    setScore(0);
    setLevel('');
    setAiAnalysis('');
  }, []);

  const handleGoHome = useCallback(() => {
    router.push('/');
  }, [router]);

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const levelConfig = LEVEL_CONFIG[level];
  const levelDesc = levelConfig?.descriptions[type] || '';

  return (
    <div className="page page-enter">
      <div className="nav-bar">
        <Link href="/" className="btn btn-ghost btn-sm">
          首页
        </Link>
        <Link href="/chat" className="btn btn-ghost btn-sm">
          AI 对话
        </Link>
      </div>

      {phase === 'quiz' && (
        <div>
          <div className="text-center" style={{ marginBottom: 'var(--sp-8)' }}>
            <h2 className="heading-section">
              {type === 'phq9' ? 'PHQ-9 抑郁筛查' : 'GAD-7 焦虑筛查'}
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              过去两周内，以下问题困扰你的频率是？
            </p>
          </div>

          <div className="assess-progress-bar">
            <div
              className="assess-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="glass" style={{ padding: 'var(--sp-8)' }}>
            <div className="assess-question">
              {currentIndex + 1}. {questions[currentIndex].text}
            </div>

            <div className="assess-options">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  className="assess-option"
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <p
            className="text-center text-body"
            style={{
              marginTop: 'var(--sp-6)',
              color: 'var(--text-ghost)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {currentIndex + 1} / {questions.length}
          </p>
        </div>
      )}

      {phase === 'result' && levelConfig && (
        <div>
          <div className="text-center" style={{ marginBottom: 'var(--sp-6)' }}>
            <h2 className="heading-section">
              {type === 'phq9' ? 'PHQ-9 评估结果' : 'GAD-7 评估结果'}
            </h2>
          </div>

          <div className="glass" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
            <div className="assess-score-ring">
              <div className="assess-score-num">{score}</div>
              <div className="assess-score-label">
                / {questions.length * 3}
              </div>
            </div>

            <span className={`assess-level ${levelConfig.cssClass}`}>
              {levelConfig.label}
            </span>

            <p className="text-body" style={{ marginBottom: 'var(--sp-6)' }}>
              {levelDesc}
            </p>

            {analyzing && (
              <div
                className="text-body"
                style={{
                  padding: 'var(--sp-6)',
                  color: 'var(--text-ghost)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                AI 正在分析中...
              </div>
            )}

            {aiAnalysis && !analyzing && (
              <div
                className="glass"
                style={{
                  padding: 'var(--sp-6)',
                  textAlign: 'left',
                  marginBottom: 'var(--sp-6)',
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 'var(--sp-3)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--sun-core)',
                  }}
                >
                  AI 分析
                </div>
                <p className="text-body" style={{ fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>
                  {aiAnalysis}
                </p>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: 'var(--sp-3)',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button className="btn btn-sun btn-sm" onClick={handleRetry}>
                重新测评
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleGoHome}>
                返回首页
              </button>
              <Link href="/chat" className="btn btn-ghost btn-sm">
                AI 对话
              </Link>
            </div>
          </div>

          <p
            className="text-center text-body"
            style={{
              marginTop: 'var(--sp-6)',
              color: 'var(--text-ghost)',
              fontSize: 'var(--text-xs)',
            }}
          >
            本测评仅供参考，不能替代专业诊断。如有严重困扰，请联系学校心理咨询中心。
          </p>
        </div>
      )}
    </div>
  );
}
