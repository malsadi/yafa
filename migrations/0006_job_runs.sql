CREATE TABLE `job_runs` (
	`job_name` text PRIMARY KEY NOT NULL,
	`last_run_at` text NOT NULL,
	`outcome` text NOT NULL,
	`error_code` text
);
