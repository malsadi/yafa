CREATE TABLE `units` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `units_code_unique` ON `units` (`code`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_person_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`occurred_at` text NOT NULL,
	`before` text,
	`after` text
);
--> statement-breakpoint
CREATE TABLE `service_switches` (
	`service` text NOT NULL,
	`scope` text NOT NULL,
	`enabled` integer NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL,
	PRIMARY KEY(`service`, `scope`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text NOT NULL,
	`scope` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL,
	PRIMARY KEY(`key`, `scope`)
);
--> statement-breakpoint
CREATE TABLE `settings_history` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`scope` text NOT NULL,
	`previous_value` text,
	`new_value` text NOT NULL,
	`changed_at` text NOT NULL,
	`changed_by` text NOT NULL
);
