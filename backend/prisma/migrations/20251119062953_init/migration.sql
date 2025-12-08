-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SettingType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'JSON', 'IMAGE', 'FILE');

-- CreateEnum
CREATE TYPE "MenuTarget" AS ENUM ('SELF', 'BLANK');

-- CreateEnum
CREATE TYPE "MenuType" AS ENUM ('HEADER', 'FOOTER', 'SIDEBAR');

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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
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
    "value" JSONB,
    "type" "SettingType" NOT NULL,
    "group" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "url" TEXT,
    "target" "MenuTarget" NOT NULL DEFAULT 'SELF',
    "icon" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "menu_type" "MenuType" NOT NULL DEFAULT 'HEADER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "featured_image" TEXT,
    "template" TEXT NOT NULL DEFAULT 'default',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
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
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featured_image" TEXT,
    "category_id" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
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

    CONSTRAINT "news_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_highlights" (
    "id" TEXT NOT NULL,
    "news_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_highlights_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "news_tag_relations" (
    "id" TEXT NOT NULL,
    "news_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_tag_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_types" (
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

    CONSTRAINT "announcement_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_sections" (
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

    CONSTRAINT "announcement_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "file_url" TEXT,
    "file_size" INTEGER,
    "file_type" TEXT,
    "thumbnail" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "period" TEXT,
    "year" INTEGER,
    "quarter" INTEGER,
    "file_url" TEXT,
    "file_size" INTEGER,
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
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "issuer" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "managements" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "description" TEXT,
    "photo" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedin" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "managements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "management_categories_pkey" PRIMARY KEY ("id")
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
    "description" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_activities_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "menus_parent_id_idx" ON "menus"("parent_id");

-- CreateIndex
CREATE INDEX "menus_position_idx" ON "menus"("position");

-- CreateIndex
CREATE INDEX "menus_menu_type_idx" ON "menus"("menu_type");

-- CreateIndex
CREATE INDEX "menus_is_active_idx" ON "menus"("is_active");

-- CreateIndex
CREATE INDEX "menus_deleted_at_idx" ON "menus"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_slug_idx" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_status_idx" ON "pages"("status");

-- CreateIndex
CREATE INDEX "pages_published_at_idx" ON "pages"("published_at");

-- CreateIndex
CREATE INDEX "pages_created_at_idx" ON "pages"("created_at");

-- CreateIndex
CREATE INDEX "pages_deleted_at_idx" ON "pages"("deleted_at");

-- CreateIndex
CREATE INDEX "page_components_page_id_idx" ON "page_components"("page_id");

-- CreateIndex
CREATE INDEX "page_components_position_idx" ON "page_components"("position");

-- CreateIndex
CREATE INDEX "page_components_type_idx" ON "page_components"("type");

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_slug_idx" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_category_id_idx" ON "news"("category_id");

-- CreateIndex
CREATE INDEX "news_status_idx" ON "news"("status");

-- CreateIndex
CREATE INDEX "news_published_at_idx" ON "news"("published_at");

-- CreateIndex
CREATE INDEX "news_created_at_idx" ON "news"("created_at");

-- CreateIndex
CREATE INDEX "news_deleted_at_idx" ON "news"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_slug_key" ON "news_categories"("slug");

-- CreateIndex
CREATE INDEX "news_categories_slug_idx" ON "news_categories"("slug");

-- CreateIndex
CREATE INDEX "news_categories_position_idx" ON "news_categories"("position");

-- CreateIndex
CREATE INDEX "news_categories_is_active_idx" ON "news_categories"("is_active");

-- CreateIndex
CREATE INDEX "news_categories_deleted_at_idx" ON "news_categories"("deleted_at");

-- CreateIndex
CREATE INDEX "news_highlights_news_id_idx" ON "news_highlights"("news_id");

-- CreateIndex
CREATE INDEX "news_highlights_position_idx" ON "news_highlights"("position");

-- CreateIndex
CREATE INDEX "news_highlights_is_active_idx" ON "news_highlights"("is_active");

-- CreateIndex
CREATE INDEX "news_highlights_start_date_end_date_idx" ON "news_highlights"("start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "news_tags_slug_key" ON "news_tags"("slug");

-- CreateIndex
CREATE INDEX "news_tags_slug_idx" ON "news_tags"("slug");

-- CreateIndex
CREATE INDEX "news_tags_deleted_at_idx" ON "news_tags"("deleted_at");

-- CreateIndex
CREATE INDEX "news_tag_relations_news_id_idx" ON "news_tag_relations"("news_id");

-- CreateIndex
CREATE INDEX "news_tag_relations_tag_id_idx" ON "news_tag_relations"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "news_tag_relations_news_id_tag_id_key" ON "news_tag_relations"("news_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_types_slug_key" ON "announcement_types"("slug");

-- CreateIndex
CREATE INDEX "announcement_types_slug_idx" ON "announcement_types"("slug");

-- CreateIndex
CREATE INDEX "announcement_types_position_idx" ON "announcement_types"("position");

-- CreateIndex
CREATE INDEX "announcement_types_is_active_idx" ON "announcement_types"("is_active");

-- CreateIndex
CREATE INDEX "announcement_types_deleted_at_idx" ON "announcement_types"("deleted_at");

-- CreateIndex
CREATE INDEX "announcement_sections_type_id_idx" ON "announcement_sections"("type_id");

-- CreateIndex
CREATE INDEX "announcement_sections_slug_idx" ON "announcement_sections"("slug");

-- CreateIndex
CREATE INDEX "announcement_sections_position_idx" ON "announcement_sections"("position");

-- CreateIndex
CREATE INDEX "announcement_sections_is_active_idx" ON "announcement_sections"("is_active");

-- CreateIndex
CREATE INDEX "announcement_sections_deleted_at_idx" ON "announcement_sections"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_sections_type_id_slug_key" ON "announcement_sections"("type_id", "slug");

-- CreateIndex
CREATE INDEX "announcements_section_id_idx" ON "announcements"("section_id");

-- CreateIndex
CREATE INDEX "announcements_slug_idx" ON "announcements"("slug");

-- CreateIndex
CREATE INDEX "announcements_status_idx" ON "announcements"("status");

-- CreateIndex
CREATE INDEX "announcements_published_at_idx" ON "announcements"("published_at");

-- CreateIndex
CREATE INDEX "announcements_created_at_idx" ON "announcements"("created_at");

-- CreateIndex
CREATE INDEX "announcements_deleted_at_idx" ON "announcements"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "announcements_section_id_slug_key" ON "announcements"("section_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "report_types_slug_key" ON "report_types"("slug");

-- CreateIndex
CREATE INDEX "report_types_slug_idx" ON "report_types"("slug");

-- CreateIndex
CREATE INDEX "report_types_position_idx" ON "report_types"("position");

-- CreateIndex
CREATE INDEX "report_types_is_active_idx" ON "report_types"("is_active");

-- CreateIndex
CREATE INDEX "report_types_deleted_at_idx" ON "report_types"("deleted_at");

-- CreateIndex
CREATE INDEX "report_sections_type_id_idx" ON "report_sections"("type_id");

-- CreateIndex
CREATE INDEX "report_sections_slug_idx" ON "report_sections"("slug");

-- CreateIndex
CREATE INDEX "report_sections_position_idx" ON "report_sections"("position");

-- CreateIndex
CREATE INDEX "report_sections_is_active_idx" ON "report_sections"("is_active");

-- CreateIndex
CREATE INDEX "report_sections_deleted_at_idx" ON "report_sections"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "report_sections_type_id_slug_key" ON "report_sections"("type_id", "slug");

-- CreateIndex
CREATE INDEX "reports_section_id_idx" ON "reports"("section_id");

-- CreateIndex
CREATE INDEX "reports_slug_idx" ON "reports"("slug");

-- CreateIndex
CREATE INDEX "reports_year_idx" ON "reports"("year");

-- CreateIndex
CREATE INDEX "reports_quarter_idx" ON "reports"("quarter");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_published_at_idx" ON "reports"("published_at");

-- CreateIndex
CREATE INDEX "reports_created_at_idx" ON "reports"("created_at");

-- CreateIndex
CREATE INDEX "reports_deleted_at_idx" ON "reports"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "reports_section_id_slug_key" ON "reports"("section_id", "slug");

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
CREATE INDEX "awards_position_idx" ON "awards"("position");

-- CreateIndex
CREATE INDEX "awards_issue_date_idx" ON "awards"("issue_date");

-- CreateIndex
CREATE INDEX "awards_is_active_idx" ON "awards"("is_active");

-- CreateIndex
CREATE INDEX "awards_deleted_at_idx" ON "awards"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "managements_slug_key" ON "managements"("slug");

-- CreateIndex
CREATE INDEX "managements_category_id_idx" ON "managements"("category_id");

-- CreateIndex
CREATE INDEX "managements_slug_idx" ON "managements"("slug");

-- CreateIndex
CREATE INDEX "managements_order_idx" ON "managements"("order");

-- CreateIndex
CREATE INDEX "managements_is_active_idx" ON "managements"("is_active");

-- CreateIndex
CREATE INDEX "managements_deleted_at_idx" ON "managements"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "management_categories_slug_key" ON "management_categories"("slug");

-- CreateIndex
CREATE INDEX "management_categories_slug_idx" ON "management_categories"("slug");

-- CreateIndex
CREATE INDEX "management_categories_position_idx" ON "management_categories"("position");

-- CreateIndex
CREATE INDEX "management_categories_is_active_idx" ON "management_categories"("is_active");

-- CreateIndex
CREATE INDEX "management_categories_deleted_at_idx" ON "management_categories"("deleted_at");

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
CREATE INDEX "log_activities_created_at_idx" ON "log_activities"("created_at");

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

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_components" ADD CONSTRAINT "page_components_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "announcement_sections" ADD CONSTRAINT "announcement_sections_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "announcement_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "announcement_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_sections" ADD CONSTRAINT "report_sections_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "report_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "report_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "managements" ADD CONSTRAINT "managements_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "management_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_activities" ADD CONSTRAINT "log_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
