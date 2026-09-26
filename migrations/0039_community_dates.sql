-- Brief 19 A3 and D-145 to D-147. Hand-edited from drizzle-kit's output
-- before it was applied anywhere. A community date is never deleted
-- (retired instead, D-147); each change raises its version by exactly one
-- (9.1); only the General Council's dates can be for all branches (D-146).
CREATE TABLE `community_dates` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`title` text NOT NULL CHECK (`title` <> ''),
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`start_time` text CHECK (`start_time` IS NULL OR length(`start_time`) = 5),
	`description` text CHECK (`description` IS NULL OR `description` <> ''),
	`for_all_branches` integer NOT NULL CHECK (`for_all_branches` IN (0, 1)),
	`retired_at` text,
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL,
	CHECK (`end_date` >= `start_date`)
);
--> statement-breakpoint
CREATE INDEX `community_dates_unit_date` ON `community_dates` (`unit_id`,`start_date`);--> statement-breakpoint
CREATE INDEX `community_dates_all_branches` ON `community_dates` (`for_all_branches`,`start_date`);--> statement-breakpoint
CREATE TRIGGER `community_dates_no_delete` BEFORE DELETE ON `community_dates`
BEGIN
	SELECT RAISE(ABORT, 'a community date is never deleted; it is retired');
END;--> statement-breakpoint
CREATE TRIGGER `community_dates_version` BEFORE UPDATE ON `community_dates`
WHEN NEW.`version` <> OLD.`version` + 1 OR NEW.`unit_id` <> OLD.`unit_id`
	OR NEW.`created_by` <> OLD.`created_by` OR NEW.`created_at` <> OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this community date');
END;--> statement-breakpoint
CREATE TRIGGER `community_dates_all_branches_national` BEFORE INSERT ON `community_dates`
WHEN NEW.`for_all_branches` = 1 AND (SELECT `type` FROM `units` WHERE `id` = NEW.`unit_id`) <> 'national'
BEGIN
	SELECT RAISE(ABORT, 'only the General Council adds a date for all branches');
END;--> statement-breakpoint
CREATE TRIGGER `community_dates_all_branches_national_update` BEFORE UPDATE OF `for_all_branches` ON `community_dates`
WHEN NEW.`for_all_branches` = 1 AND (SELECT `type` FROM `units` WHERE `id` = NEW.`unit_id`) <> 'national'
BEGIN
	SELECT RAISE(ABORT, 'only the General Council adds a date for all branches');
END;
