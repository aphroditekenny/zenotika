import { useEffect, useRef, useState } from 'react';

interface UseTypedTextOptions {
  speedMs?: number; // per character
  disabled?: boolean;
  immediate?: boolean; // skip animation
}

export function useTypedText(full: string, { speedMs = 18, disabled, immediate }: UseTypedTextOptions = {}) {
  const [text, setText] = useState(immediate || disabled ? full : '');
  const indexRef = useRef(0);
  const prevRef = useRef(full);

  useEffect(() => {
    if (prevRef.current !== full) {
      prevRef.current = full;
      indexRef.current = 0;
      setText(disabled || immediate ? full : '');
    }
  }, [full, disabled, immediate]);

  useEffect(() => {
    if (disabled || immediate) return;
    let frame: number | null = null;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      indexRef.current += 1;
      setText(full.slice(0, indexRef.current));
      if (indexRef.current < full.length) {
        frame = window.setTimeout(tick, speedMs);
      }
    };
    if (text !== full) {
      frame = window.setTimeout(tick, speedMs);
    }
    return () => { if (frame) window.clearTimeout(frame); cancelled = true; };
  }, [full, speedMs, disabled, immediate]);

  return text;
}
