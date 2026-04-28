/**
 * seed-fiber-forms.ts
 *
 * Phase 2 — Seeder: Fiber Form Registration (Multi-BU)
 *
 * Scope: 3 Fiber form modules
 *   1. fiber-registration  (REGISTRATION / SUBMISSION / Internal + file upload)
 *   2. fiber-inquiry       (INQUIRY / SUBMISSION / Internal)
 *   3. event-register      (EVENT / SUBMISSION / CRM Web-to-Lead) — Fiber BU only
 *
 * Rules:
 *   ✅ Idempotent via create-or-update pattern
 *   ✅ Uses FormModuleService for atomicity
 *   ✅ Skips modules not managed by this seeder
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

const FIBER_SEED_OWNER = 'fiber-forms-seed';
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

function pathKey(path: string): string {
  const parts = path.split('.');
  return parts[parts.length - 1]!;
}

function publicPath(businessUnit: BusinessUnit, slug: string): string {
  const bu = businessUnit.toLowerCase();
  return `/{locale}/${bu}/forms/${slug}`;
}

function baseSubmissionSettings(seedKey: string, extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    managedBy: FIBER_SEED_OWNER,
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

// ─── Shared option sets (Fiber) ───────────────────────────────────────────────

const FIBER_PROVINCE_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  option(fieldPath, 'DKI Jakarta', 'DKI Jakarta', 0),
  option(fieldPath, 'Jawa Barat', 'Jawa Barat', 1),
  option(fieldPath, 'Jawa Tengah', 'Jawa Tengah', 2),
  option(fieldPath, 'DI Yogyakarta', 'DI Yogyakarta', 3),
  option(fieldPath, 'Jawa Timur', 'Jawa Timur', 4),
  option(fieldPath, 'Banten', 'Banten', 5),
];

/**
 * City options for Fiber forms — slightly smaller set than Enterprise.
 * Metro.city for frontend filtering.
 */
const FIBER_CITY_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  // DKI Jakarta
  option(fieldPath, 'Jakarta Selatan', 'Jakarta Selatan', 0, { metadata: { province: 'DKI Jakarta' } }),
  option(fieldPath, 'Jakarta Barat', 'Jakarta Barat', 1, { metadata: { province: 'DKI Jakarta' } }),
  // Jawa Barat
  option(fieldPath, 'Bandung', 'Bandung', 2, { metadata: { province: 'Jawa Barat' } }),
  option(fieldPath, 'Bekasi', 'Bekasi', 3, { metadata: { province: 'Jawa Barat' } }),
  // Jawa Tengah
  option(fieldPath, 'Semarang', 'Semarang', 4, { metadata: { province: 'Jawa Tengah' } }),
  // DI Yogyakarta
  option(fieldPath, 'Yogyakarta', 'Yogyakarta', 5, { metadata: { province: 'DI Yogyakarta' } }),
  // Jawa Timur
  option(fieldPath, 'Surabaya', 'Surabaya', 6, { metadata: { province: 'Jawa Timur' } }),
  // Banten
  option(fieldPath, 'Tangerang', 'Tangerang', 7, { metadata: { province: 'Banten' } }),
];

/**
 * ZIP/kecamatan options for Fiber forms.
 * value = zipCode string, metadata.city = parent city.
 */
