ALTER TABLE "links" ADD COLUMN "visits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "owner" text;