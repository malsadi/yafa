CREATE TABLE `handover_items` (
	`id` text PRIMARY KEY NOT NULL,
	`handover_id` text NOT NULL,
	`name_en` text NOT NULL CHECK (`name_en` <> ''),
	`name_ar` text NOT NULL CHECK (`name_ar` <> ''),
	`ticked_at` text,
	`ticked_by` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`handover_id`) REFERENCES `handovers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ticked_by`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `handovers` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL,
	`role_id` text NOT NULL,
	`outgoing_person_id` text NOT NULL,
	`incoming_person_id` text NOT NULL CHECK (`incoming_person_id` <> `outgoing_person_id`),
	`outgoing_confirmed_at` text,
	`incoming_confirmed_at` text,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`outgoing_person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`incoming_person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
