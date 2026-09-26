-- D-110: a new version of an uploaded document has its own document date
-- (an amended constitution is a different document from the original).
-- The first version's date is the document's own, so it stays empty there
-- and is required on every later one. Existing rows are all first versions.
ALTER TABLE `archive_document_versions` ADD `document_date` text
	CHECK ((`version` = 1) = (`document_date` IS NULL));
