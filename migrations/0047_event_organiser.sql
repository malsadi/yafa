-- Brief 21; P10, P15, P16; D-172 to D-186. Hand-edited from drizzle-kit's
-- output before it was applied anywhere. An event is never deleted; each
-- change raises its version by exactly one (9.1). It is approved once, by
-- someone other than its creator (D-175); published once to each target
-- (D-182); a cancel is never undone and needs a reason (D-181); it closes
-- only from Completed or Cancelled, and once Closed it, its tasks and its
-- files are locked (D-184). Templates are retired, never deleted (D-178).
CREATE TABLE `event_template_budget_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL REFERENCES `event_templates`(`id`),
	`position` integer NOT NULL CHECK (`position` >= 1),
	`name` text NOT NULL CHECK (`name` <> ''),
	`amount_pence` integer NOT NULL CHECK (`amount_pence` >= 0)
);
--> statement-breakpoint
CREATE INDEX `event_template_budget_lines_template` ON `event_template_budget_lines` (`template_id`);--> statement-breakpoint
CREATE TABLE `event_template_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL REFERENCES `event_templates`(`id`),
	`position` integer NOT NULL CHECK (`position` >= 1),
	`title` text NOT NULL CHECK (`title` <> ''),
	`description` text CHECK (`description` IS NULL OR `description` <> ''),
	`days_before` integer NOT NULL CHECK (`days_before` >= 0)
);
--> statement-breakpoint
CREATE INDEX `event_template_tasks_template` ON `event_template_tasks` (`template_id`);--> statement-breakpoint
CREATE TABLE `event_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`name` text NOT NULL CHECK (`name` <> ''),
	`retired_at` text,
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `event_templates_unit` ON `event_templates` (`unit_id`);--> statement-breakpoint
CREATE TABLE `event_files` (
	`file_id` text PRIMARY KEY NOT NULL REFERENCES `files`(`id`),
	`event_id` text NOT NULL REFERENCES `events`(`id`),
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`section` text NOT NULL CHECK (`section` IN ('Documents', 'Media')),
	`added_by` text NOT NULL,
	`added_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `event_files_event` ON `event_files` (`event_id`,`section`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`name` text NOT NULL CHECK (`name` <> ''),
	`type_item_id` text NOT NULL REFERENCES `list_items`(`id`),
	`lead_person_id` text NOT NULL REFERENCES `people`(`id`),
	`first_day` text NOT NULL,
	`start_time` text,
	`last_day` text CHECK (`last_day` IS NULL OR `last_day` >= `first_day`),
	`status` text NOT NULL CHECK (`status` IN ('Draft', 'Approved', 'In preparation', 'Ready', 'Completed', 'Cancelled', 'Closed')),
	`template_id` text REFERENCES `event_templates`(`id`),
	`approved_by` text REFERENCES `people`(`id`),
	`approved_at` text,
	`cancel_reason` text CHECK (`cancel_reason` IS NULL OR `cancel_reason` <> ''),
	`cancelled_by` text REFERENCES `people`(`id`),
	`cancelled_at` text,
	`calendar_published_at` text,
	`noticeboard_published_at` text,
	`closed_by` text REFERENCES `people`(`id`),
	`closed_at` text,
	`report_file_id` text REFERENCES `files`(`id`),
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL,
	CHECK (`status` <> 'Cancelled' OR `cancel_reason` IS NOT NULL),
	CHECK ((`cancel_reason` IS NULL) = (`cancelled_at` IS NULL)),
	CHECK (`approved_by` IS NULL OR `approved_by` <> `created_by`)
);
--> statement-breakpoint
CREATE INDEX `events_unit_status` ON `events` (`unit_id`,`status`);--> statement-breakpoint
CREATE INDEX `events_unit_first_day` ON `events` (`unit_id`,`first_day`);--> statement-breakpoint
CREATE TRIGGER `events_no_delete` BEFORE DELETE ON `events`
BEGIN
	SELECT RAISE(ABORT, 'an event is never deleted');
END;--> statement-breakpoint
CREATE TRIGGER `events_closed_locked` BEFORE UPDATE ON `events`
WHEN OLD.`status` = 'Closed'
BEGIN
	SELECT RAISE(ABORT, 'a closed event is locked');
