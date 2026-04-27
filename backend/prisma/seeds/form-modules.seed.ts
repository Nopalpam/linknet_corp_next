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

const prisma = new PrismaClient();

const BOOTSTRAP_OWNER = 'bootstrap-seed';
const BOOTSTRAP_REVISION = 1;

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

function pathKey(path: string): string {
  const segments = path.split('.');
  return segments[segments.length - 1] || path;
}

function buSegment(businessUnit: BusinessUnit): string {
  return businessUnit.toLowerCase();
}

function publicPath(businessUnit: BusinessUnit, slug: string, suffix?: string): string {
  const basePath = `/{locale}/${buSegment(businessUnit)}/forms/${slug}`;
  return suffix ? `${basePath}/${suffix}` : basePath;
}

function baseSubmissionSettings(seedKey: string, extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    managedBy: BOOTSTRAP_OWNER,
    seedKey,
    revision: BOOTSTRAP_REVISION,
    ...extra,
  };
}

function baseIntegrationConfigs(
  businessUnit: BusinessUnit,
  slug: string,
  formName: string,
): FormIntegrationSeed[] {
  return [
    {
      key: 'crm-primary',
      provider: FormIntegrationProvider.CRM_WEB_TO_LEAD,
      dispatchMode: FormDispatchMode.ASYNC,
      mappingConfig: {
        businessUnit,
        formSlug: slug,
        formName,
      },
      headersConfig: {
        'x-form-module': slug,
        'x-form-business-unit': businessUnit,
      },
      isActive: true,
    },
  ];
}

function response(
  key: string,
  responseType: FormResponseType,
  pathTemplate: string,
  sortOrder: number,
  extra?: Partial<FormResponseSeed>,
): FormResponseSeed {
  return {
    key,
    responseType,
    pathTemplate,
    sortOrder,
    isActive: true,
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
  return {
    fieldPath,
    value,
    label,
    sortOrder,
    isActive: true,
    ...extra,
  };
}

function rule(
  ruleType: FormRuleType,
  sortOrder: number,
  config: Pick<FormRuleSeed, 'condition' | 'actionConfig'> & Partial<FormRuleSeed>,
): FormRuleSeed {
  return {
    ruleType,
    sortOrder,
    isActive: true,
    ...config,
  };
}

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

function isBootstrapManaged(value: Prisma.JsonValue | null): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return (value as Record<string, unknown>).managedBy === BOOTSTRAP_OWNER;
}

function buildEnterpriseConsultationModule(): CreateFormModuleInput {
  const slug = 'enterprise-consultation';
  const businessUnit = BusinessUnit.ENTERPRISE;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Enterprise Consultation',
    description: 'Consultative lead form for enterprise prospects.',
    category: FormCategory.REGISTRATION,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Linknet Enterprise Website',
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
        { key: 'need-details', title: 'Need & Contact', stepNumber: 1 },
        { key: 'company-profile', title: 'Company Profile', stepNumber: 2 },
        { key: 'solution-interest', title: 'Solutions & Challenges', stepNumber: 3 },
        { key: 'review-submit', title: 'Review', stepNumber: 4, isReviewStep: true },
      ],
      fields: [
        field(FormFieldType.SELECT, 'consultationType', 'Consultation Type', 'need-details', 1, { isRequired: true }),
        field(FormFieldType.TEXT, 'FirstName', 'First Name', 'need-details', 2, { isRequired: true }),
        field(FormFieldType.TEXT, 'LastName', 'Last Name', 'need-details', 3, { isRequired: true }),
        field(FormFieldType.EMAIL, 'Email', 'Business Email', 'need-details', 4, { isRequired: true }),
        field(FormFieldType.PHONE, 'MobilePhone', 'Phone Number', 'need-details', 5, { isRequired: true }),
        field(FormFieldType.TEXT, 'JobTitle', 'Job Title', 'need-details', 6),
        field(FormFieldType.TEXT, 'Company', 'Company Name', 'company-profile', 1, { isRequired: true }),
        field(FormFieldType.SELECT, 'Industry', 'Industry', 'company-profile', 2, { isRequired: true }),
        field(FormFieldType.SELECT, 'CompanySize', 'Company Size', 'company-profile', 3),
        field(FormFieldType.TEXT, 'City', 'City', 'company-profile', 4),
        field(FormFieldType.MULTI_SELECT, 'SolutionInterest', 'Solutions Needed', 'solution-interest', 1, { isRequired: true }),
        field(FormFieldType.CHECKBOX_GROUP, 'BusinessChallenge', 'Current Challenges', 'solution-interest', 2, { isRequired: true }),
        field(FormFieldType.TEXTAREA, 'AdditionalNotes', 'Additional Notes', 'solution-interest', 3),
        field(FormFieldType.CHECKBOX, 'Consent', 'I agree to be contacted by Linknet', 'solution-interest', 4, {
          isRequired: true,
          defaultValue: false,
        }),
      ],
      options: [
        option('consultationType', 'general-consultation', 'General Consultation', 0),
        option('consultationType', 'product-demo', 'Product Demo', 1),
        option('consultationType', 'pricing-discussion', 'Pricing Discussion', 2),
        option('Industry', 'finance', 'Finance', 0),
        option('Industry', 'manufacturing', 'Manufacturing', 1),
        option('Industry', 'healthcare', 'Healthcare', 2),
        option('Industry', 'retail', 'Retail', 3),
        option('Industry', 'technology', 'Technology', 4),
        option('CompanySize', '1-49', '1-49 Employees', 0),
        option('CompanySize', '50-199', '50-199 Employees', 1),
        option('CompanySize', '200-999', '200-999 Employees', 2),
        option('CompanySize', '1000+', '1000+ Employees', 3),
        option('SolutionInterest', 'internet-dedicated', 'Dedicated Internet', 0),
        option('SolutionInterest', 'sd-wan', 'SD-WAN', 1),
        option('SolutionInterest', 'managed-services', 'Managed Services', 2),
        option('SolutionInterest', 'cyber-security', 'Cyber Security', 3),
        option('SolutionInterest', 'cloud-connectivity', 'Cloud Connectivity', 4),
        option('BusinessChallenge', 'network-reliability', 'Network Reliability', 0),
        option('BusinessChallenge', 'cost-optimization', 'Cost Optimization', 1),
        option('BusinessChallenge', 'security-visibility', 'Security & Visibility', 2),
        option('BusinessChallenge', 'hybrid-work', 'Hybrid Work Collaboration', 3),
      ],
      rules: [],
      responseConfigs: [
        response('default-success', FormResponseType.SUCCESS, publicPath(businessUnit, slug, 'success'), 0, {
          isDefault: true,
          queryTemplate: {
            name: '{FirstName}',
          },
        }),
      ],
      integrationConfigs: baseIntegrationConfigs(businessUnit, slug, 'Enterprise Consultation'),
    },
  });
}

