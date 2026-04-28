/**
 * seed-enterprise-forms.ts
 *
 * Phase 2 — Seeder: Enterprise Form Registration (Multi-BU)
 *
 * Scope: 5 Enterprise form modules
 *   1. enterprise-consultation  (REGISTRATION / SUBMISSION / CRM Web-to-Lead)
 *   2. smb-enterprise           (REGISTRATION / SUBMISSION / Internal)
 *   3. enterprise-partnership   (PARTNERSHIP  / SUBMISSION / CRM Web-to-Lead)
 *   4. suggest-enterprise       (RECOMMENDATION / ROUTING_ONLY / NOOP)
 *   5. event-register           (EVENT / SUBMISSION / CRM Web-to-Lead) — Enterprise BU only
 *
 * Rules:
 *   ✅ Idempotent via create-or-update pattern
 *   ✅ Uses FormModuleService.$transaction for atomicity
 *   ✅ Skips modules not managed by this seeder (or previous bootstrap seed)
 *   ✅ Field paths & payloadKeys match source code exactly (Phase 1 mapping)
 *   ❌ Does NOT drop or recreate tables
 */

import {
  BusinessUnit,
  FormCategory,
  FormDispatchMode,
  FormFieldType,
  FormHandlingMode,
  FormIntegrationProvider,
  FormModuleStatus,
  FormResponseType,
  FormRuleType,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import {
  createFormModuleSchema,
  CreateFormModuleInput,
  UpdateFormModuleInput,
} from '../../src/modules/form-modules/formModule.validation';
import { FormModuleService } from '../../src/modules/form-modules/formModule.service';

// ─── Constants ────────────────────────────────────────────────────────────────

const prisma = new PrismaClient();

/**
 * Seeder identity key. Written to submissionSettings.managedBy so the
 * upsert logic knows this module is auto-managed and can be re-seeded.
 *
 * Using 'bootstrap-seed' (same as form-modules.seed.ts) so the existing
 * bootstrap check stays compatible. Modules seeded here are then "claimed"
 * by updating managedBy to ENTERPRISE_SEED_OWNER on each run — after which
 * the generic bootstrap seeder will skip them.
 */
const ENTERPRISE_SEED_OWNER = 'enterprise-forms-seed';

/** Also accept the old generic bootstrap key so we can take over ownership. */
const BOOTSTRAP_OWNER_LEGACY = 'bootstrap-seed';

const SEED_REVISION = 1;

// ─── Type aliases ─────────────────────────────────────────────────────────────

type FormDefinitionSeed = CreateFormModuleInput['definition'];
type FormFieldSeed = FormDefinitionSeed['fields'][number];
type FormOptionSeed = FormDefinitionSeed['options'][number];
type FormRuleSeed = FormDefinitionSeed['rules'][number];
type FormResponseSeed = FormDefinitionSeed['responseConfigs'][number];
type FormIntegrationSeed = FormDefinitionSeed['integrationConfigs'][number];

interface SeedResult {
  created: number;
  updated: number;
  skipped: number;
}

// ─── Low-level builder helpers ────────────────────────────────────────────────

/** Derive a DB key from the last segment of a dotted path. */
function pathKey(path: string): string {
  const parts = path.split('.');
  return parts[parts.length - 1]!;
}

function publicPath(businessUnit: BusinessUnit, slug: string, suffix?: string): string {
  const bu = businessUnit.toLowerCase();
  const base = `/{locale}/${bu}/forms/${slug}`;
  return suffix ? `${base}/${suffix}` : base;
}

function baseSubmissionSettings(seedKey: string, extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    managedBy: ENTERPRISE_SEED_OWNER,
    seedKey,
    revision: SEED_REVISION,
    ...extra,
  };
}

function field(
  fieldType: FormFieldType,
  path: string,
  label: string,
  formStepKey: string,
  sortOrder: number,
  extra?: Partial<FormFieldSeed>,
): FormFieldSeed {
  return {
    key: pathKey(path),
    path,
    label,
    fieldType,
    formStepKey,
    sortOrder,
    isActive: true,
    ...extra,
  };
}

function option(
  fieldPath: string,
  value: string,
  label: string,
  sortOrder: number,
  extra?: Partial<FormOptionSeed>,
): FormOptionSeed {
  return { fieldPath, value, label, sortOrder, isActive: true, ...extra };
}

function rule(
  ruleType: FormRuleType,
  sortOrder: number,
  config: Pick<FormRuleSeed, 'condition' | 'actionConfig'> & Partial<FormRuleSeed>,
): FormRuleSeed {
  return { ruleType, sortOrder, isActive: true, ...config };
}

function response(
  key: string,
  responseType: FormResponseType,
  pathTemplate: string,
  sortOrder: number,
  extra?: Partial<FormResponseSeed>,
): FormResponseSeed {
  return { key, responseType, pathTemplate, sortOrder, isActive: true, ...extra };
}

function crmIntegrationConfig(
  businessUnit: BusinessUnit,
  slug: string,
  formName: string,
): FormIntegrationSeed {
  return {
    key: 'crm-primary',
    provider: FormIntegrationProvider.CRM_WEB_TO_LEAD,
    dispatchMode: FormDispatchMode.ASYNC,
    mappingConfig: { businessUnit, formSlug: slug, formName },
    headersConfig: {
      'x-form-module': slug,
      'x-form-business-unit': businessUnit,
    },
    isActive: true,
  };
}

// ─── Shared option sets ───────────────────────────────────────────────────────

/**
 * 15 industry options shared by:
 *   enterprise-consultation  → Business_Industry__c
 *   enterprise-partnership   → businessIndustry
 *   event-register           → businessIndustry
 */
const INDUSTRY_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  option(fieldPath, 'Agriculture, Forestry, Fishing', 'Agriculture, Forestry, Fishing', 0),
  option(fieldPath, 'Entertainment, Media & Advertising', 'Entertainment, Media & Advertising', 1),
  option(fieldPath, 'Financial Service Institutions', 'Financial Service Institutions', 2),
  option(fieldPath, 'Food & Beverage', 'Food & Beverage', 3),
  option(fieldPath, 'General Services', 'General Services', 4),
  option(fieldPath, 'Government & Affairs', 'Government & Affairs', 5),
  option(fieldPath, 'Holding Company', 'Holding Company', 6),
  option(fieldPath, 'Hospitality Services', 'Hospitality Services', 7),
  option(fieldPath, 'IT & Telecommunication', 'IT & Telecommunication', 8),
  option(fieldPath, 'Manufacturing', 'Manufacturing', 9),
  option(fieldPath, 'Mining and Oil & Gas', 'Mining and Oil & Gas', 10),
  option(fieldPath, 'Property & Construction', 'Property & Construction', 11),
  option(fieldPath, 'Retail Trade', 'Retail Trade', 12),
  option(fieldPath, 'Services', 'Services', 13),
  option(fieldPath, 'Transportation & Public Utilities', 'Transportation & Public Utilities', 14),
];

/**
 * Province options used by Enterprise Consultation, Partnership, Event Register.
 * Fiber/Media use a different zipCode field and are handled in their own seeders.
 */
const PROVINCE_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  option(fieldPath, 'DKI Jakarta', 'DKI Jakarta', 0),
  option(fieldPath, 'Jawa Barat', 'Jawa Barat', 1),
  option(fieldPath, 'Jawa Tengah', 'Jawa Tengah', 2),
  option(fieldPath, 'DI Yogyakarta', 'DI Yogyakarta', 3),
  option(fieldPath, 'Jawa Timur', 'Jawa Timur', 4),
  option(fieldPath, 'Banten', 'Banten', 5),
];

