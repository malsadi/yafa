-- D-118 and D-131: an account closes only at a zero balance, with nothing
-- awaiting approval. An event account is brought to zero by the closing
-- transfer earlier in the same batch.
CREATE TRIGGER `treasury_accounts_close_at_zero` BEFORE UPDATE OF `status` ON `treasury_accounts`
WHEN NEW.`status` = 'Closed' AND (
	(SELECT COALESCE(SUM(`pence`), 0) FROM `treasury_movements` WHERE `account_id` = OLD.`id`) <> 0
	OR EXISTS (SELECT 1 FROM `treasury_entries` e WHERE e.`approval_status` = 'Awaiting approval'
		AND (e.`account_id` = OLD.`id` OR e.`to_account_id` = OLD.`id`))
)
BEGIN
	SELECT RAISE(ABORT, 'not zero: an account closes only at a zero balance with nothing awaiting approval');
END;
