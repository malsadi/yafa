-- Phase 12 (T-159): indexes for the paged lists and searches — terms by unit and person,
-- circulars sent by a unit, discussions and the audit log newest first, the audit log by
-- person and by record, the archive by unit and filing date, and tasks by due date.
CREATE INDEX `terms_unit` ON `terms` (`unit_id`);--> statement-breakpoint
CREATE INDEX `terms_person` ON `terms` (`person_id`);--> statement-breakpoint
CREATE INDEX `circulars_unit_created` ON `circulars` (`unit_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `discussions_started_at` ON `discussions` (`started_at`);--> statement-breakpoint
CREATE INDEX `audit_log_occurred_at` ON `audit_log` (`occurred_at`);--> statement-breakpoint
CREATE INDEX `audit_log_actor` ON `audit_log` (`actor_person_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `audit_log_entity` ON `audit_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `archive_documents_unit_filed` ON `archive_documents` (`unit_id`,`filed_at`);--> statement-breakpoint
CREATE INDEX `tasks_unit_due` ON `tasks` (`unit_id`,`due_date`);--> statement-breakpoint
CREATE INDEX `tasks_owner_due` ON `tasks` (`owner_person_id`,`due_date`);