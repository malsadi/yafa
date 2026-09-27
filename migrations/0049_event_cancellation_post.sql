-- D-190: when a cancelled event's automatic "cancelled" post was made, so
-- it is made once — at the cancel, or later if the Communication hub was
-- off then. Hand-edited from drizzle-kit's output before it was applied
-- anywhere. Recorded once, like an approval or a publication (0047).
ALTER TABLE `events` ADD `cancellation_posted_at` text;--> statement-breakpoint
CREATE TRIGGER `events_cancellation_posted_once` BEFORE UPDATE OF `cancellation_posted_at` ON `events`
WHEN OLD.`cancellation_posted_at` IS NOT NULL AND NEW.`cancellation_posted_at` IS NOT OLD.`cancellation_posted_at`
BEGIN
	SELECT RAISE(ABORT, 'an approval, a publication or a cancel is recorded once');
END;
