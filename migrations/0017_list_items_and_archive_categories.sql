CREATE TABLE `list_items` (
	`id` text PRIMARY KEY NOT NULL,
	`list` text NOT NULL CHECK (`list` IN ('event-types', 'meeting-types', 'achievement-categories', 'equipment-conditions', 'handover-checklist-items')),
	`name_en` text NOT NULL CHECK (`name_en` <> ''),
	`name_ar` text NOT NULL CHECK (`name_ar` <> ''),
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `archive_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`position` integer NOT NULL,
	`name_en` text NOT NULL,
	`name_ar` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archive_categories_position_unique` ON `archive_categories` (`position`);