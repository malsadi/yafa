-- D-168 (20): the starter removes a member from a discussion, or a member
-- leaves; each is recorded for good in `discussion_departures`, and the
-- messages stay. A member who has left no longer sees the discussion
-- (`left_at`); invited back, it is cleared. Hand-edited from drizzle-kit's
-- output before it was applied anywhere; replaces 0043's rule that
-- discussion members never change.
CREATE TABLE `discussion_departures` (
	`id` text PRIMARY KEY NOT NULL,
	`discussion_id` text NOT NULL REFERENCES `discussions`(`id`),
	`person_id` text NOT NULL REFERENCES `people`(`id`),
	`departed_at` text NOT NULL,
	`removed_by` text REFERENCES `people`(`id`)
);
--> statement-breakpoint
ALTER TABLE `discussion_members` ADD `left_at` text;--> statement-breakpoint
CREATE TRIGGER `discussion_departures_no_update` BEFORE UPDATE ON `discussion_departures`
BEGIN
	SELECT RAISE(ABORT, 'a removal or leaving is recorded for good');
END;--> statement-breakpoint
CREATE TRIGGER `discussion_departures_no_delete` BEFORE DELETE ON `discussion_departures`
BEGIN
	SELECT RAISE(ABORT, 'a removal or leaving is recorded for good');
END;--> statement-breakpoint
DROP TRIGGER `discussion_members_no_update`;--> statement-breakpoint
CREATE TRIGGER `discussion_members_leave_or_return` BEFORE UPDATE ON `discussion_members`
WHEN NEW.`discussion_id` IS NOT OLD.`discussion_id` OR NEW.`person_id` IS NOT OLD.`person_id`
	OR (NEW.`left_at` IS NOT NULL AND OLD.`left_at` IS NOT NULL)
	OR (NEW.`left_at` IS NULL AND OLD.`left_at` IS NULL)
	OR (NEW.`left_at` IS NOT NULL AND (NEW.`invited_by` IS NOT OLD.`invited_by` OR NEW.`invited_at` IS NOT OLD.`invited_at`))
BEGIN
	SELECT RAISE(ABORT, 'a member only leaves, or is invited back');
END;--> statement-breakpoint
CREATE TRIGGER `discussion_members_leave_recorded` BEFORE UPDATE OF `left_at` ON `discussion_members`
WHEN NEW.`left_at` IS NOT NULL AND NOT EXISTS (
	SELECT 1 FROM `discussion_departures`
	WHERE `discussion_id` = NEW.`discussion_id` AND `person_id` = NEW.`person_id` AND `departed_at` = NEW.`left_at`)
BEGIN
	SELECT RAISE(ABORT, 'a removal or leaving must be recorded');
END;--> statement-breakpoint
CREATE TRIGGER `discussion_starter_stays` BEFORE UPDATE OF `left_at` ON `discussion_members`
WHEN NEW.`left_at` IS NOT NULL
	AND NEW.`person_id` = (SELECT `started_by` FROM `discussions` WHERE `id` = NEW.`discussion_id`)
BEGIN
	SELECT RAISE(ABORT, 'the starter stays in the discussion');
END;
