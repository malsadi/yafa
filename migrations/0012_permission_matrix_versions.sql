CREATE TABLE `permission_matrix_version_grants` (
	`version_id` text NOT NULL,
	`role_id` text NOT NULL,
	`capability` text NOT NULL,
	`scope` text NOT NULL,
	PRIMARY KEY(`version_id`, `role_id`, `capability`, `scope`),
	FOREIGN KEY (`version_id`) REFERENCES `permission_matrix_versions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `permission_matrix_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`number` integer NOT NULL,
	`change` text NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permission_matrix_versions_number_unique` ON `permission_matrix_versions` (`number`);