-- T-086 (brief 6.2, 25 A2): the record of invitations is history — never
-- changed, never deleted. A resend is a new row.
CREATE TRIGGER invitations_no_update
BEFORE UPDATE ON invitations
BEGIN
  SELECT RAISE(ABORT, 'invitations is append-only: it cannot be updated');
END;
--> statement-breakpoint
CREATE TRIGGER invitations_no_delete
BEFORE DELETE ON invitations
BEGIN
  SELECT RAISE(ABORT, 'invitations is append-only: it cannot be deleted');
END;
