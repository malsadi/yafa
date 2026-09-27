import type { MeetingDetail } from '../../../shared/meeting-recorder/meeting-records';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** Brief 22 B1, B2: the minutes as recorded, to read — every comment, and every vote and decision. */
export function MinutesRecord({ detail }: { detail: MeetingDetail }) {
  const t = useText().services['meeting-recorder'];
  const r = t.reportPdf;
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold">{t.minutes.heading}</h3>
      {detail.agenda.map((item) => (
        <div key={item.id} className="flex flex-col gap-1 text-sm">
          <h4 className="font-medium">
            {item.raisedInMeeting ? fillText(r.raised, { title: item.title }) : item.title}
          </h4>
          {item.comments.map((c) => (
            <p key={c.personId}>{`${c.name ?? ''}: ${c.comment}`}</p>
          ))}
          {item.outcomeKind === 'decision' && (
            <p className="font-medium">{fillText(r.decision, { decision: item.decision ?? '' })}</p>
          )}
          {item.outcomeKind === 'vote' && (
            <p className="font-medium">
              {fillText(r.vote, {
                for: String(item.votesFor ?? 0),
                against: String(item.votesAgainst ?? 0),
                abstain: String(item.votesAbstain ?? 0),
                result: item.voteResult ?? '',
              })}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
