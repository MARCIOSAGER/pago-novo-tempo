CREATE TABLE `downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`format` varchar(32) NOT NULL,
	`fileSize` varchar(32),
	`url` text NOT NULL,
	`filename` varchar(255) NOT NULL,
	`category` varchar(64) NOT NULL DEFAULT 'ebook',
	`badge` varchar(64),
	`badgeVariant` varchar(32),
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` enum('yes','no') NOT NULL DEFAULT 'yes',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `downloads_id` PRIMARY KEY(`id`),
	CONSTRAINT `downloads_slug_unique` UNIQUE(`slug`)
);
