import { useParams } from 'react-router';
import { ElectionStatus } from '../../../../shared/committee-register/election-status';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { useActiveSession } from '../../../app/session/use-active-session';
import { ElectionBallot } from './election-ballot';
import { ElectionHeader } from './election-header';
import { confirmElection, recordResults } from './elections.api';
import { ConfirmElectionForm } from './confirm-election-form';
import { ResultsForm } from './results-form';
import { useElection } from './use-election';

/** Brief 14 C1: one election — its ballot, its results, and confirming it. */
export function ElectionPage() {
  const { electionId = '' } = useParams();
  const text = useText();
  const t = text.services['committee-register'].elections;
  const { capabilities } = useActiveSession().context;
  const { election, change, refusal } = useElection(electionId);
  if (election.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (election.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const e = election.data;
  const draft = e.status === ElectionStatus.Draft;
  const editable = draft && capabilities.includes('committee-register.elections.manage');
  const canConfirm = draft && capabilities.includes('committee-register.elections.confirm');
  const run = change.mutate;
  const candidateKey = e.positions.flatMap((p) => p.candidates.map((c) => c.id)).join();
  return (
    <div className="flex flex-col gap-6">
      <ElectionHeader election={e} refusal={refusal} />
      <ElectionBallot election={e} editable={editable} busy={change.isPending} onChange={run} />
      {editable && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{t.results}</h2>
          <ResultsForm
            key={candidateKey}
            positions={e.positions}
            busy={change.isPending}
            onSave={(results) => {
              run((r) => recordResults(r, e.id, results));
            }}
          />
        </section>
      )}
      {canConfirm && (
        <ConfirmElectionForm
          electionDate={e.electionDate}
          busy={change.isPending}
          onConfirm={(startDate) => {
            run((r) => confirmElection(r, e.id, startDate));
          }}
        />
      )}
    </div>
  );
}
