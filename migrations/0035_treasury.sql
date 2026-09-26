-- Brief 17, P6 to P10 and D-117 to D-133. Hand-edited from drizzle-kit's
-- output before it was applied anywhere. The application checks each rule
-- first; these triggers make sure nothing gets past (build rule 5, 9.1):
-- entries are never deleted and change only by their one approval decision,
-- never by the officer who entered them; nothing is entered into a closed
-- year or a closed account; a reversal undoes a counted entry, once, and is
-- never itself reversed; an account opens once and closes once.
CREATE TABLE `treasury_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`kind` text NOT NULL CHECK (`kind` IN ('branch', 'event')),
	`name` text NOT NULL CHECK (`name` <> ''),
	`branch_type` text CHECK (`branch_type` IN ('bank', 'cash')),
	`event_id` text,
	`status` text NOT NULL CHECK (`status` IN ('Open', 'Closed')),
	`opened_by` text NOT NULL,
	`opened_at` text NOT NULL,
	`closed_by` text,
	`closed_at` text,
	CHECK ((`kind` = 'branch') = (`branch_type` IS NOT NULL)),
	CHECK ((`kind` = 'event') = (`event_id` IS NOT NULL)),
	CHECK ((`status` = 'Closed') = (`closed_by` IS NOT NULL AND `closed_at` IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `treasury_accounts_unit_id` ON `treasury_accounts` (`unit_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `treasury_accounts_event_id` ON `treasury_accounts` (`event_id`);--> statement-breakpoint
