CREATE TABLE `candidateScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`screeningId` int NOT NULL,
	`resumeId` int NOT NULL,
	`overallScore` decimal(5,2) NOT NULL,
	`skillsMatch` decimal(5,2),
	`experienceMatch` decimal(5,2),
	`educationMatch` decimal(5,2),
	`keyHighlights` text,
	`strengths` text,
	`weaknesses` text,
	`relevantExperience` text,
	`ranking` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidateScores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resumes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`screeningId` int NOT NULL,
	`candidateName` varchar(255),
	`fileName` varchar(255) NOT NULL,
	`fileUrl` varchar(512) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`extractedText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resumes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `screenings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobTitle` varchar(255) NOT NULL,
	`jobDescription` text NOT NULL,
	`jobDescriptionFileUrl` varchar(512),
	`jobDescriptionFileKey` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `screenings_id` PRIMARY KEY(`id`)
);
