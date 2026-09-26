-- D-168 (19): the General Council sends and receives requests like any
-- unit. Replaces 0043's triggers, which kept requests between branches:
-- a request starts Open from any unit, and goes to other units only.
DROP TRIGGER `hub_requests_from_branch_open`;--> statement-breakpoint
CREATE TRIGGER `hub_requests_start_open` BEFORE INSERT ON `hub_requests`
WHEN NEW.`status` <> 'Open'
BEGIN
	SELECT RAISE(ABORT, 'a request starts Open');
END;--> statement-breakpoint
DROP TRIGGER `hub_request_recipients_other_branches`;--> statement-breakpoint
CREATE TRIGGER `hub_request_recipients_other_units` BEFORE INSERT ON `hub_request_recipients`
WHEN NEW.`unit_id` = (SELECT `from_unit_id` FROM `hub_requests` WHERE `id` = NEW.`request_id`)
BEGIN
	SELECT RAISE(ABORT, 'a request goes to other units only');
END;
