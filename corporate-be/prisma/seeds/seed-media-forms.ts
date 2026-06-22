/**
 * seed-media-forms.ts
 *
 * Phase 2 — Seeder: Media Form Registration (Multi-BU)
 *
 * Scope: 2 Media form modules
 *   1. media-registration  (REGISTRATION / SUBMISSION / Internal)
 *   2. event-register      (EVENT / SUBMISSION / CRM Web-to-Lead) — Media BU only
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

const MEDIA_SEED_OWNER = 'media-forms-seed';
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
    managedBy: MEDIA_SEED_OWNER,
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

// ─── Shared option sets (Media) ───────────────────────────────────────────────

const MEDIA_PROVINCE_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  option(fieldPath, 'DKI Jakarta', 'DKI Jakarta', 0),
  option(fieldPath, 'Jawa Barat', 'Jawa Barat', 1),
  option(fieldPath, 'Jawa Tengah', 'Jawa Tengah', 2),
  option(fieldPath, 'DI Yogyakarta', 'DI Yogyakarta', 3),
  option(fieldPath, 'Jawa Timur', 'Jawa Timur', 4),
  option(fieldPath, 'Banten', 'Banten', 5),
];

/**
 * City options for Media forms — matches reference modal CITY_BY_PROVINCE.
 */
const MEDIA_CITY_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
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
  // DI Yogyakarta
  option(fieldPath, 'Yogyakarta', 'Yogyakarta', 8, { metadata: { province: 'DI Yogyakarta' } }),
  option(fieldPath, 'Sleman', 'Sleman', 9, { metadata: { province: 'DI Yogyakarta' } }),
  // Jawa Timur
  option(fieldPath, 'Surabaya', 'Surabaya', 10, { metadata: { province: 'Jawa Timur' } }),
  option(fieldPath, 'Malang', 'Malang', 11, { metadata: { province: 'Jawa Timur' } }),
  // Banten
  option(fieldPath, 'Tangerang', 'Tangerang', 12, { metadata: { province: 'Banten' } }),
  option(fieldPath, 'Serpong', 'Serpong', 13, { metadata: { province: 'Banten' } }),
];

/**
 * ZIP options for Media forms — matches reference modal ZIP_BY_CITY.
 */