END;--> statement-breakpoint
CREATE TRIGGER `events_version` BEFORE UPDATE ON `events`
WHEN NEW.`version` <> OLD.`version` + 1 OR NEW.`unit_id` <> OLD.`unit_id`
	OR NEW.`created_by` <> OLD.`created_by` OR NEW.`created_at` <> OLD.`created_at`
	OR NEW.`template_id` IS NOT OLD.`template_id`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this event');
END;--> statement-breakpoint
CREATE TRIGGER `events_once` BEFORE UPDATE ON `events`
WHEN (OLD.`approved_by` IS NOT NULL AND (NEW.`approved_by` IS NOT OLD.`approved_by` OR NEW.`approved_at` IS NOT OLD.`approved_at`))
	OR (OLD.`calendar_published_at` IS NOT NULL AND NEW.`calendar_published_at` IS NOT OLD.`calendar_published_at`)
	OR (OLD.`noticeboard_published_at` IS NOT NULL AND NEW.`noticeboard_published_at` IS NOT OLD.`noticeboard_published_at`)
	OR (OLD.`cancelled_at` IS NOT NULL AND (NEW.`cancelled_at` IS NOT OLD.`cancelled_at` OR NEW.`cancel_reason` IS NOT OLD.`cancel_reason`))
BEGIN
	SELECT RAISE(ABORT, 'an approval, a publication or a cancel is recorded once');
END;--> statement-breakpoint
CREATE TRIGGER `events_status_moves` BEFORE UPDATE OF `status` ON `events`
WHEN (OLD.`status` = 'Cancelled' AND NEW.`status` NOT IN ('Cancelled', 'Closed'))
	OR (NEW.`status` = 'Closed' AND OLD.`status` NOT IN ('Completed', 'Cancelled'))
	OR (NEW.`status` = 'Draft' AND OLD.`status` <> 'Draft')
	OR (OLD.`status` = 'Draft' AND NEW.`status` NOT IN ('Draft', 'Approved', 'Cancelled'))
	OR (NEW.`status` = 'Approved' AND OLD.`status` = 'Draft' AND NEW.`approved_by` IS NULL)
BEGIN
	SELECT RAISE(ABORT, 'this status move is not allowed');
END;--> statement-breakpoint
CREATE TRIGGER `event_templates_no_delete` BEFORE DELETE ON `event_templates`
BEGIN
	SELECT RAISE(ABORT, 'an event template is never deleted; it is retired');
END;--> statement-breakpoint
CREATE TRIGGER `event_templates_version` BEFORE UPDATE ON `event_templates`
WHEN NEW.`version` <> OLD.`version` + 1 OR NEW.`unit_id` <> OLD.`unit_id`
	OR NEW.`created_by` <> OLD.`created_by` OR NEW.`created_at` <> OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this template');
END;--> statement-breakpoint
CREATE TRIGGER `event_files_locked_insert` BEFORE INSERT ON `event_files`
WHEN (SELECT `status` FROM `events` WHERE `id` = NEW.`event_id`) = 'Closed'
BEGIN
	SELECT RAISE(ABORT, 'a closed event is locked');
END;--> statement-breakpoint
CREATE TRIGGER `event_files_locked_delete` BEFORE DELETE ON `event_files`
WHEN (SELECT `status` FROM `events` WHERE `id` = OLD.`event_id`) = 'Closed'
BEGIN
	SELECT RAISE(ABORT, 'a closed event is locked');
END;--> statement-breakpoint
CREATE TRIGGER `event_files_no_update` BEFORE UPDATE ON `event_files`
BEGIN
	SELECT RAISE(ABORT, 'an event file is added or removed, never changed');
END;--> statement-breakpoint
CREATE TRIGGER `tasks_of_event_insert` BEFORE INSERT ON `tasks`
WHEN NEW.`event_id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `events` e
	WHERE e.`id` = NEW.`event_id` AND e.`unit_id` = NEW.`unit_id` AND e.`status` <> 'Closed')
BEGIN
	SELECT RAISE(ABORT, 'an event task belongs to an open event of the same unit');
END;--> statement-breakpoint
CREATE TRIGGER `tasks_of_closed_event_locked` BEFORE UPDATE ON `tasks`
WHEN (SELECT `status` FROM `events` WHERE `id` = OLD.`event_id`) = 'Closed'
BEGIN
	SELECT RAISE(ABORT, 'a closed event is locked');
END;
