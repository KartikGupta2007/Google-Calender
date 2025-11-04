CREATE TABLE IF NOT EXISTS "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" varchar(100),
	"file_size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calendars" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"description" text,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "start_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "location" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "attendees" text DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "event_type" varchar(50) DEFAULT 'event';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "calendar_id" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "is_all_day" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "conference_link" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "reminders" text DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attachments" ADD CONSTRAINT "attachments_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_calendar_id_calendars_id_fk" FOREIGN KEY ("calendar_id") REFERENCES "public"."calendars"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
