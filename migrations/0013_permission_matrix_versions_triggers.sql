-- T-078 (brief 25 A3): matrix versions and their snapshots are append-only,
-- and version numbers run 1, 2, 3 … with no gaps. Together with the UNIQUE
-- number, a change built on a stale version fails as a whole batch, so two
-- administrators can never silently overwrite each other.
CREATE TRIGGER permission_matrix_versions_next_number
BEFORE INSERT ON permission_matrix_versions
WHEN NEW.number <> (SELECT COALESCE(MAX(number), 0) + 1 FROM permission_matrix_versions)
BEGIN
  SELECT RAISE(ABORT, 'permission matrix version is not the next in sequence');
END;
--> statement-breakpoint
CREATE TRIGGER permission_matrix_versions_no_update
BEFORE UPDATE ON permission_matrix_versions
BEGIN
  SELECT RAISE(ABORT, 'permission_matrix_versions is append-only: it cannot be updated');
END;
--> statement-breakpoint
CREATE TRIGGER permission_matrix_versions_no_delete
BEFORE DELETE ON permission_matrix_versions
BEGIN
  SELECT RAISE(ABORT, 'permission_matrix_versions is append-only: it cannot be deleted');
END;
--> statement-breakpoint
CREATE TRIGGER permission_matrix_version_grants_no_update
BEFORE UPDATE ON permission_matrix_version_grants
BEGIN
  SELECT RAISE(ABORT, 'permission_matrix_version_grants is append-only: it cannot be updated');
END;
--> statement-breakpoint
CREATE TRIGGER permission_matrix_version_grants_no_delete
BEFORE DELETE ON permission_matrix_version_grants
BEGIN
  SELECT RAISE(ABORT, 'permission_matrix_version_grants is append-only: it cannot be deleted');
END;