function buildEnterpriseSmbModule(): CreateFormModuleInput {
  const slug = 'enterprise-smb-registration';
  const businessUnit = BusinessUnit.ENTERPRISE;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'SMB Enterprise Registration',
    description: 'Registration form for SMB enterprise installation and coverage requests.',
    category: FormCategory.REGISTRATION,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Linknet Enterprise Website',
    promoWebsite: 'SMB Enterprise Registration',
    leadSource: 'Website',
    integrationProvider: FormIntegrationProvider.CRM_WEB_TO_LEAD,
    submissionSettings: baseSubmissionSettings(slug),
    definition: {
      steps: [
        { key: 'location-coverage', title: 'Location & Coverage', stepNumber: 1 },
        { key: 'package-billing', title: 'Package & Billing', stepNumber: 2 },
        { key: 'schedule-contact', title: 'Schedule & Contact', stepNumber: 3 },
        { key: 'review-submit', title: 'Review', stepNumber: 4, isReviewStep: true },
      ],
      fields: [
        field(FormFieldType.RADIO, 'coverageMode', 'Coverage Check Mode', 'location-coverage', 1, { isRequired: true }),
        field(FormFieldType.ADDRESS_LOOKUP, 'coverageAddress', 'Service Address Search', 'location-coverage', 2, { isRequired: true }),
        field(FormFieldType.TEXTAREA, 'manualAddress', 'Manual Service Address', 'location-coverage', 3),
        field(FormFieldType.SELECT, 'servicePackage', 'Service Package', 'package-billing', 1, { isRequired: true }),
        field(FormFieldType.SELECT, 'bandwidthNeed', 'Bandwidth Need', 'package-billing', 2, { isRequired: true }),
        field(FormFieldType.CHECKBOX, 'billingSameAsService', 'Billing address same as service address', 'package-billing', 3, {
          defaultValue: true,
        }),
        field(FormFieldType.TEXTAREA, 'billingAddress', 'Billing Address', 'package-billing', 4),
        field(FormFieldType.TEXT, 'companyName', 'Company Name', 'schedule-contact', 1, { isRequired: true }),
        field(FormFieldType.TEXT, 'contactName', 'Contact Person Name', 'schedule-contact', 2, { isRequired: true }),
        field(FormFieldType.EMAIL, 'contactEmail', 'Contact Email', 'schedule-contact', 3, { isRequired: true }),
        field(FormFieldType.PHONE, 'contactPhone', 'Contact Phone', 'schedule-contact', 4, { isRequired: true }),
        field(FormFieldType.DATE, 'preferredInstallDate', 'Preferred Installation Date', 'schedule-contact', 5),
        field(FormFieldType.SELECT, 'preferredInstallWindow', 'Preferred Installation Window', 'schedule-contact', 6),
        field(FormFieldType.TEXTAREA, 'notes', 'Notes', 'schedule-contact', 7),
      ],
      options: [
        option('coverageMode', 'coverage-check', 'Search Existing Coverage', 0),
        option('coverageMode', 'manual-entry', 'Enter Address Manually', 1),
        option('servicePackage', 'dedicated-internet', 'Dedicated Internet', 0),
        option('servicePackage', 'managed-wifi', 'Managed Wi-Fi', 1),
        option('servicePackage', 'internet-plus-voice', 'Internet + Voice', 2),
        option('bandwidthNeed', '50-mbps', '50 Mbps', 0),
        option('bandwidthNeed', '100-mbps', '100 Mbps', 1),
        option('bandwidthNeed', '300-mbps', '300 Mbps', 2),
        option('bandwidthNeed', '1-gbps', '1 Gbps', 3),
        option('preferredInstallWindow', 'morning', 'Morning', 0),
        option('preferredInstallWindow', 'afternoon', 'Afternoon', 1),
        option('preferredInstallWindow', 'flexible', 'Flexible', 2),
      ],
      rules: [
        rule(FormRuleType.SHOW, 0, {
          sourceFieldPath: 'coverageMode',
          targetFieldPath: 'coverageAddress',
          condition: { coverageMode: 'coverage-check' },
          actionConfig: { visible: true },
        }),
        rule(FormRuleType.SHOW, 1, {
          sourceFieldPath: 'coverageMode',
          targetFieldPath: 'manualAddress',
          condition: { coverageMode: 'manual-entry' },
          actionConfig: { visible: true },
        }),
        rule(FormRuleType.REQUIRE, 2, {
          sourceFieldPath: 'coverageMode',
          targetFieldPath: 'manualAddress',
          condition: { coverageMode: 'manual-entry' },
          actionConfig: { required: true },
        }),
        rule(FormRuleType.SHOW, 3, {
          sourceFieldPath: 'billingSameAsService',
          targetFieldPath: 'billingAddress',
          condition: { billingSameAsService: false },
          actionConfig: { visible: true },
        }),
      ],
      responseConfigs: [
        response('default-success', FormResponseType.SUCCESS, publicPath(businessUnit, slug, 'success'), 0, {
          isDefault: true,
          queryTemplate: {
            company: '{companyName}',
          },
        }),
      ],
      integrationConfigs: baseIntegrationConfigs(businessUnit, slug, 'SMB Enterprise Registration'),
    },
  });
}

