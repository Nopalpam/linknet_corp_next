CREATE TYPE "LabelStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TABLE "label_groups" (
    "id" TEXT NOT NULL,
    "parent_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "label_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "label_nodes" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "label_name" JSONB NOT NULL,
    "segment" TEXT NOT NULL,
    "label_id" TEXT NOT NULL,
    "values" JSONB NOT NULL DEFAULT '{}',
    "status" "LabelStatus" NOT NULL DEFAULT 'ACTIVE',
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "label_nodes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "label_groups_parent_name_key" ON "label_groups"("parent_name");
CREATE UNIQUE INDEX "label_groups_slug_key" ON "label_groups"("slug");
CREATE INDEX "label_groups_slug_idx" ON "label_groups"("slug");
CREATE INDEX "label_groups_created_at_idx" ON "label_groups"("created_at");

CREATE UNIQUE INDEX "label_nodes_label_id_key" ON "label_nodes"("label_id");
CREATE INDEX "label_nodes_group_id_idx" ON "label_nodes"("group_id");
CREATE INDEX "label_nodes_parent_id_idx" ON "label_nodes"("parent_id");
CREATE INDEX "label_nodes_position_idx" ON "label_nodes"("position");
CREATE INDEX "label_nodes_status_idx" ON "label_nodes"("status");
CREATE UNIQUE INDEX "label_nodes_group_id_parent_id_segment_key" ON "label_nodes"("group_id", "parent_id", "segment");
CREATE UNIQUE INDEX "label_nodes_group_id_root_segment_key" ON "label_nodes"("group_id", "segment") WHERE "parent_id" IS NULL;

ALTER TABLE "label_nodes"
ADD CONSTRAINT "label_nodes_group_id_fkey"
FOREIGN KEY ("group_id") REFERENCES "label_groups"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "label_nodes"
ADD CONSTRAINT "label_nodes_parent_id_fkey"
FOREIGN KEY ("parent_id") REFERENCES "label_nodes"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
