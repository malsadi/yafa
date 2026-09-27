-- D-196: an event file is retired, never deleted — hidden from the event,
-- kept in storage, and brought back if removed by mistake. Hand-edited from
-- drizzle-kit's output before it was applied anywhere. Replaces 0047's
-- "removable before close" and "never changed" triggers: a file is only
-- retired or brought back, while its event is open; nothing deletes one.
ALTER TABLE `event_files` ADD `retired_at` text;--> statement-breakpoint
ALTER TABLE `event_files` ADD `retired_by` text CHECK ((`retired_at` IS NULL) = (`retired_by` IS NULL));--> statement-breakpoint
DROP TRIGGER `event_files_locked_delete`;--> statement-breakpoint
DROP TRIGGER `event_files_no_update`;--> statement-breakpoint
CREATE TRIGGER `event_files_no_delete` BEFORE DELETE ON `event_files`
BEGIN
	SELECT RAISE(ABORT, 'an event file is never deleted; it is retired');
END;--> statement-breakpoint
CREATE TRIGGER `event_files_retire_only` BEFORE UPDATE ON `event_files`
WHEN NEW.`file_id` <> OLD.`file_id` OR NEW.`event_id` <> OLD.`event_id` OR NEW.`unit_id` <> OLD.`unit_id`
	OR NEW.`section` <> OLD.`section` OR NEW.`added_by` <> OLD.`added_by` OR NEW.`added_at` <> OLD.`added_at`
BEGIN
	SELECT RAISE(ABORT, 'an event file is only retired or brought back');
END;--> statement-breakpoint
CREATE TRIGGER `event_files_locked_update` BEFORE UPDATE ON `event_files`
WHEN (SELECT `status` FROM `events` WHERE `id` = OLD.`event_id`) = 'Closed'
BEGIN
	SELECT RAISE(ABORT, 'a closed event is locked');
END;
