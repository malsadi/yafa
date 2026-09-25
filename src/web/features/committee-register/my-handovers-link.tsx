import { Link } from 'react-router';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';

/** A link to the handovers this officer is named on, for those who may take part (T-106). */
export function MyHandoversLink() {
  const t = useText().services['committee-register'].handovers;
  const { capabilities } = useActiveSession().context;
  if (!capabilities.includes('committee-register.handovers.confirm')) return null;
  return (
    <Link to="/committee-register/my-handovers" className="underline">
      {t.mine}
    </Link>
  );
}
