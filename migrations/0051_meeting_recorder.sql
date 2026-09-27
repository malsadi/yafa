-- Brief 22; D-198 to D-210. Hand-edited from drizzle-kit's output before it
-- was applied anywhere. A meeting is never deleted; each change raises its
-- version by exactly one (9.1). Its details change only while Scheduled
-- (D-202). It moves Scheduled → Held → Report logged, or Scheduled →
-- Cancelled with a reason, never back (D-201, D-202). Attendance, points
-- raised in the meeting, comments and votes or decisions are recorded
-- only while Held; the original agenda is fixed from Held (D-204). The
-- report is logged only once every attendee is marked and every item has
-- its vote or decision (D-203, D-206); after that, or a cancel, it is all
-- locked — only the record of a late calendar entry or hub message (D-209).
CREATE TABLE `meetings` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`type_item_id` text NOT NULL REFERENCES `list_items`(`id`),
	`date` text NOT NULL,
	`start_time` text NOT NULL CHECK (length(`start_time`) = 5),
	`place` text CHECK (`place` IS NULL OR `place` <> ''),
	`online_link` text CHECK (`online_link` IS NULL OR `online_link` <> ''),
	`chair_person_id` text NOT NULL REFERENCES `people`(`id`),
	`secretary_person_id` text NOT NULL REFERENCES `people`(`id`),
	`status` text NOT NULL CHECK (`status` IN ('Scheduled', 'Held', 'Report logged', 'Cancelled')),
	`held_at` text,
	`held_by` text REFERENCES `people`(`id`),
	`cancel_reason` text CHECK (`cancel_reason` IS NULL OR `cancel_reason` <> ''),
	`cancelled_at` text,
	`cancelled_by` text REFERENCES `people`(`id`),
	`logged_at` text,
	`logged_by` text REFERENCES `people`(`id`),
	`report_file_id` text REFERENCES `files`(`id`),
	`calendar_written_at` text,
	`scheduled_posted_at` text,
	`held_posted_at` text,
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL,
	CHECK (`place` IS NOT NULL OR `online_link` IS NOT NULL),
	CHECK (`status` <> 'Cancelled' OR `cancel_reason` IS NOT NULL),
	CHECK (`status` <> 'Report logged' OR (`logged_at` IS NOT NULL AND `report_file_id` IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `meetings_unit_date` ON `meetings` (`unit_id`,`date`);--> statement-breakpoint
CREATE TABLE `meeting_attendees` (
	`meeting_id` text NOT NULL REFERENCES `meetings`(`id`),
	`person_id` text NOT NULL REFERENCES `people`(`id`),
	`attendance` text CHECK (`attendance` IS NULL OR `attendance` IN ('Present', 'Apologies', 'Did not attend')),
	PRIMARY KEY(`meeting_id`, `person_id`)
);
--> statement-breakpoint
CREATE TABLE `agenda_items` (
	`id` text PRIMARY KEY NOT NULL,
	`meeting_id` text NOT NULL REFERENCES `meetings`(`id`),
	`position` integer NOT NULL CHECK (`position` >= 1),
	`title` text NOT NULL CHECK (`title` <> ''),
	`note` text CHECK (`note` IS NULL OR `note` <> ''),
	`raised_in_meeting` integer NOT NULL CHECK (`raised_in_meeting` IN (0, 1)),
	`outcome_kind` text CHECK (`outcome_kind` IS NULL OR `outcome_kind` IN ('vote', 'decision')),
	`votes_for` integer CHECK (`votes_for` IS NULL OR `votes_for` >= 0),
	`votes_against` integer CHECK (`votes_against` IS NULL OR `votes_against` >= 0),
	`votes_abstain` integer CHECK (`votes_abstain` IS NULL OR `votes_abstain` >= 0),
	`vote_result` text CHECK (`vote_result` IS NULL OR `vote_result` <> ''),
	`decision` text CHECK (`decision` IS NULL OR `decision` <> ''),
	`version` integer NOT NULL CHECK (`version` >= 1),
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL,
	CHECK (
		(`outcome_kind` IS NULL AND `votes_for` IS NULL AND `votes_against` IS NULL AND `votes_abstain` IS NULL
			AND `vote_result` IS NULL AND `decision` IS NULL)
		OR (`outcome_kind` = 'vote' AND `votes_for` IS NOT NULL AND `votes_against` IS NOT NULL
			AND `votes_abstain` IS NOT NULL AND `vote_result` IS NOT NULL AND `decision` IS NULL)
		OR (`outcome_kind` = 'decision' AND `decision` IS NOT NULL AND `votes_for` IS NULL AND `votes_against` IS NULL
			AND `votes_abstain` IS NULL AND `vote_result` IS NULL)
	)
);
--> statement-breakpoint
CREATE INDEX `agenda_items_meeting` ON `agenda_items` (`meeting_id`,`position`);--> statement-breakpoint
CREATE TABLE `agenda_comments` (
	`item_id` text NOT NULL REFERENCES `agenda_items`(`id`),
	`person_id` text NOT NULL REFERENCES `people`(`id`),
	`comment` text NOT NULL CHECK (`comment` <> ''),
	`version` integer NOT NULL CHECK (`version` >= 1),
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`item_id`, `person_id`)
);
--> statement-breakpoint
CREATE TRIGGER `meetings_no_delete` BEFORE DELETE ON `meetings`
BEGIN
	SELECT RAISE(ABORT, 'a meeting is never deleted');
END;--> statement-breakpoint
CREATE TRIGGER `meetings_version` BEFORE UPDATE ON `meetings`
WHEN NEW.`version` <> OLD.`version` + 1 OR NEW.`unit_id` <> OLD.`unit_id`
	OR NEW.`created_by` <> OLD.`created_by` OR NEW.`created_at` <> OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this meeting');
END;--> statement-breakpoint
CREATE TRIGGER `meetings_details_while_scheduled` BEFORE UPDATE ON `meetings`
WHEN OLD.`status` <> 'Scheduled' AND (NEW.`type_item_id` <> OLD.`type_item_id` OR NEW.`date` <> OLD.`date`
	OR NEW.`start_time` <> OLD.`start_time` OR NEW.`place` IS NOT OLD.`place` OR NEW.`online_link` IS NOT OLD.`online_link`
	OR NEW.`chair_person_id` <> OLD.`chair_person_id` OR NEW.`secretary_person_id` <> OLD.`secretary_person_id`)
BEGIN
	SELECT RAISE(ABORT, 'a meeting''s details change only while it is scheduled');
END;--> statement-breakpoint
CREATE TRIGGER `meetings_locked` BEFORE UPDATE ON `meetings`
WHEN OLD.`status` IN ('Report logged', 'Cancelled') AND (NEW.`status` <> OLD.`status`
	OR NEW.`held_at` IS NOT OLD.`held_at` OR NEW.`cancel_reason` IS NOT OLD.`cancel_reason`
	OR NEW.`logged_at` IS NOT OLD.`logged_at` OR NEW.`report_file_id` IS NOT OLD.`report_file_id`)
BEGIN
	SELECT RAISE(ABORT, 'a meeting is locked once its report is logged or it is cancelled');
END;--> statement-breakpoint
CREATE TRIGGER `meetings_status_moves` BEFORE UPDATE OF `status` ON `meetings`
WHEN NEW.`status` <> OLD.`status` AND NOT (
		(OLD.`status` = 'Scheduled' AND NEW.`status` = 'Held' AND NEW.`held_at` IS NOT NULL)
		OR (OLD.`status` = 'Scheduled' AND NEW.`status` = 'Cancelled')
		OR (OLD.`status` = 'Held' AND NEW.`status` = 'Report logged'
			AND NOT EXISTS (SELECT 1 FROM `meeting_attendees` WHERE `meeting_id` = OLD.`id` AND `attendance` IS NULL)
			AND NOT EXISTS (SELECT 1 FROM `agenda_items` WHERE `meeting_id` = OLD.`id` AND `outcome_kind` IS NULL))
	)
BEGIN
	SELECT RAISE(ABORT, 'this status move is not allowed');
END;--> statement-breakpoint
CREATE TRIGGER `meetings_recorded_once` BEFORE UPDATE ON `meetings`
WHEN (OLD.`calendar_written_at` IS NOT NULL AND NEW.`calendar_written_at` IS NOT OLD.`calendar_written_at`)
	OR (OLD.`scheduled_posted_at` IS NOT NULL AND NEW.`scheduled_posted_at` IS NOT OLD.`scheduled_posted_at`)
	OR (OLD.`held_posted_at` IS NOT NULL AND NEW.`held_posted_at` IS NOT OLD.`held_posted_at`)
BEGIN
	SELECT RAISE(ABORT, 'a calendar entry or hub message is recorded once');
END;--> statement-breakpoint
CREATE TRIGGER `meeting_attendees_locked_insert` BEFORE INSERT ON `meeting_attendees`
WHEN (SELECT `status` FROM `meetings` WHERE `id` = NEW.`meeting_id`) NOT IN ('Scheduled', 'Held')
	OR (NEW.`attendance` IS NOT NULL AND (SELECT `status` FROM `meetings` WHERE `id` = NEW.`meeting_id`) <> 'Held')
BEGIN
	SELECT RAISE(ABORT, 'a meeting is locked once its report is logged or it is cancelled');
END;--> statement-breakpoint
CREATE TRIGGER `meeting_attendees_locked_update` BEFORE UPDATE ON `meeting_attendees`
WHEN (SELECT `status` FROM `meetings` WHERE `id` = OLD.`meeting_id`) <> 'Held'
	OR NEW.`meeting_id` <> OLD.`meeting_id` OR NEW.`person_id` <> OLD.`person_id`
BEGIN
	SELECT RAISE(ABORT, 'attendance is marked only while the meeting is held');
END;--> statement-breakpoint
CREATE TRIGGER `meeting_attendees_locked_delete` BEFORE DELETE ON `meeting_attendees`
WHEN (SELECT `status` FROM `meetings` WHERE `id` = OLD.`meeting_id`) NOT IN ('Scheduled', 'Held')
BEGIN
	SELECT RAISE(ABORT, 'a meeting is locked once its report is logged or it is cancelled');
END;--> statement-breakpoint
CREATE TRIGGER `agenda_items_insert` BEFORE INSERT ON `agenda_items`
WHEN NOT (
		((SELECT `status` FROM `meetings` WHERE `id` = NEW.`meeting_id`) = 'Scheduled' AND NEW.`raised_in_meeting` = 0 AND NEW.`outcome_kind` IS NULL)
		OR ((SELECT `status` FROM `meetings` WHERE `id` = NEW.`meeting_id`) = 'Held' AND NEW.`raised_in_meeting` = 1)
	)
BEGIN
	SELECT RAISE(ABORT, 'agenda items are set before the meeting; points raised in it are added while it is held');
END;--> statement-breakpoint
CREATE TRIGGER `agenda_items_update` BEFORE UPDATE ON `agenda_items`
WHEN NEW.`version` <> OLD.`version` + 1 OR NEW.`meeting_id` <> OLD.`meeting_id` OR NEW.`raised_in_meeting` <> OLD.`raised_in_meeting`
	OR (SELECT `status` FROM `meetings` WHERE `id` = OLD.`meeting_id`) NOT IN ('Scheduled', 'Held')
	OR ((SELECT `status` FROM `meetings` WHERE `id` = OLD.`meeting_id`) = 'Held' AND OLD.`raised_in_meeting` = 0
		AND (NEW.`title` <> OLD.`title` OR NEW.`note` IS NOT OLD.`note` OR NEW.`position` <> OLD.`position`))
	OR ((SELECT `status` FROM `meetings` WHERE `id` = OLD.`meeting_id`) = 'Scheduled' AND NEW.`outcome_kind` IS NOT NULL)
BEGIN
	SELECT RAISE(ABORT, 'stale, or this agenda item cannot change now');
END;--> statement-breakpoint
CREATE TRIGGER `agenda_items_delete` BEFORE DELETE ON `agenda_items`
WHEN (SELECT `status` FROM `meetings` WHERE `id` = OLD.`meeting_id`) <> 'Scheduled'
BEGIN
	SELECT RAISE(ABORT, 'agenda items are removed only before the meeting');
END;--> statement-breakpoint
CREATE TRIGGER `agenda_comments_insert` BEFORE INSERT ON `agenda_comments`
WHEN (SELECT m.`status` FROM `agenda_items` i JOIN `meetings` m ON m.`id` = i.`meeting_id` WHERE i.`id` = NEW.`item_id`) <> 'Held'
	OR NOT EXISTS (SELECT 1 FROM `agenda_items` i JOIN `meeting_attendees` a ON a.`meeting_id` = i.`meeting_id`
		WHERE i.`id` = NEW.`item_id` AND a.`person_id` = NEW.`person_id` AND a.`attendance` = 'Present')
BEGIN
	SELECT RAISE(ABORT, 'comments are recorded while the meeting is held, for officers present');
END;--> statement-breakpoint
CREATE TRIGGER `agenda_comments_update` BEFORE UPDATE ON `agenda_comments`
WHEN NEW.`version` <> OLD.`version` + 1 OR NEW.`item_id` <> OLD.`item_id` OR NEW.`person_id` <> OLD.`person_id`
	OR (SELECT m.`status` FROM `agenda_items` i JOIN `meetings` m ON m.`id` = i.`meeting_id` WHERE i.`id` = OLD.`item_id`) <> 'Held'
BEGIN
	SELECT RAISE(ABORT, 'stale, or the minutes are locked');
END;--> statement-breakpoint
CREATE TRIGGER `agenda_comments_no_delete` BEFORE DELETE ON `agenda_comments`
BEGIN
	SELECT RAISE(ABORT, 'a comment is changed, never deleted');
END;
