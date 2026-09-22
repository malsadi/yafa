-- Brief section 9.1: SQLite triggers block UPDATE and DELETE on append-only
-- tables. The application checks first; the trigger guarantees it.
--> statement-breakpoint
CREATE TRIGGER settings_history_no_update
BEFORE UPDATE ON settings_history
BEGIN
  SELECT RAISE(ABORT, 'settings_history is append-only: it cannot be updated');
END;
--> statement-breakpoint
CREATE TRIGGER settings_history_no_delete
BEFORE DELETE ON settings_history
BEGIN
  SELECT RAISE(ABORT, 'settings_history is append-only: it cannot be deleted');
END;
--> statement-breakpoint
CREATE TRIGGER audit_log_no_update
BEFORE UPDATE ON audit_log
BEGIN
  SELECT RAISE(ABORT, 'audit_log is append-only: it cannot be updated');
END;
--> statement-breakpoint
CREATE TRIGGER audit_log_no_delete
BEFORE DELETE ON audit_log
BEGIN
  SELECT RAISE(ABORT, 'audit_log is append-only: it cannot be deleted');
END;
