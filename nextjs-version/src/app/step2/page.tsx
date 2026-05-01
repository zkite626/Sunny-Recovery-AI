'use client';

import { useState, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BODY_ZONES } from '@/lib/emotion';
import { saveCurrent } from '@/lib/storage';
import ProgressBar from '@/components/ProgressBar';

const styles: Record<string, React.CSSProperties> = {
  bodyMapContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 'var(--sp-8)',
    flexWrap: 'wrap',
  },
  bodySvgWrap: {
    width: 200,
    position: 'relative',
  },
  zoneList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--sp-3)',
    flex: 1,
    minWidth: 200,
  },
  zoneItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--sp-3)',
    padding: 'var(--sp-3) var(--sp-4)',
    borderRadius: 'var(--r-sm)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'rgba(255,255,255,0.3)',
    border: '1.5px solid transparent',
  },
  zoneItemActive: {
    background: 'linear-gradient(135deg, rgba(253,160,133,0.15), rgba(246,166,35,0.1))',
    borderColor: 'var(--peach)',
  },
  zoneDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.08)',
    flexShrink: 0,
    transition: 'all 0.3s ease',
  },
  zoneDotActive: {
    background: 'var(--peach)',
    boxShadow: '0 0 8px rgba(253,160,133,0.5)',
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontWeight: 600,
    fontSize: 'var(--text-sm)',
    color: 'var(--text-primary)',
  },
  zoneDesc: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-ghost)',
  },
};

const HOTSPOT_DEFAULT = 'rgba(253,226,202,0.4)';
const HOTSPOT_ACTIVE = 'rgba(253,160,133,0.4)';
const STROKE_DEFAULT = 'rgba(246,166,35,0.3)';
const STROKE_ACTIVE = 'rgba(253,160,133,0.6)';

export default function Step2Page() {
  return (
    <Suspense fallback={<div className="page text-center text-body">加载中...</div>}>
      <Step2Content />
    </Suspense>
  );
}

