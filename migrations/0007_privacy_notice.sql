CREATE TABLE `privacy_notice_acknowledgements` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`notice_version_id` text NOT NULL,
	`acknowledged_at` text NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`notice_version_id`) REFERENCES `privacy_notice_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `privacy_notice_acknowledgements_person_version_unique` ON `privacy_notice_acknowledgements` (`person_id`,`notice_version_id`);--> statement-breakpoint
CREATE TABLE `privacy_notice_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`text_en` text NOT NULL,
	`text_ar` text,
	`created_at` text NOT NULL
);