const MEDIA_ZIP_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  option(fieldPath, '12190', '12190 — Jakarta Selatan', 0, { metadata: { city: 'Jakarta Selatan' } }),
  option(fieldPath, '12870', '12870 — Jakarta Selatan', 1, { metadata: { city: 'Jakarta Selatan' } }),
  option(fieldPath, '11530', '11530 — Jakarta Barat', 2, { metadata: { city: 'Jakarta Barat' } }),
  option(fieldPath, '11610', '11610 — Jakarta Barat', 3, { metadata: { city: 'Jakarta Barat' } }),
  option(fieldPath, '10110', '10110 — Jakarta Pusat', 4, { metadata: { city: 'Jakarta Pusat' } }),
  option(fieldPath, '10310', '10310 — Jakarta Pusat', 5, { metadata: { city: 'Jakarta Pusat' } }),
  option(fieldPath, '40115', '40115 — Bandung', 6, { metadata: { city: 'Bandung' } }),
  option(fieldPath, '40286', '40286 — Bandung', 7, { metadata: { city: 'Bandung' } }),
  option(fieldPath, '17121', '17121 — Bekasi', 8, { metadata: { city: 'Bekasi' } }),
  option(fieldPath, '17144', '17144 — Bekasi', 9, { metadata: { city: 'Bekasi' } }),
  option(fieldPath, '16111', '16111 — Bogor', 10, { metadata: { city: 'Bogor' } }),
  option(fieldPath, '16117', '16117 — Bogor', 11, { metadata: { city: 'Bogor' } }),
  option(fieldPath, '50135', '50135 — Semarang', 12, { metadata: { city: 'Semarang' } }),
  option(fieldPath, '50241', '50241 — Semarang', 13, { metadata: { city: 'Semarang' } }),
  option(fieldPath, '57131', '57131 — Solo', 14, { metadata: { city: 'Solo' } }),
  option(fieldPath, '57139', '57139 — Solo', 15, { metadata: { city: 'Solo' } }),
  option(fieldPath, '55198', '55198 — Yogyakarta', 16, { metadata: { city: 'Yogyakarta' } }),
  option(fieldPath, '55281', '55281 — Yogyakarta', 17, { metadata: { city: 'Yogyakarta' } }),
  option(fieldPath, '55581', '55581 — Sleman', 18, { metadata: { city: 'Sleman' } }),
  option(fieldPath, '55284', '55284 — Sleman', 19, { metadata: { city: 'Sleman' } }),
  option(fieldPath, '60189', '60189 — Surabaya', 20, { metadata: { city: 'Surabaya' } }),
  option(fieldPath, '60231', '60231 — Surabaya', 21, { metadata: { city: 'Surabaya' } }),
  option(fieldPath, '65111', '65111 — Malang', 22, { metadata: { city: 'Malang' } }),
  option(fieldPath, '65145', '65145 — Malang', 23, { metadata: { city: 'Malang' } }),
  option(fieldPath, '15143', '15143 — Tangerang', 24, { metadata: { city: 'Tangerang' } }),
  option(fieldPath, '15157', '15157 — Tangerang', 25, { metadata: { city: 'Tangerang' } }),
  option(fieldPath, '15310', '15310 — Serpong', 26, { metadata: { city: 'Serpong' } }),
  option(fieldPath, '15314', '15314 — Serpong', 27, { metadata: { city: 'Serpong' } }),
];

const MEDIA_INDUSTRY_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
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

const MEDIA_DEPT_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
  option(fieldPath, 'IT/ Network', 'IT / Network', 0),
  option(fieldPath, 'Management', 'Management', 1),
  option(fieldPath, 'Supply Chain Management/ Procurement/ GA', 'Supply Chain / Procurement / GA', 2),
  option(fieldPath, 'Other', 'Other', 3),
];

const MEDIA_JOB_LEVEL_OPTIONS = (fieldPath: string): FormOptionSeed[] => [
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

// ─── Form 1: Media Registration ───────────────────────────────────────────────

function buildMediaRegistration(): CreateFormModuleInput {
  const slug = 'media-registration';
  const businessUnit = BusinessUnit.MEDIA;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Media Registration',
    description: '4-step media partnership registration for OTT/IPTV/advertising solutions.',
    category: FormCategory.REGISTRATION,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Media Website',
    promoWebsite: 'Media Registration',
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
        { key: 'personal', title: 'Personal Details', stepNumber: 1, actionLabel: 'Next' },
        { key: 'company', title: 'Company Details', stepNumber: 2, actionLabel: 'Next' },
        { key: 'services', title: 'Services & Message', stepNumber: 3, actionLabel: 'Review' },
        { key: 'review', title: 'Review', stepNumber: 4, isReviewStep: true, actionLabel: 'Confirm & Submit' },
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

        // ── Step 2: Company ────────────────────────────────────────────────
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
        field(FormFieldType.MULTI_SELECT, 'solutionsInterest', 'Solutions of Interest', 'services', 1, {
          isRequired: true,
          defaultValue: [],
          validation: { minSelect: 1 },
          placeholder: 'Select one or more solutions',
        }),
        field(FormFieldType.SELECT, 'platformType', 'Platform Type', 'services', 2, {
          isRequired: true,
          placeholder: 'Select platform type',
        }),
        field(FormFieldType.TEXTAREA, 'message', 'Message', 'services', 3, {
          isRequired: true,
          placeholder: 'Describe your specific media needs',
        }),
      ],

      options: [
        // yourRole
        option('yourRole', 'Owner', 'Owner', 0),
        option('yourRole', 'Director', 'Director', 1),
        option('yourRole', 'Marketing Manager', 'Marketing Manager', 2),
        option('yourRole', 'Brand Manager', 'Brand Manager', 3),
        option('yourRole', 'Partnership Lead', 'Partnership Lead', 4),
        option('yourRole', 'Media Planner', 'Media Planner', 5),

        // province / city / zipCode
        ...MEDIA_PROVINCE_OPTIONS('province'),
        ...MEDIA_CITY_OPTIONS('city'),
        ...MEDIA_ZIP_OPTIONS('zipCode'),

        // solutionsInterest (MULTI_SELECT)
        option('solutionsInterest', 'OTT Solutions', 'OTT Solutions', 0),
        option('solutionsInterest', 'IPTV Services', 'IPTV Services', 1),
        option('solutionsInterest', 'Hospitality Entertainment', 'Hospitality Entertainment', 2),
        option('solutionsInterest', 'Media Advertising', 'Media Advertising', 3),

        // platformType
        option('platformType', 'Content Only', 'Content Only', 0),
        option('platformType', 'APK', 'APK', 1),
        option('platformType', 'Library', 'Library', 2),
      ],

      rules: [],

      responseConfigs: [
        response(
          'success-default',
          FormResponseType.SUCCESS,
          '/{locale}/media/form/success',
          0,
          {
            isDefault: true,
            label: 'Registrasi berhasil',
            queryTemplate: { name: '{fullName}' },
          },
        ),
      ],

      integrationConfigs: [],
    },
  });
}

