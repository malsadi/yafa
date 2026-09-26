import { useState } from 'react';
import { calendarFeedPath } from '../../../shared/calendar/feed-path';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { fillText } from '../../text/fill-text';
import { useCalendarAction } from './use-calendar-action';
import { useFeedToken } from './use-feed-token';

/**
 * Brief 6.4 and 19 C1: the officer's phone calendar link. The portal keeps
 * only a hash, so the link is shown once, when made; making a new one
 * stops the old one.
 */
export function FeedPanel() {
  const t = useText().services.calendar;
  const formatTimestamp = useFormatTimestamp();
  const status = useFeedToken();
  const make = useCalendarAction<{ token: string }>();
  const [link, setLink] = useState<string | null>(null);
  const createdAt = status.data?.createdAt ?? null;
  return (
    <section className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <h2 className="text-lg font-semibold">{t.feed.heading}</h2>
      <p>{t.feed.explanation}</p>
      <p className="text-sm">
        {createdAt ? fillText(t.feed.since, { date: formatTimestamp(createdAt) }) : t.feed.none}
      </p>
      <ErrorAlert error={make.error ?? status.error} refusals={t.refusals} />
      {link && (
        <label className="flex flex-col gap-1">
          <span>{t.feed.shownOnce}</span>
          <input
            readOnly
            dir="ltr"
            className="rounded border border-slate-400 p-2"
            value={link}
            onFocus={(e) => {
              e.target.select();
            }}
          />
        </label>
      )}
      <button
        type="button"
        disabled={make.isPending || status.isPending}
        className="self-start rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
        onClick={() => {
          make.mutate(
            { path: '/api/calendar/feed-token', method: 'POST', body: {} },
            {
              onSuccess: ({ token }) => {
                setLink(`${window.location.origin}${calendarFeedPath(token)}`);
              },
            },
          );
        }}
      >
        {createdAt ? t.feed.remake : t.feed.make}
      </button>
    </section>
  );
}