function buildEnterprisePartnershipModule(): CreateFormModuleInput {
  const slug = 'enterprise-partnership';
  const businessUnit = BusinessUnit.ENTERPRISE;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Enterprise Partnership',
    description: 'Partnership inquiry form for Enterprise BU.',
    category: FormCategory.PARTNERSHIP,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Linknet Enterprise Website',
    promoWebsite: 'Enterprise Partnership',
    leadSource: 'Website',
    integrationProvider: FormIntegrationProvider.CRM_WEB_TO_LEAD,
    submissionSettings: baseSubmissionSettings(slug),
    definition: {
      steps: [
        { key: 'partnership-scope', title: 'Partnership Scope', stepNumber: 1 },
        { key: 'company-contact', title: 'Company & Contact', stepNumber: 2 },
      ],
      fields: [
        field(FormFieldType.CHECKBOX_GROUP, 'partnershipType', 'Partnership Type', 'partnership-scope', 1, { isRequired: true }),
        field(FormFieldType.TEXT, 'otherPartnershipType', 'Other Partnership Type', 'partnership-scope', 2),
        field(FormFieldType.TEXTAREA, 'partnershipGoals', 'Partnership Goals', 'partnership-scope', 3),
        field(FormFieldType.TEXT, 'companyName', 'Company Name', 'company-contact', 1, { isRequired: true }),
        field(FormFieldType.TEXT, 'companyWebsite', 'Company Website', 'company-contact', 2),
        field(FormFieldType.TEXT, 'firstName', 'First Name', 'company-contact', 3, { isRequired: true }),
        field(FormFieldType.TEXT, 'lastName', 'Last Name', 'company-contact', 4, { isRequired: true }),
        field(FormFieldType.EMAIL, 'email', 'Business Email', 'company-contact', 5, { isRequired: true }),
        field(FormFieldType.PHONE, 'phone', 'Phone Number', 'company-contact', 6),
      ],
      options: [
        option('partnershipType', 'referral', 'Referral', 0),
        option('partnershipType', 'reseller', 'Reseller', 1),
        option('partnershipType', 'co-branding', 'Co-Branding', 2),
        option('partnershipType', 'technology', 'Technology Alliance', 3),
        option('partnershipType', 'other', 'Other', 4),
      ],
      rules: [
        rule(FormRuleType.SHOW, 0, {
          sourceFieldPath: 'partnershipType',
          targetFieldPath: 'otherPartnershipType',
          condition: { partnershipType: { includes: 'other' } },
          actionConfig: { visible: true },
        }),
        rule(FormRuleType.REQUIRE, 1, {
          sourceFieldPath: 'partnershipType',
          targetFieldPath: 'otherPartnershipType',
          condition: { partnershipType: { includes: 'other' } },
          actionConfig: { required: true },
        }),
      ],
      responseConfigs: [
        response('default-success', FormResponseType.SUCCESS, publicPath(businessUnit, slug, 'success'), 0, {
          isDefault: true,
          queryTemplate: {
            company: '{companyName}',
          },
        }),
      ],
      integrationConfigs: baseIntegrationConfigs(businessUnit, slug, 'Enterprise Partnership'),
    },
  });
}

