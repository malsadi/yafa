-- Brief 15 and 16 D2, D3 (build rule 5): whatever is filed in the archive
-- or in Letters out and Letters in stays as it is, so the file it points to
-- must already be locked (brief 9.3), recorded earlier in the same batch.
CREATE TRIGGER `archive_document_versions_file_locked` BEFORE INSERT ON `archive_document_versions`
WHEN NOT EXISTS (SELECT 1 FROM `files` WHERE `id` = NEW.`file_id` AND `locked` = 1)
BEGIN
	SELECT RAISE(ABORT, 'an archived file must be locked');
END;--> statement-breakpoint
CREATE TRIGGER `library_letters_out_file_locked` BEFORE INSERT ON `library_letters_out`
WHEN NOT EXISTS (SELECT 1 FROM `files` WHERE `id` = NEW.`file_id` AND `locked` = 1)
BEGIN
	SELECT RAISE(ABORT, 'a filed letter''s file must be locked');
END;--> statement-breakpoint
CREATE TRIGGER `library_letters_in_file_locked` BEFORE INSERT ON `library_letters_in`
WHEN NOT EXISTS (SELECT 1 FROM `files` WHERE `id` = NEW.`file_id` AND `locked` = 1)
BEGIN
	SELECT RAISE(ABORT, 'a filed letter''s file must be locked');
END;
