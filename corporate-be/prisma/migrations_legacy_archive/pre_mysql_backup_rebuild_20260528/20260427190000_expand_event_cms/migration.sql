ALTER TABLE "events"
    ADD COLUMN "hero_title" TEXT,
    ADD COLUMN "location" TEXT,
    ADD COLUMN "venue" TEXT,
    ADD COLUMN "address" TEXT,
    ADD COLUMN "map_embed_url" TEXT,
    ADD COLUMN "organizer_label" TEXT,
    ADD COLUMN "organizer_name" TEXT,
    ADD COLUMN "organizer_logo" TEXT,
    ADD COLUMN "ticket_price" TEXT,
    ADD COLUMN "register_link" TEXT,
    ADD COLUMN "registration_end_at" TIMESTAMP(3),
    ADD COLUMN "max_register_participants" INTEGER NOT NULL DEFAULT 5;

CREATE INDEX "events_registration_end_at_idx" ON "events"("registration_end_at");

CREATE TABLE "event_news_relations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "news_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_news_relations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "event_news_relations_event_id_news_id_key" ON "event_news_relations"("event_id", "news_id");
CREATE INDEX "event_news_relations_event_id_idx" ON "event_news_relations"("event_id");
CREATE INDEX "event_news_relations_news_id_idx" ON "event_news_relations"("news_id");
CREATE INDEX "event_news_relations_position_idx" ON "event_news_relations"("position");

ALTER TABLE "event_news_relations"
    ADD CONSTRAINT "event_news_relations_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "event_news_relations"
    ADD CONSTRAINT "event_news_relations_news_id_fkey"
    FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_email" TEXT NOT NULL,
    "company_phone" TEXT,
    "company_address" TEXT,
    "pic_name" TEXT NOT NULL,
    "pic_email" TEXT NOT NULL,
    "pic_phone" TEXT,
    "notes" TEXT,
    "participant_count" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "event_registrations_company_email_idx" ON "event_registrations"("company_email");
CREATE INDEX "event_registrations_created_at_idx" ON "event_registrations"("created_at");
CREATE INDEX "event_registrations_event_id_idx" ON "event_registrations"("event_id");
CREATE INDEX "event_registrations_pic_email_idx" ON "event_registrations"("pic_email");
CREATE INDEX "event_registrations_status_idx" ON "event_registrations"("status");

ALTER TABLE "event_registrations"
    ADD CONSTRAINT "event_registrations_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "event_registration_participants" (
    "id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "job_title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registration_participants_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "event_registration_participants_email_idx" ON "event_registration_participants"("email");
CREATE INDEX "event_registration_participants_registration_id_idx" ON "event_registration_participants"("registration_id");

ALTER TABLE "event_registration_participants"
    ADD CONSTRAINT "event_registration_participants_registration_id_fkey"
    FOREIGN KEY ("registration_id") REFERENCES "event_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;