function buildEnterpriseSuggestModule(): CreateFormModuleInput {
  const slug = 'enterprise-suggest';
  const businessUnit = BusinessUnit.ENTERPRISE;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Enterprise Solution Recommender',
    description: 'Routing-only wizard to suggest the next enterprise solution page.',
    category: FormCategory.RECOMMENDATION,
    handlingMode: FormHandlingMode.ROUTING_ONLY,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Linknet Enterprise Website',
    promoWebsite: 'Enterprise Recommender',
    leadSource: 'Website',
    integrationProvider: FormIntegrationProvider.NOOP,
    submissionSettings: baseSubmissionSettings(slug, { persistSubmission: false }),
    definition: {
      steps: [
        { key: 'business-profile', title: 'Business Profile', stepNumber: 1 },
        { key: 'current-needs', title: 'Current Needs', stepNumber: 2 },
        { key: 'recommendation', title: 'Recommendation', stepNumber: 3, isReviewStep: true },
      ],
      fields: [
        field(FormFieldType.SELECT, 'companySize', 'Company Size', 'business-profile', 1, { isRequired: true }),
        field(FormFieldType.SELECT, 'industry', 'Industry', 'business-profile', 2, { isRequired: true }),
        field(FormFieldType.CHECKBOX_GROUP, 'businessNeed', 'Primary Business Need', 'current-needs', 1, { isRequired: true }),
        field(FormFieldType.RADIO, 'digitalMaturity', 'Digital Maturity', 'current-needs', 2, { isRequired: true }),
        field(FormFieldType.SELECT, 'timeline', 'Target Timeline', 'current-needs', 3),
        field(FormFieldType.EMAIL, 'email', 'Business Email', 'recommendation', 1),
      ],
      options: [
        option('companySize', '1-49', '1-49 Employees', 0),
        option('companySize', '50-199', '50-199 Employees', 1),
        option('companySize', '200-999', '200-999 Employees', 2),
        option('companySize', '1000+', '1000+ Employees', 3),
        option('industry', 'finance', 'Finance', 0),
        option('industry', 'retail', 'Retail', 1),
        option('industry', 'manufacturing', 'Manufacturing', 2),
        option('industry', 'technology', 'Technology', 3),
        option('businessNeed', 'cyber-security', 'Cyber Security', 0),
        option('businessNeed', 'cloud', 'Cloud Connectivity', 1),
        option('businessNeed', 'connectivity', 'Dedicated Internet', 2),
        option('businessNeed', 'managed-services', 'Managed Services', 3),
        option('digitalMaturity', 'starting', 'Getting Started', 0),
        option('digitalMaturity', 'scaling', 'Scaling Fast', 1),
        option('digitalMaturity', 'optimizing', 'Optimizing Existing Stack', 2),
        option('timeline', 'this-month', 'This Month', 0),
        option('timeline', 'this-quarter', 'This Quarter', 1),
        option('timeline', 'this-year', 'This Year', 2),
      ],
      rules: [],
      responseConfigs: [
        response('route-cyber-security', FormResponseType.REDIRECT, '/{locale}/enterprise/solutions/cyber-security', 0, {
          matchCondition: { businessNeed: { includes: 'cyber-security' } },
        }),
        response('route-cloud-connectivity', FormResponseType.REDIRECT, '/{locale}/enterprise/solutions/cloud-connectivity', 1, {
          matchCondition: { businessNeed: { includes: 'cloud' } },
        }),
        response('route-dedicated-internet', FormResponseType.REDIRECT, '/{locale}/enterprise/solutions/dedicated-internet', 2, {
          matchCondition: { businessNeed: { includes: 'connectivity' } },
        }),
        response('route-consultation', FormResponseType.REDIRECT, publicPath(businessUnit, 'enterprise-consultation'), 3, {
          isDefault: true,
        }),
      ],
      integrationConfigs: [],
    },
  });
}

