-- Brief 15 (Documents archive) and 16 D2, D3 (letters filed in the library).
-- Hand-edited from drizzle-kit's output before it was applied anywhere:
-- the checks hold D-096 (an upload goes only into Governance or General;
-- an automatic filing names the record it files), and the triggers hold
-- "nothing in the archive is ever deleted" (15 rules), versions kept
-- (A4), an automatic filing never versioned (A4), and filed letters never
-- changed (16 D2, D3).
CREATE TABLE `archive_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`category_id` text NOT NULL REFERENCES `archive_categories`(`id`),
	`source` text NOT NULL CHECK (`source` IN ('automatic', 'upload')),
	`source_service` text,
	`source_record_id` text,
	`title` text NOT NULL CHECK (`title` <> ''),
	`description` text CHECK (`description` IS NULL OR `description` <> ''),
	`document_date` text NOT NULL,
	`filed_at` text NOT NULL,
	`filed_by` text NOT NULL,
	CHECK (
		(`source` = 'automatic' AND `source_service` IS NOT NULL AND `source_record_id` IS NOT NULL)
		OR (`source` = 'upload' AND `source_service` IS NULL AND `source_record_id` IS NULL
			AND `category_id` IN ('governance', 'general'))
	)
);
--> statement-breakpoint
CREATE INDEX `archive_documents_unit_id` ON `archive_documents` (`unit_id`);--> statement-breakpoint
CREATE INDEX `archive_documents_filed_at` ON `archive_documents` (`filed_at`);--> statement-breakpoint
CREATE INDEX `archive_documents_document_date` ON `archive_documents` (`document_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `archive_documents_source` ON `archive_documents` (`source_service`,`source_record_id`);--> statement-breakpoint
CREATE TABLE `archive_document_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL REFERENCES `archive_documents`(`id`),
	`version` integer NOT NULL CHECK (`version` >= 1),
	`file_id` text NOT NULL REFERENCES `files`(`id`),
	`added_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archive_document_versions_number` ON `archive_document_versions` (`document_id`,`version`);--> statement-breakpoint
CREATE TABLE `library_letters_out` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`reference_number` text NOT NULL CHECK (`reference_number` <> ''),
	`letter_id` text NOT NULL,
	`file_id` text NOT NULL REFERENCES `files`(`id`),
	`filed_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `library_letters_out_unit_id` ON `library_letters_out` (`unit_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `library_letters_out_reference` ON `library_letters_out` (`unit_id`,`reference_number`);--> statement-breakpoint
CREATE TABLE `library_letters_in` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`reference_number` text NOT NULL CHECK (`reference_number` <> ''),
	`letter_id` text NOT NULL,
	`file_id` text NOT NULL REFERENCES `files`(`id`),
	`filed_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `library_letters_in_unit_id` ON `library_letters_in` (`unit_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `library_letters_in_reference` ON `library_letters_in` (`unit_id`,`reference_number`);--> statement-breakpoint
CREATE TRIGGER `archive_documents_no_update` BEFORE UPDATE ON `archive_documents`
BEGIN
	SELECT RAISE(ABORT, 'an archived document is never changed; a new version is added instead');
END;--> statement-breakpoint
CREATE TRIGGER `archive_documents_no_delete` BEFORE DELETE ON `archive_documents`
BEGIN
	SELECT RAISE(ABORT, 'nothing in the archive is ever deleted');
END;--> statement-breakpoint
CREATE TRIGGER `archive_document_versions_no_update` BEFORE UPDATE ON `archive_document_versions`
BEGIN
	SELECT RAISE(ABORT, 'an archived version is never changed');
END;--> statement-breakpoint
CREATE TRIGGER `archive_document_versions_no_delete` BEFORE DELETE ON `archive_document_versions`
BEGIN
	SELECT RAISE(ABORT, 'nothing in the archive is ever deleted');
END;--> statement-breakpoint
CREATE TRIGGER `archive_automatic_filings_not_versioned` BEFORE INSERT ON `archive_document_versions`
WHEN (SELECT `source` FROM `archive_documents` WHERE `id` = NEW.`document_id`) = 'automatic'
	AND EXISTS (SELECT 1 FROM `archive_document_versions` WHERE `document_id` = NEW.`document_id`)
BEGIN
	SELECT RAISE(ABORT, 'an automatic filing is locked: it has no versions');
END;--> statement-breakpoint
CREATE TRIGGER `library_letters_out_no_update` BEFORE UPDATE ON `library_letters_out`
BEGIN
	SELECT RAISE(ABORT, 'a filed letter is never changed');
END;--> statement-breakpoint
CREATE TRIGGER `library_letters_out_no_delete` BEFORE DELETE ON `library_letters_out`
BEGIN
	SELECT RAISE(ABORT, 'a filed letter is never deleted');
END;--> statement-breakpoint
CREATE TRIGGER `library_letters_in_no_update` BEFORE UPDATE ON `library_letters_in`
BEGIN
	SELECT RAISE(ABORT, 'a filed letter is never changed');
END;--> statement-breakpoint
CREATE TRIGGER `library_letters_in_no_delete` BEFORE DELETE ON `library_letters_in`
BEGIN
	SELECT RAISE(ABORT, 'a filed letter is never deleted');
END;