const FIBER_ZIP_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  option(fieldPath, '12190', '12190 — Jakarta Selatan', 0, { metadata: { city: 'Jakarta Selatan' } }),
  option(fieldPath, '12870', '12870 — Jakarta Selatan', 1, { metadata: { city: 'Jakarta Selatan' } }),
  option(fieldPath, '11530', '11530 — Jakarta Barat', 2, { metadata: { city: 'Jakarta Barat' } }),
  option(fieldPath, '11610', '11610 — Jakarta Barat', 3, { metadata: { city: 'Jakarta Barat' } }),
  option(fieldPath, '40115', '40115 — Bandung', 4, { metadata: { city: 'Bandung' } }),
  option(fieldPath, '40286', '40286 — Bandung', 5, { metadata: { city: 'Bandung' } }),
  option(fieldPath, '17121', '17121 — Bekasi', 6, { metadata: { city: 'Bekasi' } }),
  option(fieldPath, '17144', '17144 — Bekasi', 7, { metadata: { city: 'Bekasi' } }),
  option(fieldPath, '50135', '50135 — Semarang', 8, { metadata: { city: 'Semarang' } }),
  option(fieldPath, '50241', '50241 — Semarang', 9, { metadata: { city: 'Semarang' } }),
  option(fieldPath, '55281', '55281 — Yogyakarta', 10, { metadata: { city: 'Yogyakarta' } }),
  option(fieldPath, '55198', '55198 — Yogyakarta', 11, { metadata: { city: 'Yogyakarta' } }),
  option(fieldPath, '60231', '60231 — Surabaya', 12, { metadata: { city: 'Surabaya' } }),
  option(fieldPath, '60189', '60189 — Surabaya', 13, { metadata: { city: 'Surabaya' } }),
  option(fieldPath, '15143', '15143 — Tangerang', 14, { metadata: { city: 'Tangerang' } }),
  option(fieldPath, '15157', '15157 — Tangerang', 15, { metadata: { city: 'Tangerang' } }),
];

/** Role options for Fiber Registration */
const FIBER_REG_ROLE_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  option(fieldPath, 'Owner', 'Owner', 0),
  option(fieldPath, 'Director', 'Director', 1),
  option(fieldPath, 'Head of Operation', 'Head of Operation', 2),
  option(fieldPath, 'Business Development', 'Business Development', 3),
  option(fieldPath, 'Network Engineer', 'Network Engineer', 4),
  option(fieldPath, 'Procurement', 'Procurement', 5),
];

/** Role options for Fiber Inquiry */
const FIBER_INQUIRY_ROLE_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  option(fieldPath, 'Owner', 'Owner', 0),
  option(fieldPath, 'Director', 'Director', 1),
  option(fieldPath, 'Manager', 'Manager', 2),
  option(fieldPath, 'Supervisor', 'Supervisor', 3),
  option(fieldPath, 'Procurement', 'Procurement', 4),
  option(fieldPath, 'IT Lead', 'IT Lead', 5),
  option(fieldPath, 'Network Engineer', 'Network Engineer', 6),
  option(fieldPath, 'Business Development', 'Business Development', 7),
  option(fieldPath, 'Other', 'Other', 8),
];

/** Industry options for Fiber event-register (reuse same 15 as Enterprise) */
const FIBER_INDUSTRY_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
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

const FIBER_DEPT_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  option(fieldPath, 'IT/ Network', 'IT / Network', 0),
  option(fieldPath, 'Management', 'Management', 1),
  option(fieldPath, 'Supply Chain Management/ Procurement/ GA', 'Supply Chain / Procurement / GA', 2),
  option(fieldPath, 'Other', 'Other', 3),
];

const FIBER_JOB_LEVEL_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
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

// ─── Form 1: Fiber Registration ───────────────────────────────────────────────

