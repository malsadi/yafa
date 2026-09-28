-- D-216: a letter in's link to the letter out it answers can be corrected
-- while the letter in is still open (Received or Awaiting reply). The rest
-- of its details stay fixed, as 0053 made them.
DROP TRIGGER `letters_in_fixed_details`;--> statement-breakpoint
CREATE TRIGGER `letters_in_fixed_details` BEFORE UPDATE ON `letters_in`
WHEN NEW.`id` IS NOT OLD.`id` OR NEW.`unit_id` IS NOT OLD.`unit_id`
	OR NEW.`reference_number` IS NOT OLD.`reference_number`
	OR NEW.`sequence_year` IS NOT OLD.`sequence_year` OR NEW.`sequence_number` IS NOT OLD.`sequence_number`
	OR NEW.`date_received` IS NOT OLD.`date_received` OR NEW.`sender` IS NOT OLD.`sender`
	OR NEW.`subject` IS NOT OLD.`subject`
	OR NEW.`file_id` IS NOT OLD.`file_id` OR NEW.`created_by` IS NOT OLD.`created_by`
	OR NEW.`created_at` IS NOT OLD.`created_at`
BEGIN
	SELECT RAISE(ABORT, 'a letter in is locked: only its status, handling officer and link change');
END;--> statement-breakpoint
CREATE TRIGGER `letters_in_answers_while_open` BEFORE UPDATE ON `letters_in`
WHEN NEW.`answers_letter_out_id` IS NOT OLD.`answers_letter_out_id` AND (
	OLD.`status` NOT IN ('Received', 'Awaiting reply')
	OR (NEW.`answers_letter_out_id` IS NOT NULL AND NOT EXISTS (SELECT 1 FROM `letters_out`
		WHERE `id` = NEW.`answers_letter_out_id` AND `unit_id` = NEW.`unit_id`)))
BEGIN
	SELECT RAISE(ABORT, 'a letter in is closed: its link is fixed, and only to its own unit''s letter');
END;
