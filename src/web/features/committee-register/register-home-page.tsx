import { Navigate } from 'react-router';
import { StatusMessage } from '../../components/status-message';
import { useText } from '../../app/language/use-text';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { useRegisterUnits } from './use-register-units';

/** Opens the register of the selected unit if the officer may read it, else their first. */
export function RegisterHomePage() {
  const text = useText();
  const { unit } = useSelectedUnit();
  const units = useRegisterUnits();
  if (units.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (units.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const opened = units.data.find((u) => u.id === unit?.id) ?? units.data[0];
  if (!opened) {
    return <StatusMessage>{text.services['committee-register'].register.noRegister}</StatusMessage>;
  }
  return <Navigate to={`/committee-register/${opened.id}/officers`} replace />;
}