CREATE TABLE `treasury_budget_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL REFERENCES `treasury_accounts`(`id`),
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`name` text NOT NULL CHECK (`name` <> ''),
	`amount_pence` integer NOT NULL CHECK (`amount_pence` >= 0),
	`position` integer NOT NULL CHECK (`position` >= 1)
);
--> statement-breakpoint
CREATE INDEX `treasury_budget_lines_unit_id` ON `treasury_budget_lines` (`unit_id`);--> statement-breakpoint
CREATE INDEX `treasury_budget_lines_account_id` ON `treasury_budget_lines` (`account_id`);--> statement-breakpoint
CREATE TABLE `treasury_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`type` text NOT NULL CHECK (`type` IN ('opening-balance', 'credit', 'debit', 'transfer')),
	`account_id` text NOT NULL REFERENCES `treasury_accounts`(`id`),
	`to_account_id` text REFERENCES `treasury_accounts`(`id`),
	`amount_pence` integer NOT NULL,
	`entry_date` text NOT NULL,
	`counterparty` text CHECK (`counterparty` IS NULL OR `counterparty` <> ''),
	`description` text CHECK (`description` IS NULL OR `description` <> ''),
	`budget_line_id` text REFERENCES `treasury_budget_lines`(`id`),
	`approval_status` text NOT NULL CHECK (`approval_status` IN ('Not needed', 'Awaiting approval', 'Approved', 'Declined')),
	`reverses_entry_id` text REFERENCES `treasury_entries`(`id`),
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`decided_by` text,
	`decided_at` text,
	`decline_reason` text CHECK (`decline_reason` IS NULL OR `decline_reason` <> ''),
	CHECK ((`type` = 'transfer') = (`to_account_id` IS NOT NULL)),
	CHECK (`to_account_id` IS NULL OR `to_account_id` <> `account_id`),
	CHECK (`type` = 'opening-balance' OR `amount_pence` > 0),
	CHECK (`type` NOT IN ('credit', 'debit') OR `counterparty` IS NOT NULL),
	CHECK ((`approval_status` IN ('Approved', 'Declined')) = (`decided_by` IS NOT NULL AND `decided_at` IS NOT NULL)),
	CHECK ((`approval_status` = 'Declined') = (`decline_reason` IS NOT NULL)),
	CHECK (`approval_status` = 'Not needed' OR `type` IN ('debit', 'transfer'))
);
--> statement-breakpoint
CREATE INDEX `treasury_entries_unit_id` ON `treasury_entries` (`unit_id`);--> statement-breakpoint
CREATE INDEX `treasury_entries_account_id` ON `treasury_entries` (`account_id`,`entry_date`);--> statement-breakpoint
CREATE INDEX `treasury_entries_to_account_id` ON `treasury_entries` (`to_account_id`,`entry_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `treasury_entries_reversed_once` ON `treasury_entries` (`reverses_entry_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `treasury_entries_one_opening_balance` ON `treasury_entries` (`account_id`)
	WHERE `type` = 'opening-balance' AND `reverses_entry_id` IS NULL;--> statement-breakpoint
CREATE TABLE `treasury_entry_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL REFERENCES `treasury_entries`(`id`),
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`file_id` text NOT NULL REFERENCES `files`(`id`),
	`added_by` text NOT NULL,
	`added_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `treasury_entry_receipts_unit_id` ON `treasury_entry_receipts` (`unit_id`);--> statement-breakpoint
CREATE INDEX `treasury_entry_receipts_entry_id` ON `treasury_entry_receipts` (`entry_id`);--> statement-breakpoint
CREATE TABLE `treasury_financial_years` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL REFERENCES `units`(`id`),
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`closed_by` text NOT NULL,
	`closed_at` text NOT NULL,
	CHECK (`end_date` > `start_date`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `treasury_financial_years_unit_id` ON `treasury_financial_years` (`unit_id`,`start_date`);--> statement-breakpoint
-- Brief 17's rule: balances are always derived from entries. Each counted
-- entry (P7) as its movement on each account it touches, in pence.
CREATE VIEW `treasury_movements` AS
	SELECT `id` AS `entry_id`, `unit_id`, `account_id`, `entry_date`,
		CASE WHEN `type` IN ('opening-balance', 'credit') THEN `amount_pence` ELSE -`amount_pence` END AS `pence`
	FROM `treasury_entries` WHERE `approval_status` IN ('Not needed', 'Approved')
	UNION ALL
	SELECT `id`, `unit_id`, `to_account_id`, `entry_date`, `amount_pence`
	FROM `treasury_entries` WHERE `type` = 'transfer' AND `approval_status` IN ('Not needed', 'Approved');--> statement-breakpoint
CREATE TRIGGER `treasury_accounts_no_delete` BEFORE DELETE ON `treasury_accounts`
BEGIN
	SELECT RAISE(ABORT, 'a Treasury account is never deleted');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_accounts_only_closed` BEFORE UPDATE ON `treasury_accounts`
WHEN OLD.`status` <> 'Open' OR NEW.`status` <> 'Closed'
	OR NEW.`id` <> OLD.`id` OR NEW.`unit_id` <> OLD.`unit_id` OR NEW.`kind` <> OLD.`kind` OR NEW.`name` <> OLD.`name`
	OR NEW.`branch_type` IS NOT OLD.`branch_type` OR NEW.`event_id` IS NOT OLD.`event_id`
	OR NEW.`opened_by` <> OLD.`opened_by` OR NEW.`opened_at` <> OLD.`opened_at`
BEGIN
	SELECT RAISE(ABORT, 'a Treasury account only closes, once, and is never reopened');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_budget_lines_no_delete` BEFORE DELETE ON `treasury_budget_lines`
BEGIN
	SELECT RAISE(ABORT, 'a budget line is never deleted');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_entries_no_delete` BEFORE DELETE ON `treasury_entries`
BEGIN
	SELECT RAISE(ABORT, 'a Treasury entry is never deleted');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_entries_only_decided` BEFORE UPDATE ON `treasury_entries`
WHEN OLD.`approval_status` <> 'Awaiting approval' OR NEW.`approval_status` NOT IN ('Approved', 'Declined')
	OR NEW.`id` <> OLD.`id` OR NEW.`unit_id` <> OLD.`unit_id` OR NEW.`type` <> OLD.`type`
	OR NEW.`account_id` <> OLD.`account_id` OR NEW.`to_account_id` IS NOT OLD.`to_account_id`
	OR NEW.`amount_pence` <> OLD.`amount_pence` OR NEW.`entry_date` <> OLD.`entry_date`
	OR NEW.`counterparty` IS NOT OLD.`counterparty` OR NEW.`description` IS NOT OLD.`description`
	OR NEW.`budget_line_id` IS NOT OLD.`budget_line_id` OR NEW.`reverses_entry_id` IS NOT OLD.`reverses_entry_id`
	OR NEW.`created_by` <> OLD.`created_by` OR NEW.`created_at` <> OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'a Treasury entry is never changed; only its one approval decision is recorded');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_entries_no_self_approval` BEFORE UPDATE ON `treasury_entries`
WHEN NEW.`decided_by` = OLD.`created_by`
BEGIN
	SELECT RAISE(ABORT, 'self-approval: the officer who entered it never decides it');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_entries_closed_year` BEFORE INSERT ON `treasury_entries`
WHEN EXISTS (SELECT 1 FROM `treasury_financial_years` y WHERE y.`unit_id` = NEW.`unit_id`
	AND NEW.`entry_date` BETWEEN y.`start_date` AND y.`end_date`)
BEGIN
	SELECT RAISE(ABORT, 'closed year: its entries are locked');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_entries_closed_year_decision` BEFORE UPDATE ON `treasury_entries`
WHEN EXISTS (SELECT 1 FROM `treasury_financial_years` y WHERE y.`unit_id` = OLD.`unit_id`
	AND OLD.`entry_date` BETWEEN y.`start_date` AND y.`end_date`)
BEGIN
	SELECT RAISE(ABORT, 'closed year: its entries are locked');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_entries_open_accounts_of_unit` BEFORE INSERT ON `treasury_entries`
WHEN NOT EXISTS (SELECT 1 FROM `treasury_accounts` a WHERE a.`id` = NEW.`account_id`
		AND a.`unit_id` = NEW.`unit_id` AND a.`status` = 'Open')
	OR (NEW.`to_account_id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `treasury_accounts` a
		WHERE a.`id` = NEW.`to_account_id` AND a.`unit_id` = NEW.`unit_id` AND a.`status` = 'Open'))
BEGIN
	SELECT RAISE(ABORT, 'account closed: entries go only into the unit''s own open accounts');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_entries_budget_line_of_account` BEFORE INSERT ON `treasury_entries`
WHEN NEW.`budget_line_id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `treasury_budget_lines` b
	WHERE b.`id` = NEW.`budget_line_id` AND b.`account_id` IN (NEW.`account_id`, NEW.`to_account_id`))
BEGIN
	SELECT RAISE(ABORT, 'a budget line belongs to the event account it tags');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_entries_reversal` BEFORE INSERT ON `treasury_entries`
WHEN NEW.`reverses_entry_id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `treasury_entries` o
	WHERE o.`id` = NEW.`reverses_entry_id` AND o.`unit_id` = NEW.`unit_id` AND o.`reverses_entry_id` IS NULL
	AND o.`approval_status` IN ('Not needed', 'Approved'))
BEGIN
	SELECT RAISE(ABORT, 'a reversal undoes a counted entry, and is never itself reversed');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_entry_receipts_no_update` BEFORE UPDATE ON `treasury_entry_receipts`
BEGIN
	SELECT RAISE(ABORT, 'a receipt is never changed');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_entry_receipts_no_delete` BEFORE DELETE ON `treasury_entry_receipts`
BEGIN
	SELECT RAISE(ABORT, 'a receipt is never removed');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_entry_receipts_file_locked` BEFORE INSERT ON `treasury_entry_receipts`
WHEN NOT EXISTS (SELECT 1 FROM `files` WHERE `id` = NEW.`file_id` AND `locked` = 1)
	OR NOT EXISTS (SELECT 1 FROM `treasury_entries` e WHERE e.`id` = NEW.`entry_id`
		AND e.`type` IN ('credit', 'debit') AND e.`unit_id` = NEW.`unit_id`)
BEGIN
	SELECT RAISE(ABORT, 'a receipt is a locked file of one of the unit''s credits or debits');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_financial_years_no_update` BEFORE UPDATE ON `treasury_financial_years`
BEGIN
	SELECT RAISE(ABORT, 'a closed financial year stays closed');
END;--> statement-breakpoint
CREATE TRIGGER `treasury_financial_years_no_delete` BEFORE DELETE ON `treasury_financial_years`
BEGIN
	SELECT RAISE(ABORT, 'a closed financial year stays closed');
END;
