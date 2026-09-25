-- D-078: no two units share a calendar colour, so branches can be told apart.
CREATE UNIQUE INDEX `units_calendar_colour_unique` ON `units` (`calendar_colour_id`) WHERE "units"."calendar_colour_id" IS NOT NULL;
