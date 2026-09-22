CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`clerk_user_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `people_email_unique` ON `people` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `people_clerk_user_id_unique` ON `people` (`clerk_user_id`);--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text,
	`name` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `terms` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`role_id` text NOT NULL,
	`unit_id` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `permission_grants` (
	`id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`capability` text NOT NULL,
	`scope` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permission_grants_role_capability_scope_unique` ON `permission_grants` (`role_id`,`capability`,`scope`);--> statement-breakpoint
CREATE TABLE `system_administrators` (
	`person_id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
