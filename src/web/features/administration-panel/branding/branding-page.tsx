import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Branding } from '../../../../shared/administration-panel/branding';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import { useText } from '../../../app/language/use-text';
import { BRANDING_QUERY_KEY, useBranding } from '../../../app/session/use-branding';
import { PageHeading } from '../../../components/page-heading';
import { RefusalAlert } from '../../../components/refusal-alert';
import { StatusMessage } from '../../../components/status-message';
import { BrandingFilesSection } from './branding-files-section';
import { BrandingForm } from './branding-form';
import { LogoPositionControl } from './logo-position-control';

/** Brief 25 C3: the organisation name, colours, files and the letterhead's logo position. */
export function BrandingPage() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const text = useText();
  const admin = text.services['administration-panel'];
  const branding = useBranding();
  const save = useMutation({
    mutationFn: (changes: Partial<Branding>) =>
      request<Branding>('/api/administration-panel/branding', { method: 'PUT', body: changes }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: BRANDING_QUERY_KEY }),
  });
  if (branding.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (branding.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const refusal =
    save.error instanceof ApiError ? save.error.code : save.error ? 'server.error' : null;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{admin.screens.branding}</PageHeading>
      <p className="max-w-prose">{admin.branding.intro}</p>
      <RefusalAlert code={refusal} refusals={admin.branding.refusals} />
      <LogoPositionControl
        value={branding.data.logoPosition}
        busy={save.isPending}
        onChange={(logoPosition) => {
          save.mutate({ logoPosition });
        }}
      />
      <BrandingFilesSection files={branding.data.files} />
      <BrandingForm
        key={JSON.stringify(branding.data)}
        branding={branding.data}
        busy={save.isPending}
        onSave={(changes) => {
          save.mutate(changes);
        }}
      />
    </div>
  );
}