function buildEventRegistrationModule(businessUnit: BusinessUnit, titlePrefix: string): CreateFormModuleInput {
  const slug = 'event-register';

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: `${titlePrefix} Event Registration`,
    description: `Shared event registration module for ${titlePrefix}.`,
    category: FormCategory.EVENT,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: `Linknet ${titlePrefix} Website`,
    promoWebsite: `${titlePrefix} Event Registration`,
    leadSource: 'Website',
    integrationProvider: FormIntegrationProvider.CRM_WEB_TO_LEAD,
    submissionSettings: baseSubmissionSettings(`${buSegment(businessUnit)}-${slug}`, {
      repeaterLimits: {
        participants: 5,
      },
    }),
    definition: {
      steps: [
        { key: 'company-profile', title: 'Company Profile', stepNumber: 1 },
        { key: 'participants', title: 'Participants', stepNumber: 2 },
      ],
      fields: [
        field(FormFieldType.TEXT, 'eventName', 'Event Name', 'company-profile', 1, { isRequired: true }),
        field(FormFieldType.TEXT, 'companyName', 'Company Name', 'company-profile', 2, { isRequired: true }),
        field(FormFieldType.EMAIL, 'companyEmail', 'Company Email', 'company-profile', 3, { isRequired: true }),
        field(FormFieldType.PHONE, 'companyPhone', 'Company Phone', 'company-profile', 4),
        field(FormFieldType.TEXTAREA, 'companyAddress', 'Company Address', 'company-profile', 5),
        field(FormFieldType.TEXT, 'picName', 'PIC Name', 'company-profile', 6, { isRequired: true }),
        field(FormFieldType.EMAIL, 'picEmail', 'PIC Email', 'company-profile', 7, { isRequired: true }),
        field(FormFieldType.PHONE, 'picPhone', 'PIC Phone', 'company-profile', 8),
        field(FormFieldType.TEXTAREA, 'notes', 'Notes', 'company-profile', 9),
        field(FormFieldType.REPEATER, 'participants', 'Participants', 'participants', 1, {
          isRequired: true,
          uiConfig: {
            minItems: 1,
            maxItems: 5,
          },
        }),
        field(FormFieldType.TEXT, 'participants.firstName', 'First Name', 'participants', 2, {
          isRequired: true,
          parentFieldPath: 'participants',
        }),
        field(FormFieldType.TEXT, 'participants.lastName', 'Last Name', 'participants', 3, {
          isRequired: true,
          parentFieldPath: 'participants',
        }),
        field(FormFieldType.TEXT, 'participants.jobTitle', 'Job Title', 'participants', 4, {
          isRequired: true,
          parentFieldPath: 'participants',
        }),
        field(FormFieldType.EMAIL, 'participants.companyEmail', 'Business Email', 'participants', 5, {
          isRequired: true,
          parentFieldPath: 'participants',
        }),
        field(FormFieldType.PHONE, 'participants.phone', 'Phone Number', 'participants', 6, {
          parentFieldPath: 'participants',
        }),
      ],
      options: [],
      rules: [
        rule(FormRuleType.LIMIT, 0, {
          targetFieldPath: 'participants',
          condition: {},
          actionConfig: {
            maxItems: 5,
          },
        }),
      ],
      responseConfigs: [
        response('default-success', FormResponseType.SUCCESS, publicPath(businessUnit, slug, 'success'), 0, {
          isDefault: true,
          queryTemplate: {
            event: '{eventName}',
            company: '{companyName}',
          },
        }),
      ],
      integrationConfigs: baseIntegrationConfigs(businessUnit, slug, `${titlePrefix} Event Registration`),
    },
  });
}

