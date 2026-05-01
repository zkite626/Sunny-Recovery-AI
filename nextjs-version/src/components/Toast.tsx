'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useToast() {
  const toastRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    if (!toastRef.current) {
      const div = document.createElement('div');
      div.className = 'toast';
      document.body.appendChild(div);
      toastRef.current = div;
    }
    toastRef.current.textContent = msg;
    toastRef.current.classList.add('show');
    setTimeout(() => toastRef.current?.classList.remove('show'), 2500);
  }, []);

  return { showToast };
}
