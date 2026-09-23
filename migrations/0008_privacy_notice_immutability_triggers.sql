-- Brief section 9.1/T-020: privacy notice versions and acknowledgements are
-- append-only, protected by a trigger, same as migration 0001.
--> statement-breakpoint
CREATE TRIGGER privacy_notice_versions_no_update
BEFORE UPDATE ON privacy_notice_versions
BEGIN
  SELECT RAISE(ABORT, 'privacy_notice_versions is append-only: it cannot be updated');
END;
--> statement-breakpoint
CREATE TRIGGER privacy_notice_versions_no_delete
BEFORE DELETE ON privacy_notice_versions
BEGIN
  SELECT RAISE(ABORT, 'privacy_notice_versions is append-only: it cannot be deleted');
END;
--> statement-breakpoint
CREATE TRIGGER privacy_notice_acknowledgements_no_update
BEFORE UPDATE ON privacy_notice_acknowledgements
BEGIN
  SELECT RAISE(ABORT, 'privacy_notice_acknowledgements is append-only: it cannot be updated');
END;
--> statement-breakpoint
CREATE TRIGGER privacy_notice_acknowledgements_no_delete
BEFORE DELETE ON privacy_notice_acknowledgements
BEGIN
  SELECT RAISE(ABORT, 'privacy_notice_acknowledgements is append-only: it cannot be deleted');
END;
