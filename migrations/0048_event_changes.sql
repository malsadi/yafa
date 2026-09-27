-- Phase 8 owner decisions D-187 to D-190, hand-edited from drizzle-kit's
-- output (the Calendar's column) before it was applied anywhere.
-- D-189: a Calendar entry has an optional last day. D-187: a budget line
-- is removed only while its event is in Draft and untagged, and is fixed
-- once the event is approved (replacing 0035's "never deleted"). D-188: an
-- open event account's name follows its event. D-190: "event-cancelled" is
-- a fourth automatic post; SQLite can't change a CHECK in place, so the
-- notices table is rebuilt with every row, index and trigger kept (T-146):
-- copied aside, recreated under its own name and copied back, so the
-- deferred foreign keys from its votes are satisfied again before commit.
PRAGMA defer_foreign_keys = on;--> statement-breakpoint
ALTER TABLE `calendar_entries` ADD `last_date` text CHECK (`last_date` IS NULL OR `last_date` > `date`);--> statement-breakpoint
DROP TRIGGER `treasury_budget_lines_no_delete`;--> statement-breakpoint
CREATE TRIGGER `treasury_budget_lines_draft_delete` BEFORE DELETE ON `treasury_budget_lines`
WHEN COALESCE((SELECT e.`status` FROM `treasury_accounts` a JOIN `events` e ON e.`id` = a.`event_id`
		WHERE a.`id` = OLD.`account_id`), '') <> 'Draft'
	OR EXISTS (SELECT 1 FROM `treasury_entries` WHERE `budget_line_id` = OLD.`id`)
BEGIN
	SELECT RAISE(ABORT, 'a budget line is removed only in Draft, and never once an entry is tagged to it');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_budget_lines_draft_update` BEFORE UPDATE ON `treasury_budget_lines`
WHEN COALESCE((SELECT e.`status` FROM `treasury_accounts` a JOIN `events` e ON e.`id` = a.`event_id`
		WHERE a.`id` = OLD.`account_id`), '') <> 'Draft'
	OR NEW.`account_id` <> OLD.`account_id` OR NEW.`unit_id` <> OLD.`unit_id` OR NEW.`id` <> OLD.`id`
BEGIN
	SELECT RAISE(ABORT, 'a budget line changes only in Draft');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_budget_lines_draft_insert` BEFORE INSERT ON `treasury_budget_lines`
WHEN (SELECT e.`status` FROM `treasury_accounts` a JOIN `events` e ON e.`id` = a.`event_id`
		WHERE a.`id` = NEW.`account_id`) <> 'Draft'
BEGIN
	SELECT RAISE(ABORT, 'a budget line is added only in Draft');
END;--> statement-breakpoint
DROP TRIGGER `treasury_accounts_only_closed`;--> statement-breakpoint
CREATE TRIGGER `treasury_accounts_only_closed` BEFORE UPDATE ON `treasury_accounts`
WHEN NOT (
		(OLD.`status` = 'Open' AND NEW.`status` = 'Closed' AND NEW.`name` = OLD.`name`)
		OR (OLD.`status` = 'Open' AND NEW.`status` = 'Open' AND OLD.`kind` = 'event'
			AND NEW.`closed_by` IS NULL AND NEW.`closed_at` IS NULL)
	)
	OR NEW.`id` <> OLD.`id` OR NEW.`unit_id` <> OLD.`unit_id` OR NEW.`kind` <> OLD.`kind`
	OR NEW.`branch_type` IS NOT OLD.`branch_type` OR NEW.`event_id` IS NOT OLD.`event_id`
	OR NEW.`opened_by` <> OLD.`opened_by` OR NEW.`opened_at` <> OLD.`opened_at`
BEGIN
	SELECT RAISE(ABORT, 'a Treasury account only closes, once, and is never reopened; only an open event account is renamed');
END;--> statement-breakpoint
DROP TRIGGER `notice_votes_officer_notices_only`;--> statement-breakpoint
DROP TRIGGER `notice_ballots_open`;--> statement-breakpoint
CREATE TABLE `notices_copy` AS SELECT * FROM `notices`;--> statement-breakpoint
DROP TABLE `notices`;--> statement-breakpoint
CREATE TABLE `notices` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`source` text NOT NULL CHECK (`source` IN ('officer', 'automatic')),
	`automatic_kind` text CHECK (`automatic_kind` IS NULL OR `automatic_kind` IN ('event-published', 'event-cancelled', 'meeting-scheduled', 'meeting-held')),
	`source_record_id` text,
	`title` text NOT NULL CHECK (`title` <> ''),
	`body` text,
	`about_date` text,
	`retired_at` text,
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL,
	CHECK (
		(`source` = 'officer' AND `automatic_kind` IS NULL AND `source_record_id` IS NULL
			AND `about_date` IS NULL AND `body` IS NOT NULL AND `body` <> '')
		OR (`source` = 'automatic' AND `automatic_kind` IS NOT NULL AND `source_record_id` IS NOT NULL)
	)
);
--> statement-breakpoint
INSERT INTO `notices` (`id`, `unit_id`, `source`, `automatic_kind`, `source_record_id`, `title`, `body`,
	`about_date`, `retired_at`, `version`, `created_by`, `created_at`, `updated_by`, `updated_at`)
SELECT `id`, `unit_id`, `source`, `automatic_kind`, `source_record_id`, `title`, `body`,
	`about_date`, `retired_at`, `version`, `created_by`, `created_at`, `updated_by`, `updated_at`
FROM `notices_copy`;--> statement-breakpoint
DROP TABLE `notices_copy`;--> statement-breakpoint
CREATE INDEX `notices_unit_created` ON `notices` (`unit_id`,`created_at`);--> statement-breakpoint
CREATE TRIGGER `notices_no_delete` BEFORE DELETE ON `notices`
BEGIN
	SELECT RAISE(ABORT, 'a notice is never deleted; it is retired');
END;--> statement-breakpoint
CREATE TRIGGER `notices_version` BEFORE UPDATE ON `notices`
WHEN NEW.`version` <> OLD.`version` + 1 OR NEW.`unit_id` <> OLD.`unit_id` OR NEW.`source` <> OLD.`source`
	OR NEW.`created_by` <> OLD.`created_by` OR NEW.`created_at` <> OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this notice');
END;--> statement-breakpoint
CREATE TRIGGER `notices_automatic_unchanged` BEFORE UPDATE ON `notices`
WHEN OLD.`source` = 'automatic' AND (NEW.`title` IS NOT OLD.`title` OR NEW.`body` IS NOT OLD.`body`
	OR NEW.`automatic_kind` IS NOT OLD.`automatic_kind` OR NEW.`source_record_id` IS NOT OLD.`source_record_id`
	OR NEW.`about_date` IS NOT OLD.`about_date`)
BEGIN
	SELECT RAISE(ABORT, 'an automatic post is never changed');
END;--> statement-breakpoint
CREATE TRIGGER `notice_votes_officer_notices_only` BEFORE INSERT ON `notice_votes`
WHEN (SELECT `source` FROM `notices` WHERE `id` = NEW.`notice_id`) IS NOT 'officer'
BEGIN
	SELECT RAISE(ABORT, 'only an officer''s notice can include a vote');
END;--> statement-breakpoint
CREATE TRIGGER `notice_ballots_open` BEFORE INSERT ON `notice_ballots`
WHEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now') >= (SELECT `closes_at` FROM `notice_votes` WHERE `notice_id` = NEW.`notice_id`)
	OR (SELECT `retired_at` FROM `notices` WHERE `id` = NEW.`notice_id`) IS NOT NULL
BEGIN
	SELECT RAISE(ABORT, 'vote closed');
END;
