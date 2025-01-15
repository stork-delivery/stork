CREATE TABLE `itchIO` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`appId` integer NOT NULL,
	`buttlerKey` text NOT NULL,
	`itchIOUsername` text NOT NULL,
	`itchIOGameName` text NOT NULL,
	FOREIGN KEY (`appId`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE no action
);
