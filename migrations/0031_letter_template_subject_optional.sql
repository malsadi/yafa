-- D-112: a letter template's subject becomes optional; with none, the
-- letter begins at its text. 0030 is applied, so it is not edited: this
-- rebuilds the table, keeping every row, with the subject either absent
-- (NULL) or written. The checks and triggers are 0030's, unchanged.
PRAGMA defer_foreign_keys = true;--> statement-breakpoint
CREATE TABLE `library_letter_templates_new` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`title` text NOT NULL CHECK (`title` <> ''),
	`subject` text CHECK (`subject` IS NULL OR `subject` <> ''),
	`body` text NOT NULL CHECK (`body` <> ''),
	`fields` text NOT NULL CHECK (json_valid(`fields`) AND json_type(`fields`) = 'array'),
	`language` text NOT NULL CHECK (`language` IN ('en', 'ar')),
	`retired_at` text,
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);--> statement-breakpoint
INSERT INTO `library_letter_templates_new` (`id`, `unit_id`, `title`, `subject`, `body`, `fields`, `language`, `retired_at`, `version`, `created_by`, `created_at`, `updated_by`, `updated_at`)
	SELECT `id`, `unit_id`, `title`, `subject`, `body`, `fields`, `language`, `retired_at`, `version`, `created_by`, `created_at`, `updated_by`, `updated_at`
	FROM `library_letter_templates`;--> statement-breakpoint
DROP TABLE `library_letter_templates`;--> statement-breakpoint
ALTER TABLE `library_letter_templates_new` RENAME TO `library_letter_templates`;--> statement-breakpoint
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
