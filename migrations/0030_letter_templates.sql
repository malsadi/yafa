-- Brief 16 D1, P19, D-100, D-101 and 9.1. Hand-edited from drizzle-kit's
-- output before it was applied anywhere: the checks keep a template whole
-- (a title, a subject, a body, a field list, English or Arabic); the
-- triggers refuse deleting one (retired instead, D-100) and any change that
-- does not raise its version by exactly one, so a save made from an older
-- version fails ("someone else changed this", 9.1).
CREATE TABLE `library_letter_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`title` text NOT NULL CHECK (`title` <> ''),
	`subject` text NOT NULL CHECK (`subject` <> ''),
	`body` text NOT NULL CHECK (`body` <> ''),
	`fields` text NOT NULL CHECK (json_valid(`fields`) AND json_type(`fields`) = 'array'),
	`language` text NOT NULL CHECK (`language` IN ('en', 'ar')),
	`retired_at` text,
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `library_letter_templates_unit_id` ON `library_letter_templates` (`unit_id`);--> statement-breakpoint
CREATE TRIGGER `library_letter_templates_no_delete` BEFORE DELETE ON `library_letter_templates`
BEGIN
	SELECT RAISE(ABORT, 'a letter template is never deleted; it is retired');
END;--> statement-breakpoint
CREATE TRIGGER `library_letter_templates_version` BEFORE UPDATE ON `library_letter_templates`
WHEN NEW.`version` <> OLD.`version` + 1
	OR NEW.`unit_id` <> OLD.`unit_id`
	OR NEW.`created_by` <> OLD.`created_by`
	OR NEW.`created_at` <> OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this letter template');
END;
