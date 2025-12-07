CREATE TABLE "link_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"link_id" integer NOT NULL,
	"visited_at" timestamp DEFAULT now() NOT NULL,
	"referrer" text,
	"owner" text
);
--> statement-breakpoint
ALTER TABLE "link_visits" ADD CONSTRAINT "link_visits_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;