function buildFiberRegistrationModule(): CreateFormModuleInput {
  const slug = 'fiber-registration';
  const businessUnit = BusinessUnit.FIBER;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Fiber Registration',
    description: 'Multi-step registration form for Fiber business applications and documents.',
    category: FormCategory.REGISTRATION,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Linknet Fiber Website',
    promoWebsite: 'Fiber Registration',
    leadSource: 'Website',
    integrationProvider: FormIntegrationProvider.CRM_WEB_TO_LEAD,
    submissionSettings: baseSubmissionSettings(slug, {
      filePolicy: {
        required: ['npwpFile', 'nibFile', 'companySignatureFile'],
      },
    }),
    definition: {
      steps: [
        { key: 'applicant-company', title: 'Applicant & Company', stepNumber: 1 },
        { key: 'legal-documents', title: 'Legal Documents', stepNumber: 2 },
        { key: 'service-site', title: 'Service Site', stepNumber: 3 },
        { key: 'technical-needs', title: 'Technical Needs', stepNumber: 4 },
        { key: 'review-submit', title: 'Review', stepNumber: 5, isReviewStep: true },
      ],
      fields: [
        field(FormFieldType.TEXT, 'companyName', 'Company Name', 'applicant-company', 1, { isRequired: true }),
        field(FormFieldType.EMAIL, 'companyEmail', 'Company Email', 'applicant-company', 2, { isRequired: true }),
        field(FormFieldType.PHONE, 'companyPhone', 'Company Phone', 'applicant-company', 3, { isRequired: true }),
        field(FormFieldType.TEXT, 'picName', 'PIC Name', 'applicant-company', 4, { isRequired: true }),
        field(FormFieldType.EMAIL, 'picEmail', 'PIC Email', 'applicant-company', 5, { isRequired: true }),
        field(FormFieldType.TEXT, 'npwpNumber', 'NPWP Number', 'legal-documents', 1, { isRequired: true }),
        field(FormFieldType.TEXT, 'nibNumber', 'NIB Number', 'legal-documents', 2, { isRequired: true }),
        field(FormFieldType.TEXT, 'companyDeedNumber', 'Company Deed Number', 'legal-documents', 3),
        field(FormFieldType.FILE, 'npwpFile', 'NPWP Document', 'legal-documents', 4, { isRequired: true }),
        field(FormFieldType.FILE, 'nibFile', 'NIB Document', 'legal-documents', 5, { isRequired: true }),
        field(FormFieldType.FILE, 'companySignatureFile', 'Signed Application File', 'legal-documents', 6, { isRequired: true }),
        field(FormFieldType.FILE_GROUP, 'additionalSupportingFiles', 'Additional Supporting Files', 'legal-documents', 7),
        field(FormFieldType.ADDRESS_LOOKUP, 'serviceAddress', 'Service Address', 'service-site', 1, { isRequired: true }),
        field(FormFieldType.TEXTAREA, 'billingAddress', 'Billing Address', 'service-site', 2),
        field(FormFieldType.SELECT, 'buildingType', 'Building Type', 'service-site', 3),
        field(FormFieldType.TEXT, 'currentProvider', 'Current Provider', 'service-site', 4),
        field(FormFieldType.SELECT, 'requiredBandwidth', 'Required Bandwidth', 'technical-needs', 1, { isRequired: true }),
        field(FormFieldType.SELECT, 'infrastructureStatus', 'Infrastructure Status', 'technical-needs', 2, { isRequired: true }),
        field(FormFieldType.DATE, 'desiredActivationDate', 'Desired Activation Date', 'technical-needs', 3),
        field(FormFieldType.TEXTAREA, 'additionalNotes', 'Additional Notes', 'technical-needs', 4),
      ],
      options: [
        option('buildingType', 'office', 'Office Building', 0),
        option('buildingType', 'factory', 'Factory / Warehouse', 1),
        option('buildingType', 'campus', 'Campus', 2),
        option('buildingType', 'retail', 'Retail Outlet', 3),
        option('requiredBandwidth', '50-mbps', '50 Mbps', 0),
        option('requiredBandwidth', '100-mbps', '100 Mbps', 1),
        option('requiredBandwidth', '500-mbps', '500 Mbps', 2),
        option('requiredBandwidth', '1-gbps', '1 Gbps', 3),
        option('infrastructureStatus', 'existing-fiber', 'Existing Fiber Ready', 0),
        option('infrastructureStatus', 'new-deployment', 'Need New Deployment', 1),
        option('infrastructureStatus', 'survey-required', 'Survey Required', 2),
      ],
      rules: [],
      responseConfigs: [
        response('default-success', FormResponseType.SUCCESS, publicPath(businessUnit, slug, 'success'), 0, {
          isDefault: true,
          queryTemplate: {
            company: '{companyName}',
          },
        }),
      ],
      integrationConfigs: baseIntegrationConfigs(businessUnit, slug, 'Fiber Registration'),
    },
  });
}

