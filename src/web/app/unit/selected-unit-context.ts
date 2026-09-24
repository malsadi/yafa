import { createContext } from 'react';
import type { MeUnit } from '../../../shared/core/me-response';

export interface SelectedUnitState {
  unit: MeUnit | undefined;
  selectUnit: (unitId: string) => void;
}

export const SelectedUnitContext = createContext<SelectedUnitState | null>(null);
