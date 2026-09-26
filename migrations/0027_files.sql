-- Brief 9.3: one record per object in R2, written only after the object is
-- in R2 and checked. Hand-edited from drizzle-kit's output before it was
-- applied anywhere: the use and the lock are checked values, a size is
-- never negative, and a locked file's record can never be changed or
-- deleted (brief 9.3: "Files of locked records can never be deleted or
-- overwritten"; build rule 5).
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`unit_id` text NOT NULL,
	`service` text NOT NULL,
	`record_id` text NOT NULL,
	`use` text NOT NULL CHECK (`use` IN ('receipt-photos', 'documents', 'letter-scans', 'media-images', 'video', 'branding-images', 'fonts')),
	`file_name` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`size` integer NOT NULL CHECK (`size` >= 0),
	`content_type` text NOT NULL,
	`checksum` text NOT NULL,
	`locked` integer NOT NULL CHECK (`locked` IN (0, 1)),
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `files_key_unique` ON `files` (`key`);--> statement-breakpoint
CREATE INDEX `files_unit_id` ON `files` (`unit_id`);--> statement-breakpoint
CREATE INDEX `files_record` ON `files` (`service`,`record_id`);--> statement-breakpoint
CREATE TRIGGER `files_locked_no_update` BEFORE UPDATE ON `files` WHEN OLD.`locked` = 1
BEGIN
	SELECT RAISE(ABORT, 'a locked file is never changed');
END;--> statement-breakpoint
CREATE TRIGGER `files_locked_no_delete` BEFORE DELETE ON `files` WHEN OLD.`locked` = 1
BEGIN
	SELECT RAISE(ABORT, 'a locked file is never deleted');
END;
