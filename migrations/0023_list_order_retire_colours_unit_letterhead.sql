-- D-070 (list items are retired, never deleted), D-071 (the administrator
-- orders list items and standard roles), D-076 (a calendar colours list;
-- each unit's letterhead address in both languages, and its calendar
-- colour). Hand-edited from drizzle-kit's output before it was applied
-- anywhere: SQLite cannot change a CHECK in place, so list_items is rebuilt,
-- keeping every row. Each list's positions follow the order its items were
-- added, which is the order shown until now.
CREATE TABLE `list_items_new` (
	`id` text PRIMARY KEY NOT NULL,
	`list` text NOT NULL CHECK (`list` IN ('event-types', 'meeting-types', 'achievement-categories', 'equipment-conditions', 'handover-checklist-items', 'calendar-colours')),
	`name_en` text NOT NULL CHECK (`name_en` <> ''),
	`name_ar` text NOT NULL CHECK (`name_ar` <> ''),
	`position` integer NOT NULL CHECK (`position` >= 1),
	`retired_at` text,
	`colour` text CHECK (
		((`list` = 'calendar-colours') = (`colour` IS NOT NULL))
		AND (`colour` IS NULL OR `colour` GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]')
	),
	`created_at` text NOT NULL
);--> statement-breakpoint
INSERT INTO `list_items_new` (`id`, `list`, `name_en`, `name_ar`, `position`, `retired_at`, `colour`, `created_at`)
	SELECT `id`, `list`, `name_en`, `name_ar`,
		ROW_NUMBER() OVER (PARTITION BY `list` ORDER BY `created_at`, `rowid`),
		NULL, NULL, `created_at`
	FROM `list_items`;--> statement-breakpoint
DROP TABLE `list_items`;--> statement-breakpoint
ALTER TABLE `list_items_new` RENAME TO `list_items`;--> statement-breakpoint
CREATE TRIGGER `list_items_never_deleted` BEFORE DELETE ON `list_items`
BEGIN
	SELECT RAISE(ABORT, 'list items are never deleted; retire them instead (D-070)');
END;--> statement-breakpoint
ALTER TABLE `roles` ADD `position` integer CHECK (`position` IS NULL OR `position` >= 1);--> statement-breakpoint
UPDATE `roles` SET `position` = (
	SELECT COUNT(*) FROM `roles` AS `earlier`
	WHERE `earlier`.`unit_id` IS NULL
		AND (`earlier`.`created_at` < `roles`.`created_at`
			OR (`earlier`.`created_at` = `roles`.`created_at` AND `earlier`.`rowid` <= `roles`.`rowid`))
) WHERE `unit_id` IS NULL;--> statement-breakpoint
ALTER TABLE `units` ADD `letterhead_address_en` text CHECK (`letterhead_address_en` IS NULL OR `letterhead_address_en` <> '');--> statement-breakpoint
ALTER TABLE `units` ADD `letterhead_address_ar` text CHECK (`letterhead_address_ar` IS NULL OR `letterhead_address_ar` <> '');--> statement-breakpoint
ALTER TABLE `units` ADD `calendar_colour_id` text REFERENCES `list_items`(`id`);
