-- D-114. 0033 is applied, so it is not edited.
-- 1. A retired venue note can be brought back. Its text, venue, writer and
--    date still never change; an update may only retire it (recording who
--    and when) or bring it back.
-- 2. Equipment needs only its item and quantity; where it is kept and its
--    condition are optional. The table is rebuilt, keeping every row, with
--    0033's checks and triggers otherwise unchanged. Loans refer to it by
--    name, so they refer to the rebuilt table; the two loan triggers that
--    read it are dropped first and made again, unchanged, after it.
DROP TRIGGER `library_venue_notes_only_retired`;--> statement-breakpoint
CREATE TRIGGER `library_venue_notes_only_retired_or_restored` BEFORE UPDATE ON `library_venue_notes`
WHEN (OLD.`retired_at` IS NULL) = (NEW.`retired_at` IS NULL)
	OR NEW.`id` <> OLD.`id` OR NEW.`venue_id` <> OLD.`venue_id` OR NEW.`unit_id` <> OLD.`unit_id`
	OR NEW.`text` <> OLD.`text` OR NEW.`written_by` <> OLD.`written_by` OR NEW.`written_at` <> OLD.`written_at`
BEGIN
	SELECT RAISE(ABORT, 'a venue note is never changed; it can only be retired or brought back');
END;--> statement-breakpoint
PRAGMA defer_foreign_keys = true;--> statement-breakpoint
CREATE TABLE `library_equipment_new` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`item` text NOT NULL CHECK (`item` <> ''),
	`quantity` integer NOT NULL CHECK (`quantity` >= 0),
	`location` text CHECK (`location` IS NULL OR `location` <> ''),
	`condition_id` text REFERENCES `list_items`(`id`),
	`retired_at` text,
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);--> statement-breakpoint
INSERT INTO `library_equipment_new` (`id`, `unit_id`, `item`, `quantity`, `location`, `condition_id`, `retired_at`, `version`, `created_by`, `created_at`, `updated_by`, `updated_at`)
	SELECT `id`, `unit_id`, `item`, `quantity`, `location`, `condition_id`, `retired_at`, `version`, `created_by`, `created_at`, `updated_by`, `updated_at`
	FROM `library_equipment`;--> statement-breakpoint
DROP TRIGGER `library_equipment_loans_within_stock`;--> statement-breakpoint
DROP TRIGGER `library_equipment_loans_corrected_within_stock`;--> statement-breakpoint
DROP TABLE `library_equipment`;--> statement-breakpoint
ALTER TABLE `library_equipment_new` RENAME TO `library_equipment`;--> statement-breakpoint
CREATE INDEX `library_equipment_unit_id` ON `library_equipment` (`unit_id`);--> statement-breakpoint
CREATE TRIGGER `library_equipment_no_delete` BEFORE DELETE ON `library_equipment`
BEGIN
	SELECT RAISE(ABORT, 'equipment is never deleted; it is retired');
END;--> statement-breakpoint
CREATE TRIGGER `library_equipment_version` BEFORE UPDATE ON `library_equipment`
WHEN NEW.`version` <> OLD.`version` + 1 OR NEW.`unit_id` <> OLD.`unit_id`
	OR NEW.`created_by` <> OLD.`created_by` OR NEW.`created_at` <> OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this equipment');
END;--> statement-breakpoint
CREATE TRIGGER `library_equipment_not_below_loans` BEFORE UPDATE OF `quantity` ON `library_equipment`
WHEN NEW.`quantity` < (SELECT COALESCE(SUM(`quantity`), 0) FROM `library_equipment_loans`
	WHERE `equipment_id` = NEW.`id` AND `returned_on` IS NULL)
BEGIN
	SELECT RAISE(ABORT, 'over-lent: the quantity would be below what is out on loan');
END;--> statement-breakpoint
CREATE TRIGGER `library_equipment_loans_within_stock` BEFORE INSERT ON `library_equipment_loans`
WHEN NEW.`quantity` + (SELECT COALESCE(SUM(`quantity`), 0) FROM `library_equipment_loans`
	WHERE `equipment_id` = NEW.`equipment_id` AND `returned_on` IS NULL)
	> (SELECT `quantity` FROM `library_equipment` WHERE `id` = NEW.`equipment_id`)
BEGIN
	SELECT RAISE(ABORT, 'over-lent: more than is left');
END;--> statement-breakpoint
CREATE TRIGGER `library_equipment_loans_corrected_within_stock` BEFORE UPDATE ON `library_equipment_loans`
WHEN NEW.`returned_on` IS NULL AND NEW.`quantity` + (SELECT COALESCE(SUM(`quantity`), 0) FROM `library_equipment_loans`
	WHERE `equipment_id` = NEW.`equipment_id` AND `returned_on` IS NULL AND `id` <> OLD.`id`)
	> (SELECT `quantity` FROM `library_equipment` WHERE `id` = NEW.`equipment_id`)
BEGIN
	SELECT RAISE(ABORT, 'over-lent: more than is left');
END;