/**
 * City options — aggregated for Enterprise cascading SELECT.
 * Frontend filters by selected province at runtime; DB stores all options.
 */
const CITY_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  // DKI Jakarta
  option(fieldPath, 'Jakarta Selatan', 'Jakarta Selatan', 0, { metadata: { province: 'DKI Jakarta' } }),
  option(fieldPath, 'Jakarta Barat', 'Jakarta Barat', 1, { metadata: { province: 'DKI Jakarta' } }),
  option(fieldPath, 'Jakarta Pusat', 'Jakarta Pusat', 2, { metadata: { province: 'DKI Jakarta' } }),
  // Jawa Barat
  option(fieldPath, 'Bandung', 'Bandung', 3, { metadata: { province: 'Jawa Barat' } }),
  option(fieldPath, 'Bekasi', 'Bekasi', 4, { metadata: { province: 'Jawa Barat' } }),
  option(fieldPath, 'Bogor', 'Bogor', 5, { metadata: { province: 'Jawa Barat' } }),
  // Jawa Tengah
  option(fieldPath, 'Semarang', 'Semarang', 6, { metadata: { province: 'Jawa Tengah' } }),
  option(fieldPath, 'Solo', 'Solo', 7, { metadata: { province: 'Jawa Tengah' } }),
  option(fieldPath, 'Magelang', 'Magelang', 8, { metadata: { province: 'Jawa Tengah' } }),
  // DI Yogyakarta
  option(fieldPath, 'Yogyakarta', 'Yogyakarta', 9, { metadata: { province: 'DI Yogyakarta' } }),
  option(fieldPath, 'Sleman', 'Sleman', 10, { metadata: { province: 'DI Yogyakarta' } }),
  option(fieldPath, 'Bantul', 'Bantul', 11, { metadata: { province: 'DI Yogyakarta' } }),
  // Jawa Timur
  option(fieldPath, 'Surabaya', 'Surabaya', 12, { metadata: { province: 'Jawa Timur' } }),
  option(fieldPath, 'Sidoarjo', 'Sidoarjo', 13, { metadata: { province: 'Jawa Timur' } }),
  option(fieldPath, 'Malang', 'Malang', 14, { metadata: { province: 'Jawa Timur' } }),
  // Banten
  option(fieldPath, 'Tangerang', 'Tangerang', 15, { metadata: { province: 'Banten' } }),
  option(fieldPath, 'Tangerang Selatan', 'Tangerang Selatan', 16, { metadata: { province: 'Banten' } }),
  option(fieldPath, 'Serang', 'Serang', 17, { metadata: { province: 'Banten' } }),
];

/**
 * Ward/ZIP cascading options for Enterprise Consultation, Partnership, Event Register.
 * value = ward name, metadata.city = parent city for frontend filtering.
 */
const WARD_ZIP_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  // Jakarta Selatan
  option(fieldPath, 'Kebayoran Baru', 'Kebayoran Baru', 0, { metadata: { city: 'Jakarta Selatan' } }),
  option(fieldPath, 'Setiabudi', 'Setiabudi', 1, { metadata: { city: 'Jakarta Selatan' } }),
  option(fieldPath, 'Tebet', 'Tebet', 2, { metadata: { city: 'Jakarta Selatan' } }),
  // Jakarta Barat
  option(fieldPath, 'Kembangan', 'Kembangan', 3, { metadata: { city: 'Jakarta Barat' } }),
  option(fieldPath, 'Palmerah', 'Palmerah', 4, { metadata: { city: 'Jakarta Barat' } }),
  option(fieldPath, 'Cengkareng', 'Cengkareng', 5, { metadata: { city: 'Jakarta Barat' } }),
  // Jakarta Pusat
  option(fieldPath, 'Menteng', 'Menteng', 6, { metadata: { city: 'Jakarta Pusat' } }),
  option(fieldPath, 'Tanah Abang', 'Tanah Abang', 7, { metadata: { city: 'Jakarta Pusat' } }),
  option(fieldPath, 'Kemayoran', 'Kemayoran', 8, { metadata: { city: 'Jakarta Pusat' } }),
  // Bandung
  option(fieldPath, 'Coblong', 'Coblong', 9, { metadata: { city: 'Bandung' } }),
  option(fieldPath, 'Lengkong', 'Lengkong', 10, { metadata: { city: 'Bandung' } }),
  option(fieldPath, 'Sukajadi', 'Sukajadi', 11, { metadata: { city: 'Bandung' } }),
  // Bekasi
  option(fieldPath, 'Bekasi Selatan', 'Bekasi Selatan', 12, { metadata: { city: 'Bekasi' } }),
  option(fieldPath, 'Bekasi Timur', 'Bekasi Timur', 13, { metadata: { city: 'Bekasi' } }),
  option(fieldPath, 'Jatiasih', 'Jatiasih', 14, { metadata: { city: 'Bekasi' } }),
  // Bogor
  option(fieldPath, 'Bogor Tengah', 'Bogor Tengah', 15, { metadata: { city: 'Bogor' } }),
  option(fieldPath, 'Bogor Barat', 'Bogor Barat', 16, { metadata: { city: 'Bogor' } }),
  option(fieldPath, 'Cigombong', 'Cigombong', 17, { metadata: { city: 'Bogor' } }),
  // Semarang
  option(fieldPath, 'Banyumanik', 'Banyumanik', 18, { metadata: { city: 'Semarang' } }),
  option(fieldPath, 'Candisari', 'Candisari', 19, { metadata: { city: 'Semarang' } }),
  option(fieldPath, 'Tembalang', 'Tembalang', 20, { metadata: { city: 'Semarang' } }),
  // Solo
  option(fieldPath, 'Banjarsari', 'Banjarsari', 21, { metadata: { city: 'Solo' } }),
  option(fieldPath, 'Laweyan', 'Laweyan', 22, { metadata: { city: 'Solo' } }),
  option(fieldPath, 'Jebres', 'Jebres', 23, { metadata: { city: 'Solo' } }),
  // Magelang
  option(fieldPath, 'Magelang Tengah', 'Magelang Tengah', 24, { metadata: { city: 'Magelang' } }),
  option(fieldPath, 'Magelang Utara', 'Magelang Utara', 25, { metadata: { city: 'Magelang' } }),
  option(fieldPath, 'Mertoyudan', 'Mertoyudan', 26, { metadata: { city: 'Magelang' } }),
  // Yogyakarta
  option(fieldPath, 'Gondokusuman', 'Gondokusuman', 27, { metadata: { city: 'Yogyakarta' } }),
  option(fieldPath, 'Jetis', 'Jetis', 28, { metadata: { city: 'Yogyakarta' } }),
  option(fieldPath, 'Umbulharjo', 'Umbulharjo', 29, { metadata: { city: 'Yogyakarta' } }),
  // Sleman
  option(fieldPath, 'Depok', 'Depok', 30, { metadata: { city: 'Sleman' } }),
  option(fieldPath, 'Ngaglik', 'Ngaglik', 31, { metadata: { city: 'Sleman' } }),
  option(fieldPath, 'Mlati', 'Mlati', 32, { metadata: { city: 'Sleman' } }),
  // Bantul
  option(fieldPath, 'Banguntapan', 'Banguntapan', 33, { metadata: { city: 'Bantul' } }),
  option(fieldPath, 'Kasihan', 'Kasihan', 34, { metadata: { city: 'Bantul' } }),
  option(fieldPath, 'Sewon', 'Sewon', 35, { metadata: { city: 'Bantul' } }),
  // Surabaya
  option(fieldPath, 'Tegalsari', 'Tegalsari', 36, { metadata: { city: 'Surabaya' } }),
  option(fieldPath, 'Wonokromo', 'Wonokromo', 37, { metadata: { city: 'Surabaya' } }),
  option(fieldPath, 'Rungkut', 'Rungkut', 38, { metadata: { city: 'Surabaya' } }),
  // Sidoarjo
  option(fieldPath, 'Buduran', 'Buduran', 39, { metadata: { city: 'Sidoarjo' } }),
  option(fieldPath, 'Candi', 'Candi', 40, { metadata: { city: 'Sidoarjo' } }),
  option(fieldPath, 'Gedangan', 'Gedangan', 41, { metadata: { city: 'Sidoarjo' } }),
  // Malang
  option(fieldPath, 'Klojen', 'Klojen', 42, { metadata: { city: 'Malang' } }),
  option(fieldPath, 'Lowokwaru', 'Lowokwaru', 43, { metadata: { city: 'Malang' } }),
  option(fieldPath, 'Blimbing', 'Blimbing', 44, { metadata: { city: 'Malang' } }),
  // Tangerang
  option(fieldPath, 'Ciledug', 'Ciledug', 45, { metadata: { city: 'Tangerang' } }),
  option(fieldPath, 'Karawaci', 'Karawaci', 46, { metadata: { city: 'Tangerang' } }),
  option(fieldPath, 'Pinang', 'Pinang', 47, { metadata: { city: 'Tangerang' } }),
  // Tangerang Selatan
  option(fieldPath, 'Serpong', 'Serpong', 48, { metadata: { city: 'Tangerang Selatan' } }),
  option(fieldPath, 'Pondok Aren', 'Pondok Aren', 49, { metadata: { city: 'Tangerang Selatan' } }),
  option(fieldPath, 'Ciputat', 'Ciputat', 50, { metadata: { city: 'Tangerang Selatan' } }),
  // Serang
  option(fieldPath, 'Curug', 'Curug', 51, { metadata: { city: 'Serang' } }),
  option(fieldPath, 'Kasemen', 'Kasemen', 52, { metadata: { city: 'Serang' } }),
  option(fieldPath, 'Walantaka', 'Walantaka', 53, { metadata: { city: 'Serang' } }),
];

