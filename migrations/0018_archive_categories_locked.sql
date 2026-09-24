-- Brief 8.2 and 13 A3: the six archive categories, fixed by the brief and
-- created here as locked data. The Arabic names are Claude Code's drafts,
-- awaiting the owner's review (D-013); a later change is a new migration.
INSERT INTO archive_categories (id, position, name_en, name_ar) VALUES
  ('events', 1, 'Events', 'الفعاليات'),
  ('meetings', 2, 'Meetings', 'الاجتماعات'),
  ('finance', 3, 'Finance', 'المالية'),
  ('annual-reports', 4, 'Annual reports', 'التقارير السنوية'),
  ('governance', 5, 'Governance', 'الحوكمة'),
  ('general', 6, 'General', 'عام');
--> statement-breakpoint
CREATE TRIGGER archive_categories_no_insert
BEFORE INSERT ON archive_categories
BEGIN
  SELECT RAISE(ABORT, 'archive_categories is fixed by the brief: it cannot be added to');
END;
--> statement-breakpoint
CREATE TRIGGER archive_categories_no_update
BEFORE UPDATE ON archive_categories
BEGIN
  SELECT RAISE(ABORT, 'archive_categories is fixed by the brief: it cannot be changed');
END;
--> statement-breakpoint
CREATE TRIGGER archive_categories_no_delete
BEFORE DELETE ON archive_categories
BEGIN
  SELECT RAISE(ABORT, 'archive_categories is fixed by the brief: it cannot be deleted');
END;
