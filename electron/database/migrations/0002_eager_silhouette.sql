ALTER TABLE `transactions` ADD `status` text DEFAULT 'Completed' NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `completed_date` text;--> statement-breakpoint
UPDATE `transactions` SET `completed_date` = `transaction_date`;