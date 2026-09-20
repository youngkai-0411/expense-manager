ALTER TABLE `sources` ADD COLUMN `category_id` integer REFERENCES `categories`(`id`) ON DELETE cascade;
--> statement-breakpoint
DROP INDEX IF EXISTS `sources_account_name_unique`;
--> statement-breakpoint
CREATE INDEX `sources_category_id_idx` ON `sources` (`category_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `sources_account_category_name_unique` ON `sources` (`account_id`, `category_id`, `name`);
