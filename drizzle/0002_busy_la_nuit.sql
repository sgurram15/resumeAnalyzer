CREATE TABLE `scoringWeights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`screeningId` int NOT NULL,
	`skillsWeight` decimal(3,2) NOT NULL DEFAULT '0.40',
	`experienceWeight` decimal(3,2) NOT NULL DEFAULT '0.35',
	`educationWeight` decimal(3,2) NOT NULL DEFAULT '0.15',
	`cultureWeight` decimal(3,2) NOT NULL DEFAULT '0.10',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scoringWeights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `candidateScores` ADD `skillsScore` decimal(5,2);--> statement-breakpoint
ALTER TABLE `candidateScores` ADD `experienceScore` decimal(5,2);--> statement-breakpoint
ALTER TABLE `candidateScores` ADD `educationScore` decimal(5,2);--> statement-breakpoint
ALTER TABLE `candidateScores` ADD `cultureScore` decimal(5,2);--> statement-breakpoint
ALTER TABLE `candidateScores` ADD `skillsDetails` text;--> statement-breakpoint
ALTER TABLE `candidateScores` ADD `experienceDetails` text;--> statement-breakpoint
ALTER TABLE `candidateScores` ADD `educationDetails` text;--> statement-breakpoint
ALTER TABLE `candidateScores` ADD `cultureDetails` text;