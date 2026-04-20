CREATE TABLE "stripe_events" (
	"eventId" varchar(255) PRIMARY KEY NOT NULL,
	"type" varchar(128) NOT NULL,
	"processedAt" timestamp DEFAULT now() NOT NULL
);
