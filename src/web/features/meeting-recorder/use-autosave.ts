import { useEffect, useRef } from 'react';
import { autosaveDue } from './autosave-due';

/**
 * Brief 22 build notes and D-207: while the minutes are being written, the
 * text saves itself at the administrator's interval, so nothing is lost on
 * a weak signal. With the interval unset, only the Save button saves (8.1).
 */
export function useAutosave(p: {
  text: string;
  saved: string;
  busy: boolean;
  seconds: number | null;
  save: () => void;
}): void {
  const latest = useRef(p);
  useEffect(() => {
    latest.current = p;
  });
  useEffect(() => {
    if (p.seconds === null) return;
    const timer = setInterval(() => {
      if (autosaveDue(latest.current)) latest.current.save();
    }, p.seconds * 1000);
    return () => {
      clearInterval(timer);
    };
  }, [p.seconds]);
}
