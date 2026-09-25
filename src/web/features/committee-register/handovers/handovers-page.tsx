import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { StatusMessage } from '../../../components/status-message';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import { useText } from '../../../app/language/use-text';
import { useActiveSession } from '../../../app/session/use-active-session';
import { useRegisterUnit } from '../use-register-unit';
import { CreateHandoverForm } from './create-handover-form';
import { HandoverList } from './handover-list';
import { createHandover, fetchUnitHandovers, type NewHandover } from './handovers.api';

/** Brief 14 C2: the unit's handovers, and setting up a new one. */
export function HandoversPage() {
  const unit = useRegisterUnit();
  const request = useApiRequest();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const text = useText();
  const t = text.services['committee-register'].handovers;
  const canSetUp =
    useActiveSession().context.capabilities.includes('committee-register.handovers.manage') &&
    unit.status === 'active';
  const handovers = useQuery({
    queryKey: ['committee-register', unit.id, 'handovers'],
    queryFn: () => fetchUnitHandovers(request, unit.id),
  });
  const create = useMutation({
    mutationFn: (handover: NewHandover) => createHandover(request, unit.id, handover),
    onSuccess: (created) => navigate(`/committee-register/handovers/${created.id}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['committee-register', unit.id] }),
  });
  if (handovers.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (handovers.isError)
    return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const refusals: Partial<Record<string, string>> = t.refusals;
  const refusal = create.error instanceof ApiError ? create.error.code : null;
  return (
    <div className="flex flex-col gap-4">
      <HandoverList handovers={handovers.data} showUnit={false} />
      {canSetUp && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{t.setUpHeading}</h2>
          {refusal && (
            <p role="alert" className="rounded bg-amber-100 p-3 text-amber-950">
              {refusals[refusal] ?? text.portalShell.somethingWentWrong}
            </p>
          )}
          <CreateHandoverForm
            unitId={unit.id}
            busy={create.isPending}
            onCreate={(h) => {
              create.mutate(h);
            }}
          />
        </section>
      )}
    </div>
  );
}
