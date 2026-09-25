-- Brief 8.5, 25 C4 and C5: the texts the data administrator writes, in
-- English and Arabic. Hand-edited from drizzle-kit's output before it was
-- applied anywhere: the keys are the brief's, and a text is never empty
-- (an Arabic text not yet written is NULL, D-022).
CREATE TABLE `admin_texts` (
	`key` text PRIMARY KEY NOT NULL CHECK (`key` IN ('iphone-install-guide', 'access-not-active', 'help')),
	`text_en` text NOT NULL CHECK (`text_en` <> ''),
	`text_ar` text CHECK (`text_ar` IS NULL OR `text_ar` <> ''),
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);