/** Department options — Enterprise Consultation & Partnership */
const DEPARTMENT_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  option(fieldPath, 'IT/ Network', 'IT / Network', 0),
  option(fieldPath, 'Management', 'Management', 1),
  option(fieldPath, 'Supply Chain Management/ Procurement/ GA', 'Supply Chain / Procurement / GA', 2),
  option(fieldPath, 'Other', 'Other', 3),
];

/** Job Level / Role Title options — Enterprise Consultation & Partnership */
const JOB_LEVEL_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  option(fieldPath, 'CEO', 'CEO', 0),
  option(fieldPath, 'CTO/Technical Director', 'CTO / Technical Director', 1),
  option(fieldPath, 'Engineering/Technical Officer', 'Engineering / Technical Officer', 2),
  option(fieldPath, 'IT Head/IT Manager/IT Staff', 'IT Head / IT Manager / IT Staff', 3),
  option(fieldPath, 'Kepala Yayasan/Wakil', 'Kepala Yayasan / Wakil', 4),
  option(fieldPath, 'Marketing Director/Manager', 'Marketing Director / Manager', 5),
  option(fieldPath, 'Procurement/SCM', 'Procurement / SCM', 6),
  option(fieldPath, 'Rektor/Kepala Sekolah/Wakil', 'Rektor / Kepala Sekolah / Wakil', 7),
  option(fieldPath, 'Sales Director/Manager', 'Sales Director / Manager', 8),
  option(fieldPath, 'Tim IT/Administrasi', 'Tim IT / Administrasi', 9),
];

// ─── Form 1: Enterprise Consultation ─────────────────────────────────────────

