import { useMemo, useState, type ReactNode } from 'react';
import type { MeUnit } from '../../../shared/core/me-response';
import { SelectedUnitContext } from './selected-unit-context';

const STORAGE_KEY = 'selected-unit-id';

function readStoredUnitId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * The unit the officer is working in, for people in more than one unit
 * (brief section 26, Phase 0). Only ever one of the officer's own units;
 * remembered on this device only (T-068) — the server still checks every
 * request against the officer's own terms.
 */
export function SelectedUnitProvider({
  units,
  children,
}: {
  units: MeUnit[];
  children: ReactNode;
}) {
  const [unitId, setUnitId] = useState(readStoredUnitId);
  const value = useMemo(
    () => ({
      unit: units.find((unit) => unit.id === unitId) ?? units[0],
      selectUnit: (id: string) => {
        setUnitId(id);
        try {
          localStorage.setItem(STORAGE_KEY, id);
        } catch {
          // Storage unavailable: the choice lasts for this page only.
        }
      },
    }),
    [units, unitId],
  );
  return <SelectedUnitContext value={value}>{children}</SelectedUnitContext>;
}
