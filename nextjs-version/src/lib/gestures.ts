'use client';

import { useEffect, useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export function useSwipe(
  ref: React.RefObject<HTMLElement | null>,
  handlers: SwipeHandlers
) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const threshold = handlers.threshold || 50;

    const onTouchStart = (e: TouchEvent) => {
      startRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!startRef.current) return;
      const dx = e.changedTouches[0].clientX - startRef.current.x;
      const dy = e.changedTouches[0].clientY - startRef.current.y;
      startRef.current = null;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > threshold) handlers.onSwipeRight?.();
        else if (dx < -threshold) handlers.onSwipeLeft?.();
      } else {
        if (dy > threshold) handlers.onSwipeDown?.();
        else if (dy < -threshold) handlers.onSwipeUp?.();
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [ref, handlers]);
}

export function useLongPress(
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void,
  delay = 500
) {
  const timerRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const start = () => {
      timerRef.current = setTimeout(callback, delay);
    };

    const cancel = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchend', cancel, { passive: true });
    el.addEventListener('touchmove', cancel, { passive: true });

    return () => {
      cancel();
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchend', cancel);
      el.removeEventListener('touchmove', cancel);
    };
  }, [ref, callback, delay]);
}
