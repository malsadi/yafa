-- Brief 6.4, 19 build notes and 10.3. Hand-edited from drizzle-kit's output
-- before it was applied anywhere. A feed token is stored only as its hash.
-- The read-model of meetings and events is written only by their owning
-- services (Phases 8 and 9); the Calendar only reads it.
CREATE TABLE `calendar_feed_tokens` (
	`person_id` text PRIMARY KEY NOT NULL REFERENCES `people`(`id`),
	`token_hash` text NOT NULL CHECK (length(`token_hash`) = 64),
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `calendar_feed_tokens_hash` ON `calendar_feed_tokens` (`token_hash`);--> statement-breakpoint
CREATE TABLE `calendar_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`kind` text NOT NULL CHECK (`kind` IN ('meeting', 'event')),
	`source_record_id` text NOT NULL,
	`title` text NOT NULL CHECK (`title` <> ''),
	`date` text NOT NULL,
	`start_time` text CHECK (`start_time` IS NULL OR length(`start_time`) = 5),
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `calendar_entries_unit_date` ON `calendar_entries` (`unit_id`,`date`);--> statement-breakpoint
CREATE INDEX `calendar_entries_date` ON `calendar_entries` (`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `calendar_entries_source` ON `calendar_entries` (`kind`,`source_record_id`);
