CREATE TABLE "purchase_lookup_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"emailLower" varchar(320) NOT NULL,
	"tokenHash" varchar(128) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"usedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_lookup_tokens_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE INDEX "purchase_lookup_tokens_email_idx" ON "purchase_lookup_tokens" ("emailLower");