function buildFiberRegistration(): CreateFormModuleInput {
  const slug = 'fiber-registration';
  const businessUnit = BusinessUnit.FIBER;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Fiber Registration',
    description: '5-step wholesale fiber partnership registration with legal documents upload.',
    category: FormCategory.REGISTRATION,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Fiber Website',
    promoWebsite: 'Fiber Registration',
    leadSource: 'Website',
    integrationProvider: FormIntegrationProvider.INTERNAL,
    submissionSettings: baseSubmissionSettings(slug, {
      primaryFieldPaths: {
        name: ['fullName'],
        email: ['companyEmail'],
        phone: ['phoneNumber'],
      },
      fileUploadEnabled: true,
      incompleteRedirectPath: '/{locale}/fiber/form/incomplete',
    }),
    definition: {
      steps: [
        { key: 'personal', title: 'Personal Details', stepNumber: 1, actionLabel: 'Next' },
        { key: 'corporate', title: 'Corporate Profile & Legal', stepNumber: 2, actionLabel: 'Next' },
        { key: 'infrastructure', title: 'Infrastructure Details & Requirements', stepNumber: 3, actionLabel: 'Next' },
        { key: 'documents', title: 'Upload Documents', stepNumber: 4, actionLabel: 'Review' },
        { key: 'review', title: 'Review', stepNumber: 5, isReviewStep: true, actionLabel: 'Confirm & Submit' },
      ],

      fields: [
        // ── Step 1: Personal ───────────────────────────────────────────────
        field(FormFieldType.TEXT, 'fullName', 'Full Name', 'personal', 1, {
          isRequired: true,
          placeholder: 'Your full name',
        }),
        field(FormFieldType.EMAIL, 'companyEmail', 'Company Email', 'personal', 2, {
          isRequired: true,
          placeholder: 'your@company.com',
        }),
        field(FormFieldType.PHONE, 'phoneNumber', 'Phone Number', 'personal', 3, {
          isRequired: true,
          placeholder: '08xx-xxxx-xxxx',
        }),
        field(FormFieldType.SELECT, 'yourRole', 'Your Role / Title', 'personal', 4, {
          isRequired: true,
          placeholder: 'Select your role',
        }),

        // ── Step 2: Corporate ──────────────────────────────────────────────
        field(FormFieldType.TEXT, 'companyName', 'Company Name', 'corporate', 1, {
          isRequired: true,
          placeholder: 'PT / CV ...',
        }),
        field(FormFieldType.TEXT, 'directorName', 'Name of Incharge Director', 'corporate', 2, {
          isRequired: true,
          placeholder: 'Full name of director',
        }),
        field(FormFieldType.SELECT, 'province', 'Province', 'corporate', 3, {
          isRequired: true,
          placeholder: 'Select province',
        }),
        field(FormFieldType.SELECT, 'city', 'City', 'corporate', 4, {
          isRequired: true,
          placeholder: 'Select city',
        }),
        field(FormFieldType.SELECT, 'zipCode', 'Ward / ZIP Code', 'corporate', 5, {
          isRequired: true,
          placeholder: 'Select zip code',
        }),
        field(FormFieldType.TEXTAREA, 'detailAddress', 'Detail Address', 'corporate', 6, {
          isRequired: true,
          placeholder: 'Full office address',
        }),
        field(FormFieldType.DATE, 'companyEstablishmentDate', 'Company Establishment Date', 'corporate', 7, {
          isRequired: true,
        }),
        field(FormFieldType.DATE, 'companyOperatingSince', 'Company Operating Since', 'corporate', 8, {
          isRequired: true,
        }),
        field(FormFieldType.TEXT, 'nibCompanyNumber', 'NIB Company Number', 'corporate', 9, {
          isRequired: true,
          placeholder: 'Nomor Induk Berusaha',
        }),
        field(FormFieldType.TEXT, 'npwpCompanyNumber', 'No NPWP Company', 'corporate', 10, {
          isRequired: true,
          placeholder: 'XX.XXX.XXX.X-XXX.XXX',
        }),
        field(FormFieldType.TEXT, 'sppkpCompanyNumber', 'Company SPPKP Number', 'corporate', 11, {
          isRequired: true,
          placeholder: 'Nomor SPPKP',
        }),
        field(FormFieldType.TEXT, 'licensePermitNumber', 'License Permit Number', 'corporate', 12, {
          isRequired: true,
          placeholder: 'No. izin usaha',
        }),
        field(FormFieldType.TEXT, 'apjiiMembershipNumber', 'APJII Membership Number', 'corporate', 13, {
          isRequired: true,
          placeholder: 'No. anggota APJII',
        }),
        field(FormFieldType.DATE, 'apjiiMembershipActiveDate', 'APJII Membership Active Date', 'corporate', 14, {
          isRequired: true,
        }),

        // ── Step 3: Infrastructure ─────────────────────────────────────────
        field(FormFieldType.NUMBER, 'employeeCount', 'Number of Employees', 'infrastructure', 1, {
          isRequired: true,
          placeholder: 'e.g. 150',
          validation: { min: 1 },
        }),
        field(FormFieldType.NUMBER, 'homepassedCount', 'Number of Existing Homepassed', 'infrastructure', 2, {
          isRequired: true,
          placeholder: 'e.g. 5000',
          validation: { min: 0 },
        }),
        field(FormFieldType.NUMBER, 'customerCount', 'Number of Existing Customers', 'infrastructure', 3, {
          isRequired: true,
          placeholder: 'e.g. 2000',
          validation: { min: 0 },
        }),
        field(FormFieldType.TEXTAREA, 'coverageArea', 'Coverage Area', 'infrastructure', 4, {
          isRequired: true,
          placeholder: 'Describe coverage area (districts, cities)',
        }),
        field(FormFieldType.TEXTAREA, 'ispInfrastructureCoverage', 'ISP Infrastructure Coverage', 'infrastructure', 5, {
          isRequired: true,
          placeholder: 'Describe ISP infrastructure coverage',
        }),
        field(FormFieldType.NUMBER, 'productTypeCount', 'Types of Products Offered', 'infrastructure', 6, {
          isRequired: true,
          placeholder: 'e.g. 3',
          validation: { min: 1 },
        }),

        // ── Step 4: Documents (companySignatureFile wajib, sisanya opsional) ─
        field(FormFieldType.FILE, 'companySignatureFile', 'Upload Signature with Company Stamp', 'documents', 1, {
          isRequired: true,
          validation: { accept: ['application/pdf', 'image/jpeg', 'image/png'], maxSizeMB: 10 },
          uiConfig: { hint: 'Wajib. PDF / JPG / PNG, maks. 10 MB.' },
        }),
        field(FormFieldType.FILE, 'npwpCompanyFile', 'NPWP Company Document', 'documents', 2, {
          isRequired: false,
          validation: { accept: ['application/pdf', 'image/jpeg', 'image/png'], maxSizeMB: 10 },
          uiConfig: { hint: 'Opsional. PDF / JPG / PNG.' },
        }),
        field(FormFieldType.FILE, 'nibCompanyFile', 'NIB Company Document', 'documents', 3, {
          isRequired: false,
          validation: { accept: ['application/pdf', 'image/jpeg', 'image/png'], maxSizeMB: 10 },
          uiConfig: { hint: 'Opsional.' },
        }),
        field(FormFieldType.FILE, 'apjiiCertificateFile', 'APJII Certificate', 'documents', 4, {
          isRequired: false,
          validation: { accept: ['application/pdf', 'image/jpeg', 'image/png'], maxSizeMB: 10 },
          uiConfig: { hint: 'Opsional.' },
        }),
        field(FormFieldType.FILE, 'linknetProductStatementFile', 'Linknet Product Statement', 'documents', 5, {
          isRequired: false,
          validation: { accept: ['application/pdf', 'image/jpeg', 'image/png'], maxSizeMB: 10 },
          uiConfig: { hint: 'Opsional.' },
        }),
        field(FormFieldType.FILE, 'previousYearFinancialReportFile', 'Previous Year Financial Report', 'documents', 6, {
          isRequired: false,
          validation: { accept: ['application/pdf'], maxSizeMB: 20 },
          uiConfig: { hint: 'Opsional. PDF, maks. 20 MB.' },
        }),
        field(FormFieldType.FILE, 'companyDeedFile', 'Company Deed (Akta Perusahaan)', 'documents', 7, {
          isRequired: false,
          validation: { accept: ['application/pdf', 'image/jpeg', 'image/png'], maxSizeMB: 10 },
          uiConfig: { hint: 'Opsional.' },
        }),
        field(FormFieldType.FILE, 'deedAmendmentFile', 'Deed Amendment (Perubahan Akta)', 'documents', 8, {
          isRequired: false,
          validation: { accept: ['application/pdf', 'image/jpeg', 'image/png'], maxSizeMB: 10 },
          uiConfig: { hint: 'Opsional.' },
        }),
        field(FormFieldType.FILE, 'corporateTaxReportFile', 'Corporate Tax Report', 'documents', 9, {
          isRequired: false,
          validation: { accept: ['application/pdf'], maxSizeMB: 20 },
          uiConfig: { hint: 'Opsional. PDF, maks. 20 MB.' },
        }),

        // ── Review: Confirmation checkboxes ───────────────────────────────
        field(FormFieldType.CHECKBOX, 'utilizationConfirmed', 'Konfirmasi Pemanfaatan Infrastruktur Linknet Fiber', 'review', 1, {
          isRequired: true,
          defaultValue: false,
          validation: { mustBeTrue: true },
        }),
        field(FormFieldType.CHECKBOX, 'wholesaleProductConfirmed', 'Konfirmasi Linknet Fiber Wholesale Product', 'review', 2, {
          isRequired: true,
          defaultValue: false,
          validation: { mustBeTrue: true },
        }),
      ],

      options: [
        // yourRole
        ...FIBER_REG_ROLE_OPTIONS('yourRole'),
        // province / city / zipCode
        ...FIBER_PROVINCE_OPTIONS('province'),
        ...FIBER_CITY_OPTIONS('city'),
        ...FIBER_ZIP_OPTIONS('zipCode'),
      ],

      rules: [],

      responseConfigs: [
        response(
          'success-default',
          FormResponseType.SUCCESS,
          '/{locale}/fiber/form/success',
          0,
          {
            isDefault: true,
            label: 'Registrasi berhasil',
            queryTemplate: { name: '{fullName}' },
          },
        ),
        response(
          'incomplete',
          FormResponseType.INCOMPLETE,
          '/{locale}/fiber/form/incomplete',
          1,
          {
            label: 'Dokumen belum lengkap',
            queryTemplate: { name: '{fullName}' },
          },
        ),
      ],

      integrationConfigs: [],
    },
  });
}