function Step2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'personal';

  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());
  const svgRef = useRef<SVGSVGElement>(null);

  const toggleZone = useCallback((zoneId: string) => {
    setSelectedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) {
        next.delete(zoneId);
      } else {
        next.add(zoneId);
      }
      return next;
    });
  }, []);

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const target = e.target as SVGElement;
      const zoneId = target.getAttribute('data-zone');
      if (zoneId) {
        toggleZone(zoneId);
      }
    },
    [toggleZone],
  );

  function goNext() {
    saveCurrent({ bodyZones: Array.from(selectedZones) });
    router.push(`/step3?mode=${mode}`);
  }

  function hotspotFill(zoneId: string, defaultFill: string, activeFill: string) {
    return selectedZones.has(zoneId) ? activeFill : defaultFill;
  }

  function hotspotStroke(zoneId: string) {
    return selectedZones.has(zoneId) ? STROKE_ACTIVE : STROKE_DEFAULT;
  }

  return (
    <div className="page page-enter">
      <ProgressBar step={2} />

      <div className="nav-bar">
        <Link href="/" className="btn btn-ghost btn-sm">🏠 首页</Link>
        <Link href="/step1" className="btn btn-ghost btn-sm">← 上一步</Link>
      </div>

      <div className="text-center">
        <h2 className="heading-section">你的身体在哪里紧张？</h2>
        <p className="text-body">情绪会储存在身体里。点击你感到不适的部位</p>
      </div>

      <div className="glass">
        <div style={styles.bodyMapContainer}>
          {/* Body SVG */}
          <div style={styles.bodySvgWrap}>
            <svg
              ref={svgRef}
              viewBox="0 0 200 450"
              xmlns="http://www.w3.org/2000/svg"
              onClick={handleSvgClick}
              style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
            >
              {/* Head */}
              <ellipse
                data-zone="head"
                cx="100" cy="40" rx="30" ry="35"
                fill={hotspotFill('head', 'rgba(253,226,202,0.4)', HOTSPOT_ACTIVE)}
                stroke={hotspotStroke('head')}
                strokeWidth={1.5}
              />
              {/* Eyes */}
              <ellipse
                data-zone="eyes"
                cx="100" cy="38" rx="20" ry="6"
                fill={hotspotFill('eyes', 'rgba(253,226,202,0.3)', HOTSPOT_ACTIVE)}
                stroke={hotspotStroke('eyes')}
                strokeWidth={1}
              />
              {/* Throat */}
              <rect
                data-zone="throat"
                x="88" y="72" width="24" height="18" rx="8"
                fill={hotspotFill('throat', 'rgba(253,226,202,0.3)', HOTSPOT_ACTIVE)}
                stroke={hotspotStroke('throat')}
                strokeWidth={1}
              />
              {/* Back */}
              <path
                data-zone="back"
                d="M60,95 Q100,85 140,95 L140,160 Q100,155 60,160 Z"
                fill={hotspotFill('back', 'rgba(253,226,202,0.35)', HOTSPOT_ACTIVE)}
                stroke={hotspotStroke('back')}
                strokeWidth={1.5}
              />
              {/* Chest */}
              <ellipse
                data-zone="chest"
                cx="100" cy="125" rx="28" ry="22"
                fill={hotspotFill('chest', 'rgba(253,226,202,0.3)', HOTSPOT_ACTIVE)}
                stroke={hotspotStroke('chest')}
                strokeWidth={1.5}
              />
              {/* Stomach */}
              <ellipse
                data-zone="stomach"
                cx="100" cy="180" rx="25" ry="20"
                fill={hotspotFill('stomach', 'rgba(253,226,202,0.3)', HOTSPOT_ACTIVE)}
                stroke={hotspotStroke('stomach')}
                strokeWidth={1.5}
              />
              {/* Hands (left arm) */}
              <path
                data-zone="hands"
                d="M60,95 L40,160 L35,220 Q30,230 38,235 L48,225 L55,170 L60,160"
                fill={hotspotFill('hands', 'rgba(253,226,202,0.3)', HOTSPOT_ACTIVE)}
                stroke={hotspotStroke('hands')}
                strokeWidth={1}
              />
              {/* Hands (right arm) */}
              <path
                data-zone="hands"
                d="M140,95 L160,160 L165,220 Q170,230 162,235 L152,225 L145,170 L140,160"
                fill={hotspotFill('hands', 'rgba(253,226,202,0.3)', HOTSPOT_ACTIVE)}
                stroke={hotspotStroke('hands')}
                strokeWidth={1}
              />
              {/* Torso (decorative, non-interactive) */}
              <path
                d="M75,200 Q100,195 125,200 L125,230 Q100,235 75,230 Z"
                fill="rgba(253,226,202,0.2)"
                stroke="rgba(246,166,35,0.15)"
                strokeWidth={1}
              />
              {/* Legs (left) */}
              <path
                data-zone="legs"
                d="M78,230 L72,340 L65,400 Q60,420 75,420 L85,420 Q90,420 88,400 L90,340 L92,230"
                fill={hotspotFill('legs', 'rgba(253,226,202,0.3)', HOTSPOT_ACTIVE)}
                stroke={hotspotStroke('legs')}
                strokeWidth={1}
              />
              {/* Legs (right) */}
              <path
                data-zone="legs"
                d="M108,230 L110,340 L112,400 Q110,420 125,420 L135,420 Q140,420 138,400 L128,340 L122,230"
                fill={hotspotFill('legs', 'rgba(253,226,202,0.3)', HOTSPOT_ACTIVE)}
                stroke={hotspotStroke('legs')}
                strokeWidth={1}
              />
            </svg>
          </div>

          {/* Zone list */}
          <div style={styles.zoneList}>
            {BODY_ZONES.map((zone) => {
              const isActive = selectedZones.has(zone.id);
              return (
                <div
                  key={zone.id}
                  style={{
                    ...styles.zoneItem,
                    ...(isActive ? styles.zoneItemActive : {}),
                  }}
                  onClick={() => toggleZone(zone.id)}
                >
                  <div
                    style={{
                      ...styles.zoneDot,
                      ...(isActive ? styles.zoneDotActive : {}),
                    }}
                  />
                  <div style={styles.zoneInfo}>
                    <div style={styles.zoneName}>{zone.label}</div>
                    <div style={styles.zoneDesc}>{zone.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-body" style={{ marginBottom: 'var(--sp-3)' }}>
          已选择 {selectedZones.size} 个部位
        </p>
        <button className="btn btn-sun btn-lg" onClick={goNext}>
          继续，与AI对话 →
        </button>
      </div>
    </div>
  );
}
