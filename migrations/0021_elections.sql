CREATE TABLE `election_candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`position_id` text NOT NULL,
	`person_id` text NOT NULL,
	`votes` integer CHECK (`votes` IS NULL OR `votes` >= 0),
	`elected` integer,
	FOREIGN KEY (`position_id`) REFERENCES `election_positions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `election_candidates_position_person` ON `election_candidates` (`position_id`,`person_id`);--> statement-breakpoint
CREATE TABLE `election_positions` (
	`id` text PRIMARY KEY NOT NULL,
	`election_id` text NOT NULL,
	`role_id` text NOT NULL,
	`seats` integer NOT NULL CHECK (`seats` >= 1),
	FOREIGN KEY (`election_id`) REFERENCES `elections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `elections` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL,
	`election_date` text NOT NULL,
	`status` text NOT NULL CHECK (`status` IN ('Draft', 'Confirmed')),
	`corrects_election_id` text,
	`terms_start_date` text,
	`confirmed_at` text,
	`confirmed_by` text,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`corrects_election_id`) REFERENCES `elections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`confirmed_by`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
