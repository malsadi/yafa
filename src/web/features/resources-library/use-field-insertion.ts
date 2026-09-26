import { useRef } from 'react';

type Target = 'subject' | 'body';
type Input = HTMLInputElement | HTMLTextAreaElement;

/**
 * D-101: a field's button puts its mark where the author was last writing
 * — the subject or the letter text — at the cursor.
 */
export function useFieldInsertion(onInsert: (target: Target, value: string) => void) {
  const inputs = useRef<Partial<Record<Target, Input | null>>>({});
  const last = useRef<Target>('body');
  const bind = (target: Target) => ({
    ref: (element: Input | null) => {
      inputs.current[target] = element;
    },
    onFocus: () => {
      last.current = target;
    },
  });
  const insert = (mark: string) => {
    const element = inputs.current[last.current];
    if (!element) return;
    const start = element.selectionStart ?? element.value.length;
    const end = element.selectionEnd ?? start;
    onInsert(last.current, element.value.slice(0, start) + mark + element.value.slice(end));
  };
  return { bind, insert };
}
