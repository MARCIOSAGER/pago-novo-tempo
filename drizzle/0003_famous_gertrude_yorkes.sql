CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'delivered', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripeSessionId" varchar(255) NOT NULL,
	"stripePaymentIntentId" varchar(255),
	"email" varchar(320) NOT NULL,
	"customerName" varchar(255),
	"productSlug" varchar(64) NOT NULL,
	"language" varchar(8),
	"amountCents" integer NOT NULL,
	"currency" varchar(8) NOT NULL,
	"downloadToken" varchar(64),
	"downloadCount" integer DEFAULT 0 NOT NULL,
	"maxDownloads" integer DEFAULT 10 NOT NULL,
	"tokenExpiresAt" timestamp,
	"status" "purchase_status" DEFAULT 'pending' NOT NULL,
	"rawSession" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deliveredAt" timestamp,
	CONSTRAINT "purchases_stripeSessionId_unique" UNIQUE("stripeSessionId")
);
