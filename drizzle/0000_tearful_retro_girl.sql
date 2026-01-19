CREATE TABLE "courses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cid" varchar NOT NULL,
	"name" varchar,
	"description" varchar,
	"noOfChapters" integer NOT NULL,
	"includeVideo" boolean DEFAULT false,
	"level" varchar NOT NULL,
	"category" varchar,
	"courseJson" json,
	"banner_image_url" text DEFAULT '',
	"userEmail" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"SubscriptIconId" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_userEmail_users_email_fk" FOREIGN KEY ("userEmail") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;