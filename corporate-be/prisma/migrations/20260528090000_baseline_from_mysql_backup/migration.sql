-- CreateEnum
CREATE TYPE "ComponentVisibilityStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "LabelStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DataBankSolutionCategoryType" AS ENUM ('INDUSTRY', 'BUSINESS_SCALE', 'BUSINESS_NEED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SettingType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'IMAGE', 'SELECT');

-- CreateEnum
CREATE TYPE "MenuPosition" AS ENUM ('header', 'footer', 'both');

-- CreateEnum
CREATE TYPE "MenuType" AS ENUM ('link', 'dropdown', 'mega');

-- CreateEnum
CREATE TYPE "PageTemplate" AS ENUM ('DEFAULT', 'FULL_WIDTH', 'LANDING');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "CareerStatus" AS ENUM ('OPEN', 'CLOSED', 'DRAFT');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('GENERAL', 'SUPPORT', 'SALES', 'PARTNERSHIP', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('BUSINESS', 'SUPPORT', 'CAREER', 'OTHERS');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'READ');

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
CREATE TYPE "FormSubmissionStatus" AS ENUM ('STORED', 'FAILED');

-- CreateEnum
CREATE TYPE "FormFileStatus" AS ENUM ('PENDING', 'UPLOADED', 'LINKED', 'FAILED');

-- CreateEnum
CREATE TYPE "FormDispatchStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_at" TIMESTAMP(3),
    "locked_reason" TEXT,
    "password_changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret" TEXT,
    "mfa_verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "type" "SettingType" NOT NULL DEFAULT 'STRING',
    "group" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" BIGSERIAL NOT NULL,
    "parent_id" BIGINT,
    "section_title" VARCHAR(191),
    "section_order" INTEGER NOT NULL DEFAULT 0,
    "title" VARCHAR(191) NOT NULL,
    "translations" JSONB,
    "slug" VARCHAR(191),
    "url" VARCHAR(191),
    "icon" VARCHAR(191),
    "image" VARCHAR(191),
    "description" VARCHAR(191),
    "badge" VARCHAR(191),
    "position" "MenuPosition" NOT NULL DEFAULT 'header',
    "type" "MenuType" NOT NULL DEFAULT 'link',
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "open_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "css_class" VARCHAR(191),
    "created_by" VARCHAR(191),
    "updated_by" VARCHAR(191),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_en" TEXT,
    "title_id" TEXT,
    "slug" TEXT NOT NULL,
    "template" "PageTemplate" NOT NULL DEFAULT 'DEFAULT',
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "meta_thumbnail" TEXT,
    "og_image" TEXT,
    "product" TEXT,
    "promo" TEXT,
    "source" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "nofollow" BOOLEAN NOT NULL DEFAULT false,
    "show_navbar" BOOLEAN NOT NULL DEFAULT true,
    "show_footer" BOOLEAN NOT NULL DEFAULT true,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_components" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "component_type" TEXT NOT NULL,
    "component_data" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "careers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employment_type" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "benefits" TEXT,
    "salary_range" TEXT,
    "closing_date" TIMESTAMP(3),
    "status" "CareerStatus" NOT NULL DEFAULT 'OPEN',
    "views" INTEGER NOT NULL DEFAULT 0,
    "applications" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "awards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_id" TEXT,
    "title_en" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "description_id" TEXT,
    "description_en" TEXT,
    "top_logo" TEXT,
    "image" TEXT,
    "link" TEXT,
    "issuer" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "management_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "managements" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "position_en" TEXT,
    "position_id" TEXT,
    "description" TEXT,
    "photo" TEXT,
    "bio_en" TEXT,
    "bio_id" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedin" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "managements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "ContactType" NOT NULL DEFAULT 'GENERAL',
    "status" "SubmissionStatus" NOT NULL DEFAULT 'NEW',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "read_at" TIMESTAMP(3),
    "replied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "record_id" TEXT,
    "old_data" JSONB,
    "new_data" JSONB,
    "description" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "log_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_logs" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "referrer" TEXT,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url_redirects" (
    "id" TEXT NOT NULL,
    "from_url" TEXT NOT NULL,
    "to_url" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL DEFAULT 301,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "url_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "folder_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cloud_provider" TEXT,
    "cloud_path" TEXT,
    "cloud_key" TEXT,
    "thumbnail" TEXT,
    "thumbnails" JSONB,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "metadata" JSONB,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_us" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT,
    "company" TEXT,
    "inquiry_type" "InquiryType" NOT NULL,
    "subject" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "read_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_us_pkey" PRIMARY KEY ("id")
);

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
    "status" "FormSubmissionStatus" NOT NULL DEFAULT 'STORED',
    "locale" TEXT NOT NULL DEFAULT 'id',
    "request_id" TEXT,
    "session_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "source_path" TEXT,
    "product" TEXT,
    "promo_website" TEXT,
    "page_website" TEXT,
    "source_website" TEXT,
    "form_module_name" TEXT,
    "form_channel" TEXT,
    "lead_source" TEXT,
    "primary_name" TEXT,
    "primary_email" TEXT,
    "primary_phone" TEXT,
    "event_name" TEXT,
    "raw_payload" JSONB,
    "response_context" JSONB,
    "review_status" TEXT DEFAULT 'HOLD',
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

