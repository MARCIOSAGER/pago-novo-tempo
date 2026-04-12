CREATE TYPE "public"."demo_request_status" AS ENUM('pending', 'contacted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."diagnostico_status" AS ENUM('new', 'reviewed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."inscription_status" AS ENUM('pending', 'contacted', 'enrolled', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."org_member_role" AS ENUM('owner', 'hr_admin', 'hr_viewer', 'employee');--> statement-breakpoint
CREATE TYPE "public"."org_member_status" AS ENUM('invited', 'active', 'deactivated');--> statement-breakpoint
CREATE TYPE "public"."org_status" AS ENUM('active', 'suspended', 'trial');--> statement-breakpoint
CREATE TYPE "public"."questionnaire_type" AS ENUM('individual', 'corporate');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "corporate_diagnostics" (
	"id" serial PRIMARY KEY NOT NULL,
	"orgId" integer NOT NULL,
	"memberId" integer,
	"questionnaireId" integer NOT NULL,
	"answersP" json NOT NULL,
	"answersA" json NOT NULL,
	"answersG" json NOT NULL,
	"answersO" json NOT NULL,
	"mediaP" real NOT NULL,
	"mediaA" real NOT NULL,
	"mediaG" real NOT NULL,
	"mediaO" real NOT NULL,
	"mediaGeral" real NOT NULL,
	"pilarMaisFraco" varchar(1) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"companyName" varchar(255) NOT NULL,
	"contactName" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"employeeRange" varchar(20) NOT NULL,
	"message" text,
	"status" "demo_request_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagnostico_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) NOT NULL,
	"email" varchar(320),
	"answersP" json NOT NULL,
	"answersA" json NOT NULL,
	"answersG" json NOT NULL,
	"answersO" json NOT NULL,
	"mediaP" real NOT NULL,
	"mediaA" real NOT NULL,
	"mediaG" real NOT NULL,
	"mediaO" real NOT NULL,
	"mediaGeral" real NOT NULL,
	"pilarMaisFraco" varchar(1) NOT NULL,
	"pdfBase64" text,
	"status" "diagnostico_status" DEFAULT 'new' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"fileKey" varchar(512) NOT NULL,
	"url" text NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mimeType" varchar(128),
	"size" bigint,
	"category" varchar(64),
	"description" text,
	"uploadedBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentoria_inscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(30),
	"message" text,
	"status" "inscription_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"orgId" integer NOT NULL,
	"userId" integer,
	"email" varchar(320) NOT NULL,
	"name" varchar(255),
	"role" "org_member_role" DEFAULT 'employee' NOT NULL,
	"status" "org_member_status" DEFAULT 'invited' NOT NULL,
	"inviteToken" varchar(64),
	"inviteExpiresAt" timestamp,
	"consentGivenAt" timestamp,
	"department" varchar(128),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "org_members_inviteToken_unique" UNIQUE("inviteToken")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"cnpj" varchar(18),
	"logo" text,
	"status" "org_status" DEFAULT 'trial' NOT NULL,
	"maxMembers" integer DEFAULT 50 NOT NULL,
	"privacyMinResponses" integer DEFAULT 5 NOT NULL,
	"privacyShowIndividual" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "questionnaires" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "questionnaire_type" NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"questions" json NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(128) NOT NULL,
	"value" text NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
ALTER TABLE "corporate_diagnostics" ADD CONSTRAINT "corporate_diagnostics_orgId_organizations_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_diagnostics" ADD CONSTRAINT "corporate_diagnostics_memberId_org_members_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."org_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_diagnostics" ADD CONSTRAINT "corporate_diagnostics_questionnaireId_questionnaires_id_fk" FOREIGN KEY ("questionnaireId") REFERENCES "public"."questionnaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_orgId_organizations_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;