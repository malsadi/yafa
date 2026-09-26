-- Brief 20 A1, A2; P11, P12; D-154 to D-156. Hand-edited from drizzle-kit's
-- output before it was applied anywhere. A notice is never deleted
-- (retired instead, D-155); each change raises its version by exactly one
-- (9.1); an automatic post can't be changed. A vote's details lock at the
-- first ballot; a ballot is never changed or removed, one per person, and
-- only an eligible voter's, before the vote closes, on a live notice.
CREATE TABLE `notices` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`source` text NOT NULL CHECK (`source` IN ('officer', 'automatic')),
	`automatic_kind` text CHECK (`automatic_kind` IS NULL OR `automatic_kind` IN ('event-published', 'meeting-scheduled', 'meeting-held')),
	`source_record_id` text,
	`title` text NOT NULL CHECK (`title` <> ''),
	`body` text,
	`about_date` text,
	`retired_at` text,
	`version` integer NOT NULL CHECK (`version` >= 1),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL,
	CHECK (
		(`source` = 'officer' AND `automatic_kind` IS NULL AND `source_record_id` IS NULL
			AND `about_date` IS NULL AND `body` IS NOT NULL AND `body` <> '')
		OR (`source` = 'automatic' AND `automatic_kind` IS NOT NULL AND `source_record_id` IS NOT NULL)
	)
);
--> statement-breakpoint
CREATE INDEX `notices_unit_created` ON `notices` (`unit_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `notice_votes` (
	`notice_id` text PRIMARY KEY NOT NULL REFERENCES `notices`(`id`),
	`question` text NOT NULL CHECK (`question` <> ''),
	`closes_on` text NOT NULL,
	`closes_at` text NOT NULL,
	`eligibility` text NOT NULL CHECK (`eligibility` IN ('unit', 'roles', 'named'))
);
--> statement-breakpoint
CREATE TABLE `notice_vote_options` (
	`id` text PRIMARY KEY NOT NULL,
	`notice_id` text NOT NULL REFERENCES `notice_votes`(`notice_id`),
	`position` integer NOT NULL,
	`label` text NOT NULL CHECK (`label` <> '')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notice_vote_options_position` ON `notice_vote_options` (`notice_id`,`position`);--> statement-breakpoint
CREATE TABLE `notice_vote_roles` (
	`notice_id` text NOT NULL REFERENCES `notice_votes`(`notice_id`),
	`role_id` text NOT NULL REFERENCES `roles`(`id`),
	PRIMARY KEY(`notice_id`, `role_id`)
);
--> statement-breakpoint
CREATE TABLE `notice_vote_voters` (
	`notice_id` text NOT NULL REFERENCES `notice_votes`(`notice_id`),
	`person_id` text NOT NULL REFERENCES `people`(`id`),
	PRIMARY KEY(`notice_id`, `person_id`)
);
--> statement-breakpoint
CREATE TABLE `notice_ballots` (
	`notice_id` text NOT NULL REFERENCES `notice_votes`(`notice_id`),
	`person_id` text NOT NULL REFERENCES `people`(`id`),
	`option_id` text NOT NULL REFERENCES `notice_vote_options`(`id`),
	`cast_at` text NOT NULL,
	PRIMARY KEY(`notice_id`, `person_id`)
);
--> statement-breakpoint
CREATE TRIGGER `notices_no_delete` BEFORE DELETE ON `notices`
BEGIN
	SELECT RAISE(ABORT, 'a notice is never deleted; it is retired');
END;--> statement-breakpoint
CREATE TRIGGER `notices_version` BEFORE UPDATE ON `notices`
WHEN NEW.`version` <> OLD.`version` + 1 OR NEW.`unit_id` <> OLD.`unit_id` OR NEW.`source` <> OLD.`source`
	OR NEW.`created_by` <> OLD.`created_by` OR NEW.`created_at` <> OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'stale: someone else changed this notice');
END;--> statement-breakpoint
CREATE TRIGGER `notices_automatic_unchanged` BEFORE UPDATE ON `notices`
WHEN OLD.`source` = 'automatic' AND (NEW.`title` IS NOT OLD.`title` OR NEW.`body` IS NOT OLD.`body`
	OR NEW.`automatic_kind` IS NOT OLD.`automatic_kind` OR NEW.`source_record_id` IS NOT OLD.`source_record_id`
	OR NEW.`about_date` IS NOT OLD.`about_date`)
BEGIN
	SELECT RAISE(ABORT, 'an automatic post is never changed');
END;--> statement-breakpoint
CREATE TRIGGER `notice_votes_officer_notices_only` BEFORE INSERT ON `notice_votes`
WHEN (SELECT `source` FROM `notices` WHERE `id` = NEW.`notice_id`) IS NOT 'officer'
BEGIN
	SELECT RAISE(ABORT, 'only an officer''s notice can include a vote');
