-- D-052: roles have an English and an Arabic name; brief 7.2/15 B2: the
-- register officer designations. Hand-edited from drizzle-kit's output
-- before it was applied anywhere: SQLite cannot add a NOT NULL column
-- without a default, so name_ar takes '' only to satisfy that, and the
-- CHECK means no row can ever hold it (no role rows exist yet anywhere).
ALTER TABLE `roles` RENAME COLUMN "name" TO "name_en";--> statement-breakpoint
ALTER TABLE `roles` ADD `name_ar` text NOT NULL DEFAULT '' CHECK (`name_ar` <> '');--> statement-breakpoint
ALTER TABLE `roles` ADD `designation` text CHECK (`designation` IN ('Branch register officer', 'National register officer'));--> statement-breakpoint
CREATE UNIQUE INDEX `roles_designation_unique` ON `roles` (`designation`) WHERE "roles"."designation" IS NOT NULL;
