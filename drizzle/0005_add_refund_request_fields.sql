ALTER TABLE "purchases" ADD COLUMN "refundRequestedAt" timestamp;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "refundReason" text;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "refundDeniedAt" timestamp;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "refundDenialNote" text;
