-- D-076: 0023's colour check used one GLOB pattern with six character
-- classes, which D1 refuses as "too complex" on every insert. 0023 was
-- already applied locally, so it is not edited: this rebuilds list_items
-- once more, keeping every row, with the same rule written in simpler
-- parts — seven characters, '#' first, then only hex digits.
PRAGMA defer_foreign_keys = true;--> statement-breakpoint
CREATE TABLE `list_items_new` (
	`id` text PRIMARY KEY NOT NULL,
	`list` text NOT NULL CHECK (`list` IN ('event-types', 'meeting-types', 'achievement-categories', 'equipment-conditions', 'handover-checklist-items', 'calendar-colours')),
	`name_en` text NOT NULL CHECK (`name_en` <> ''),
	`name_ar` text NOT NULL CHECK (`name_ar` <> ''),
	`position` integer NOT NULL CHECK (`position` >= 1),
	`retired_at` text,
	`colour` text CHECK (
		((`list` = 'calendar-colours') = (`colour` IS NOT NULL))
		AND (`colour` IS NULL OR (
			length(`colour`) = 7
			AND substr(`colour`, 1, 1) = '#'
			AND NOT (substr(`colour`, 2) GLOB '*[^0-9A-Fa-f]*')
		))
	),
	`created_at` text NOT NULL
);--> statement-breakpoint
INSERT INTO `list_items_new` (`id`, `list`, `name_en`, `name_ar`, `position`, `retired_at`, `colour`, `created_at`)
	SELECT `id`, `list`, `name_en`, `name_ar`, `position`, `retired_at`, `colour`, `created_at`
	FROM `list_items`;--> statement-breakpoint
DROP TABLE `list_items`;--> statement-breakpoint
ALTER TABLE `list_items_new` RENAME TO `list_items`;--> statement-breakpoint
CREATE TRIGGER `list_items_never_deleted` BEFORE DELETE ON `list_items`
BEGIN
	SELECT RAISE(ABORT, 'list items are never deleted; retire them instead (D-070)');
END;
