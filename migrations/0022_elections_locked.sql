-- D-066: an election is never deleted; once Confirmed, it and its positions
-- and candidates are locked — results can never be changed. A correction
-- is a new election that refers to it.
CREATE TRIGGER elections_no_delete
BEFORE DELETE ON elections
BEGIN
  SELECT RAISE(ABORT, 'elections are never deleted');
END;
--> statement-breakpoint
CREATE TRIGGER elections_locked_when_confirmed
BEFORE UPDATE ON elections
WHEN OLD.status = 'Confirmed'
BEGIN
  SELECT RAISE(ABORT, 'a confirmed election is locked');
END;
--> statement-breakpoint
CREATE TRIGGER election_positions_locked_insert
BEFORE INSERT ON election_positions
WHEN (SELECT status FROM elections WHERE id = NEW.election_id) = 'Confirmed'
BEGIN
  SELECT RAISE(ABORT, 'a confirmed election is locked');
END;
--> statement-breakpoint
CREATE TRIGGER election_positions_locked_update
BEFORE UPDATE ON election_positions
WHEN (SELECT status FROM elections WHERE id = OLD.election_id) = 'Confirmed'
BEGIN
  SELECT RAISE(ABORT, 'a confirmed election is locked');
END;
--> statement-breakpoint
CREATE TRIGGER election_positions_locked_delete
BEFORE DELETE ON election_positions
WHEN (SELECT status FROM elections WHERE id = OLD.election_id) = 'Confirmed'
BEGIN
  SELECT RAISE(ABORT, 'a confirmed election is locked');
END;
--> statement-breakpoint
CREATE TRIGGER election_candidates_locked_insert
BEFORE INSERT ON election_candidates
WHEN (SELECT e.status FROM elections e JOIN election_positions p ON p.election_id = e.id WHERE p.id = NEW.position_id) = 'Confirmed'
BEGIN
  SELECT RAISE(ABORT, 'a confirmed election is locked');
END;
--> statement-breakpoint
CREATE TRIGGER election_candidates_locked_update
BEFORE UPDATE ON election_candidates
WHEN (SELECT e.status FROM elections e JOIN election_positions p ON p.election_id = e.id WHERE p.id = OLD.position_id) = 'Confirmed'
BEGIN
  SELECT RAISE(ABORT, 'a confirmed election is locked');
END;
--> statement-breakpoint
CREATE TRIGGER election_candidates_locked_delete
BEFORE DELETE ON election_candidates
WHEN (SELECT e.status FROM elections e JOIN election_positions p ON p.election_id = e.id WHERE p.id = OLD.position_id) = 'Confirmed'
BEGIN
  SELECT RAISE(ABORT, 'a confirmed election is locked');
END;