// ─── Form 2: Fiber Inquiry ────────────────────────────────────────────────────

function buildFiberInquiry(): CreateFormModuleInput {
  const slug = 'fiber-inquiry';
  const businessUnit = BusinessUnit.FIBER;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Fiber Inquiry',
    description: '4-step fiber inquiry form for Sales Inquiry, Support, and Partnership needs.',
    category: FormCategory.INQUIRY,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Fiber Website',
    promoWebsite: 'Fiber Inquiry',
    leadSource: 'Website',
    integrationProvider: FormIntegrationProvider.INTERNAL,
    submissionSettings: baseSubmissionSettings(slug, {
      primaryFieldPaths: {
        name: ['fullName'],
        email: ['companyEmail'],
        phone: ['phoneNumber'],
      },
    }),
    definition: {
      steps: [
        { key: 'needs_personal', title: 'Needs & Personal Details', stepNumber: 1, actionLabel: 'Next' },
        { key: 'company', title: 'Company Details', stepNumber: 2, actionLabel: 'Next' },
        { key: 'services', title: 'Services & Message', stepNumber: 3, actionLabel: 'Review' },
        { key: 'review', title: 'Review', stepNumber: 4, isReviewStep: true, actionLabel: 'Confirm & Submit' },
      ],

      fields: [
        // ── Step 1: Needs & Personal ──────────────────────────────────────
        field(FormFieldType.SELECT, 'needs', 'Your Needs', 'needs_personal', 1, {
          isRequired: true,
          placeholder: 'Select inquiry type',
        }),
        field(FormFieldType.TEXT, 'fullName', 'Full Name', 'needs_personal', 2, {
          isRequired: true,
          placeholder: 'Your full name',
        }),
        field(FormFieldType.EMAIL, 'companyEmail', 'Company Email', 'needs_personal', 3, {
          isRequired: true,
          placeholder: 'your@company.com',
        }),
        field(FormFieldType.PHONE, 'phoneNumber', 'Phone Number', 'needs_personal', 4, {
          isRequired: true,
          placeholder: '08xx-xxxx-xxxx',
        }),
        field(FormFieldType.SELECT, 'yourRole', 'Your Role / Title', 'needs_personal', 5, {
          isRequired: true,
          placeholder: 'Select your role',
        }),

        // ── Step 2: Company ───────────────────────────────────────────────
        field(FormFieldType.TEXT, 'companyName', 'Company Name', 'company', 1, {
          isRequired: true,
          placeholder: 'Company / organization name',
        }),
        field(FormFieldType.TEXT, 'brandName', 'Brand Name', 'company', 2, {
          isRequired: true,
          placeholder: 'Operating brand name',
        }),
        field(FormFieldType.SELECT, 'province', 'Province', 'company', 3, {
          isRequired: true,
          placeholder: 'Select province',
        }),
        field(FormFieldType.SELECT, 'city', 'City', 'company', 4, {
          isRequired: true,
          placeholder: 'Select city',
        }),
        field(FormFieldType.SELECT, 'zipCode', 'Ward / ZIP Code', 'company', 5, {
          isRequired: true,
          placeholder: 'Select zip code',
        }),
        field(FormFieldType.TEXTAREA, 'detailAddress', 'Detail Address', 'company', 6, {
          isRequired: true,
          placeholder: 'Full office address',
        }),

        // ── Step 3: Services & Message ────────────────────────────────────
        // 'services' field: shown & required ONLY when needs = 'Sales Inquiry'
        field(FormFieldType.SELECT, 'services', 'Services', 'services', 1, {
          isRequired: false, // conditional rule below handles required
          placeholder: 'Select service of interest',
        }),
        field(FormFieldType.TEXTAREA, 'message', 'Message', 'services', 2, {
          isRequired: true,
          placeholder: 'Describe your needs in detail',
        }),
      ],

      options: [
        // needs
        option('needs', 'Sales Inquiry', 'Sales Inquiry', 0),
        option('needs', 'Support', 'Support', 1),
        option('needs', 'Partnership', 'Partnership', 2),

        // yourRole
        ...FIBER_INQUIRY_ROLE_OPTIONS('yourRole'),

        // province / city / zipCode
        ...FIBER_PROVINCE_OPTIONS('province'),
        ...FIBER_CITY_OPTIONS('city'),
        ...FIBER_ZIP_OPTIONS('zipCode'),

        // services
        option('services', 'Dedicated Internet', 'Dedicated Internet', 0),
        option('services', 'Metro Ethernet', 'Metro Ethernet', 1),
        option('services', 'IP Transit', 'IP Transit', 2),
        option('services', 'Data Center Connectivity', 'Data Center Connectivity', 3),
        option('services', 'Managed Service', 'Managed Service', 4),
        option('services', 'Fiber Backbone Partnership', 'Fiber Backbone Partnership', 5),
      ],

      rules: [
        // services: shown only when needs = 'Sales Inquiry'
        rule(FormRuleType.SHOW, 0, {
          sourceFieldPath: 'needs',
          targetFieldPath: 'services',
          condition: { needs: 'Sales Inquiry' },
          actionConfig: { visible: true },
        }),
        // services: required only when needs = 'Sales Inquiry'
        rule(FormRuleType.REQUIRE, 1, {
          sourceFieldPath: 'needs',
          targetFieldPath: 'services',
          condition: { needs: 'Sales Inquiry' },
          actionConfig: { required: true },
        }),
      ],

      responseConfigs: [
        response(
          'success-default',
          FormResponseType.SUCCESS,
          '/{locale}/fiber/form/success',
          0,
          {
            isDefault: true,
            label: 'Inquiry berhasil',
            queryTemplate: { name: '{fullName}', needs: '{needs}' },
          },
        ),
      ],

      integrationConfigs: [],
    },
  });
}

