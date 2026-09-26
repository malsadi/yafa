-- Brief 18 and D-137 to D-142. Hand-edited from drizzle-kit's output
-- before it was applied anywhere. A task is never deleted (Cancelled
-- instead, D-140); each change must raise its version by exactly one, so a
-- save from an older version fails (9.1); a reminder is recorded once per
-- task, kind and due date (D-142). `event_id` waits for the Event
-- organiser's events (Phase 8), which will lock a closed event's tasks.
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`event_id` text,
	`title` text NOT NULL CHECK (`title` <> ''),
	`description` text CHECK (`description` IS NULL OR `description` <> ''),
	`owner_person_id` text NOT NULL REFERENCES `people`(`id`),
	`due_date` text NOT NULL,
	`status` text NOT NULL CHECK (`status` IN ('To do', 'In progress', 'Done', 'Cancelled')),
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tasks_unit_id` ON `tasks` (`unit_id`,`status`);--> statement-breakpoint
CREATE INDEX `tasks_owner` ON `tasks` (`owner_person_id`,`status`);--> statement-breakpoint
CREATE INDEX `tasks_event_id` ON `tasks` (`event_id`);--> statement-breakpoint
CREATE TABLE `task_reminders_sent` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL REFERENCES `tasks`(`id`),
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`kind` text NOT NULL CHECK (`kind` IN ('due-soon', 'overdue')),
	`due_date` text NOT NULL,
	`sent_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_reminders_sent_unit_id` ON `task_reminders_sent` (`unit_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `task_reminders_sent_once` ON `task_reminders_sent` (`task_id`,`kind`,`due_date`);--> statement-breakpoint
CREATE TRIGGER `tasks_no_delete` BEFORE DELETE ON `tasks`
BEGIN
	SELECT RAISE(ABORT, 'a task is never deleted; it is Cancelled');
END;--> statement-breakpoint
CREATE TRIGGER `tasks_version` BEFORE UPDATE ON `tasks`
WHEN NEW.`version` <> OLD.`version` + 1 OR NEW.`unit_id` <> OLD.`unit_id` OR NEW.`event_id` IS NOT OLD.`event_id`
	OR NEW.`created_by` <> OLD.`created_by` OR NEW.`created_at` <> OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this task');
END;--> statement-breakpoint
CREATE TRIGGER `task_reminders_sent_no_update` BEFORE UPDATE ON `task_reminders_sent`
BEGIN
	SELECT RAISE(ABORT, 'a sent reminder is never changed');
END;
