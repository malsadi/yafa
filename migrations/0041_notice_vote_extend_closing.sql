-- D-166: once anyone has voted, a vote's question, options and voters stay
-- locked, but its closing date can be moved later — never earlier — while
-- the vote is still open (a closed vote's results are already shown, P12).
-- Replaces 0040's trigger, which locked every column.
DROP TRIGGER `notice_votes_locked_update`;--> statement-breakpoint
CREATE TRIGGER `notice_votes_locked_update` BEFORE UPDATE ON `notice_votes`
WHEN EXISTS (SELECT 1 FROM `notice_ballots` WHERE `notice_id` = OLD.`notice_id`)
	AND (NEW.`notice_id` IS NOT OLD.`notice_id` OR NEW.`question` IS NOT OLD.`question`
		OR NEW.`eligibility` IS NOT OLD.`eligibility`)
BEGIN
	SELECT RAISE(ABORT, 'vote locked: someone has already voted');
END;--> statement-breakpoint
CREATE TRIGGER `notice_votes_closing_extended_only` BEFORE UPDATE OF `closes_on`, `closes_at` ON `notice_votes`
WHEN EXISTS (SELECT 1 FROM `notice_ballots` WHERE `notice_id` = OLD.`notice_id`)
	AND (NEW.`closes_at` <= OLD.`closes_at` OR NEW.`closes_on` <= OLD.`closes_on`
		OR strftime('%Y-%m-%dT%H:%M:%fZ', 'now') >= OLD.`closes_at`)
BEGIN
	SELECT RAISE(ABORT, 'vote locked: a closing date can only be moved later, while the vote is open');
END;
