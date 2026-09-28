-- Phase 11, brief 24 and D-215: Achievements and reports — achievements,
-- the officers credited and their photos, and each unit's annual reports.
-- Hand-edited from drizzle-kit's output before it was applied anywhere:
-- value checks added, and the triggers below.
CREATE TABLE `achievement_officers` (
	`achievement_id` text NOT NULL,
	`person_id` text NOT NULL,
	PRIMARY KEY(`achievement_id`, `person_id`)
);
--> statement-breakpoint
CREATE INDEX `achievement_officers_person` ON `achievement_officers` (`person_id`);--> statement-breakpoint
CREATE TABLE `achievement_photos` (
	`achievement_id` text NOT NULL,
	`file_id` text NOT NULL,
	`retired_at` text,
	`added_by` text NOT NULL,
	`added_at` text NOT NULL,
	PRIMARY KEY(`achievement_id`, `file_id`)
);
--> statement-breakpoint
CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL,
	`title` text NOT NULL CHECK (`title` <> ''),
	`achievement_date` text NOT NULL,
	`category_item_id` text NOT NULL,
	`description` text NOT NULL CHECK (`description` <> ''),
	`withdrawn_at` text,
	`version` integer NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `achievements_unit_date` ON `achievements` (`unit_id`,`achievement_date`);--> statement-breakpoint
