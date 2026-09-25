import { useQuery } from '@tanstack/react-query';
import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { useApiRequest } from '../../../app/api/use-api-request';
import { useText } from '../../../app/language/use-text';
import { HandoverList } from './handover-list';
import { fetchMyHandovers } from './handovers.api';

/** Brief 14 C2 and D-067: the handovers this officer is named on, in any unit (T-106). */
export function MyHandoversPage() {
  const request = useApiRequest();
  const text = useText();
  const handovers = useQuery({
    queryKey: ['committee-register', 'my-handovers'],
    queryFn: () => fetchMyHandovers(request),
  });
  if (handovers.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (handovers.isError)
    return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{text.services['committee-register'].handovers.mine}</PageHeading>
      <HandoverList handovers={handovers.data} showUnit />
    </div>
  );
}
