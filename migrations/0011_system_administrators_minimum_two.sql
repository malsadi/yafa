-- P21 (D-042): at least two system administrators must exist at all times;
-- the last two cannot be removed. The service refuses first, with a clear
-- message; this trigger refuses again, whatever path a delete comes by.
CREATE TRIGGER system_administrators_minimum_two
BEFORE DELETE ON system_administrators
WHEN (SELECT COUNT(*) FROM system_administrators) <= 2
BEGIN
  SELECT RAISE(ABORT, 'P21: at least two system administrators must remain');
END;
