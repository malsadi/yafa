import { useContext } from 'react';
import { SelectedUnitContext, type SelectedUnitState } from './selected-unit-context';

export function useSelectedUnit(): SelectedUnitState {
  const state = useContext(SelectedUnitContext);
  if (!state) {
    throw new Error('useSelectedUnit must be used inside SelectedUnitProvider');
  }
  return state;
}
