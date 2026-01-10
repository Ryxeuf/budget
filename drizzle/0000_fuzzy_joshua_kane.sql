CREATE TABLE `expense_tags` (
	`expense_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`expense_id`, `tag_id`),
	FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`payer_id` integer,
	`amount` real NOT NULL,
	`purpose` text NOT NULL,
	`label` text,
	`date` integer,
	`quote_id` integer,
	`created_at` integer DEFAULT '"2026-01-10T21:43:05.110Z"' NOT NULL,
	FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `income_tags` (
	`income_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`income_id`, `tag_id`),
	FOREIGN KEY (`income_id`) REFERENCES `incomes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `incomes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`payer_id` integer,
	`amount` real NOT NULL,
	`purpose` text NOT NULL,
	`label` text,
	`date` integer,
	`created_at` integer DEFAULT '"2026-01-10T21:43:05.111Z"' NOT NULL,
	FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payers_name_unique` ON `payers` (`name`);--> statement-breakpoint
CREATE TABLE `quote_tags` (
	`quote_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`quote_id`, `tag_id`),
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company` text,
	`need` text NOT NULL,
	`price` real NOT NULL,
	`is_estimated` integer DEFAULT false NOT NULL,
	`is_accepted` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT '"2026-01-10T21:43:05.110Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);