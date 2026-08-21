DROP INDEX IF EXISTS `sources_name_unique`;
--> statement-breakpoint
CREATE UNIQUE INDEX `sources_account_name_unique` ON `sources` (`account_id`, `name`);
