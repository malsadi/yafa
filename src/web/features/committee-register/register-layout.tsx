import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { PageHeading } from '../../components/page-heading';
import { StatusMessage } from '../../components/status-message';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { MyHandoversLink } from './my-handovers-link';
import { REGISTER_TABS } from './register-tabs';
import { RegisterUnitPicker } from './register-unit-picker';
import { useRegisterUnits } from './use-register-units';

/** Brief 14: one unit's register — its unit, its views, and the view open. */
export function RegisterLayout() {
  const { unitId } = useParams();
  // The open view, kept when switching units: /committee-register/:unitId/<view>/…
  const view = useLocation().pathname.split('/')[3];
  const navigate = useNavigate();
  const text = useText();
  const t = text.services['committee-register'];
  const { capabilities } = useActiveSession().context;
  const units = useRegisterUnits();
  if (units.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (units.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const unit = units.data.find((u) => u.id === unitId);
  if (!unit) return <StatusMessage>{t.register.noRegister}</StatusMessage>;
  const tabs = REGISTER_TABS.filter((x) => x.capabilities.some((c) => capabilities.includes(c)));
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{t.name}</PageHeading>
      <MyHandoversLink />
      <RegisterUnitPicker
        units={units.data}
        value={unit.id}
        onChange={(id) => {
          void navigate(`/committee-register/${id}/${view ?? 'officers'}`);
        }}
      />
      {unit.status === 'inactive' && <p role="note">{t.register.inactive}</p>}
      <nav aria-label={t.name} className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map(({ slug }) => (
          <NavLink
            key={slug}
            to={`/committee-register/${unit.id}/${slug}`}
            className="rounded px-3 py-2 aria-[current=page]:bg-slate-200"
          >
            {t.register.tabs[slug]}
          </NavLink>
        ))}
      </nav>
      <Outlet context={unit} />
    </div>
  );
}
