'use client';

import { useEffect, useRef } from 'react';

interface HandTrackerProps {
  onHandMove: (point: { x: number; y: number; vx: number; vy: number }) => void;
  onPermissionDenied: () => void;
  width: number;
  height: number;
}

export default function HandTracker({ onHandMove, onPermissionDenied, width, height }: HandTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevPosRef = useRef<{ x: number; y: number } | null>(null);
  const animRef = useRef(0);
  const detectorRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Dynamic import mediapipe
        const vision = await import('@mediapipe/tasks-vision');
        const { HandLandmarker, FilesetResolver } = vision;

        if (cancelled) return;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (cancelled) return;

        const detector = await HandLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });

        if (cancelled) return;
        detectorRef.current = detector;

        const detect = () => {
          if (cancelled || !videoRef.current || videoRef.current.readyState < 2) {
            animRef.current = requestAnimationFrame(detect);
            return;
          }

          try {
            const result = (detector as { detectForVideo: (video: HTMLVideoElement, time: number) => { landmarks: Array<Array<{ x: number; y: number; z: number }>> } }).detectForVideo(
              videoRef.current,
              performance.now()
            );

            if (result.landmarks && result.landmarks.length > 0) {
              // Use index fingertip (landmark 8)
              const tip = result.landmarks[0][8];
              const x = (1 - tip.x) * width; // Mirror horizontally
              const y = tip.y * height;

              const prev = prevPosRef.current;
              const vx = prev ? (x - prev.x) * 0.5 : 0;
              const vy = prev ? (y - prev.y) * 0.5 : 0;
              prevPosRef.current = { x, y };

              onHandMove({ x, y, vx, vy });
            }
          } catch {
            // Skip frame errors
          }

          animRef.current = requestAnimationFrame(detect);
        };

        detect();
      } catch {
        if (!cancelled) onPermissionDenied();
      }
    };

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animRef.current);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [width, height, onHandMove, onPermissionDenied]);

  return (
    <video
      ref={videoRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.15,
        transform: 'scaleX(-1)',
      }}
      playsInline
      muted
    />
  );
}
