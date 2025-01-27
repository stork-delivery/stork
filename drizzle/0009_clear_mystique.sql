CREATE TABLE `deployLogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`deployId` integer NOT NULL,
	`log` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`deployId`) REFERENCES `deploys`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `deploys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`appId` integer NOT NULL,
	`versionId` integer NOT NULL,
	`status` text NOT NULL,
	`createdAt` integer NOT NULL,
	`targetService` text NOT NULL,
	`platform` text NOT NULL,
	FOREIGN KEY (`appId`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`versionId`) REFERENCES `versions`(`id`) ON UPDATE no action ON DELETE no action
);
