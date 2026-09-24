import type { ReactNode } from 'react';

/** A calm, centred message: loading, not configured, not found, an error. */
export function StatusMessage({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="mx-auto max-w-prose p-6 text-center">
      {children}
    </p>
  );
}
