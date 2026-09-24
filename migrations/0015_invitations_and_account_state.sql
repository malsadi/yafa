CREATE TABLE `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`status` text NOT NULL CHECK (`status` IN ('sent', 'failed')),
	`clerk_invitation_id` text,
	`sent_at` text NOT NULL,
	`sent_by` text NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sent_by`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `people` ADD `clerk_unlinked_at` text;--> statement-breakpoint
ALTER TABLE `people` ADD `account_locked_at` text;