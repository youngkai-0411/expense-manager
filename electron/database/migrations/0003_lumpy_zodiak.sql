CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sources_name_unique` ON `sources` (`name`);--> statement-breakpoint
CREATE INDEX `sources_name_idx` ON `sources` (`name`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'Expense' NOT NULL,
	`description` text,
	`icon` text,
	`color` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "type", "description", "icon", "color", "is_archived", "created_at", "updated_at") SELECT "id", "name", "type", NULL AS "description", "icon", "color", "is_archived", "created_at", "updated_at" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `categories_name_idx` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer NOT NULL,
	`source_id` integer,
	`type` text DEFAULT 'Expense' NOT NULL,
	`amount` real NOT NULL,
	`transaction_date` text NOT NULL,
	`note` text,
	`status` text DEFAULT 'Completed' NOT NULL,
	`completed_date` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "transactions_amount_positive" CHECK("__new_transactions"."amount" > 0),
	CONSTRAINT "transactions_type_check" CHECK("__new_transactions"."type" IN ('Income', 'Expense'))
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "category_id", "source_id", "type", "amount", "transaction_date", "note", "status", "completed_date", "created_at", "updated_at") SELECT "id", "category_id", NULL AS "source_id", (SELECT `type` FROM `categories` WHERE `categories`.`id` = `transactions`.`category_id`) AS "type", "amount", "transaction_date", "note", "status", "completed_date", "created_at", "updated_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
CREATE INDEX `transactions_transaction_date_idx` ON `transactions` (`transaction_date`);--> statement-breakpoint
CREATE INDEX `transactions_category_id_idx` ON `transactions` (`category_id`);--> statement-breakpoint
CREATE INDEX `transactions_source_id_idx` ON `transactions` (`source_id`);