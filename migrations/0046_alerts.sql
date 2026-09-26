-- Brief 20 C1, C2; 11; D-033, D-050, D-163, D-164. Hand-edited from
-- drizzle-kit's output before it was applied anywhere. An officer's alert
-- choices (their own to change); the closed votes whose results have been
-- queued, once each; and undelivered phone alerts, kept for the health
-- screen until Push pruning removes them.
CREATE TABLE `alert_choices` (
	`person_id` text PRIMARY KEY NOT NULL REFERENCES `people`(`id`),
	`alert_types` text NOT NULL CHECK (json_valid(`alert_types`) AND json_type(`alert_types`) = 'array'),
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vote_result_alerts` (
	`notice_id` text PRIMARY KEY NOT NULL REFERENCES `notice_votes`(`notice_id`),
	`queued_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `push_delivery_failures` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL REFERENCES `people`(`id`),
	`alert_kind` text NOT NULL,
	`last_status` text NOT NULL,
	`failed_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `push_delivery_failures_failed` ON `push_delivery_failures` (`failed_at`);--> statement-breakpoint
CREATE TRIGGER `vote_result_alerts_no_change` BEFORE UPDATE ON `vote_result_alerts`
BEGIN
	SELECT RAISE(ABORT, 'a vote result is alerted once');
END;--> statement-breakpoint
CREATE TRIGGER `vote_result_alerts_no_delete` BEFORE DELETE ON `vote_result_alerts`
BEGIN
	SELECT RAISE(ABORT, 'a vote result is alerted once');
END;