function buildEnterpriseConsultation(): CreateFormModuleInput {
  const slug = 'enterprise-consultation';
  const businessUnit = BusinessUnit.ENTERPRISE;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Enterprise Consultation',
    description: '4-step consultative lead form for enterprise prospects (CRM Web-to-Lead).',
    category: FormCategory.REGISTRATION,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Enterprise Website',
    promoWebsite: 'Enterprise Consultation',
    leadSource: 'Website',
    integrationProvider: FormIntegrationProvider.CRM_WEB_TO_LEAD,
    submissionSettings: baseSubmissionSettings(slug, {
      primaryFieldPaths: {
        name: ['FirstName', 'LastName'],
        email: ['Email'],
        phone: ['MobilePhone'],
      },
    }),
    definition: {
      steps: [
        { key: 'need_personal', title: 'Need & Personal Details', stepNumber: 1, actionLabel: 'Next' },
        { key: 'company', title: 'Company Details', stepNumber: 2, actionLabel: 'Next' },
        { key: 'business_needs', title: 'Business Needs', stepNumber: 3, actionLabel: 'Next' },
        { key: 'review', title: 'Review', stepNumber: 4, isReviewStep: true, actionLabel: 'Submit' },
      ],

      // ── Step 1: Need & Personal ──────────────────────────────────────────
      fields: [
        field(FormFieldType.TEXT, 'FirstName', 'First Name', 'need_personal', 1, {
          isRequired: true,
          payloadKey: 'FirstName',
          placeholder: 'Your first name',
        }),
        field(FormFieldType.TEXT, 'LastName', 'Last Name', 'need_personal', 2, {
          isRequired: true,
          payloadKey: 'LastName',
          placeholder: 'Your last name',
        }),
        field(FormFieldType.EMAIL, 'Email', 'Company Email', 'need_personal', 3, {
          isRequired: true,
          payloadKey: 'Email',
          placeholder: 'your@company.com',
        }),
        field(FormFieldType.PHONE, 'MobilePhone', 'Phone Number', 'need_personal', 4, {
          isRequired: true,
          payloadKey: 'MobilePhone',
          placeholder: '08xx-xxxx-xxxx',
        }),
        field(FormFieldType.SELECT, 'Department__c', 'Your Department', 'need_personal', 5, {
          isRequired: true,
          payloadKey: 'Department__c',
          placeholder: 'Select department',
        }),
        field(FormFieldType.SELECT, 'Job_Level__c', 'Your Role / Title', 'need_personal', 6, {
          isRequired: true,
          payloadKey: 'Job_Level__c',
          placeholder: 'Select role',
        }),

        // ── Step 2: Company Details ────────────────────────────────────────
        field(FormFieldType.TEXT, 'Company', 'Company Name', 'company', 1, {
          isRequired: true,
          payloadKey: 'Company',
          placeholder: 'Your company name',
        }),
        field(FormFieldType.SELECT, 'Business_Industry__c', 'Business Industry', 'company', 2, {
          isRequired: true,
          payloadKey: 'Business_Industry__c',
          placeholder: 'Select industry',
        }),
        field(FormFieldType.SELECT, 'Province__c', 'Province', 'company', 3, {
          isRequired: true,
          payloadKey: 'Province__c',
          placeholder: 'Select province',
        }),
        field(FormFieldType.SELECT, 'City__c', 'City', 'company', 4, {
          isRequired: true,
          payloadKey: 'City__c',
          placeholder: 'Select city',
        }),
        field(FormFieldType.SELECT, 'Kecamatan_Zipcode__c', 'Ward / ZIP Code', 'company', 5, {
          isRequired: true,
          payloadKey: 'Kecamatan_Zipcode__c',
          placeholder: 'Select ward/zip',
        }),
        field(FormFieldType.TEXT, 'Building_Name__c', 'Detail Address', 'company', 6, {
          isRequired: true,
          payloadKey: 'Building_Name__c',
          placeholder: 'Office/Building name',
        }),

        // ── Step 3: Business Needs ─────────────────────────────────────────
        field(FormFieldType.MULTI_SELECT, 'Solution__c', 'Solution', 'business_needs', 1, {
          isRequired: true,
          payloadKey: 'Solution__c',
          defaultValue: [],
          validation: { minSelect: 1 },
        }),
        field(FormFieldType.SELECT, 'Timeline__c', 'Timeline', 'business_needs', 2, {
          isRequired: true,
          payloadKey: 'Timeline__c',
          placeholder: 'Select timeline',
        }),
        field(FormFieldType.SELECT, 'Choose_your_Needs__c', 'Choose Your Needs', 'business_needs', 3, {
          isRequired: true,
          payloadKey: 'Choose_your_Needs__c',
          placeholder: 'Select needs',
        }),
        field(FormFieldType.SELECT, 'Procurement_Method__c', 'Procurement Method', 'business_needs', 4, {
          isRequired: true,
          payloadKey: 'Procurement_Method__c',
          placeholder: 'Select method',
        }),
        field(FormFieldType.TEXTAREA, 'Specific_Needs__c', 'Specific Needs', 'business_needs', 5, {
          isRequired: true,
          payloadKey: 'Specific_Needs__c',
          placeholder: 'Describe your specific needs',
        }),
        field(FormFieldType.CHECKBOX_GROUP, 'Business_Objective__c', 'Business Challenge', 'business_needs', 6, {
          isRequired: true,
          payloadKey: 'Business_Objective__c',
          defaultValue: [],
          validation: { minSelect: 1 },
        }),

        // ── Step 4: Review (hidden CRM payload fields) ─────────────────────
        field(FormFieldType.HIDDEN, 'Web_to_Lead__c', 'Web to Lead', 'review', 1, {
          payloadKey: 'Web_to_Lead__c',
          defaultValue: true,
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'LeadSource', 'Lead Source', 'review', 2, {
          payloadKey: 'LeadSource',
          defaultValue: 'Website',
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'Promo_Website__c', 'Promo Website', 'review', 3, {
          payloadKey: 'Promo_Website__c',
          defaultValue: 'Enterprise Consultation',
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'Page_Website__c', 'Page Website', 'review', 4, {
          payloadKey: 'Page_Website__c',
          defaultValue: '/enterprise/form',
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'Source_Website__c', 'Source Website', 'review', 5, {
          payloadKey: 'Source_Website__c',
          defaultValue: 'Enterprise Website',
          isSystem: true,
        }),
        field(FormFieldType.CHECKBOX, 'I_am_an_existing_Link_Net_Customer__c', 'Existing Linknet Customer', 'review', 6, {
          payloadKey: 'I_am_an_existing_Link_Net_Customer__c',
          defaultValue: false,
        }),
      ],

      options: [
        // Department__c
        ...DEPARTMENT_OPTIONS('Department__c'),

        // Job_Level__c
        ...JOB_LEVEL_OPTIONS('Job_Level__c'),

        // Business_Industry__c
        ...INDUSTRY_OPTIONS('Business_Industry__c'),

        // Province__c / City__c / Kecamatan_Zipcode__c
        ...PROVINCE_OPTIONS('Province__c'),
        ...CITY_OPTIONS('City__c'),
        ...WARD_ZIP_OPTIONS('Kecamatan_Zipcode__c'),

        // Solution__c (MULTI_SELECT)
        option('Solution__c', 'Cloud', 'Cloud', 0),
        option('Solution__c', 'Corporate TV', 'Corporate TV', 1),
        option('Solution__c', 'Data Center', 'Data Center', 2),
        option('Solution__c', 'Data Communication', 'Data Communication', 3),
        option('Solution__c', 'Internet', 'Internet', 4),
        option('Solution__c', 'IOT', 'IOT', 5),
        option('Solution__c', 'Managed Service', 'Managed Service', 6),
        option('Solution__c', 'Penetration Test', 'Penetration Test', 7),
        option('Solution__c', 'SD-WAN', 'SD-WAN', 8),
        option('Solution__c', 'Voice', 'Voice', 9),
        option('Solution__c', 'VSAT', 'VSAT', 10),

        // Timeline__c
        option('Timeline__c', 'Planned Project', 'Planned Project', 0),
        option('Timeline__c', 'Urgent/ Unplanned', 'Urgent / Unplanned', 1),

        // Choose_your_Needs__c
        option('Choose_your_Needs__c', 'Billing/ Subscription/ Contract', 'Billing / Subscription / Contract', 0),
        option('Choose_your_Needs__c', 'Contact Sales Person', 'Contact Sales Person', 1),
        option('Choose_your_Needs__c', 'Customer Care', 'Customer Care', 2),
        option('Choose_your_Needs__c', 'Sales/ Product', 'Sales / Product', 3),

        // Procurement_Method__c
        option('Procurement_Method__c', 'Direct', 'Direct', 0),
        option('Procurement_Method__c', 'Short listed', 'Short Listed', 1),
        option('Procurement_Method__c', 'Tender', 'Tender', 2),

        // Business_Objective__c (CHECKBOX_GROUP)
        option('Business_Objective__c', 'Adjust the digital transformation', 'Adjust the digital transformation', 0),
        option('Business_Objective__c', 'Business Process Automation', 'Business Process Automation', 1),
        option('Business_Objective__c', 'Changing and uncertain business environment', 'Changing and uncertain business environment', 2),
        option('Business_Objective__c', 'Customer Engagement', 'Customer Engagement', 3),
        option('Business_Objective__c', 'Data Security and Privacy', 'Data Security and Privacy', 4),
      ],

      rules: [],

      responseConfigs: [
        response(
          'success-default',
          FormResponseType.SUCCESS,
          '/{locale}/enterprise/form/success',
          0,
          {
            isDefault: true,
            label: 'Submission berhasil',
            queryTemplate: { name: '{FirstName}', needs: 'Sales Inquiry' },
          },
        ),
      ],

      integrationConfigs: [
        crmIntegrationConfig(businessUnit, slug, 'Enterprise Consultation'),
      ],
    },
  });
}

// ─── Form 2: SMB Enterprise ───────────────────────────────────────────────────

function buildSmbEnterprise(): CreateFormModuleInput {
  const slug = 'smb-enterprise';
  const businessUnit = BusinessUnit.ENTERPRISE;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'SMB Enterprise Registration',
    description: '4-step SMB enterprise registration with coverage check and installation scheduling.',
    category: FormCategory.REGISTRATION,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Enterprise Website',
    promoWebsite: 'SMB Enterprise Registration',
    leadSource: 'Website',
    integrationProvider: FormIntegrationProvider.INTERNAL,
    submissionSettings: baseSubmissionSettings(slug, {
      primaryFieldPaths: {
        name: ['picName'],
        email: ['companyEmail'],
        phone: ['phoneNumber'],
      },
    }),
    definition: {
      steps: [
        { key: 'lokasi', title: 'Layanan & Lokasi Pemasangan', stepNumber: 1, actionLabel: 'Lanjut' },
        { key: 'personal_data', title: 'Data Diri', stepNumber: 2, actionLabel: 'Lanjut' },
        { key: 'schedule', title: 'Jadwal Instalasi', stepNumber: 3, actionLabel: 'Lanjut' },
        { key: 'review', title: 'Review', stepNumber: 4, isReviewStep: true, actionLabel: 'Konfirmasi & Daftar' },
      ],

      fields: [
        // ── Step 1: Layanan & Lokasi ───────────────────────────────────────
        field(FormFieldType.SELECT, 'internetService', 'Layanan Internet', 'lokasi', 1, {
          isRequired: true,
          placeholder: 'Pilih layanan',
        }),
        field(FormFieldType.SELECT, 'subscriptionTerm', 'Jangka Waktu Berlangganan', 'lokasi', 2, {
          isRequired: true,
          placeholder: 'Pilih durasi',
        }),
        field(FormFieldType.ADDRESS_LOOKUP, 'address', 'Alamat Pemasangan', 'lokasi', 3, {
          isRequired: true,
          placeholder: 'Cari alamat',
          uiConfig: { coverageCheckEnabled: true },
        }),
        // Hidden sub-fields populated by CoverageCheckInput component
        field(FormFieldType.HIDDEN, 'site_id', 'Site ID', 'lokasi', 4, { defaultValue: '' }),
        field(FormFieldType.HIDDEN, 'manualProvince', 'Provinsi (Manual)', 'lokasi', 5, { defaultValue: '' }),
        field(FormFieldType.HIDDEN, 'manualCity', 'Kota (Manual)', 'lokasi', 6, { defaultValue: '' }),
        field(FormFieldType.HIDDEN, 'manualZip', 'Kode Pos (Manual)', 'lokasi', 7, { defaultValue: '' }),
        field(FormFieldType.HIDDEN, 'manualDetailAddress', 'Alamat Detail (Manual)', 'lokasi', 8, { defaultValue: '' }),

        // ── Step 2: Data Diri ──────────────────────────────────────────────
        field(FormFieldType.TEXT, 'companyName', 'Nama Perusahaan', 'personal_data', 1, {
          isRequired: true,
          placeholder: 'Nama perusahaan',
        }),
        field(FormFieldType.TEXT, 'brandName', 'Nama Brand', 'personal_data', 2, {
          isRequired: true,
          placeholder: 'Nama brand',
        }),
        field(FormFieldType.TEXT, 'picName', 'Nama PIC', 'personal_data', 3, {
          isRequired: true,
          placeholder: 'Nama lengkap PIC',
        }),
        field(FormFieldType.SELECT, 'jobTitle', 'Jabatan', 'personal_data', 4, {
          isRequired: true,
          placeholder: 'Pilih jabatan',
        }),
        field(FormFieldType.EMAIL, 'companyEmail', 'Email', 'personal_data', 5, {
          isRequired: true,
          placeholder: 'email@perusahaan.com',
        }),
        field(FormFieldType.PHONE, 'phoneNumber', 'No HP', 'personal_data', 6, {
          isRequired: true,
          placeholder: '08xx-xxxx-xxxx',
        }),
        field(FormFieldType.CHECKBOX, 'isBillingSameAsInstallation', 'Alamat Penagihan = Alamat Instalasi', 'personal_data', 7, {
          defaultValue: false,
        }),
        field(FormFieldType.TEXTAREA, 'billingAddress', 'Alamat Penagihan', 'personal_data', 8, {
          isRequired: false, // conditional — required when isBillingSameAsInstallation=false
          placeholder: 'Masukkan alamat penagihan',
        }),

        // ── Step 3: Jadwal Instalasi ───────────────────────────────────────
        field(FormFieldType.RADIO, 'installDate', 'Tanggal Instalasi', 'schedule', 1, {
          isRequired: true,
          uiConfig: { variant: 'RadioCardDate', dynamicDays: 5 },
        }),
        field(FormFieldType.RADIO, 'installTimeSlot', 'Slot Waktu Instalasi', 'schedule', 2, {
          isRequired: true,
          defaultValue: '09:00 - 12:00',
          uiConfig: { variant: 'RadioCard' },
        }),
      ],

      options: [
        // internetService
        option('internetService', 'Broadband 30 Mbps - Rp 350.000/Bulan', 'Broadband 30 Mbps — Rp 350.000/Bulan', 0),
        option('internetService', 'Broadband 50 Mbps - Rp 400.000/Bulan', 'Broadband 50 Mbps — Rp 400.000/Bulan', 1),
        option('internetService', 'Broadband 100 Mbps - Rp 600.000/Bulan', 'Broadband 100 Mbps — Rp 600.000/Bulan', 2),
        option('internetService', 'Broadband 200 Mbps - Rp 1.250.000/Bulan', 'Broadband 200 Mbps — Rp 1.250.000/Bulan', 3),

        // subscriptionTerm
        option('subscriptionTerm', '12 Bulan', '12 Bulan', 0),
        option('subscriptionTerm', '24 Bulan', '24 Bulan', 1),
        option('subscriptionTerm', '36 Bulan', '36 Bulan', 2),

        // jobTitle
        option('jobTitle', 'Owner', 'Owner', 0),
        option('jobTitle', 'Direktur', 'Direktur', 1),
        option('jobTitle', 'Manager', 'Manager', 2),
        option('jobTitle', 'Supervisor', 'Supervisor', 3),
        option('jobTitle', 'Staff', 'Staff', 4),
        option('jobTitle', 'Lainnya', 'Lainnya', 5),

        // installTimeSlot (static options; installDate is dynamic at runtime)
        option('installTimeSlot', '09:00 - 12:00', '09:00 – 12:00', 0, { isDefault: true }),
        option('installTimeSlot', '15:00 - 18:00', '15:00 – 18:00', 1),
        option('installTimeSlot', '12:00 - 15:00', '12:00 – 15:00', 2, {
          metadata: { disabled: true },
        }),
      ],

      rules: [
        // billingAddress: show when isBillingSameAsInstallation = false
        rule(FormRuleType.SHOW, 0, {
          sourceFieldPath: 'isBillingSameAsInstallation',
          targetFieldPath: 'billingAddress',
          condition: { isBillingSameAsInstallation: false },
          actionConfig: { visible: true },
        }),
        // billingAddress: require when isBillingSameAsInstallation = false
        rule(FormRuleType.REQUIRE, 1, {
          sourceFieldPath: 'isBillingSameAsInstallation',
          targetFieldPath: 'billingAddress',
          condition: { isBillingSameAsInstallation: false },
          actionConfig: { required: true },
        }),
      ],

      responseConfigs: [
        response(
          'success-default',
          FormResponseType.SUCCESS,
          '/{locale}/enterprise/form/success',
          0,
          {
            isDefault: true,
            queryTemplate: { name: '{picName}' },
          },
        ),
      ],

      integrationConfigs: [],
    },
  });
}

