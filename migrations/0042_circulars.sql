-- Brief 20 A3, A4; P14; D-157. Hand-edited from drizzle-kit's output
-- before it was applied anywhere. Only the General Council sends a
-- circular, to branches only; it is never changed or deleted, and neither
-- are the branches it went to. A branch's first opening is recorded once
-- (P14), only for a branch it went to, and never changed or removed.
CREATE TABLE `circulars` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`title` text NOT NULL CHECK (`title` <> ''),
	`body` text NOT NULL CHECK (`body` <> ''),
	`to_all_branches` integer NOT NULL CHECK (`to_all_branches` IN (0, 1)),
	`created_by` text NOT NULL REFERENCES `people`(`id`),
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `circulars_created` ON `circulars` (`created_at`);--> statement-breakpoint
CREATE TABLE `circular_recipients` (
	`circular_id` text NOT NULL REFERENCES `circulars`(`id`),
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	PRIMARY KEY(`circular_id`, `unit_id`)
);
--> statement-breakpoint
CREATE INDEX `circular_recipients_unit` ON `circular_recipients` (`unit_id`);--> statement-breakpoint
CREATE TABLE `circular_opens` (
	`circular_id` text NOT NULL,
	`unit_id` text NOT NULL,
	`opened_at` text NOT NULL,
	`opened_by` text NOT NULL REFERENCES `people`(`id`),
	PRIMARY KEY(`circular_id`, `unit_id`),
	FOREIGN KEY (`circular_id`, `unit_id`) REFERENCES `circular_recipients`(`circular_id`, `unit_id`)
);
--> statement-breakpoint
CREATE TRIGGER `circulars_general_council_only` BEFORE INSERT ON `circulars`
WHEN (SELECT `type` FROM `units` WHERE `id` = NEW.`unit_id`) IS NOT 'national'
BEGIN
	SELECT RAISE(ABORT, 'only the General Council sends a national circular');
END;--> statement-breakpoint
CREATE TRIGGER `circulars_no_update` BEFORE UPDATE ON `circulars`
BEGIN
	SELECT RAISE(ABORT, 'a circular is never changed once sent');
END;--> statement-breakpoint
CREATE TRIGGER `circulars_no_delete` BEFORE DELETE ON `circulars`
BEGIN
	SELECT RAISE(ABORT, 'a circular is never changed once sent');
END;--> statement-breakpoint
CREATE TRIGGER `circular_recipients_branches_only` BEFORE INSERT ON `circular_recipients`
WHEN (SELECT `type` FROM `units` WHERE `id` = NEW.`unit_id`) IS NOT 'branch'
BEGIN
	SELECT RAISE(ABORT, 'a circular goes to branches only');
END;--> statement-breakpoint
CREATE TRIGGER `circular_recipients_no_update` BEFORE UPDATE ON `circular_recipients`
BEGIN
	SELECT RAISE(ABORT, 'a circular is never changed once sent');
END;--> statement-breakpoint
CREATE TRIGGER `circular_recipients_no_delete` BEFORE DELETE ON `circular_recipients`
BEGIN
	SELECT RAISE(ABORT, 'a circular is never changed once sent');
END;--> statement-breakpoint
CREATE TRIGGER `circular_opens_no_update` BEFORE UPDATE ON `circular_opens`
BEGIN
	SELECT RAISE(ABORT, 'a read confirmation is never changed');
END;--> statement-breakpoint
CREATE TRIGGER `circular_opens_no_delete` BEFORE DELETE ON `circular_opens`
BEGIN
	SELECT RAISE(ABORT, 'a read confirmation is never changed');
END;