// ─── Form 2: Event Register (Media) ──────────────────────────────────────────

function buildEventRegisterMedia(): CreateFormModuleInput {
  const slug = 'event-register';
  const businessUnit = BusinessUnit.MEDIA;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Media Event Registration',
    description: '2-step shared event registration form for Media BU. Participant data is stored as REPEATER groups.',
    category: FormCategory.EVENT,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Media Website',
    promoWebsite: 'Media Event Registration',
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
          defaultValue: 'Media Website',
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

        ...MEDIA_INDUSTRY_OPTIONS('businessIndustry'),
        ...MEDIA_PROVINCE_OPTIONS('province'),
        ...MEDIA_CITY_OPTIONS('city'),
        ...MEDIA_ZIP_OPTIONS('wardZipCode'),
        ...MEDIA_DEPT_OPTIONS('participants.department'),
        ...MEDIA_JOB_LEVEL_OPTIONS('participants.roleTitle'),
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
          '/{locale}/media/form/success',
          0,
          {
            isDefault: true,
            queryTemplate: { name: '{companyName}', needs: 'Register Event' },
          },
        ),
      ],

      integrationConfigs: [
        crmIntegrationConfig(businessUnit, slug, 'Media Event Registration'),
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
  return managedBy === MEDIA_SEED_OWNER || managedBy === BOOTSTRAP_OWNER_LEGACY;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Seeds all 2 Media form modules.
 * Safe to run multiple times — idempotent upsert.
 */
export async function seedMediaForms(prismaClient?: PrismaClient): Promise<SeedResult> {
  const client = prismaClient ?? prisma;
  const service = new FormModuleService(client);

  const seeds: CreateFormModuleInput[] = [
    buildMediaRegistration(),
    buildEventRegisterMedia(),
  ];

  const result: SeedResult = { created: 0, updated: 0, skipped: 0 };

  console.log('\n📺 Seeding Media form modules...');

  for (const seed of seeds) {
    const label = `MEDIA/${seed.slug}`;

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
    `\n✅ Media forms seed complete — created=${result.created}, updated=${result.updated}, skipped=${result.skipped}\n`,
  );

  return result;
}

// ─── Standalone runner ────────────────────────────────────────────────────────

if (require.main === module) {
  seedMediaForms()
    .catch((err) => {
      console.error('❌ Media forms seed failed:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