// ─── Form 3: Enterprise Partnership ──────────────────────────────────────────

function buildEnterprisePartnership(): CreateFormModuleInput {
  const slug = 'enterprise-partnership';
  const businessUnit = BusinessUnit.ENTERPRISE;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Enterprise Partnership',
    description: '2-step partnership inquiry form for Enterprise BU (CRM Web-to-Lead).',
    category: FormCategory.PARTNERSHIP,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Enterprise Website',
    promoWebsite: 'Enterprise Partnership',
    leadSource: 'Website',
    integrationProvider: FormIntegrationProvider.CRM_WEB_TO_LEAD,
    submissionSettings: baseSubmissionSettings(slug, {
      primaryFieldPaths: {
        name: ['firstName', 'lastName'],
        email: ['companyEmail'],
        phone: ['phoneNumber'],
      },
    }),
    definition: {
      steps: [
        { key: 'profile', title: 'Profile', stepNumber: 1, actionLabel: 'Next' },
        { key: 'company', title: 'Company Details', stepNumber: 2, actionLabel: 'Next' },
        { key: 'review', title: 'Review', stepNumber: 3, isReviewStep: true, actionLabel: 'Submit' },
      ],

      fields: [
        // ── Step 1: Profile ────────────────────────────────────────────────
        field(FormFieldType.TEXT, 'firstName', 'First Name', 'profile', 1, {
          isRequired: true,
          payloadKey: 'FirstName',
          placeholder: 'Your first name',
        }),
        field(FormFieldType.TEXT, 'lastName', 'Last Name', 'profile', 2, {
          isRequired: true,
          payloadKey: 'LastName',
          placeholder: 'Your last name',
        }),
        field(FormFieldType.EMAIL, 'companyEmail', 'Company Email', 'profile', 3, {
          isRequired: true,
          payloadKey: 'Email',
          placeholder: 'your@company.com',
        }),
        field(FormFieldType.PHONE, 'phoneNumber', 'Phone Number', 'profile', 4, {
          isRequired: true,
          payloadKey: 'MobilePhone',
          placeholder: '08xx-xxxx-xxxx',
        }),
        field(FormFieldType.SELECT, 'department', 'Your Department', 'profile', 5, {
          isRequired: true,
          payloadKey: 'Department__c',
          placeholder: 'Select department',
        }),
        field(FormFieldType.SELECT, 'roleTitle', 'Your Role / Title', 'profile', 6, {
          isRequired: true,
          payloadKey: 'Job_Level__c',
          placeholder: 'Select role',
        }),
        field(FormFieldType.SELECT, 'typePartnership', 'Type of Partnership', 'profile', 7, {
          isRequired: true,
          payloadKey: 'Type_of_Partnership__c',
          placeholder: 'Select type',
        }),
        field(FormFieldType.TEXT, 'otherPartnershipType', 'Other Partnership Type', 'profile', 8, {
          isRequired: false, // conditional
          payloadKey: 'Other_Partnership_Type__c',
          placeholder: 'Describe partnership type',
        }),

        // ── Step 2: Company Details ────────────────────────────────────────
        field(FormFieldType.TEXT, 'companyName', 'Company Name', 'company', 1, {
          isRequired: true,
          payloadKey: 'Company',
          placeholder: 'Your company name',
        }),
        field(FormFieldType.SELECT, 'businessIndustry', 'Business Industry', 'company', 2, {
          isRequired: true,
          payloadKey: 'Business_Industry__c',
          placeholder: 'Select industry',
        }),
        field(FormFieldType.SELECT, 'province', 'Province', 'company', 3, {
          isRequired: true,
          payloadKey: 'Province__c',
          placeholder: 'Select province',
        }),
        field(FormFieldType.SELECT, 'city', 'City', 'company', 4, {
          isRequired: true,
          payloadKey: 'City__c',
          placeholder: 'Select city',
        }),
        field(FormFieldType.SELECT, 'wardZipCode', 'Ward / ZIP Code', 'company', 5, {
          isRequired: true,
          payloadKey: 'Kecamatan_Zipcode__c',
          placeholder: 'Select ward/zip',
        }),
        field(FormFieldType.TEXTAREA, 'detailAddress', 'Detail Address', 'company', 6, {
          isRequired: true,
          payloadKey: 'Building_Name__c',
          placeholder: 'Full address detail',
        }),

        // ── Step 3: Review (hidden CRM payload) ────────────────────────────
        field(FormFieldType.HIDDEN, 'Web_to_Lead__c', 'Web to Lead', 'review', 1, {
          payloadKey: 'Web_to_Lead__c',
          defaultValue: true,
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'LeadSource', 'Lead Source', 'review', 2, {
          payloadKey: 'LeadSource',
          defaultValue: 'Website',
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'Promo_Website__c', 'Promo Website', 'review', 3, {
          payloadKey: 'Promo_Website__c',
          defaultValue: 'Enterprise Partnership',
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'Page_Website__c', 'Page Website', 'review', 4, {
          payloadKey: 'Page_Website__c',
          defaultValue: '/enterprise/form',
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'Source_Website__c', 'Source Website', 'review', 5, {
          payloadKey: 'Source_Website__c',
          defaultValue: 'Enterprise Website',
          isSystem: true,
        }),
        field(FormFieldType.CHECKBOX, 'I_am_an_existing_Link_Net_Customer__c', 'Existing Linknet Customer', 'review', 6, {
          payloadKey: 'I_am_an_existing_Link_Net_Customer__c',
          defaultValue: false,
        }),
      ],

      options: [
        // department → same as Enterprise Consultation Department__c
        ...DEPARTMENT_OPTIONS('department'),

        // roleTitle → same as Enterprise Consultation Job_Level__c
        ...JOB_LEVEL_OPTIONS('roleTitle'),

        // typePartnership
        option('typePartnership', 'Referral Partnership', 'Referral Partnership', 0),
        option('typePartnership', 'Reseller Partnership', 'Reseller Partnership', 1),
        option('typePartnership', 'Strategic Alliance', 'Strategic Alliance', 2),
        option('typePartnership', 'Technology Partnership', 'Technology Partnership', 3),
        option('typePartnership', 'Others', 'Others', 4),

        // businessIndustry
        ...INDUSTRY_OPTIONS('businessIndustry'),

        // province / city / wardZipCode
        ...PROVINCE_OPTIONS('province'),
        ...CITY_OPTIONS('city'),
        ...WARD_ZIP_OPTIONS('wardZipCode'),
      ],

      rules: [
        // otherPartnershipType: show when typePartnership = "Others"
        rule(FormRuleType.SHOW, 0, {
          sourceFieldPath: 'typePartnership',
          targetFieldPath: 'otherPartnershipType',
          condition: { typePartnership: 'Others' },
          actionConfig: { visible: true },
        }),
        // otherPartnershipType: require when typePartnership = "Others"
        rule(FormRuleType.REQUIRE, 1, {
          sourceFieldPath: 'typePartnership',
          targetFieldPath: 'otherPartnershipType',
          condition: { typePartnership: 'Others' },
          actionConfig: { required: true },
        }),
      ],

      responseConfigs: [
        response(
          'success-partnership',
          FormResponseType.SUCCESS,
          '/{locale}/enterprise/form/success',
          0,
          {
            isDefault: true,
            label: 'Partnership inquiry submitted',
            queryTemplate: { name: '{firstName}', needs: 'Partnership' },
          },
        ),
      ],

      integrationConfigs: [
        crmIntegrationConfig(businessUnit, slug, 'Enterprise Partnership'),
      ],
    },
  });
}

// ─── Form 4: Suggest Enterprise (ROUTING_ONLY) ────────────────────────────────

function buildSuggestEnterprise(): CreateFormModuleInput {
  const slug = 'suggest-enterprise';
  const businessUnit = BusinessUnit.ENTERPRISE;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Suggest Enterprise',
    description: 'Routing-only wizard: select industry, business scale, and needs to be redirected to the right Enterprise solution page. No data is stored.',
    category: FormCategory.RECOMMENDATION,
    handlingMode: FormHandlingMode.ROUTING_ONLY,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Enterprise Website',
    promoWebsite: null,
    leadSource: null,
    integrationProvider: FormIntegrationProvider.NOOP,
    submissionSettings: baseSubmissionSettings(slug, {
      persistSubmission: false,
    }),
    definition: {
      steps: [
        { key: 'industry', title: 'Industry', stepNumber: 1, actionLabel: 'Next' },
        { key: 'business_scale', title: 'Business Scale', stepNumber: 2, actionLabel: 'Next' },
        { key: 'needs', title: 'Business Needs', stepNumber: 3, actionLabel: 'See Recommendations' },
      ],

      fields: [
        field(FormFieldType.RADIO, 'selectedIndustry', 'Industry', 'industry', 1, {
          defaultValue: 'all-industry',
          uiConfig: { variant: 'RadioCard', showImages: true },
        }),
        field(FormFieldType.RADIO, 'selectedScale', 'Business Scale', 'business_scale', 1, {
          defaultValue: 'all-scales',
          uiConfig: { variant: 'RadioCard', showImages: true },
        }),
        field(FormFieldType.CHECKBOX_GROUP, 'selectedNeeds', 'Business Needs', 'needs', 1, {
          defaultValue: [],
          uiConfig: { variant: 'CheckboxCard' },
        }),
      ],

      options: [
        // selectedIndustry (RADIO — RadioCard with image)
        option('selectedIndustry', 'all-industry', 'All Industry', 0, { isDefault: true }),
        option('selectedIndustry', 'agriculture-forestry-fishing', 'Agriculture, Forestry, Fishing', 1),
        option('selectedIndustry', 'entertainment-media-advertising', 'Entertainment, Media & Advertising', 2),
        option('selectedIndustry', 'financial-service-institutions', 'Financial Service Institutions', 3),
        option('selectedIndustry', 'food-beverage', 'Food & Beverage', 4),
        option('selectedIndustry', 'general-services', 'General Services', 5),
        option('selectedIndustry', 'government-affairs', 'Government & Affairs', 6),
        option('selectedIndustry', 'holding-company', 'Holding Company', 7),
        option('selectedIndustry', 'hospitality-services', 'Hospitality Services', 8),
        option('selectedIndustry', 'it-telecommunication', 'IT & Telecommunication', 9),
        option('selectedIndustry', 'manufacturing', 'Manufacturing', 10),
        option('selectedIndustry', 'mining-and-oil-gas', 'Mining and Oil & Gas', 11),
        option('selectedIndustry', 'property-construction', 'Property & Construction', 12),
        option('selectedIndustry', 'retail-trade', 'Retail Trade', 13),
        option('selectedIndustry', 'services', 'Services', 14),
        option('selectedIndustry', 'transportation-public-utilities', 'Transportation & Public Utilities', 15),

        // selectedScale (RADIO — RadioCard with image)
        option('selectedScale', 'all-scales', 'All Scales', 0, { isDefault: true }),
        option('selectedScale', 'small-business', 'Small Business (1–10 Employees)', 1),
        option('selectedScale', 'medium-enterprise', 'Medium Enterprise (11–50 Employees)', 2),
        option('selectedScale', 'large-enterprise', 'Large Enterprise (50+ Employees)', 3),

        // selectedNeeds (CHECKBOX_GROUP — CheckboxCard)
        option('selectedNeeds', 'digital-transformation', 'Adjust the digital transformation', 0),
        option('selectedNeeds', 'business-process-automation', 'Business Process Automation', 1),
        option('selectedNeeds', 'customer-engagement', 'Customer Engagement', 2),
        option('selectedNeeds', 'business-environment', 'Changing and uncertain business environment', 3),
        option('selectedNeeds', 'data-security-privacy', 'Data Security and Privacy', 4),
      ],

      rules: [],

      // Response configs for routing to product/solution pages
      responseConfigs: [
        response(
          'route-digital-transformation',
          FormResponseType.REDIRECT,
          '/{locale}/enterprise/solutions/digital-transformation',
          0,
          { matchCondition: { selectedNeeds: { includes: 'digital-transformation' } } },
        ),
        response(
          'route-business-automation',
          FormResponseType.REDIRECT,
          '/{locale}/enterprise/solutions/business-automation',
          1,
          { matchCondition: { selectedNeeds: { includes: 'business-process-automation' } } },
        ),
        response(
          'route-customer-engagement',
          FormResponseType.REDIRECT,
          '/{locale}/enterprise/solutions/customer-engagement',
          2,
          { matchCondition: { selectedNeeds: { includes: 'customer-engagement' } } },
        ),
        response(
          'route-data-security',
          FormResponseType.REDIRECT,
          '/{locale}/enterprise/solutions/data-security',
          3,
          { matchCondition: { selectedNeeds: { includes: 'data-security-privacy' } } },
        ),
        response(
          'route-default',
          FormResponseType.REDIRECT,
          '/{locale}/enterprise/solutions',
          99,
          { isDefault: true },
        ),
      ],

      integrationConfigs: [],
    },
  });
}