END;--> statement-breakpoint
CREATE TRIGGER `notice_votes_locked_update` BEFORE UPDATE ON `notice_votes`
WHEN EXISTS (SELECT 1 FROM `notice_ballots` WHERE `notice_id` = OLD.`notice_id`)
BEGIN
	SELECT RAISE(ABORT, 'vote locked: someone has already voted');
END;--> statement-breakpoint
CREATE TRIGGER `notice_votes_locked_delete` BEFORE DELETE ON `notice_votes`
WHEN EXISTS (SELECT 1 FROM `notice_ballots` WHERE `notice_id` = OLD.`notice_id`)
BEGIN
	SELECT RAISE(ABORT, 'vote locked: someone has already voted');
END;--> statement-breakpoint
CREATE TRIGGER `notice_vote_options_locked_insert` BEFORE INSERT ON `notice_vote_options`
WHEN EXISTS (SELECT 1 FROM `notice_ballots` WHERE `notice_id` = NEW.`notice_id`)
BEGIN
	SELECT RAISE(ABORT, 'vote locked: someone has already voted');
END;--> statement-breakpoint
CREATE TRIGGER `notice_vote_options_locked_update` BEFORE UPDATE ON `notice_vote_options`
WHEN EXISTS (SELECT 1 FROM `notice_ballots` WHERE `notice_id` = OLD.`notice_id`)
BEGIN
	SELECT RAISE(ABORT, 'vote locked: someone has already voted');
END;--> statement-breakpoint
CREATE TRIGGER `notice_vote_options_locked_delete` BEFORE DELETE ON `notice_vote_options`
WHEN EXISTS (SELECT 1 FROM `notice_ballots` WHERE `notice_id` = OLD.`notice_id`)
BEGIN
	SELECT RAISE(ABORT, 'vote locked: someone has already voted');
END;--> statement-breakpoint
CREATE TRIGGER `notice_vote_roles_locked_insert` BEFORE INSERT ON `notice_vote_roles`
WHEN EXISTS (SELECT 1 FROM `notice_ballots` WHERE `notice_id` = NEW.`notice_id`)
BEGIN
	SELECT RAISE(ABORT, 'vote locked: someone has already voted');
END;--> statement-breakpoint
CREATE TRIGGER `notice_vote_roles_locked_delete` BEFORE DELETE ON `notice_vote_roles`
WHEN EXISTS (SELECT 1 FROM `notice_ballots` WHERE `notice_id` = OLD.`notice_id`)
BEGIN
	SELECT RAISE(ABORT, 'vote locked: someone has already voted');
END;--> statement-breakpoint
CREATE TRIGGER `notice_vote_voters_locked_insert` BEFORE INSERT ON `notice_vote_voters`
WHEN EXISTS (SELECT 1 FROM `notice_ballots` WHERE `notice_id` = NEW.`notice_id`)
BEGIN
	SELECT RAISE(ABORT, 'vote locked: someone has already voted');
END;--> statement-breakpoint
CREATE TRIGGER `notice_vote_voters_locked_delete` BEFORE DELETE ON `notice_vote_voters`
WHEN EXISTS (SELECT 1 FROM `notice_ballots` WHERE `notice_id` = OLD.`notice_id`)
BEGIN
	SELECT RAISE(ABORT, 'vote locked: someone has already voted');
END;--> statement-breakpoint
CREATE TRIGGER `notice_ballots_no_update` BEFORE UPDATE ON `notice_ballots`
BEGIN
	SELECT RAISE(ABORT, 'a vote cannot be changed once cast');
END;--> statement-breakpoint
CREATE TRIGGER `notice_ballots_no_delete` BEFORE DELETE ON `notice_ballots`
BEGIN
	SELECT RAISE(ABORT, 'a vote cannot be changed once cast');
END;--> statement-breakpoint
CREATE TRIGGER `notice_ballots_valid` BEFORE INSERT ON `notice_ballots`
WHEN (SELECT `notice_id` FROM `notice_vote_options` WHERE `id` = NEW.`option_id`) IS NOT NEW.`notice_id`
	OR NOT EXISTS (SELECT 1 FROM `notice_vote_voters` WHERE `notice_id` = NEW.`notice_id` AND `person_id` = NEW.`person_id`)
BEGIN
	SELECT RAISE(ABORT, 'not an eligible voter, or not one of this vote''s options');
END;--> statement-breakpoint
CREATE TRIGGER `notice_ballots_open` BEFORE INSERT ON `notice_ballots`
WHEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now') >= (SELECT `closes_at` FROM `notice_votes` WHERE `notice_id` = NEW.`notice_id`)
	OR (SELECT `retired_at` FROM `notices` WHERE `id` = NEW.`notice_id`) IS NOT NULL
BEGIN
	SELECT RAISE(ABORT, 'vote closed');
END;