-- CreateTable
CREATE TABLE "career_content" (
    "id" BIGSERIAL NOT NULL,
    "position" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255),
    "division" VARCHAR(255),
    "type" VARCHAR(100),
    "link_job" VARCHAR(500),
    "location" VARCHAR(255),
    "description" TEXT,
    "description_id" TEXT,
    "requirements" TEXT,
    "requirements_id" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "expiry_date" TIMESTAMP(6),
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(255),
    "updated_by" VARCHAR(255),

    CONSTRAINT "career_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "report_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_sections" (
    "id" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "report_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_id" TEXT,
    "slug" TEXT NOT NULL,
    "news_date" DATE NOT NULL,
    "news_thumbnail" TEXT,
    "excerpt_en" TEXT,
    "excerpt_id" TEXT,
    "content_en" TEXT NOT NULL,
    "content_id" TEXT,
    "news_link" TEXT,
    "author" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_desc" TEXT,
    "category_id" TEXT NOT NULL,
    "meta_keywords" TEXT,
    "custom_css" TEXT,
    "custom_js" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "view_count_unique" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "published_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_categories" (
    "id" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_id" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "news_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_highlights" (
    "id" TEXT NOT NULL,
    "news_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_tag_relations" (
    "id" TEXT NOT NULL,
    "news_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_tag_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "news_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_views" (
    "id" TEXT NOT NULL,
    "news_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_id" TEXT,
    "hero_title" TEXT,
    "hero_title_id" TEXT,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "excerpt_id" TEXT,
    "content" TEXT NOT NULL,
    "content_id" TEXT,
    "cover_image" TEXT,
    "location" TEXT,
    "venue" TEXT,
    "address" TEXT,
    "map_embed_url" TEXT,
    "organizer_label" TEXT,
    "organizer_name" TEXT,
    "organizer_logo" TEXT,
    "ticket_price" TEXT,
    "register_link" TEXT,
    "registration_end_at" TIMESTAMP(3),
    "max_register_participants" INTEGER NOT NULL DEFAULT 5,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_news_relations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "news_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_news_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "type_id" TEXT,
    "section_id" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "pdf_file" TEXT,
    "cover_image" TEXT,
    "data_type" TEXT,
    "audit_status" TEXT,
    "file_size" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "period" TEXT,
    "year" INTEGER,
    "quarter" INTEGER,
    "file_url" TEXT,
    "file_type" TEXT,
    "thumbnail" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'List',
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "announcement_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_sections" (
    "id" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "announcement_year" TEXT,
    "cta_enabled" BOOLEAN NOT NULL DEFAULT false,
    "cta_text" TEXT,
    "cta_url" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "announcement_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "type_id" TEXT,
    "section_id" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "pdf_file" TEXT,
    "cover_image" TEXT,
    "data_type" TEXT,
    "audit_status" TEXT,
    "file_size" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_visibility" (
    "id" TEXT NOT NULL,
    "component_key" TEXT NOT NULL,
    "component_name" TEXT NOT NULL,
    "status" "ComponentVisibilityStatus" NOT NULL DEFAULT 'ACTIVE',
    "business_unit" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "component_visibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map_coverage_regions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Area',
    "title" TEXT NOT NULL,
    "color" TEXT,
    "province_keys" JSONB NOT NULL DEFAULT '[]',
    "cities" JSONB NOT NULL DEFAULT '[]',
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "map_coverage_regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_bank_solutions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_id" TEXT,
    "title_en" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "description_id" TEXT,
    "description_en" TEXT,
    "image" TEXT,
    "banner_image" TEXT,
    "cta_list" JSONB NOT NULL DEFAULT '[]',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "data_bank_solutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_bank_solution_categories" (
    "id" TEXT NOT NULL,
    "type" "DataBankSolutionCategoryType" NOT NULL,
    "name" TEXT NOT NULL,
    "name_id" TEXT,
    "name_en" TEXT,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "data_bank_solution_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_bank_solution_category_relations" (
    "id" TEXT NOT NULL,
    "solution_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_bank_solution_category_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "label_nodes" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "label_name" JSONB NOT NULL,
    "segment" TEXT NOT NULL,
    "label_id" TEXT NOT NULL,
    "is_manual_label_id" BOOLEAN NOT NULL DEFAULT false,
    "values" JSONB NOT NULL DEFAULT '{}',
    "status" "LabelStatus" NOT NULL DEFAULT 'ACTIVE',
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "label_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cookie_consents" (
    "id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "os" TEXT,
    "browser" TEXT,
    "device" TEXT,
    "user_agent" TEXT,
    "fingerprint" TEXT,
    "consented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cookie_consents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_id_key" ON "refresh_tokens"("token_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_id_idx" ON "refresh_tokens"("token_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_email_idx" ON "password_reset_tokens"("email");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "password_histories_user_id_idx" ON "password_histories"("user_id");

-- CreateIndex
CREATE INDEX "password_histories_created_at_idx" ON "password_histories"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");

-- CreateIndex
CREATE INDEX "roles_slug_idx" ON "roles"("slug");

-- CreateIndex
CREATE INDEX "roles_deleted_at_idx" ON "roles"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_slug_key" ON "permissions"("slug");

-- CreateIndex
CREATE INDEX "permissions_module_idx" ON "permissions"("module");

-- CreateIndex
CREATE INDEX "permissions_slug_idx" ON "permissions"("slug");

-- CreateIndex
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions"("role_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings_group_idx" ON "settings"("group");

-- CreateIndex
CREATE INDEX "settings_key_idx" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings_is_public_idx" ON "settings"("is_public");

-- CreateIndex
CREATE INDEX "menus_parent_id_idx" ON "menus"("parent_id");

-- CreateIndex
CREATE INDEX "menus_position_order_is_active_idx" ON "menus"("position", "order", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_slug_idx" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_status_idx" ON "pages"("status");

-- CreateIndex
CREATE INDEX "pages_template_idx" ON "pages"("template");

-- CreateIndex
CREATE INDEX "pages_published_at_idx" ON "pages"("published_at");

-- CreateIndex
CREATE INDEX "pages_created_at_idx" ON "pages"("created_at");

-- CreateIndex
CREATE INDEX "pages_created_by_id_idx" ON "pages"("created_by_id");

-- CreateIndex
CREATE INDEX "pages_updated_by_id_idx" ON "pages"("updated_by_id");

-- CreateIndex
CREATE INDEX "pages_deleted_at_idx" ON "pages"("deleted_at");

-- CreateIndex
CREATE INDEX "page_components_page_id_idx" ON "page_components"("page_id");

-- CreateIndex
CREATE INDEX "page_components_order_idx" ON "page_components"("order");

-- CreateIndex
CREATE INDEX "page_components_component_type_idx" ON "page_components"("component_type");

-- CreateIndex
CREATE UNIQUE INDEX "careers_slug_key" ON "careers"("slug");

-- CreateIndex
CREATE INDEX "careers_slug_idx" ON "careers"("slug");

-- CreateIndex
CREATE INDEX "careers_department_idx" ON "careers"("department");

-- CreateIndex
CREATE INDEX "careers_status_idx" ON "careers"("status");

-- CreateIndex
CREATE INDEX "careers_closing_date_idx" ON "careers"("closing_date");

-- CreateIndex
CREATE INDEX "careers_created_at_idx" ON "careers"("created_at");

-- CreateIndex
CREATE INDEX "careers_deleted_at_idx" ON "careers"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "awards_slug_key" ON "awards"("slug");

-- CreateIndex
CREATE INDEX "awards_slug_idx" ON "awards"("slug");

-- CreateIndex
CREATE INDEX "awards_year_idx" ON "awards"("year");

-- CreateIndex
CREATE INDEX "awards_position_idx" ON "awards"("position");

-- CreateIndex
CREATE INDEX "awards_issue_date_idx" ON "awards"("issue_date");

-- CreateIndex
CREATE INDEX "awards_is_active_idx" ON "awards"("is_active");

-- CreateIndex
CREATE INDEX "awards_status_idx" ON "awards"("status");

-- CreateIndex
CREATE INDEX "awards_deleted_at_idx" ON "awards"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "management_categories_slug_key" ON "management_categories"("slug");

-- CreateIndex
CREATE INDEX "management_categories_slug_idx" ON "management_categories"("slug");

-- CreateIndex
CREATE INDEX "management_categories_deleted_at_idx" ON "management_categories"("deleted_at");

-- CreateIndex
CREATE INDEX "management_categories_is_active_idx" ON "management_categories"("is_active");

-- CreateIndex
CREATE INDEX "management_categories_position_idx" ON "management_categories"("position");

-- CreateIndex
CREATE UNIQUE INDEX "managements_slug_key" ON "managements"("slug");

-- CreateIndex
CREATE INDEX "managements_category_id_idx" ON "managements"("category_id");

-- CreateIndex
CREATE INDEX "managements_deleted_at_idx" ON "managements"("deleted_at");

-- CreateIndex
CREATE INDEX "managements_is_active_idx" ON "managements"("is_active");

-- CreateIndex
CREATE INDEX "managements_order_idx" ON "managements"("order");

-- CreateIndex
CREATE INDEX "managements_slug_idx" ON "managements"("slug");

-- CreateIndex
CREATE INDEX "contact_submissions_user_id_idx" ON "contact_submissions"("user_id");

-- CreateIndex
CREATE INDEX "contact_submissions_email_idx" ON "contact_submissions"("email");

-- CreateIndex
CREATE INDEX "contact_submissions_status_idx" ON "contact_submissions"("status");

-- CreateIndex
CREATE INDEX "contact_submissions_type_idx" ON "contact_submissions"("type");

-- CreateIndex
CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions"("created_at");

-- CreateIndex
CREATE INDEX "contact_submissions_deleted_at_idx" ON "contact_submissions"("deleted_at");

-- CreateIndex
CREATE INDEX "log_activities_user_id_idx" ON "log_activities"("user_id");

-- CreateIndex
CREATE INDEX "log_activities_action_idx" ON "log_activities"("action");

-- CreateIndex
CREATE INDEX "log_activities_module_idx" ON "log_activities"("module");

-- CreateIndex
CREATE INDEX "log_activities_record_id_idx" ON "log_activities"("record_id");

-- CreateIndex
CREATE INDEX "log_activities_created_at_idx" ON "log_activities"("created_at");

-- CreateIndex
CREATE INDEX "log_activities_deleted_at_idx" ON "log_activities"("deleted_at");

-- CreateIndex
CREATE INDEX "visitor_logs_page_idx" ON "visitor_logs"("page");

-- CreateIndex
CREATE INDEX "visitor_logs_created_at_idx" ON "visitor_logs"("created_at");

-- CreateIndex
CREATE INDEX "visitor_logs_session_id_idx" ON "visitor_logs"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "url_redirects_from_url_key" ON "url_redirects"("from_url");

-- CreateIndex
CREATE INDEX "url_redirects_from_url_idx" ON "url_redirects"("from_url");

-- CreateIndex
CREATE INDEX "url_redirects_is_active_idx" ON "url_redirects"("is_active");

-- CreateIndex
CREATE INDEX "url_redirects_deleted_at_idx" ON "url_redirects"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "folders_path_key" ON "folders"("path");

-- CreateIndex
CREATE INDEX "folders_parent_id_idx" ON "folders"("parent_id");

-- CreateIndex
CREATE INDEX "folders_path_idx" ON "folders"("path");

-- CreateIndex
CREATE INDEX "folders_deleted_at_idx" ON "folders"("deleted_at");

-- CreateIndex
CREATE INDEX "files_folder_id_idx" ON "files"("folder_id");

-- CreateIndex
CREATE INDEX "files_created_by_id_idx" ON "files"("created_by_id");

-- CreateIndex
CREATE INDEX "files_mime_type_idx" ON "files"("mime_type");

-- CreateIndex
CREATE INDEX "files_path_idx" ON "files"("path");

-- CreateIndex
CREATE INDEX "files_created_at_idx" ON "files"("created_at");

-- CreateIndex
CREATE INDEX "files_deleted_at_idx" ON "files"("deleted_at");

-- CreateIndex
CREATE INDEX "contact_us_email_idx" ON "contact_us"("email");

-- CreateIndex
CREATE INDEX "contact_us_inquiry_type_idx" ON "contact_us"("inquiry_type");

-- CreateIndex
CREATE INDEX "contact_us_status_idx" ON "contact_us"("status");

-- CreateIndex
CREATE INDEX "contact_us_submitted_at_idx" ON "contact_us"("submitted_at");

-- CreateIndex
CREATE INDEX "contact_us_created_at_idx" ON "contact_us"("created_at");

-- CreateIndex
CREATE INDEX "form_modules_business_unit_idx" ON "form_modules"("business_unit");

-- CreateIndex
CREATE INDEX "form_modules_category_idx" ON "form_modules"("category");

-- CreateIndex
CREATE INDEX "form_modules_status_idx" ON "form_modules"("status");

-- CreateIndex
CREATE INDEX "form_modules_deleted_at_idx" ON "form_modules"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "form_modules_business_unit_slug_key" ON "form_modules"("business_unit", "slug");

-- CreateIndex
CREATE INDEX "form_steps_form_module_id_idx" ON "form_steps"("form_module_id");

-- CreateIndex
CREATE INDEX "form_steps_is_active_idx" ON "form_steps"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "form_steps_form_module_id_key_key" ON "form_steps"("form_module_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "form_steps_form_module_id_step_number_key" ON "form_steps"("form_module_id", "step_number");

-- CreateIndex
CREATE INDEX "form_fields_form_module_id_idx" ON "form_fields"("form_module_id");

-- CreateIndex
CREATE INDEX "form_fields_form_step_id_idx" ON "form_fields"("form_step_id");

-- CreateIndex
CREATE INDEX "form_fields_parent_field_id_idx" ON "form_fields"("parent_field_id");

-- CreateIndex
CREATE INDEX "form_fields_field_type_idx" ON "form_fields"("field_type");

-- CreateIndex
CREATE INDEX "form_fields_is_active_idx" ON "form_fields"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "form_fields_form_module_id_path_key" ON "form_fields"("form_module_id", "path");

-- CreateIndex
CREATE INDEX "form_field_options_field_id_idx" ON "form_field_options"("field_id");

-- CreateIndex
CREATE INDEX "form_field_options_is_active_idx" ON "form_field_options"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "form_field_options_field_id_value_key" ON "form_field_options"("field_id", "value");

-- CreateIndex
CREATE INDEX "form_field_rules_form_module_id_idx" ON "form_field_rules"("form_module_id");

-- CreateIndex
CREATE INDEX "form_field_rules_source_field_id_idx" ON "form_field_rules"("source_field_id");

-- CreateIndex
CREATE INDEX "form_field_rules_target_field_id_idx" ON "form_field_rules"("target_field_id");

-- CreateIndex
CREATE INDEX "form_field_rules_rule_type_idx" ON "form_field_rules"("rule_type");

-- CreateIndex
CREATE INDEX "form_field_rules_is_active_idx" ON "form_field_rules"("is_active");

-- CreateIndex
CREATE INDEX "form_response_configs_form_module_id_idx" ON "form_response_configs"("form_module_id");

-- CreateIndex
CREATE INDEX "form_response_configs_response_type_idx" ON "form_response_configs"("response_type");

-- CreateIndex
CREATE INDEX "form_response_configs_is_default_idx" ON "form_response_configs"("is_default");

-- CreateIndex
CREATE INDEX "form_response_configs_is_active_idx" ON "form_response_configs"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "form_response_configs_form_module_id_key_key" ON "form_response_configs"("form_module_id", "key");

-- CreateIndex
CREATE INDEX "form_integration_configs_form_module_id_idx" ON "form_integration_configs"("form_module_id");

-- CreateIndex
CREATE INDEX "form_integration_configs_provider_idx" ON "form_integration_configs"("provider");

-- CreateIndex
CREATE INDEX "form_integration_configs_is_active_idx" ON "form_integration_configs"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "form_integration_configs_form_module_id_key_key" ON "form_integration_configs"("form_module_id", "key");

-- CreateIndex
CREATE INDEX "form_submissions_form_module_id_idx" ON "form_submissions"("form_module_id");

-- CreateIndex
CREATE INDEX "form_submissions_business_unit_idx" ON "form_submissions"("business_unit");

-- CreateIndex
CREATE INDEX "form_submissions_form_slug_idx" ON "form_submissions"("form_slug");

-- CreateIndex
CREATE INDEX "form_submissions_status_idx" ON "form_submissions"("status");

-- CreateIndex
CREATE INDEX "form_submissions_primary_email_idx" ON "form_submissions"("primary_email");

-- CreateIndex
CREATE INDEX "form_submissions_received_at_idx" ON "form_submissions"("received_at");

-- CreateIndex
CREATE INDEX "form_submissions_deleted_at_idx" ON "form_submissions"("deleted_at");

-- CreateIndex
CREATE INDEX "form_submission_values_submission_id_idx" ON "form_submission_values"("submission_id");

-- CreateIndex
CREATE INDEX "form_submission_values_field_key_idx" ON "form_submission_values"("field_key");

-- CreateIndex
CREATE UNIQUE INDEX "form_submission_values_submission_id_field_path_key" ON "form_submission_values"("submission_id", "field_path");

-- CreateIndex
CREATE INDEX "form_submission_groups_submission_id_idx" ON "form_submission_groups"("submission_id");

-- CreateIndex
CREATE INDEX "form_submission_groups_group_key_idx" ON "form_submission_groups"("group_key");

-- CreateIndex
CREATE UNIQUE INDEX "form_submission_groups_submission_id_group_key_sort_order_key" ON "form_submission_groups"("submission_id", "group_key", "sort_order");

-- CreateIndex
CREATE INDEX "form_submission_group_values_group_id_idx" ON "form_submission_group_values"("group_id");

-- CreateIndex
CREATE INDEX "form_submission_group_values_field_key_idx" ON "form_submission_group_values"("field_key");

-- CreateIndex
CREATE UNIQUE INDEX "form_submission_group_values_group_id_field_path_key" ON "form_submission_group_values"("group_id", "field_path");

-- CreateIndex
CREATE INDEX "form_submission_files_submission_id_idx" ON "form_submission_files"("submission_id");

-- CreateIndex
CREATE INDEX "form_submission_files_group_id_idx" ON "form_submission_files"("group_id");

-- CreateIndex
CREATE INDEX "form_submission_files_file_id_idx" ON "form_submission_files"("file_id");

-- CreateIndex
CREATE INDEX "form_submission_files_field_path_idx" ON "form_submission_files"("field_path");

-- CreateIndex
CREATE INDEX "form_submission_files_status_idx" ON "form_submission_files"("status");

-- CreateIndex
CREATE INDEX "form_submission_dispatch_logs_submission_id_idx" ON "form_submission_dispatch_logs"("submission_id");

-- CreateIndex
CREATE INDEX "form_submission_dispatch_logs_integration_config_id_idx" ON "form_submission_dispatch_logs"("integration_config_id");

-- CreateIndex
CREATE INDEX "form_submission_dispatch_logs_provider_idx" ON "form_submission_dispatch_logs"("provider");

-- CreateIndex
CREATE INDEX "form_submission_dispatch_logs_status_idx" ON "form_submission_dispatch_logs"("status");

-- CreateIndex
CREATE INDEX "idx_career_content_created_at_desc" ON "career_content"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_career_content_division" ON "career_content"("division");

-- CreateIndex
CREATE INDEX "idx_career_content_expiry_date" ON "career_content"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_career_content_location" ON "career_content"("location");

-- CreateIndex
CREATE INDEX "idx_career_content_status" ON "career_content"("status");

-- CreateIndex
CREATE INDEX "idx_career_content_type" ON "career_content"("type");

-- CreateIndex
CREATE UNIQUE INDEX "report_types_slug_key" ON "report_types"("slug");

-- CreateIndex
CREATE INDEX "report_types_is_active_idx" ON "report_types"("is_active");

-- CreateIndex
CREATE INDEX "report_types_deleted_at_idx" ON "report_types"("deleted_at");

-- CreateIndex
CREATE INDEX "report_types_position_idx" ON "report_types"("position");

-- CreateIndex
CREATE INDEX "report_types_slug_idx" ON "report_types"("slug");

-- CreateIndex
CREATE INDEX "report_sections_is_active_idx" ON "report_sections"("is_active");

-- CreateIndex
CREATE INDEX "report_sections_deleted_at_idx" ON "report_sections"("deleted_at");

-- CreateIndex
CREATE INDEX "report_sections_position_idx" ON "report_sections"("position");

-- CreateIndex
CREATE INDEX "report_sections_slug_idx" ON "report_sections"("slug");

-- CreateIndex
CREATE INDEX "report_sections_type_id_idx" ON "report_sections"("type_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_sections_type_id_slug_key" ON "report_sections"("type_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_category_id_idx" ON "news"("category_id");

-- CreateIndex
CREATE INDEX "news_created_at_idx" ON "news"("created_at");

-- CreateIndex
CREATE INDEX "news_deleted_at_idx" ON "news"("deleted_at");

-- CreateIndex
CREATE INDEX "news_news_date_idx" ON "news"("news_date");

-- CreateIndex
CREATE INDEX "news_published_at_idx" ON "news"("published_at");

-- CreateIndex
CREATE INDEX "news_slug_idx" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_status_idx" ON "news"("status");

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_slug_key" ON "news_categories"("slug");

-- CreateIndex
CREATE INDEX "news_categories_deleted_at_idx" ON "news_categories"("deleted_at");

-- CreateIndex
CREATE INDEX "news_categories_is_active_idx" ON "news_categories"("is_active");

-- CreateIndex
CREATE INDEX "news_categories_position_idx" ON "news_categories"("position");

-- CreateIndex
CREATE INDEX "news_categories_slug_idx" ON "news_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_highlights_news_id_key" ON "news_highlights"("news_id");

-- CreateIndex
CREATE UNIQUE INDEX "news_highlights_position_key" ON "news_highlights"("position");

-- CreateIndex
CREATE INDEX "news_highlights_news_id_idx" ON "news_highlights"("news_id");

-- CreateIndex
CREATE INDEX "news_highlights_position_idx" ON "news_highlights"("position");

-- CreateIndex
CREATE INDEX "news_tag_relations_news_id_idx" ON "news_tag_relations"("news_id");

-- CreateIndex
CREATE INDEX "news_tag_relations_tag_id_idx" ON "news_tag_relations"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "news_tag_relations_news_id_tag_id_key" ON "news_tag_relations"("news_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "news_tags_slug_key" ON "news_tags"("slug");

-- CreateIndex
CREATE INDEX "news_tags_deleted_at_idx" ON "news_tags"("deleted_at");

-- CreateIndex
CREATE INDEX "news_tags_slug_idx" ON "news_tags"("slug");

-- CreateIndex
CREATE INDEX "news_views_ip_address_idx" ON "news_views"("ip_address");

-- CreateIndex
CREATE INDEX "news_views_news_id_idx" ON "news_views"("news_id");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_created_at_idx" ON "events"("created_at");

-- CreateIndex
CREATE INDEX "events_registration_end_at_idx" ON "events"("registration_end_at");

-- CreateIndex
CREATE INDEX "events_slug_idx" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_start_date_idx" ON "events"("start_date");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "event_news_relations_event_id_idx" ON "event_news_relations"("event_id");

-- CreateIndex
CREATE INDEX "event_news_relations_news_id_idx" ON "event_news_relations"("news_id");

-- CreateIndex
CREATE INDEX "event_news_relations_position_idx" ON "event_news_relations"("position");

-- CreateIndex
CREATE UNIQUE INDEX "event_news_relations_event_id_news_id_key" ON "event_news_relations"("event_id", "news_id");

-- CreateIndex
CREATE INDEX "event_registrations_company_email_idx" ON "event_registrations"("company_email");

-- CreateIndex
CREATE INDEX "event_registrations_created_at_idx" ON "event_registrations"("created_at");

-- CreateIndex
CREATE INDEX "event_registrations_event_id_idx" ON "event_registrations"("event_id");

-- CreateIndex
CREATE INDEX "event_registrations_pic_email_idx" ON "event_registrations"("pic_email");

-- CreateIndex
CREATE INDEX "event_registrations_status_idx" ON "event_registrations"("status");

-- CreateIndex
CREATE INDEX "event_registration_participants_email_idx" ON "event_registration_participants"("email");

-- CreateIndex
CREATE INDEX "event_registration_participants_registration_id_idx" ON "event_registration_participants"("registration_id");

-- CreateIndex
CREATE INDEX "reports_created_at_idx" ON "reports"("created_at");

-- CreateIndex
CREATE INDEX "reports_deleted_at_idx" ON "reports"("deleted_at");

-- CreateIndex
CREATE INDEX "reports_published_at_idx" ON "reports"("published_at");

-- CreateIndex
CREATE INDEX "reports_quarter_idx" ON "reports"("quarter");

-- CreateIndex
CREATE INDEX "reports_section_id_idx" ON "reports"("section_id");

-- CreateIndex
CREATE INDEX "reports_slug_idx" ON "reports"("slug");

-- CreateIndex
CREATE INDEX "reports_sort_order_idx" ON "reports"("sort_order");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_type_id_idx" ON "reports"("type_id");

-- CreateIndex
CREATE INDEX "reports_year_idx" ON "reports"("year");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_types_slug_key" ON "announcement_types"("slug");

-- CreateIndex
CREATE INDEX "announcement_types_is_active_idx" ON "announcement_types"("is_active");

-- CreateIndex
CREATE INDEX "announcement_types_deleted_at_idx" ON "announcement_types"("deleted_at");

-- CreateIndex
CREATE INDEX "announcement_types_position_idx" ON "announcement_types"("position");

-- CreateIndex
CREATE INDEX "announcement_types_slug_idx" ON "announcement_types"("slug");

-- CreateIndex
CREATE INDEX "announcement_sections_is_active_idx" ON "announcement_sections"("is_active");

-- CreateIndex
CREATE INDEX "announcement_sections_deleted_at_idx" ON "announcement_sections"("deleted_at");

-- CreateIndex
CREATE INDEX "announcement_sections_position_idx" ON "announcement_sections"("position");

-- CreateIndex
CREATE INDEX "announcement_sections_slug_idx" ON "announcement_sections"("slug");

-- CreateIndex
CREATE INDEX "announcement_sections_type_id_idx" ON "announcement_sections"("type_id");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_sections_type_id_slug_key" ON "announcement_sections"("type_id", "slug");

-- CreateIndex
CREATE INDEX "announcements_created_at_idx" ON "announcements"("created_at");

-- CreateIndex
CREATE INDEX "announcements_deleted_at_idx" ON "announcements"("deleted_at");

-- CreateIndex
CREATE INDEX "announcements_section_id_idx" ON "announcements"("section_id");

-- CreateIndex
CREATE INDEX "announcements_slug_idx" ON "announcements"("slug");

-- CreateIndex
CREATE INDEX "announcements_sort_order_idx" ON "announcements"("sort_order");

-- CreateIndex
CREATE INDEX "announcements_status_idx" ON "announcements"("status");

-- CreateIndex
CREATE INDEX "announcements_type_id_idx" ON "announcements"("type_id");

-- CreateIndex
CREATE UNIQUE INDEX "component_visibility_component_key_key" ON "component_visibility"("component_key");

-- CreateIndex
CREATE INDEX "component_visibility_status_idx" ON "component_visibility"("status");

-- CreateIndex
CREATE INDEX "component_visibility_business_unit_idx" ON "component_visibility"("business_unit");

-- CreateIndex
CREATE UNIQUE INDEX "map_coverage_regions_code_key" ON "map_coverage_regions"("code");

-- CreateIndex
CREATE INDEX "map_coverage_regions_is_active_idx" ON "map_coverage_regions"("is_active");

-- CreateIndex
CREATE INDEX "map_coverage_regions_sort_order_idx" ON "map_coverage_regions"("sort_order");

-- CreateIndex
CREATE INDEX "map_coverage_regions_deleted_at_idx" ON "map_coverage_regions"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "data_bank_solutions_slug_key" ON "data_bank_solutions"("slug");

-- CreateIndex
CREATE INDEX "data_bank_solutions_slug_idx" ON "data_bank_solutions"("slug");

-- CreateIndex
CREATE INDEX "data_bank_solutions_sort_order_idx" ON "data_bank_solutions"("sort_order");

-- CreateIndex
CREATE INDEX "data_bank_solutions_status_idx" ON "data_bank_solutions"("status");

-- CreateIndex
CREATE INDEX "data_bank_solutions_published_at_idx" ON "data_bank_solutions"("published_at");

-- CreateIndex
CREATE INDEX "data_bank_solutions_deleted_at_idx" ON "data_bank_solutions"("deleted_at");

-- CreateIndex
CREATE INDEX "data_bank_solution_categories_type_idx" ON "data_bank_solution_categories"("type");

-- CreateIndex
CREATE INDEX "data_bank_solution_categories_sort_order_idx" ON "data_bank_solution_categories"("sort_order");

-- CreateIndex
CREATE INDEX "data_bank_solution_categories_is_active_idx" ON "data_bank_solution_categories"("is_active");

-- CreateIndex
CREATE INDEX "data_bank_solution_categories_deleted_at_idx" ON "data_bank_solution_categories"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "data_bank_solution_categories_type_slug_key" ON "data_bank_solution_categories"("type", "slug");

-- CreateIndex
CREATE INDEX "data_bank_solution_category_relations_solution_id_idx" ON "data_bank_solution_category_relations"("solution_id");

-- CreateIndex
CREATE INDEX "data_bank_solution_category_relations_category_id_idx" ON "data_bank_solution_category_relations"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "data_bank_solution_category_relations_solution_id_category__key" ON "data_bank_solution_category_relations"("solution_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "label_groups_parent_name_key" ON "label_groups"("parent_name");

-- CreateIndex
CREATE UNIQUE INDEX "label_groups_slug_key" ON "label_groups"("slug");

-- CreateIndex
CREATE INDEX "label_groups_slug_idx" ON "label_groups"("slug");

-- CreateIndex
CREATE INDEX "label_groups_created_at_idx" ON "label_groups"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "label_nodes_label_id_key" ON "label_nodes"("label_id");

-- CreateIndex
CREATE INDEX "label_nodes_group_id_idx" ON "label_nodes"("group_id");

-- CreateIndex
CREATE INDEX "label_nodes_parent_id_idx" ON "label_nodes"("parent_id");

-- CreateIndex
CREATE INDEX "label_nodes_position_idx" ON "label_nodes"("position");

-- CreateIndex
CREATE INDEX "label_nodes_status_idx" ON "label_nodes"("status");

-- CreateIndex
CREATE INDEX "label_nodes_is_manual_label_id_idx" ON "label_nodes"("is_manual_label_id");

-- CreateIndex
CREATE UNIQUE INDEX "label_nodes_group_id_parent_id_segment_key" ON "label_nodes"("group_id", "parent_id", "segment");

-- CreateIndex
CREATE INDEX "cookie_consents_ip_address_idx" ON "cookie_consents"("ip_address");

-- CreateIndex
CREATE INDEX "cookie_consents_consented_at_idx" ON "cookie_consents"("consented_at");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_histories" ADD CONSTRAINT "password_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_components" ADD CONSTRAINT "page_components_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "managements" ADD CONSTRAINT "managements_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "management_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_activities" ADD CONSTRAINT "log_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "form_submission_files" ADD CONSTRAINT "form_submission_files_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission_files" ADD CONSTRAINT "form_submission_files_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "form_submission_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission_files" ADD CONSTRAINT "form_submission_files_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "form_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission_dispatch_logs" ADD CONSTRAINT "form_submission_dispatch_logs_integration_config_id_fkey" FOREIGN KEY ("integration_config_id") REFERENCES "form_integration_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission_dispatch_logs" ADD CONSTRAINT "form_submission_dispatch_logs_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "form_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_sections" ADD CONSTRAINT "report_sections_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "report_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "news_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_highlights" ADD CONSTRAINT "news_highlights_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_tag_relations" ADD CONSTRAINT "news_tag_relations_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_tag_relations" ADD CONSTRAINT "news_tag_relations_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "news_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_views" ADD CONSTRAINT "news_views_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_news_relations" ADD CONSTRAINT "event_news_relations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_news_relations" ADD CONSTRAINT "event_news_relations_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registration_participants" ADD CONSTRAINT "event_registration_participants_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "event_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "report_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "report_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_sections" ADD CONSTRAINT "announcement_sections_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "announcement_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "announcement_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "announcement_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_bank_solution_category_relations" ADD CONSTRAINT "data_bank_solution_category_relations_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "data_bank_solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_bank_solution_category_relations" ADD CONSTRAINT "data_bank_solution_category_relations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "data_bank_solution_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "label_nodes" ADD CONSTRAINT "label_nodes_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "label_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "label_nodes" ADD CONSTRAINT "label_nodes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "label_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

