import { NavLink } from 'react-router';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { useInbox } from './use-inbox';

/** D-031: the way to the inbox, with the unread count shown. */
export function InboxLink() {
  const t = useText().portalShell.inbox;
  const { inbox } = useInbox();
  const unread = inbox.data?.unreadCount ?? 0;
  return (
    <NavLink to="/notifications" className="rounded px-3 py-1 aria-[current=page]:bg-slate-200">
      {unread > 0 ? fillText(t.linkUnread, { count: unread }) : t.link}
    </NavLink>
  );
}
