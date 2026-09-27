-- D-211: a meeting's Calendar entry and its automatic Noticeboard posts
-- carry its type's Arabic name too, so readers see it in their language.
-- Hand-edited from drizzle-kit's output before it was applied anywhere:
-- columns are only added, no row changes, and an automatic post's Arabic
-- title is fixed like the rest of it (0040's rule, remade from 0048).
ALTER TABLE `calendar_entries` ADD `title_ar` text CHECK (`title_ar` IS NULL OR `title_ar` <> '');--> statement-breakpoint
ALTER TABLE `notices` ADD `title_ar` text CHECK (`title_ar` IS NULL OR `title_ar` <> '');--> statement-breakpoint
DROP TRIGGER `notices_automatic_unchanged`;--> statement-breakpoint
CREATE TRIGGER `notices_automatic_unchanged` BEFORE UPDATE ON `notices`
WHEN OLD.`source` = 'automatic' AND (NEW.`title` IS NOT OLD.`title` OR NEW.`title_ar` IS NOT OLD.`title_ar`
	OR NEW.`body` IS NOT OLD.`body` OR NEW.`automatic_kind` IS NOT OLD.`automatic_kind`
	OR NEW.`source_record_id` IS NOT OLD.`source_record_id` OR NEW.`about_date` IS NOT OLD.`about_date`)
BEGIN
	SELECT RAISE(ABORT, 'an automatic post is never changed');
END;
