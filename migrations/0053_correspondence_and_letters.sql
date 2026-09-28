-- Phase 10, brief 23 and D-214: Correspondence and letters — each unit's
-- letter counters, the letters out register and the letters in register.
-- Hand-edited from drizzle-kit's output before it was applied anywhere:
-- value checks added, and the triggers below.
CREATE TABLE `letter_counters` (
	`unit_id` text NOT NULL,
	`direction` text NOT NULL CHECK (`direction` IN ('out', 'in')),
	`year` integer NOT NULL,
	`last_number` integer NOT NULL CHECK (`last_number` >= 0),
	PRIMARY KEY(`unit_id`, `direction`, `year`)
);
--> statement-breakpoint
CREATE TABLE `letters_in` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL,
	`reference_number` text NOT NULL CHECK (`reference_number` <> ''),
	`sequence_year` integer NOT NULL,
	`sequence_number` integer NOT NULL CHECK (`sequence_number` >= 1),
	`date_received` text NOT NULL,
	`sender` text NOT NULL CHECK (`sender` <> ''),
	`subject` text NOT NULL CHECK (`subject` <> ''),
	`handler_person_id` text NOT NULL,
	`status` text NOT NULL CHECK (`status` IN ('Received', 'Awaiting reply', 'Replied', 'No reply needed')),
	`answers_letter_out_id` text,
	`file_id` text NOT NULL,
	`version` integer NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `letters_in_unit_reference` ON `letters_in` (`unit_id`,`reference_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `letters_in_unit_sequence` ON `letters_in` (`unit_id`,`sequence_year`,`sequence_number`);--> statement-breakpoint
CREATE INDEX `letters_in_unit_received` ON `letters_in` (`unit_id`,`date_received`);--> statement-breakpoint
CREATE INDEX `letters_in_answers` ON `letters_in` (`answers_letter_out_id`);--> statement-breakpoint
CREATE TABLE `letters_out` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL,
	`reference_number` text NOT NULL CHECK (`reference_number` <> ''),
	`sequence_year` integer NOT NULL,
	`sequence_number` integer NOT NULL CHECK (`sequence_number` >= 1),
	`letter_date` text NOT NULL,
	`template_id` text NOT NULL,
	`language` text NOT NULL CHECK (`language` IN ('en', 'ar')),
	`recipient_name` text NOT NULL CHECK (`recipient_name` <> ''),
	`recipient_address` text CHECK (`recipient_address` IS NULL OR `recipient_address` <> ''),
	`subject` text NOT NULL CHECK (`subject` <> ''),
	`field_values` text NOT NULL,
	`signer_person_id` text NOT NULL,
	`signer_role_id` text NOT NULL,
	`reply_to_letter_in_id` text,
	`file_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `letters_out_unit_reference` ON `letters_out` (`unit_id`,`reference_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `letters_out_unit_sequence` ON `letters_out` (`unit_id`,`sequence_year`,`sequence_number`);--> statement-breakpoint
CREATE INDEX `letters_out_unit_date` ON `letters_out` (`unit_id`,`letter_date`);--> statement-breakpoint
CREATE INDEX `letters_out_reply_to` ON `letters_out` (`reply_to_letter_in_id`);--> statement-breakpoint
-- 23 build notes: a counter only ever moves on by one, and is never removed.
CREATE TRIGGER `letter_counters_by_one` BEFORE UPDATE ON `letter_counters`
WHEN NEW.`unit_id` IS NOT OLD.`unit_id` OR NEW.`direction` IS NOT OLD.`direction`
	OR NEW.`year` IS NOT OLD.`year` OR NEW.`last_number` IS NOT OLD.`last_number` + 1
BEGIN
	SELECT RAISE(ABORT, 'a letter counter only moves on by one');
END;--> statement-breakpoint
CREATE TRIGGER `letter_counters_no_delete` BEFORE DELETE ON `letter_counters`
BEGIN
	SELECT RAISE(ABORT, 'a letter counter is never removed');
END;--> statement-breakpoint
-- T-154: the number a letter carries must be the one its counter has just
-- given, in the same batch; otherwise another letter took it first.
CREATE TRIGGER `letters_out_number_taken` BEFORE INSERT ON `letters_out`
WHEN NEW.`sequence_number` IS NOT (SELECT `last_number` FROM `letter_counters`
	WHERE `unit_id` = NEW.`unit_id` AND `direction` = 'out' AND `year` = NEW.`sequence_year`)
BEGIN
	SELECT RAISE(ABORT, 'letter number taken');
END;--> statement-breakpoint
CREATE TRIGGER `letters_out_file_locked` BEFORE INSERT ON `letters_out`
WHEN NOT EXISTS (SELECT 1 FROM `files` WHERE `id` = NEW.`file_id` AND `locked` = 1)
BEGIN
	SELECT RAISE(ABORT, 'a letter''s file must be locked');
END;--> statement-breakpoint
-- O-144: a reply answers a letter in of the same unit that still takes one.
CREATE TRIGGER `letters_out_reply_answerable` BEFORE INSERT ON `letters_out`
WHEN NEW.`reply_to_letter_in_id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `letters_in`
	WHERE `id` = NEW.`reply_to_letter_in_id` AND `unit_id` = NEW.`unit_id`
	AND `status` IN ('Received', 'Awaiting reply', 'Replied'))
BEGIN
	SELECT RAISE(ABORT, 'letter not answerable');
END;--> statement-breakpoint
-- O-142: a letter out is locked forever.
CREATE TRIGGER `letters_out_no_update` BEFORE UPDATE ON `letters_out`
BEGIN
	SELECT RAISE(ABORT, 'a letter out is locked: never changed');
END;--> statement-breakpoint
CREATE TRIGGER `letters_out_no_delete` BEFORE DELETE ON `letters_out`
BEGIN
	SELECT RAISE(ABORT, 'a letter out is locked: never deleted');
END;--> statement-breakpoint
CREATE TRIGGER `letters_in_number_taken` BEFORE INSERT ON `letters_in`
WHEN NEW.`sequence_number` IS NOT (SELECT `last_number` FROM `letter_counters`
	WHERE `unit_id` = NEW.`unit_id` AND `direction` = 'in' AND `year` = NEW.`sequence_year`)
BEGIN
	SELECT RAISE(ABORT, 'letter number taken');
END;--> statement-breakpoint
CREATE TRIGGER `letters_in_file_locked` BEFORE INSERT ON `letters_in`
WHEN NOT EXISTS (SELECT 1 FROM `files` WHERE `id` = NEW.`file_id` AND `locked` = 1)
BEGIN
	SELECT RAISE(ABORT, 'a letter''s file must be locked');
END;--> statement-breakpoint
-- O-144 and O-146: a new letter in is Received, at version 1, and answers
-- only a letter out of its own unit.
CREATE TRIGGER `letters_in_starts_received` BEFORE INSERT ON `letters_in`
WHEN NEW.`status` <> 'Received' OR NEW.`version` <> 1
	OR (NEW.`answers_letter_out_id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `letters_out`
		WHERE `id` = NEW.`answers_letter_out_id` AND `unit_id` = NEW.`unit_id`))
BEGIN
	SELECT RAISE(ABORT, 'a letter in starts as Received, answering its own unit''s letter');
END;--> statement-breakpoint
CREATE TRIGGER `letters_in_no_delete` BEFORE DELETE ON `letters_in`
BEGIN
	SELECT RAISE(ABORT, 'a letter in is locked: never deleted');
END;--> statement-breakpoint
-- O-143: only its status and handling officer ever change.
CREATE TRIGGER `letters_in_fixed_details` BEFORE UPDATE ON `letters_in`
WHEN NEW.`id` IS NOT OLD.`id` OR NEW.`unit_id` IS NOT OLD.`unit_id`
	OR NEW.`reference_number` IS NOT OLD.`reference_number`
	OR NEW.`sequence_year` IS NOT OLD.`sequence_year` OR NEW.`sequence_number` IS NOT OLD.`sequence_number`
	OR NEW.`date_received` IS NOT OLD.`date_received` OR NEW.`sender` IS NOT OLD.`sender`
	OR NEW.`subject` IS NOT OLD.`subject` OR NEW.`answers_letter_out_id` IS NOT OLD.`answers_letter_out_id`
	OR NEW.`file_id` IS NOT OLD.`file_id` OR NEW.`created_by` IS NOT OLD.`created_by`
	OR NEW.`created_at` IS NOT OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'a letter in is locked: only its status and handling officer change');
END;--> statement-breakpoint
-- 9.1: each change raises the version by exactly one.
CREATE TRIGGER `letters_in_version` BEFORE UPDATE ON `letters_in`
WHEN NEW.`version` IS NOT OLD.`version` + 1
BEGIN
	SELECT RAISE(ABORT, 'stale: the letter has changed since it was read');
END;--> statement-breakpoint
-- O-144: the moves allowed; Replied only with a reply, and final.
CREATE TRIGGER `letters_in_status_moves` BEFORE UPDATE ON `letters_in`
WHEN NEW.`status` IS NOT OLD.`status` AND NOT (
	(OLD.`status` = 'Received' AND NEW.`status` IN ('Awaiting reply', 'No reply needed', 'Replied'))
	OR (OLD.`status` = 'Awaiting reply' AND NEW.`status` IN ('No reply needed', 'Replied'))
	OR (OLD.`status` = 'No reply needed' AND NEW.`status` = 'Awaiting reply'))
BEGIN
	SELECT RAISE(ABORT, 'a letter in cannot move to that status');
END;--> statement-breakpoint
CREATE TRIGGER `letters_in_replied_needs_reply` BEFORE UPDATE ON `letters_in`
WHEN NEW.`status` = 'Replied' AND OLD.`status` <> 'Replied'
	AND NOT EXISTS (SELECT 1 FROM `letters_out` WHERE `reply_to_letter_in_id` = NEW.`id`)
BEGIN
	SELECT RAISE(ABORT, 'a letter in is Replied only once a reply is generated');
END;--> statement-breakpoint
-- O-145: the handling officer changes only while the letter is open.
CREATE TRIGGER `letters_in_handler_while_open` BEFORE UPDATE ON `letters_in`
WHEN NEW.`handler_person_id` IS NOT OLD.`handler_person_id`
	AND OLD.`status` NOT IN ('Received', 'Awaiting reply')
BEGIN
	SELECT RAISE(ABORT, 'a letter in is closed: its handling officer is fixed');
END;
