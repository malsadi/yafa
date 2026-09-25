import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { PageHeading } from '../../components/page-heading';
import { StatusMessage } from '../../components/status-message';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { REGISTER_TABS } from './register-tabs';
import { useRegisterUnits } from './use-register-units';

/** Brief 14: one unit's register — its unit, its views, and the view open. */
export function RegisterLayout() {
  const { unitId } = useParams();
  // The open view, kept when switching units: the path's last part.
  const view = useLocation().pathname.split('/').at(-1);
  const navigate = useNavigate();
  const { language } = useLanguage();
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
      <label className="flex flex-col gap-1">
        <span>{t.register.unit}</span>
        <select
          className="max-w-md rounded border border-slate-400 p-2"
          value={unit.id}
          onChange={(event) => {
            void navigate(`/committee-register/${event.target.value}/${view ?? 'officers'}`);
          }}
        >
          {units.data.map((u) => (
            <option key={u.id} value={u.id}>
              {{ en: u.nameEn, ar: u.nameAr }[language]}
            </option>
          ))}
        </select>
      </label>
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