// ─── Form 3: Event Register (Fiber) ──────────────────────────────────────────

function buildEventRegisterFiber(): CreateFormModuleInput {
  const slug = 'event-register';
  const businessUnit = BusinessUnit.FIBER;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Fiber Event Registration',
    description: '2-step shared event registration form for Fiber BU. Participant data is stored as REPEATER groups.',
    category: FormCategory.EVENT,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Fiber Website',
    promoWebsite: 'Fiber Event Registration',
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
        // ── Step 1: Company ────────────────────────────────────────────────
        field(FormFieldType.SELECT, 'participantCount', 'Jumlah Peserta', 'company', 1, {
          isRequired: false,
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
        // Hidden context fields from Event CMS page
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
          defaultValue: 'Fiber Website',
          isSystem: true,
        }),

        // ── Step 2: Participant REPEATER ──────────────────────────────────
        field(FormFieldType.REPEATER, 'participants', 'Participants', 'participant', 1, {
          isRequired: true,
          uiConfig: { minItems: 1, maxItems: 5, controlledByField: 'participantCount' },
        }),
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
        option('participantCount', '1', '1 People', 0),
        option('participantCount', '2', '2 People', 1),
        option('participantCount', '3', '3 People', 2),
        option('participantCount', '4', '4 People', 3),
        option('participantCount', '5', '5 People', 4),

        ...FIBER_INDUSTRY_OPTIONS('businessIndustry'),
        ...FIBER_PROVINCE_OPTIONS('province'),
        ...FIBER_CITY_OPTIONS('city'),
        ...FIBER_ZIP_OPTIONS('wardZipCode'),
        ...FIBER_DEPT_OPTIONS('participants.department'),
        ...FIBER_JOB_LEVEL_OPTIONS('participants.roleTitle'),
      ],

      rules: [
        rule(FormRuleType.REQUIRE, 0, {
          sourceFieldPath: 'maxParticipants',
          targetFieldPath: 'participantCount',
          condition: { maxParticipants: { gt: 1 } },
          actionConfig: { required: true },
        }),
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
          '/{locale}/fiber/form/success',
          0,
          {
            isDefault: true,
            queryTemplate: { name: '{companyName}', needs: 'Register Event' },
          },
        ),
      ],

      integrationConfigs: [
        crmIntegrationConfig(businessUnit, slug, 'Fiber Event Registration'),
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
  return managedBy === FIBER_SEED_OWNER || managedBy === BOOTSTRAP_OWNER_LEGACY;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Seeds all 3 Fiber form modules.
 * Safe to run multiple times — idempotent upsert.
 */
export async function seedFiberForms(prismaClient?: PrismaClient): Promise<SeedResult> {
  const client = prismaClient ?? prisma;
  const service = new FormModuleService(client);

  const seeds: CreateFormModuleInput[] = [
    buildFiberRegistration(),
    buildFiberInquiry(),
    buildEventRegisterFiber(),
  ];

  const result: SeedResult = { created: 0, updated: 0, skipped: 0 };

  console.log('\n📡 Seeding Fiber form modules...');

  for (const seed of seeds) {
    const label = `FIBER/${seed.slug}`;

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
    `\n✅ Fiber forms seed complete — created=${result.created}, updated=${result.updated}, skipped=${result.skipped}\n`,
  );

  return result;
}

// ─── Standalone runner ────────────────────────────────────────────────────────

if (require.main === module) {
  seedFiberForms()
    .catch((err) => {
      console.error('❌ Fiber forms seed failed:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
