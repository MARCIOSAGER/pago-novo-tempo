ALTER TABLE "users" ADD COLUMN "passwordHash" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "resetToken" varchar(64);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "resetTokenExpiresAt" timestamp;