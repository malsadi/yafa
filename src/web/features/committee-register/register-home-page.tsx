import { Navigate } from 'react-router';
import { StatusMessage } from '../../components/status-message';
import { useText } from '../../app/language/use-text';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { MyHandoversLink } from './my-handovers-link';
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
    return (
      <div className="flex flex-col items-center gap-2">
        <StatusMessage>{text.services['committee-register'].register.noRegister}</StatusMessage>
        <MyHandoversLink />
      </div>
    );
  }
  return <Navigate to={`/committee-register/${opened.id}/officers`} replace />;
}