function buildFiberInquiryModule(): CreateFormModuleInput {
  const slug = 'fiber-inquiry';
  const businessUnit = BusinessUnit.FIBER;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Fiber Inquiry',
    description: 'Inquiry form for Fiber service needs and current provider context.',
    category: FormCategory.INQUIRY,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Linknet Fiber Website',
    promoWebsite: 'Fiber Inquiry',
    leadSource: 'Website',
    integrationProvider: FormIntegrationProvider.CRM_WEB_TO_LEAD,
    submissionSettings: baseSubmissionSettings(slug),
    definition: {
      steps: [
        { key: 'need-context', title: 'Need Context', stepNumber: 1 },
        { key: 'company-contact', title: 'Company & Contact', stepNumber: 2 },
        { key: 'service-interest', title: 'Service Interest', stepNumber: 3 },
        { key: 'review-submit', title: 'Review', stepNumber: 4, isReviewStep: true },
      ],
      fields: [
        field(FormFieldType.RADIO, 'needType', 'What do you need?', 'need-context', 1, { isRequired: true }),
        field(FormFieldType.TEXT, 'currentProvider', 'Current Provider', 'need-context', 2),
        field(FormFieldType.TEXT, 'companyName', 'Company Name', 'company-contact', 1, { isRequired: true }),
        field(FormFieldType.EMAIL, 'companyEmail', 'Company Email', 'company-contact', 2, { isRequired: true }),
        field(FormFieldType.PHONE, 'companyPhone', 'Company Phone', 'company-contact', 3),
        field(FormFieldType.CHECKBOX_GROUP, 'servicesInterest', 'Services Interested In', 'service-interest', 1, {
          isRequired: true,
        }),
        field(FormFieldType.SELECT, 'preferredContactTime', 'Preferred Contact Time', 'service-interest', 2),
        field(FormFieldType.TEXTAREA, 'message', 'Inquiry Details', 'service-interest', 3),
      ],
      options: [
        option('needType', 'new-service', 'New Service', 0),
        option('needType', 'existing-service', 'Existing Service Upgrade / Issue', 1),
        option('needType', 'other', 'Other Inquiry', 2),
        option('servicesInterest', 'dedicated-internet', 'Dedicated Internet', 0),
        option('servicesInterest', 'metro-e', 'Metro-E', 1),
        option('servicesInterest', 'internet-backup', 'Internet Backup', 2),
        option('servicesInterest', 'managed-wifi', 'Managed Wi-Fi', 3),
        option('preferredContactTime', 'working-hours', 'Working Hours', 0),
        option('preferredContactTime', 'after-hours', 'After Hours', 1),
        option('preferredContactTime', 'anytime', 'Anytime', 2),
      ],
      rules: [
        rule(FormRuleType.SHOW, 0, {
          sourceFieldPath: 'needType',
          targetFieldPath: 'currentProvider',
          condition: { needType: 'existing-service' },
          actionConfig: { visible: true },
        }),
        rule(FormRuleType.REQUIRE, 1, {
          sourceFieldPath: 'needType',
          targetFieldPath: 'currentProvider',
          condition: { needType: 'existing-service' },
          actionConfig: { required: true },
        }),
      ],
      responseConfigs: [
        response('other-needs-incomplete', FormResponseType.INCOMPLETE, publicPath(businessUnit, slug, 'incomplete'), 0, {
          matchCondition: { needType: 'other' },
        }),
        response('default-success', FormResponseType.SUCCESS, publicPath(businessUnit, slug, 'success'), 1, {
          isDefault: true,
          queryTemplate: {
            company: '{companyName}',
          },
        }),
      ],
      integrationConfigs: baseIntegrationConfigs(businessUnit, slug, 'Fiber Inquiry'),
    },
  });
}

