-- Brief 16 A1 to C2, and D-100 and D-103 to D-109. Hand-edited from
-- drizzle-kit's output before it was applied anywhere. Nothing here is
-- ever deleted (retired instead, D-100); each editable record's change must
-- raise its version by exactly one, so a save from an older version fails
-- (9.1); an optional text is either absent or written, never blank.
CREATE TABLE `library_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`kind` text NOT NULL CHECK (`kind` IN ('template', 'guide')),
	`title` text NOT NULL CHECK (`title` <> ''),
	`description` text CHECK (`description` IS NULL OR `description` <> ''),
	`language` text NOT NULL CHECK (`language` IN ('en', 'ar')),
	`file_id` text NOT NULL REFERENCES `files`(`id`),
	`retired_at` text,
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `library_resources_unit_id` ON `library_resources` (`unit_id`);--> statement-breakpoint
CREATE TABLE `library_venues` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`name` text NOT NULL CHECK (`name` <> ''),
	`address` text CHECK (`address` IS NULL OR `address` <> ''),
	`capacity` integer CHECK (`capacity` IS NULL OR `capacity` >= 1),
	`facilities` text CHECK (`facilities` IS NULL OR `facilities` <> ''),
	`contact_name` text CHECK (`contact_name` IS NULL OR `contact_name` <> ''),
	`contact_phone` text CHECK (`contact_phone` IS NULL OR `contact_phone` <> ''),
	`contact_email` text CHECK (`contact_email` IS NULL OR `contact_email` <> ''),
	`typical_cost_pence` integer CHECK (`typical_cost_pence` IS NULL OR `typical_cost_pence` >= 0),
	`typical_cost_note` text CHECK (`typical_cost_note` IS NULL OR `typical_cost_note` <> ''),
	`retired_at` text,
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `library_venues_unit_id` ON `library_venues` (`unit_id`);--> statement-breakpoint
CREATE TABLE `library_venue_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL REFERENCES `library_venues`(`id`),
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`text` text NOT NULL CHECK (`text` <> ''),
	`written_by` text NOT NULL,
	`written_at` text NOT NULL,
	`retired_at` text,
	`retired_by` text,
	CHECK ((`retired_at` IS NULL) = (`retired_by` IS NULL))
);
--> statement-breakpoint
CREATE INDEX `library_venue_notes_unit_id` ON `library_venue_notes` (`unit_id`);--> statement-breakpoint
CREATE INDEX `library_venue_notes_venue_id` ON `library_venue_notes` (`venue_id`);--> statement-breakpoint
CREATE TABLE `library_equipment` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`item` text NOT NULL CHECK (`item` <> ''),
	`quantity` integer NOT NULL CHECK (`quantity` >= 0),
	`location` text NOT NULL CHECK (`location` <> ''),
	`condition_id` text NOT NULL REFERENCES `list_items`(`id`),
	`retired_at` text,
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `library_equipment_unit_id` ON `library_equipment` (`unit_id`);--> statement-breakpoint
CREATE TABLE `library_equipment_loans` (
	`id` text PRIMARY KEY NOT NULL,
	`equipment_id` text NOT NULL REFERENCES `library_equipment`(`id`),
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`borrower` text NOT NULL CHECK (`borrower` <> ''),
	`quantity` integer NOT NULL CHECK (`quantity` >= 1),
	`borrowed_on` text NOT NULL,
	`due_back` text NOT NULL,
	`returned_on` text,
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL,
	CHECK (`due_back` >= `borrowed_on`),
	CHECK (`returned_on` IS NULL OR `returned_on` >= `borrowed_on`)
);
--> statement-breakpoint
CREATE INDEX `library_equipment_loans_unit_id` ON `library_equipment_loans` (`unit_id`);--> statement-breakpoint
CREATE INDEX `library_equipment_loans_equipment_id` ON `library_equipment_loans` (`equipment_id`);--> statement-breakpoint
CREATE TABLE `library_equipment_loan_history` (
	`id` text PRIMARY KEY NOT NULL,
	`loan_id` text NOT NULL REFERENCES `library_equipment_loans`(`id`),
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`change` text NOT NULL CHECK (`change` IN ('lent', 'corrected', 'returned')),
	`borrower` text NOT NULL,
	`quantity` integer NOT NULL,
	`borrowed_on` text NOT NULL,
	`due_back` text NOT NULL,
	`returned_on` text,
	`recorded_by` text NOT NULL,
	`recorded_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `library_equipment_loan_history_unit_id` ON `library_equipment_loan_history` (`unit_id`);--> statement-breakpoint
CREATE INDEX `library_equipment_loan_history_loan_id` ON `library_equipment_loan_history` (`loan_id`);--> statement-breakpoint
CREATE TRIGGER `library_resources_no_delete` BEFORE DELETE ON `library_resources`
BEGIN
	SELECT RAISE(ABORT, 'a template or guide is never deleted; it is retired');
END;--> statement-breakpoint
CREATE TRIGGER `library_resources_version` BEFORE UPDATE ON `library_resources`
WHEN NEW.`version` <> OLD.`version` + 1 OR NEW.`unit_id` <> OLD.`unit_id` OR NEW.`kind` <> OLD.`kind`
	OR NEW.`created_by` <> OLD.`created_by` OR NEW.`created_at` <> OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this template or guide');
END;--> statement-breakpoint
CREATE TRIGGER `library_venues_no_delete` BEFORE DELETE ON `library_venues`
BEGIN
	SELECT RAISE(ABORT, 'a venue is never deleted; it is retired');
END;--> statement-breakpoint
CREATE TRIGGER `library_venues_version` BEFORE UPDATE ON `library_venues`
WHEN NEW.`version` <> OLD.`version` + 1 OR NEW.`unit_id` <> OLD.`unit_id`
	OR NEW.`created_by` <> OLD.`created_by` OR NEW.`created_at` <> OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this venue');
END;--> statement-breakpoint
CREATE TRIGGER `library_venue_notes_no_delete` BEFORE DELETE ON `library_venue_notes`
BEGIN
	SELECT RAISE(ABORT, 'a venue note is never deleted; it is retired');
END;--> statement-breakpoint
CREATE TRIGGER `library_venue_notes_only_retired` BEFORE UPDATE ON `library_venue_notes`
WHEN OLD.`retired_at` IS NOT NULL OR NEW.`retired_at` IS NULL
	OR NEW.`id` <> OLD.`id` OR NEW.`venue_id` <> OLD.`venue_id` OR NEW.`unit_id` <> OLD.`unit_id`
	OR NEW.`text` <> OLD.`text` OR NEW.`written_by` <> OLD.`written_by` OR NEW.`written_at` <> OLD.`written_at`
BEGIN
	SELECT RAISE(ABORT, 'a venue note is never changed; it can only be retired, once');
END;--> statement-breakpoint
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
CREATE TRIGGER `library_equipment_loans_no_delete` BEFORE DELETE ON `library_equipment_loans`
BEGIN
	SELECT RAISE(ABORT, 'a loan is never deleted');
END;--> statement-breakpoint
CREATE TRIGGER `library_equipment_loans_fixed_once_returned` BEFORE UPDATE ON `library_equipment_loans`
WHEN OLD.`returned_on` IS NOT NULL
BEGIN
	SELECT RAISE(ABORT, 'a returned loan is fixed');
END;--> statement-breakpoint
CREATE TRIGGER `library_equipment_loans_version` BEFORE UPDATE ON `library_equipment_loans`
WHEN NEW.`version` <> OLD.`version` + 1 OR NEW.`unit_id` <> OLD.`unit_id` OR NEW.`equipment_id` <> OLD.`equipment_id`
	OR NEW.`created_by` <> OLD.`created_by` OR NEW.`created_at` <> OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this loan');
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
END;--> statement-breakpoint
CREATE TRIGGER `library_equipment_loan_history_no_update` BEFORE UPDATE ON `library_equipment_loan_history`
BEGIN
	SELECT RAISE(ABORT, 'a loan history entry is never changed');
END;--> statement-breakpoint
CREATE TRIGGER `library_equipment_loan_history_no_delete` BEFORE DELETE ON `library_equipment_loan_history`
BEGIN
	SELECT RAISE(ABORT, 'a loan history entry is never deleted');
END;