// ─── Form 5: Event Register (Enterprise BU) ───────────────────────────────────

function buildEventRegisterEnterprise(): CreateFormModuleInput {
  const slug = 'event-register';
  const businessUnit = BusinessUnit.ENTERPRISE;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Enterprise Event Registration',
    description: '2-step shared event registration form for Enterprise BU. Participant data is stored as REPEATER groups.',
    category: FormCategory.EVENT,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Enterprise Website',
    promoWebsite: 'Enterprise Event Registration',
    leadSource: 'Website',
    integrationProvider: FormIntegrationProvider.CRM_WEB_TO_LEAD,
    submissionSettings: baseSubmissionSettings(`${businessUnit.toLowerCase()}-${slug}`, {
      primaryFieldPaths: {
        name: ['companyName'],
        email: ['participants.companyEmail'],
        phone: ['participants.phoneNumber'],
      },
      repeaterLimits: { participants: 5 },
    }),
    definition: {
      steps: [
        { key: 'company', title: 'Company Details', stepNumber: 1, actionLabel: 'Next' },
        { key: 'participant', title: 'Participant Data', stepNumber: 2, actionLabel: 'Submit' },
      ],

      fields: [
        // ── Step 1: Company Details ────────────────────────────────────────
        field(FormFieldType.SELECT, 'participantCount', 'Jumlah Peserta', 'company', 1, {
          isRequired: false, // conditional: required when maxParticipants > 1
          payloadKey: 'Participant_Count__c',
          uiConfig: { dynamicMaxFromField: 'maxParticipants' },
        }),
        field(FormFieldType.TEXT, 'companyName', 'Company Name', 'company', 2, {
          isRequired: true,
          payloadKey: 'Company',
          placeholder: 'Your company name',
        }),
        field(FormFieldType.SELECT, 'businessIndustry', 'Business Industry', 'company', 3, {
          isRequired: true,
          payloadKey: 'Business_Industry__c',
          placeholder: 'Select industry',
        }),
        field(FormFieldType.SELECT, 'province', 'Province', 'company', 4, {
          isRequired: true,
          payloadKey: 'Province__c',
          placeholder: 'Select province',
        }),
        field(FormFieldType.SELECT, 'city', 'City', 'company', 5, {
          isRequired: true,
          payloadKey: 'City__c',
          placeholder: 'Select city',
        }),
        field(FormFieldType.SELECT, 'wardZipCode', 'Ward / ZIP Code', 'company', 6, {
          isRequired: true,
          payloadKey: 'Kecamatan_Zipcode__c',
          placeholder: 'Select ward/zip',
        }),
        field(FormFieldType.TEXTAREA, 'detailAddress', 'Detail Address', 'company', 7, {
          isRequired: true,
          payloadKey: 'Building_Name__c',
          placeholder: 'Full address detail',
        }),
        // Hidden context fields injected from the Event CMS page
        field(FormFieldType.HIDDEN, 'eventName', 'Event Name', 'company', 8, {
          payloadKey: 'Event_Name__c',
          defaultValue: '',
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'maxParticipants', 'Max Participants', 'company', 9, {
          defaultValue: 5,
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'Web_to_Lead__c', 'Web to Lead', 'company', 10, {
          payloadKey: 'Web_to_Lead__c',
          defaultValue: true,
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'LeadSource', 'Lead Source', 'company', 11, {
          payloadKey: 'LeadSource',
          defaultValue: 'Website',
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'Promo_Website__c', 'Promo Website', 'company', 12, {
          payloadKey: 'Promo_Website__c',
          defaultValue: '',
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'Page_Website__c', 'Page Website', 'company', 13, {
          payloadKey: 'Page_Website__c',
          defaultValue: '',
          isSystem: true,
        }),
        field(FormFieldType.HIDDEN, 'Source_Website__c', 'Source Website', 'company', 14, {
          payloadKey: 'Source_Website__c',
          defaultValue: 'Enterprise Website',
          isSystem: true,
        }),

        // ── Step 2: Participant REPEATER ───────────────────────────────────
        field(FormFieldType.REPEATER, 'participants', 'Participants', 'participant', 1, {
          isRequired: true,
          uiConfig: { minItems: 1, maxItems: 5, controlledByField: 'participantCount' },
        }),
        // Repeater child fields (parentFieldPath = 'participants')
        field(FormFieldType.TEXT, 'participants.firstName', 'First Name', 'participant', 2, {
          isRequired: true,
          payloadKey: 'FirstName',
          placeholder: 'First name',
          parentFieldPath: 'participants',
        }),
        field(FormFieldType.TEXT, 'participants.lastName', 'Last Name', 'participant', 3, {
          isRequired: true,
          payloadKey: 'LastName',
          placeholder: 'Last name',
          parentFieldPath: 'participants',
        }),
        field(FormFieldType.EMAIL, 'participants.companyEmail', 'Company Email', 'participant', 4, {
          isRequired: true,
          payloadKey: 'Email',
          placeholder: 'email@company.com',
          parentFieldPath: 'participants',
        }),
        field(FormFieldType.PHONE, 'participants.phoneNumber', 'Phone Number', 'participant', 5, {
          isRequired: true,
          payloadKey: 'MobilePhone',
          placeholder: '08xx-xxxx-xxxx',
          parentFieldPath: 'participants',
        }),
        field(FormFieldType.SELECT, 'participants.department', 'Department', 'participant', 6, {
          isRequired: true,
          payloadKey: 'Department__c',
          placeholder: 'Select department',
          parentFieldPath: 'participants',
        }),
        field(FormFieldType.SELECT, 'participants.roleTitle', 'Role / Title', 'participant', 7, {
          isRequired: true,
          payloadKey: 'Job_Level__c',
          placeholder: 'Select role',
          parentFieldPath: 'participants',
        }),
      ],

      options: [
        // participantCount (1–5; actual range driven by maxParticipants at runtime)
        option('participantCount', '1', '1 People', 0),
        option('participantCount', '2', '2 People', 1),
        option('participantCount', '3', '3 People', 2),
        option('participantCount', '4', '4 People', 3),
        option('participantCount', '5', '5 People', 4),

        // businessIndustry
        ...INDUSTRY_OPTIONS('businessIndustry'),

        // province / city / wardZipCode
        ...PROVINCE_OPTIONS('province'),
        ...CITY_OPTIONS('city'),
        ...WARD_ZIP_OPTIONS('wardZipCode'),

        // participants.department
        ...DEPARTMENT_OPTIONS('participants.department'),

        // participants.roleTitle
        ...JOB_LEVEL_OPTIONS('participants.roleTitle'),
      ],

      rules: [
        // participantCount: require when maxParticipants > 1
        rule(FormRuleType.REQUIRE, 0, {
          sourceFieldPath: 'maxParticipants',
          targetFieldPath: 'participantCount',
          condition: { maxParticipants: { gt: 1 } },
          actionConfig: { required: true },
        }),
        // Limit repeater max items
        rule(FormRuleType.LIMIT, 1, {
          targetFieldPath: 'participants',
          condition: {},
          actionConfig: { maxItems: 5 },
        }),
      ],

      responseConfigs: [
        response(
          'success-event',
          FormResponseType.SUCCESS,
          '/{locale}/enterprise/form/success',
          0,
          {
            isDefault: true,
            queryTemplate: { name: '{companyName}', needs: 'Register Event' },
          },
        ),
      ],

      integrationConfigs: [
        crmIntegrationConfig(businessUnit, slug, 'Enterprise Event Registration'),
      ],
    },
  });
}

// ─── Upsert helpers ───────────────────────────────────────────────────────────

function toUpdateInput(seed: CreateFormModuleInput): UpdateFormModuleInput {
  return {
    businessUnit: seed.businessUnit,
    slug: seed.slug,
    name: seed.name,
    description: seed.description,
    category: seed.category,
    handlingMode: seed.handlingMode,
    status: seed.status,
    schemaVersion: seed.schemaVersion,
    defaultLocale: seed.defaultLocale,
    publicPath: seed.publicPath,
    sourceWebsite: seed.sourceWebsite,
    promoWebsite: seed.promoWebsite,
    leadSource: seed.leadSource,
    integrationProvider: seed.integrationProvider,
    integrationConfig: seed.integrationConfig,
    submissionSettings: seed.submissionSettings,
    replaceDefinition: true,
    definition: seed.definition,
  };
}

function isManagedByThisSeeder(value: Prisma.JsonValue | null): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const managedBy = (value as Record<string, unknown>).managedBy;
  return managedBy === ENTERPRISE_SEED_OWNER || managedBy === BOOTSTRAP_OWNER_LEGACY;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Seeds all 5 Enterprise form modules.
 * Safe to run multiple times — idempotent upsert.
 */
export async function seedEnterpriseforms(prismaClient?: PrismaClient): Promise<SeedResult> {
  const client = prismaClient ?? prisma;
  const service = new FormModuleService(client);

  const seeds: CreateFormModuleInput[] = [
    buildEnterpriseConsultation(),
    buildSmbEnterprise(),
    buildEnterprisePartnership(),
    buildSuggestEnterprise(),
    buildEventRegisterEnterprise(),
  ];

  const result: SeedResult = { created: 0, updated: 0, skipped: 0 };

  console.log('\n🏢 Seeding Enterprise form modules...');

  for (const seed of seeds) {
    const label = `ENTERPRISE/${seed.slug}`;

    const existing = await client.formModule.findFirst({
      where: { businessUnit: seed.businessUnit, slug: seed.slug },
      select: { id: true, deletedAt: true, submissionSettings: true },
    });

    if (!existing) {
      await service.createFormModule(seed);
      result.created += 1;
      console.log(`   ✅ Created ${label}`);
      continue;
    }

    if (existing.deletedAt) {
      result.skipped += 1;
      console.log(`   ⏭️  Skipped (archived) ${label}`);
      continue;
    }

    if (!isManagedByThisSeeder(existing.submissionSettings)) {
      result.skipped += 1;
      console.log(`   ⏭️  Skipped (manually managed) ${label}`);
      continue;
    }

    await service.updateFormModule(existing.id, toUpdateInput(seed));
    result.updated += 1;
    console.log(`   🔄 Updated ${label}`);
  }

  console.log(
    `\n✅ Enterprise forms seed complete — created=${result.created}, updated=${result.updated}, skipped=${result.skipped}\n`,
  );

  return result;
}

// ─── Standalone runner ────────────────────────────────────────────────────────

if (require.main === module) {
  seedEnterpriseforms()
    .catch((err) => {
      console.error('❌ Enterprise forms seed failed:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
