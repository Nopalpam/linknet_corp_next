ALTER TABLE "label_nodes"
ADD COLUMN "is_manual_label_id" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "label_nodes_is_manual_label_id_idx" ON "label_nodes"("is_manual_label_id");
