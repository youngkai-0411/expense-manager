CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`color` text,
	`description` text,
	`is_default` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `accounts` (`id`, `name`, `icon`, `color`, `description`, `is_default`, `is_active`) 
VALUES (1, 'Personal', 'User', '#3b82f6', 'Personal workspace', true, true);
--> statement-breakpoint
ALTER TABLE `categories` ADD COLUMN `account_id` integer NOT NULL DEFAULT 1;
--> statement-breakpoint
ALTER TABLE `sources` ADD COLUMN `account_id` integer NOT NULL DEFAULT 1;
--> statement-breakpoint
ALTER TABLE `transactions` ADD COLUMN `account_id` integer NOT NULL DEFAULT 1;