function buildMediaRegistrationModule(): CreateFormModuleInput {
  const slug = 'media-registration';
  const businessUnit = BusinessUnit.MEDIA;

  return createFormModuleSchema.parse({
    businessUnit,
    slug,
    name: 'Media Registration',
    description: 'Media partnership and campaign registration form.',
    category: FormCategory.REGISTRATION,
    handlingMode: FormHandlingMode.SUBMISSION,
    status: FormModuleStatus.ACTIVE,
    schemaVersion: 1,
    defaultLocale: 'id',
    publicPath: publicPath(businessUnit, slug),
    sourceWebsite: 'Linknet Media Website',
    promoWebsite: 'Media Registration',
    leadSource: 'Website',
    integrationProvider: FormIntegrationProvider.CRM_WEB_TO_LEAD,
    submissionSettings: baseSubmissionSettings(slug),
    definition: {
      steps: [
        { key: 'brand-profile', title: 'Brand Profile', stepNumber: 1 },
        { key: 'campaign-needs', title: 'Campaign Needs', stepNumber: 2 },
        { key: 'solutions-platforms', title: 'Solutions & Platforms', stepNumber: 3 },
        { key: 'review-submit', title: 'Review', stepNumber: 4, isReviewStep: true },
      ],
      fields: [
        field(FormFieldType.TEXT, 'companyName', 'Company Name', 'brand-profile', 1, { isRequired: true }),
        field(FormFieldType.TEXT, 'brandName', 'Brand Name', 'brand-profile', 2),
        field(FormFieldType.SELECT, 'industry', 'Industry', 'brand-profile', 3),
        field(FormFieldType.TEXTAREA, 'campaignObjective', 'Campaign Objective', 'campaign-needs', 1, { isRequired: true }),
        field(FormFieldType.SELECT, 'budgetRange', 'Budget Range', 'campaign-needs', 2),
        field(FormFieldType.DATE, 'preferredLaunchDate', 'Preferred Launch Date', 'campaign-needs', 3),
        field(FormFieldType.MULTI_SELECT, 'solutionsInterest', 'Solutions Interest', 'solutions-platforms', 1, { isRequired: true }),
        field(FormFieldType.CHECKBOX_GROUP, 'platformType', 'Platform Type', 'solutions-platforms', 2, { isRequired: true }),
        field(FormFieldType.TEXT, 'picName', 'PIC Name', 'solutions-platforms', 3, { isRequired: true }),
        field(FormFieldType.EMAIL, 'picEmail', 'PIC Email', 'solutions-platforms', 4, { isRequired: true }),
        field(FormFieldType.PHONE, 'picPhone', 'PIC Phone', 'solutions-platforms', 5),
        field(FormFieldType.TEXTAREA, 'notes', 'Notes', 'solutions-platforms', 6),
      ],
      options: [
        option('industry', 'retail', 'Retail', 0),
        option('industry', 'technology', 'Technology', 1),
        option('industry', 'automotive', 'Automotive', 2),
        option('industry', 'finance', 'Finance', 3),
        option('budgetRange', 'under-50m', 'Under 50M', 0),
        option('budgetRange', '50m-250m', '50M - 250M', 1),
        option('budgetRange', '250m-1b', '250M - 1B', 2),
        option('budgetRange', '1b+', '1B+', 3),
        option('solutionsInterest', 'branded-content', 'Branded Content', 0),
        option('solutionsInterest', 'media-buying', 'Media Buying', 1),
        option('solutionsInterest', 'event-activation', 'Event Activation', 2),
        option('solutionsInterest', 'community-engagement', 'Community Engagement', 3),
        option('platformType', 'digital', 'Digital', 0),
        option('platformType', 'social', 'Social Media', 1),
        option('platformType', 'on-ground', 'On Ground', 2),
        option('platformType', 'hybrid', 'Hybrid', 3),
      ],
      rules: [],
      responseConfigs: [
        response('default-success', FormResponseType.SUCCESS, publicPath(businessUnit, slug, 'success'), 0, {
          isDefault: true,
          queryTemplate: {
            company: '{companyName}',
          },
        }),
      ],
      integrationConfigs: baseIntegrationConfigs(businessUnit, slug, 'Media Registration'),
    },
  });
}

function buildFormModuleSeeds(): CreateFormModuleInput[] {
  return [
    buildEnterpriseConsultationModule(),
    buildEnterpriseSmbModule(),
    buildEnterprisePartnershipModule(),
    buildEnterpriseSuggestModule(),
    buildEventRegistrationModule(BusinessUnit.ENTERPRISE, 'Enterprise'),
    buildFiberRegistrationModule(),
    buildFiberInquiryModule(),
    buildEventRegistrationModule(BusinessUnit.FIBER, 'Fiber'),
    buildMediaRegistrationModule(),
    buildEventRegistrationModule(BusinessUnit.MEDIA, 'Media'),
  ];
}

export async function seedFormModules(prismaClient?: PrismaClient): Promise<SeedResult> {
  const client = prismaClient ?? prisma;
  const service = new FormModuleService(client);
  const seeds = buildFormModuleSeeds();

  const result: SeedResult = {
    created: 0,
    updated: 0,
    skipped: 0,
  };

  console.log('🧩 Seeding form modules...');

  for (const seed of seeds) {
    const existing = await client.formModule.findFirst({
      where: {
        businessUnit: seed.businessUnit,
        slug: seed.slug,
      },
      select: {
        id: true,
        deletedAt: true,
        submissionSettings: true,
      },
    });

    if (!existing) {
      await service.createFormModule(seed);
      result.created += 1;
      console.log(`   ✅ Created ${seed.businessUnit}/${seed.slug}`);
      continue;
    }

    if (existing.deletedAt) {
      result.skipped += 1;
      console.log(`   ⏭️  Skipped archived module ${seed.businessUnit}/${seed.slug}`);
      continue;
    }

    if (!isBootstrapManaged(existing.submissionSettings)) {
      result.skipped += 1;
      console.log(`   ⏭️  Skipped manual module ${seed.businessUnit}/${seed.slug}`);
      continue;
    }

    await service.updateFormModule(existing.id, toUpdateInput(seed));
    result.updated += 1;
    console.log(`   🔄 Updated ${seed.businessUnit}/${seed.slug}`);
  }

  console.log(
    `✅ Form modules seed complete (created=${result.created}, updated=${result.updated}, skipped=${result.skipped})`,
  );

  return result;
}

if (require.main === module) {
  seedFormModules()
    .catch((error) => {
      console.error('❌ Error seeding form modules:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}