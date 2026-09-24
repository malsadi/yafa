-- D-067 (brief 14 C2): a handover is never deleted; who and what it is
-- about never changes; a confirmation is never undone; once both officers
-- have confirmed it is locked; and its checklist is fixed as soon as the
-- first confirmation is made.
CREATE TRIGGER handovers_no_delete
BEFORE DELETE ON handovers
BEGIN
  SELECT RAISE(ABORT, 'handovers are never deleted');
END;
--> statement-breakpoint
CREATE TRIGGER handovers_locked_when_complete
BEFORE UPDATE ON handovers
WHEN OLD.outgoing_confirmed_at IS NOT NULL AND OLD.incoming_confirmed_at IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, 'a completed handover is locked');
END;
--> statement-breakpoint
CREATE TRIGGER handovers_fixed_parties_and_confirmations
BEFORE UPDATE ON handovers
WHEN NEW.unit_id IS NOT OLD.unit_id OR NEW.role_id IS NOT OLD.role_id
  OR NEW.outgoing_person_id IS NOT OLD.outgoing_person_id
  OR NEW.incoming_person_id IS NOT OLD.incoming_person_id
  OR (OLD.outgoing_confirmed_at IS NOT NULL AND NEW.outgoing_confirmed_at IS NOT OLD.outgoing_confirmed_at)
  OR (OLD.incoming_confirmed_at IS NOT NULL AND NEW.incoming_confirmed_at IS NOT OLD.incoming_confirmed_at)
BEGIN
  SELECT RAISE(ABORT, 'a handover''s officers never change and a confirmation is never undone');
END;
--> statement-breakpoint
CREATE TRIGGER handover_items_fixed_after_confirmation_insert
BEFORE INSERT ON handover_items
WHEN EXISTS (SELECT 1 FROM handovers h WHERE h.id = NEW.handover_id
  AND (h.outgoing_confirmed_at IS NOT NULL OR h.incoming_confirmed_at IS NOT NULL))
BEGIN
  SELECT RAISE(ABORT, 'a handover''s checklist is fixed once confirmation starts');
END;
--> statement-breakpoint
CREATE TRIGGER handover_items_fixed_after_confirmation_update
BEFORE UPDATE ON handover_items
WHEN EXISTS (SELECT 1 FROM handovers h WHERE h.id = OLD.handover_id
  AND (h.outgoing_confirmed_at IS NOT NULL OR h.incoming_confirmed_at IS NOT NULL))
BEGIN
  SELECT RAISE(ABORT, 'a handover''s checklist is fixed once confirmation starts');
END;
--> statement-breakpoint
CREATE TRIGGER handover_items_fixed_after_confirmation_delete
BEFORE DELETE ON handover_items
WHEN EXISTS (SELECT 1 FROM handovers h WHERE h.id = OLD.handover_id
  AND (h.outgoing_confirmed_at IS NOT NULL OR h.incoming_confirmed_at IS NOT NULL))
BEGIN
  SELECT RAISE(ABORT, 'a handover''s checklist is fixed once confirmation starts');
END;
