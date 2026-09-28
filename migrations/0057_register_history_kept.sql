-- Phase 12 immutability review (brief 14: past officers are kept, never
-- deleted; T-085's "an ended term is history: nothing changes or deletes it").
-- The service already refused both; build rule 5 wants the database to as well.
-- An ended term is one whose end date is before today in UTC: the UK date is
-- never behind UTC, so this never blocks a change the service allows.
CREATE TRIGGER terms_no_delete
BEFORE DELETE ON terms
BEGIN
  SELECT RAISE(ABORT, 'terms are never deleted');
END;
--> statement-breakpoint
CREATE TRIGGER terms_ended_fixed
BEFORE UPDATE ON terms
WHEN OLD.end_date IS NOT NULL AND OLD.end_date < date('now')
BEGIN
  SELECT RAISE(ABORT, 'an ended term is never changed');
END;
--> statement-breakpoint
CREATE TRIGGER people_no_delete
BEFORE DELETE ON people
BEGIN
  SELECT RAISE(ABORT, 'people are never deleted');
END;
