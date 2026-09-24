-- D-054 (unit names in English and Arabic), brief 14 A1 (area, status: P4),
-- D-053 (email and phone). Hand-edited from drizzle-kit's output before it
-- was applied anywhere: SQLite cannot add a NOT NULL column without a
-- default, so each takes a placeholder only to satisfy that, and a CHECK
-- means no row can ever hold it. No unit or person rows existed anywhere.
ALTER TABLE `units` RENAME COLUMN "name" TO "name_en";--> statement-breakpoint
ALTER TABLE `units` ADD `name_ar` text NOT NULL DEFAULT '' CHECK (`name_ar` <> '');--> statement-breakpoint
ALTER TABLE `units` ADD `area` text;--> statement-breakpoint
ALTER TABLE `units` ADD `status` text NOT NULL DEFAULT '' CHECK (`status` IN ('active', 'inactive'));--> statement-breakpoint
ALTER TABLE `people` ADD `name` text NOT NULL DEFAULT '' CHECK (`name` <> '');--> statement-breakpoint
ALTER TABLE `people` ADD `phone` text NOT NULL DEFAULT '' CHECK (`phone` <> '');
