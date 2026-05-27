import { useState, useCallback, useRef, useEffect } from 'react';
import type { ToastAction } from '../types';

export function useToast() {
  const [toast, setToast] = useState<ToastAction | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const showToast = useCallback((action: ToastAction) => {
    setToast(action);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setToast(null);
    }, 5000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { toast, showToast, hideToast };
}
