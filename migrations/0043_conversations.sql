-- Brief 20 B1 to B3; P13; D-158 to D-161. Hand-edited from drizzle-kit's
-- output before it was applied anywhere. A message is never changed or
-- deleted; its author can only mark it removed, once. A discussion, its
-- members, a request and the branches it went to are never deleted. A
-- request goes Open → Answered → Closed, never back, from a branch to
-- other branches only, and a closed one takes no more replies.
CREATE TABLE `hub_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_kind` text NOT NULL CHECK (`conversation_kind` IN ('role-network', 'discussion', 'request')),
	`conversation_id` text NOT NULL,
	`author_person_id` text NOT NULL REFERENCES `people`(`id`),
	`author_unit_id` text REFERENCES `units`(`id`),
	`body` text NOT NULL CHECK (`body` <> ''),
	`sent_at` text NOT NULL,
	`removed_at` text,
	CHECK ((`conversation_kind` = 'request') = (`author_unit_id` IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `hub_messages_conversation` ON `hub_messages` (`conversation_kind`,`conversation_id`,`sent_at`);--> statement-breakpoint
CREATE TABLE `discussions` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL CHECK (`subject` <> ''),
	`started_by` text NOT NULL REFERENCES `people`(`id`),
	`started_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `discussion_members` (
	`discussion_id` text NOT NULL REFERENCES `discussions`(`id`),
	`person_id` text NOT NULL REFERENCES `people`(`id`),
	`invited_by` text NOT NULL REFERENCES `people`(`id`),
	`invited_at` text NOT NULL,
	PRIMARY KEY(`discussion_id`, `person_id`)
);
--> statement-breakpoint
CREATE INDEX `discussion_members_person` ON `discussion_members` (`person_id`);--> statement-breakpoint
CREATE TABLE `hub_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`from_unit_id` text NOT NULL REFERENCES `units`(`id`),
	`subject` text NOT NULL CHECK (`subject` <> ''),
	`body` text NOT NULL CHECK (`body` <> ''),
	`to_all_branches` integer NOT NULL CHECK (`to_all_branches` IN (0, 1)),
	`status` text NOT NULL CHECK (`status` IN ('Open', 'Answered', 'Closed')),
	`created_by` text NOT NULL REFERENCES `people`(`id`),
	`created_at` text NOT NULL,
	`answered_at` text,
	`closed_by` text REFERENCES `people`(`id`),
	`closed_at` text
);
--> statement-breakpoint
CREATE INDEX `hub_requests_from` ON `hub_requests` (`from_unit_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `hub_request_recipients` (
	`request_id` text NOT NULL REFERENCES `hub_requests`(`id`),
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	PRIMARY KEY(`request_id`, `unit_id`)
);
--> statement-breakpoint
CREATE INDEX `hub_request_recipients_unit` ON `hub_request_recipients` (`unit_id`);--> statement-breakpoint
CREATE TRIGGER `hub_messages_no_delete` BEFORE DELETE ON `hub_messages`
BEGIN
	SELECT RAISE(ABORT, 'a message is never deleted; its author can remove it');
END;--> statement-breakpoint
CREATE TRIGGER `hub_messages_only_removed` BEFORE UPDATE ON `hub_messages`
WHEN OLD.`removed_at` IS NOT NULL OR NEW.`removed_at` IS NULL
	OR NEW.`id` IS NOT OLD.`id` OR NEW.`conversation_kind` IS NOT OLD.`conversation_kind`
	OR NEW.`conversation_id` IS NOT OLD.`conversation_id` OR NEW.`author_person_id` IS NOT OLD.`author_person_id`
	OR NEW.`author_unit_id` IS NOT OLD.`author_unit_id` OR NEW.`body` IS NOT OLD.`body` OR NEW.`sent_at` IS NOT OLD.`sent_at`
BEGIN
	SELECT RAISE(ABORT, 'a message is never changed; its author can remove it, once');
END;--> statement-breakpoint
CREATE TRIGGER `hub_messages_request_open` BEFORE INSERT ON `hub_messages`
WHEN NEW.`conversation_kind` = 'request'
	AND (SELECT `status` FROM `hub_requests` WHERE `id` = NEW.`conversation_id`) IS NOT 'Open'
	AND (SELECT `status` FROM `hub_requests` WHERE `id` = NEW.`conversation_id`) IS NOT 'Answered'
BEGIN
	SELECT RAISE(ABORT, 'request closed: it takes no more replies');
END;--> statement-breakpoint
CREATE TRIGGER `discussions_no_update` BEFORE UPDATE ON `discussions`
BEGIN
	SELECT RAISE(ABORT, 'a discussion is never changed or deleted');
END;--> statement-breakpoint
CREATE TRIGGER `discussions_no_delete` BEFORE DELETE ON `discussions`
BEGIN
	SELECT RAISE(ABORT, 'a discussion is never changed or deleted');
END;--> statement-breakpoint
CREATE TRIGGER `discussion_members_no_update` BEFORE UPDATE ON `discussion_members`
BEGIN
	SELECT RAISE(ABORT, 'a discussion is never changed or deleted');
END;--> statement-breakpoint
CREATE TRIGGER `discussion_members_no_delete` BEFORE DELETE ON `discussion_members`
BEGIN
	SELECT RAISE(ABORT, 'a discussion is never changed or deleted');
END;--> statement-breakpoint
CREATE TRIGGER `hub_requests_from_branch_open` BEFORE INSERT ON `hub_requests`
WHEN (SELECT `type` FROM `units` WHERE `id` = NEW.`from_unit_id`) IS NOT 'branch' OR NEW.`status` <> 'Open'
BEGIN
	SELECT RAISE(ABORT, 'a request is sent by a branch, and starts Open');
END;--> statement-breakpoint
CREATE TRIGGER `hub_requests_status_forward` BEFORE UPDATE ON `hub_requests`
WHEN NOT (
		(OLD.`status` = 'Open' AND NEW.`status` = 'Answered' AND NEW.`answered_at` IS NOT NULL AND NEW.`closed_at` IS NULL)
		OR (OLD.`status` IN ('Open', 'Answered') AND NEW.`status` = 'Closed' AND NEW.`closed_at` IS NOT NULL
			AND NEW.`closed_by` IS NOT NULL AND NEW.`answered_at` IS OLD.`answered_at`)
	)
	OR NEW.`id` IS NOT OLD.`id` OR NEW.`from_unit_id` IS NOT OLD.`from_unit_id` OR NEW.`subject` IS NOT OLD.`subject`
	OR NEW.`body` IS NOT OLD.`body` OR NEW.`to_all_branches` IS NOT OLD.`to_all_branches`
	OR NEW.`created_by` IS NOT OLD.`created_by` OR NEW.`created_at` IS NOT OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'a request goes Open, Answered, Closed, never back');
END;--> statement-breakpoint
CREATE TRIGGER `hub_requests_no_delete` BEFORE DELETE ON `hub_requests`
BEGIN
	SELECT RAISE(ABORT, 'a request is never deleted');
END;--> statement-breakpoint
CREATE TRIGGER `hub_request_recipients_other_branches` BEFORE INSERT ON `hub_request_recipients`
WHEN (SELECT `type` FROM `units` WHERE `id` = NEW.`unit_id`) IS NOT 'branch'
	OR NEW.`unit_id` = (SELECT `from_unit_id` FROM `hub_requests` WHERE `id` = NEW.`request_id`)
BEGIN
	SELECT RAISE(ABORT, 'a request goes to other branches only');
END;--> statement-breakpoint
CREATE TRIGGER `hub_request_recipients_no_update` BEFORE UPDATE ON `hub_request_recipients`
BEGIN
	SELECT RAISE(ABORT, 'a request is never deleted');
END;--> statement-breakpoint
CREATE TRIGGER `hub_request_recipients_no_delete` BEFORE DELETE ON `hub_request_recipients`
BEGIN
	SELECT RAISE(ABORT, 'a request is never deleted');
END;
