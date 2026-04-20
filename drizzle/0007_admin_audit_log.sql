CREATE TABLE "admin_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actorUserId" integer NOT NULL,
	"actorEmail" varchar(320),
	"action" varchar(64) NOT NULL,
	"targetType" varchar(32),
	"targetId" varchar(64),
	"details" json,
	"ipAddress" varchar(64),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
