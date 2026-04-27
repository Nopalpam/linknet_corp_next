-- CreateEnum
CREATE TYPE "BusinessUnit" AS ENUM ('ENTERPRISE', 'FIBER', 'MEDIA');

-- CreateEnum
CREATE TYPE "FormCategory" AS ENUM ('REGISTRATION', 'INQUIRY', 'PARTNERSHIP', 'RECOMMENDATION', 'EVENT');

-- CreateEnum
CREATE TYPE "FormHandlingMode" AS ENUM ('SUBMISSION', 'ROUTING_ONLY');

-- CreateEnum
CREATE TYPE "FormModuleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FormFieldType" AS ENUM ('TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'TEXTAREA', 'SELECT', 'MULTI_SELECT', 'CHECKBOX', 'CHECKBOX_GROUP', 'RADIO', 'DATE', 'FILE', 'FILE_GROUP', 'ADDRESS_LOOKUP', 'REPEATER', 'HIDDEN');

-- CreateEnum
CREATE TYPE "FormRuleType" AS ENUM ('SHOW', 'HIDE', 'REQUIRE', 'CLEAR', 'DISABLE', 'SYNC', 'DERIVE', 'LIMIT');

-- CreateEnum
CREATE TYPE "FormResponseType" AS ENUM ('SUCCESS', 'INCOMPLETE', 'REDIRECT');

-- CreateEnum
CREATE TYPE "FormIntegrationProvider" AS ENUM ('INTERNAL', 'CRM_WEB_TO_LEAD', 'CUSTOM', 'NOOP');

-- CreateEnum
CREATE TYPE "FormDispatchMode" AS ENUM ('SYNC', 'ASYNC');

-- CreateEnum
CREATE TYPE "FormSubmissionStatus" AS ENUM ('RECEIVED', 'VALIDATED', 'STORED', 'DISPATCHED', 'PARTIAL_FAILED', 'FAILED');

-- CreateEnum
CREATE TYPE "FormFileStatus" AS ENUM ('PENDING', 'UPLOADED', 'LINKED', 'FAILED');

-- CreateEnum
CREATE TYPE "FormDispatchStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "form_modules" (
    "id" TEXT NOT NULL,
    "business_unit" "BusinessUnit" NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "FormCategory" NOT NULL,
    "handling_mode" "FormHandlingMode" NOT NULL DEFAULT 'SUBMISSION',
    "status" "FormModuleStatus" NOT NULL DEFAULT 'DRAFT',
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "default_locale" TEXT NOT NULL DEFAULT 'id',
    "public_path" TEXT,
    "source_website" TEXT,
    "promo_website" TEXT,
    "lead_source" TEXT,
    "integration_provider" "FormIntegrationProvider" NOT NULL DEFAULT 'INTERNAL',
    "integration_config" JSONB,
    "submission_settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "form_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_steps" (
    "id" TEXT NOT NULL,
    "form_module_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "action_label" TEXT,
    "step_number" INTEGER NOT NULL,
    "is_review_step" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_fields" (
    "id" TEXT NOT NULL,
    "form_module_id" TEXT NOT NULL,
    "form_step_id" TEXT,
    "parent_field_id" TEXT,
    "key" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "field_type" "FormFieldType" NOT NULL,
    "placeholder" TEXT,
    "help_text" TEXT,
    "default_value" JSONB,
    "validation" JSONB,
    "ui_config" JSONB,
    "payload_key" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_field_options" (
    "id" TEXT NOT NULL,
    "field_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_field_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_field_rules" (
    "id" TEXT NOT NULL,
    "form_module_id" TEXT NOT NULL,
    "source_field_id" TEXT,
    "target_field_id" TEXT,
    "rule_type" "FormRuleType" NOT NULL,
    "condition" JSONB NOT NULL,
    "action_config" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_field_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_response_configs" (
    "id" TEXT NOT NULL,
    "form_module_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "response_type" "FormResponseType" NOT NULL,
    "label" TEXT,
    "match_condition" JSONB,
    "path_template" TEXT NOT NULL,
    "query_template" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_response_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_integration_configs" (
    "id" TEXT NOT NULL,
    "form_module_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "provider" "FormIntegrationProvider" NOT NULL,
    "dispatch_mode" "FormDispatchMode" NOT NULL DEFAULT 'SYNC',
    "endpoint" TEXT,
    "mapping_config" JSONB,
    "headers_config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_integration_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" TEXT NOT NULL,
    "form_module_id" TEXT NOT NULL,
    "business_unit" "BusinessUnit" NOT NULL,
    "form_slug" TEXT NOT NULL,
    "schema_version" INTEGER NOT NULL,
    "status" "FormSubmissionStatus" NOT NULL DEFAULT 'RECEIVED',
    "locale" TEXT NOT NULL DEFAULT 'id',
    "request_id" TEXT,
    "session_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "source_path" TEXT,
    "promo_website" TEXT,
    "page_website" TEXT,
    "source_website" TEXT,
    "lead_source" TEXT,
    "primary_name" TEXT,
    "primary_email" TEXT,
    "primary_phone" TEXT,
    "event_name" TEXT,
    "raw_payload" JSONB,
    "response_context" JSONB,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submission_values" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "field_path" TEXT NOT NULL,
    "field_key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "display_value" TEXT,
    "is_sensitive" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_submission_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submission_groups" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "group_key" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_submission_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submission_group_values" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "field_path" TEXT NOT NULL,
    "field_key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "display_value" TEXT,
    "is_sensitive" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_submission_group_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submission_files" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "group_id" TEXT,
    "field_path" TEXT NOT NULL,
    "field_key" TEXT NOT NULL,
    "file_id" TEXT,
    "original_name" TEXT,
    "mime_type" TEXT,
    "size" INTEGER,
    "path" TEXT,
    "url" TEXT,
    "checksum" TEXT,
    "status" "FormFileStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_submission_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submission_dispatch_logs" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "integration_config_id" TEXT,
    "provider" "FormIntegrationProvider" NOT NULL,
    "dispatch_mode" "FormDispatchMode" NOT NULL,
    "status" "FormDispatchStatus" NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "request_payload" JSONB,
    "response_payload" JSONB,
    "error_message" TEXT,
    "dispatched_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_submission_dispatch_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "form_modules_business_unit_slug_key" ON "form_modules"("business_unit", "slug");
CREATE INDEX "form_modules_business_unit_idx" ON "form_modules"("business_unit");
CREATE INDEX "form_modules_category_idx" ON "form_modules"("category");
CREATE INDEX "form_modules_status_idx" ON "form_modules"("status");
CREATE INDEX "form_modules_deleted_at_idx" ON "form_modules"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "form_steps_form_module_id_key_key" ON "form_steps"("form_module_id", "key");
CREATE UNIQUE INDEX "form_steps_form_module_id_step_number_key" ON "form_steps"("form_module_id", "step_number");
CREATE INDEX "form_steps_form_module_id_idx" ON "form_steps"("form_module_id");
CREATE INDEX "form_steps_is_active_idx" ON "form_steps"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "form_fields_form_module_id_path_key" ON "form_fields"("form_module_id", "path");
CREATE INDEX "form_fields_form_module_id_idx" ON "form_fields"("form_module_id");
CREATE INDEX "form_fields_form_step_id_idx" ON "form_fields"("form_step_id");
CREATE INDEX "form_fields_parent_field_id_idx" ON "form_fields"("parent_field_id");
CREATE INDEX "form_fields_field_type_idx" ON "form_fields"("field_type");
CREATE INDEX "form_fields_is_active_idx" ON "form_fields"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "form_field_options_field_id_value_key" ON "form_field_options"("field_id", "value");
CREATE INDEX "form_field_options_field_id_idx" ON "form_field_options"("field_id");
CREATE INDEX "form_field_options_is_active_idx" ON "form_field_options"("is_active");

-- CreateIndex
CREATE INDEX "form_field_rules_form_module_id_idx" ON "form_field_rules"("form_module_id");
CREATE INDEX "form_field_rules_source_field_id_idx" ON "form_field_rules"("source_field_id");
CREATE INDEX "form_field_rules_target_field_id_idx" ON "form_field_rules"("target_field_id");
CREATE INDEX "form_field_rules_rule_type_idx" ON "form_field_rules"("rule_type");
CREATE INDEX "form_field_rules_is_active_idx" ON "form_field_rules"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "form_response_configs_form_module_id_key_key" ON "form_response_configs"("form_module_id", "key");
CREATE INDEX "form_response_configs_form_module_id_idx" ON "form_response_configs"("form_module_id");
CREATE INDEX "form_response_configs_response_type_idx" ON "form_response_configs"("response_type");
CREATE INDEX "form_response_configs_is_default_idx" ON "form_response_configs"("is_default");
CREATE INDEX "form_response_configs_is_active_idx" ON "form_response_configs"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "form_integration_configs_form_module_id_key_key" ON "form_integration_configs"("form_module_id", "key");
CREATE INDEX "form_integration_configs_form_module_id_idx" ON "form_integration_configs"("form_module_id");
CREATE INDEX "form_integration_configs_provider_idx" ON "form_integration_configs"("provider");
CREATE INDEX "form_integration_configs_is_active_idx" ON "form_integration_configs"("is_active");

-- CreateIndex
CREATE INDEX "form_submissions_form_module_id_idx" ON "form_submissions"("form_module_id");
CREATE INDEX "form_submissions_business_unit_idx" ON "form_submissions"("business_unit");
CREATE INDEX "form_submissions_form_slug_idx" ON "form_submissions"("form_slug");
CREATE INDEX "form_submissions_status_idx" ON "form_submissions"("status");
CREATE INDEX "form_submissions_primary_email_idx" ON "form_submissions"("primary_email");
CREATE INDEX "form_submissions_received_at_idx" ON "form_submissions"("received_at");
CREATE INDEX "form_submissions_deleted_at_idx" ON "form_submissions"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "form_submission_values_submission_id_field_path_key" ON "form_submission_values"("submission_id", "field_path");
CREATE INDEX "form_submission_values_submission_id_idx" ON "form_submission_values"("submission_id");
CREATE INDEX "form_submission_values_field_key_idx" ON "form_submission_values"("field_key");

-- CreateIndex
CREATE UNIQUE INDEX "form_submission_groups_submission_id_group_key_sort_order_key" ON "form_submission_groups"("submission_id", "group_key", "sort_order");
CREATE INDEX "form_submission_groups_submission_id_idx" ON "form_submission_groups"("submission_id");
CREATE INDEX "form_submission_groups_group_key_idx" ON "form_submission_groups"("group_key");

-- CreateIndex
CREATE UNIQUE INDEX "form_submission_group_values_group_id_field_path_key" ON "form_submission_group_values"("group_id", "field_path");
CREATE INDEX "form_submission_group_values_group_id_idx" ON "form_submission_group_values"("group_id");
CREATE INDEX "form_submission_group_values_field_key_idx" ON "form_submission_group_values"("field_key");

-- CreateIndex
CREATE INDEX "form_submission_files_submission_id_idx" ON "form_submission_files"("submission_id");
CREATE INDEX "form_submission_files_group_id_idx" ON "form_submission_files"("group_id");
CREATE INDEX "form_submission_files_file_id_idx" ON "form_submission_files"("file_id");
CREATE INDEX "form_submission_files_field_path_idx" ON "form_submission_files"("field_path");
CREATE INDEX "form_submission_files_status_idx" ON "form_submission_files"("status");

-- CreateIndex
CREATE INDEX "form_submission_dispatch_logs_submission_id_idx" ON "form_submission_dispatch_logs"("submission_id");
CREATE INDEX "form_submission_dispatch_logs_integration_config_id_idx" ON "form_submission_dispatch_logs"("integration_config_id");
CREATE INDEX "form_submission_dispatch_logs_provider_idx" ON "form_submission_dispatch_logs"("provider");
CREATE INDEX "form_submission_dispatch_logs_status_idx" ON "form_submission_dispatch_logs"("status");

-- AddForeignKey
ALTER TABLE "form_steps" ADD CONSTRAINT "form_steps_form_module_id_fkey" FOREIGN KEY ("form_module_id") REFERENCES "form_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_module_id_fkey" FOREIGN KEY ("form_module_id") REFERENCES "form_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_step_id_fkey" FOREIGN KEY ("form_step_id") REFERENCES "form_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_parent_field_id_fkey" FOREIGN KEY ("parent_field_id") REFERENCES "form_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_field_options" ADD CONSTRAINT "form_field_options_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "form_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_field_rules" ADD CONSTRAINT "form_field_rules_form_module_id_fkey" FOREIGN KEY ("form_module_id") REFERENCES "form_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_field_rules" ADD CONSTRAINT "form_field_rules_source_field_id_fkey" FOREIGN KEY ("source_field_id") REFERENCES "form_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_field_rules" ADD CONSTRAINT "form_field_rules_target_field_id_fkey" FOREIGN KEY ("target_field_id") REFERENCES "form_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_response_configs" ADD CONSTRAINT "form_response_configs_form_module_id_fkey" FOREIGN KEY ("form_module_id") REFERENCES "form_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_integration_configs" ADD CONSTRAINT "form_integration_configs_form_module_id_fkey" FOREIGN KEY ("form_module_id") REFERENCES "form_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_module_id_fkey" FOREIGN KEY ("form_module_id") REFERENCES "form_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission_values" ADD CONSTRAINT "form_submission_values_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "form_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission_groups" ADD CONSTRAINT "form_submission_groups_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "form_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission_group_values" ADD CONSTRAINT "form_submission_group_values_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "form_submission_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission_files" ADD CONSTRAINT "form_submission_files_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "form_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission_files" ADD CONSTRAINT "form_submission_files_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "form_submission_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission_files" ADD CONSTRAINT "form_submission_files_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission_dispatch_logs" ADD CONSTRAINT "form_submission_dispatch_logs_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "form_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission_dispatch_logs" ADD CONSTRAINT "form_submission_dispatch_logs_integration_config_id_fkey" FOREIGN KEY ("integration_config_id") REFERENCES "form_integration_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;