CREATE TABLE `annual_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL,
	`year` integer NOT NULL CHECK (`year` >= 1),
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`status` text NOT NULL CHECK (`status` IN ('Draft', 'Finalised')),
	`summary` text CHECK (`summary` IS NULL OR `summary` <> ''),
	`content` text CHECK (`content` IS NULL OR json_valid(`content`)),
	`language` text CHECK (`language` IS NULL OR `language` IN ('en', 'ar')),
	`file_id` text,
	`finalised_by` text,
	`finalised_at` text,
	`version` integer NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `annual_reports_unit_year` ON `annual_reports` (`unit_id`,`year`);--> statement-breakpoint
-- O-152: an achievement is never deleted, and is locked once its year's report is finalised.
CREATE TRIGGER `achievements_no_delete` BEFORE DELETE ON `achievements`
BEGIN
	SELECT RAISE(ABORT, 'an achievement is never deleted');
END;--> statement-breakpoint
CREATE TRIGGER `achievements_locked_insert` BEFORE INSERT ON `achievements`
WHEN EXISTS (SELECT 1 FROM `annual_reports` r WHERE r.`unit_id` = NEW.`unit_id` AND r.`status` = 'Finalised' AND NEW.`achievement_date` BETWEEN r.`period_start` AND r.`period_end`)
BEGIN
	SELECT RAISE(ABORT, 'locked: that year''s annual report is finalised');
END;--> statement-breakpoint
CREATE TRIGGER `achievements_locked_update` BEFORE UPDATE ON `achievements`
WHEN EXISTS (SELECT 1 FROM `annual_reports` r WHERE r.`unit_id` = OLD.`unit_id` AND r.`status` = 'Finalised' AND OLD.`achievement_date` BETWEEN r.`period_start` AND r.`period_end`)
	OR EXISTS (SELECT 1 FROM `annual_reports` r WHERE r.`unit_id` = OLD.`unit_id` AND r.`status` = 'Finalised' AND NEW.`achievement_date` BETWEEN r.`period_start` AND r.`period_end`)
BEGIN
	SELECT RAISE(ABORT, 'locked: that year''s annual report is finalised');
END;--> statement-breakpoint
-- 9.1: each change raises the version by exactly one; its unit and creation never change.
CREATE TRIGGER `achievements_version` BEFORE UPDATE ON `achievements`
WHEN NEW.`version` IS NOT OLD.`version` + 1 OR NEW.`unit_id` IS NOT OLD.`unit_id`
	OR NEW.`created_by` IS NOT OLD.`created_by` OR NEW.`created_at` IS NOT OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this achievement');
END;--> statement-breakpoint
CREATE TRIGGER `achievement_officers_locked_insert` BEFORE INSERT ON `achievement_officers`
WHEN EXISTS (SELECT 1 FROM `achievements` a JOIN `annual_reports` r ON r.`unit_id` = a.`unit_id` WHERE a.`id` = NEW.`achievement_id` AND r.`status` = 'Finalised' AND a.`achievement_date` BETWEEN r.`period_start` AND r.`period_end`)
BEGIN
	SELECT RAISE(ABORT, 'locked: that year''s annual report is finalised');
END;--> statement-breakpoint
CREATE TRIGGER `achievement_officers_locked_delete` BEFORE DELETE ON `achievement_officers`
WHEN EXISTS (SELECT 1 FROM `achievements` a JOIN `annual_reports` r ON r.`unit_id` = a.`unit_id` WHERE a.`id` = OLD.`achievement_id` AND r.`status` = 'Finalised' AND a.`achievement_date` BETWEEN r.`period_start` AND r.`period_end`)
BEGIN
	SELECT RAISE(ABORT, 'locked: that year''s annual report is finalised');
END;--> statement-breakpoint
CREATE TRIGGER `achievement_officers_no_update` BEFORE UPDATE ON `achievement_officers`
BEGIN
	SELECT RAISE(ABORT, 'an achievement''s officers are added or taken off, never changed');
END;--> statement-breakpoint
CREATE TRIGGER `achievement_photos_no_delete` BEFORE DELETE ON `achievement_photos`
BEGIN
	SELECT RAISE(ABORT, 'a photo is retired, never deleted');
END;--> statement-breakpoint
CREATE TRIGGER `achievement_photos_locked_insert` BEFORE INSERT ON `achievement_photos`
WHEN EXISTS (SELECT 1 FROM `achievements` a JOIN `annual_reports` r ON r.`unit_id` = a.`unit_id` WHERE a.`id` = NEW.`achievement_id` AND r.`status` = 'Finalised' AND a.`achievement_date` BETWEEN r.`period_start` AND r.`period_end`)
BEGIN
	SELECT RAISE(ABORT, 'locked: that year''s annual report is finalised');
END;--> statement-breakpoint
CREATE TRIGGER `achievement_photos_update` BEFORE UPDATE ON `achievement_photos`
WHEN EXISTS (SELECT 1 FROM `achievements` a JOIN `annual_reports` r ON r.`unit_id` = a.`unit_id` WHERE a.`id` = OLD.`achievement_id` AND r.`status` = 'Finalised' AND a.`achievement_date` BETWEEN r.`period_start` AND r.`period_end`)
	OR NEW.`achievement_id` IS NOT OLD.`achievement_id` OR NEW.`file_id` IS NOT OLD.`file_id`
	OR NEW.`added_by` IS NOT OLD.`added_by` OR NEW.`added_at` IS NOT OLD.`added_at`
BEGIN
	SELECT RAISE(ABORT, 'locked: only a photo''s retirement changes, before the report is finalised');
END;--> statement-breakpoint
-- O-157, O-158: a report starts as a draft; finalised, it is frozen and filed, and never reopened.
CREATE TRIGGER `annual_reports_no_delete` BEFORE DELETE ON `annual_reports`
BEGIN
	SELECT RAISE(ABORT, 'an annual report is never deleted');
END;--> statement-breakpoint
CREATE TRIGGER `annual_reports_start_draft` BEFORE INSERT ON `annual_reports`
WHEN NEW.`status` <> 'Draft' OR NEW.`version` <> 1 OR NEW.`content` IS NOT NULL
	OR NEW.`file_id` IS NOT NULL OR NEW.`finalised_at` IS NOT NULL
BEGIN
	SELECT RAISE(ABORT, 'an annual report starts as a draft');
END;--> statement-breakpoint
CREATE TRIGGER `annual_reports_finalised_locked` BEFORE UPDATE ON `annual_reports`
WHEN OLD.`status` = 'Finalised'
BEGIN
	SELECT RAISE(ABORT, 'locked: a finalised annual report never changes');
END;--> statement-breakpoint
CREATE TRIGGER `annual_reports_version` BEFORE UPDATE ON `annual_reports`
WHEN NEW.`version` IS NOT OLD.`version` + 1 OR NEW.`unit_id` IS NOT OLD.`unit_id`
	OR NEW.`year` IS NOT OLD.`year` OR NEW.`period_start` IS NOT OLD.`period_start`
	OR NEW.`period_end` IS NOT OLD.`period_end` OR NEW.`created_by` IS NOT OLD.`created_by`
	OR NEW.`created_at` IS NOT OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this report');
END;--> statement-breakpoint
CREATE TRIGGER `annual_reports_finalising` BEFORE UPDATE ON `annual_reports`
WHEN (NEW.`status` = 'Finalised' AND (NEW.`content` IS NULL OR NEW.`file_id` IS NULL
		OR NEW.`language` IS NULL OR NEW.`finalised_by` IS NULL OR NEW.`finalised_at` IS NULL))
	OR (NEW.`status` = 'Draft' AND (NEW.`content` IS NOT NULL OR NEW.`file_id` IS NOT NULL))
BEGIN
	SELECT RAISE(ABORT, 'a finalised report has its content and PDF; a draft has neither');
END;
