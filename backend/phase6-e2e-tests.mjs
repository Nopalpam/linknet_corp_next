/**
 * Phase 6 — End-to-End Testing Checklist
 * Form Registration Multi-BU (Enterprise, Fiber, Media)
 *
 * Run: node phase6-e2e-tests.mjs
 * Requires: backend running at http://localhost:5000
 */

const BASE_URL = 'http://localhost:5000/api/v1';

let passed = 0;
let failed = 0;
const results = [];

function log(emoji, tag, msg) {
  const line = `${emoji} [${tag}] ${msg}`;
  results.push(line);
  console.log(line);
}

async function testGET(path, testId, description) {
  try {
    const res = await fetch(`${BASE_URL}/forms/${path}`);
    const body = await res.json();
    if (res.status === 200 && body.data && body.data.slug) {
      log('✅', testId, `${description} | status:${res.status} fields:${body.data.fields?.length ?? 0} mode:${body.data.handlingMode}`);
      passed++;
      return body.data;
    } else {
      log('❌', testId, `${description} | status:${res.status} body:${JSON.stringify(body).slice(0, 120)}`);
      failed++;
      return null;
    }
  } catch (e) {
    log('❌', testId, `${description} | ERROR: ${e.message}`);
    failed++;
    return null;
  }
}

async function testPOST(path, payload, testId, description, opts = {}) {
  const { expectPersisted = true, expectStatus = null } = opts;
  try {
    const res = await fetch(`${BASE_URL}/forms/${path}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json();

    // If expected status is explicitly given, use strict check
    if (expectStatus !== null) {
      if (res.status === expectStatus) {
        log('✅', testId, `${description} | expected status:${expectStatus} confirmed`);
        passed++;
        return body;
      } else {
        log('❌', testId, `${description} | expected status:${expectStatus} got:${res.status} body:${JSON.stringify(body).slice(0, 180)}`);
        failed++;
        return null;
      }
    }

    if (!expectPersisted) {
      // ROUTING_ONLY: expect 200 with persisted:false
      if (res.status === 200 && body.data && body.data.persisted === false) {
        log('✅', testId, `${description} | ROUTING_ONLY confirmed persisted:false response:${body.data.response?.pathTemplate ?? 'none'}`);
        passed++;
        return body.data;
      } else {
        log('❌', testId, `${description} | expected ROUTING_ONLY (persisted:false) got status:${res.status} body:${JSON.stringify(body).slice(0, 180)}`);
        failed++;
        return null;
      }
    }

    // SUBMISSION: expect 201 with submission.id
    if (res.status === 201 && body.data && body.data.submission && body.data.submission.id) {
      log('✅', testId, `${description} | submissionId:${body.data.submission.id} status:${body.data.submission.status}`);
      passed++;
      return body.data;
    } else {
      log('❌', testId, `${description} | status:${res.status} body:${JSON.stringify(body).slice(0, 200)}`);
      failed++;
      return null;
    }
  } catch (e) {
    log('❌', testId, `${description} | ERROR: ${e.message}`);
    failed++;
    return null;
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  PHASE 6 — END-TO-END TESTING CHECKLIST');
  console.log('  Form Registration Multi-BU | Linknet Corp Next');
  console.log('══════════════════════════════════════════════════════════\n');

  // ──────────────────────────────────────────────────────────
  // [A] ENTERPRISE FORMS
  // ──────────────────────────────────────────────────────────
  console.log('══ [A] ENTERPRISE FORMS ═══════════════════════════════════\n');

  // A1 — enterprise-consultation GET
  await testGET('enterprise/enterprise-consultation', 'A1', 'Enterprise Consultation — GET form definition');

  // A1a — enterprise-consultation POST (valid full submission)
  await testPOST(
    'enterprise/enterprise-consultation',
    {
      locale: 'id',
      values: {
        Company: 'PT Teknologi Indonesia',
        consultationType: 'new-service',
        SolutionInterest: ['cloud', 'security'],
        BusinessChallenge: ['cost-efficiency', 'scalability'],
        FirstName: 'Budi',
        LastName: 'Santoso',
        Industry: 'manufacturing',
        Email: 'budi.santoso@ptteknologi.co.id',
        MobilePhone: '+628111234567',
        CompanySize: '100-500',
        JobTitle: 'IT Manager',
        City: 'Jakarta',
        AdditionalNotes: 'Phase 6 test submission — enterprise consultation',
        Consent: true,
      },
      groups: [],
      files: [],
    },
    'A1a',
    'Enterprise Consultation — POST valid submission'
  );

  // A2 — enterprise-partnership GET
  await testGET('enterprise/enterprise-partnership', 'A2', 'Enterprise Partnership — GET form definition');

  // A2a — enterprise-partnership POST (partnershipType without "other")
  await testPOST(
    'enterprise/enterprise-partnership',
    {
      locale: 'id',
      values: {
        companyName: 'PT Mitra Teknologi',
        firstName: 'Andi',
        lastName: 'Wijaya',
        email: 'andi@ptmitra.co.id',
        phone: '+628222345678',
        partnershipType: ['reseller', 'system-integrator'],
        partnershipGoals: 'Memperluas jangkauan di wilayah Indonesia Timur',
        companyWebsite: 'https://ptmitra.co.id',
      },
      groups: [],
      files: [],
    },
    'A2a',
    'Enterprise Partnership — POST valid (no "other" type)'
  );

  // A2b — enterprise-partnership POST with partnershipType=other (conditional rule triggers otherPartnershipType)
  await testPOST(
    'enterprise/enterprise-partnership',
    {
      locale: 'id',
      values: {
        companyName: 'PT Teknologi Khusus',
        firstName: 'Rina',
        lastName: 'Pratiwi',
        email: 'rina@teknologikhusus.co.id',
        partnershipType: ['other'],
        otherPartnershipType: 'Technology Distributor',
        partnershipGoals: 'Distribusi teknologi jaringan',
      },
      groups: [],
      files: [],
    },
    'A2b',
    'Enterprise Partnership — POST with partnershipType=other (SHOW/REQUIRE conditional)'
  );

  // A3 — enterprise-smb-registration GET
  // NOTE: Plan doc uses slug "smb-enterprise" — actual DB slug is "enterprise-smb-registration"
  await testGET('enterprise/enterprise-smb-registration', 'A3', 'Enterprise SMB Registration — GET form definition [slug: enterprise-smb-registration]');

  // A3a — enterprise-smb-registration POST (with ADDRESS_LOOKUP as JSON object)
  await testPOST(
    'enterprise/enterprise-smb-registration',
    {
      locale: 'id',
      values: {
        companyName: 'CV Usaha Maju Jaya',
        coverageMode: 'new-installation',
        servicePackage: 'business-50mbps',
        bandwidthNeed: '50mbps',
        contactName: 'Dewi Rahayu',
        coverageAddress: {
          street: 'Jl. Sudirman No. 10, Karet Semanggi',
          city: 'Jakarta Selatan',
          postalCode: '12190',
        },
        contactEmail: 'dewi@usahamaju.co.id',
        contactPhone: '+628333456789',
        billingSameAsService: true,
        notes: 'Phase 6 SMB test',
      },
      groups: [],
      files: [],
    },
    'A3a',
    'Enterprise SMB Registration — POST valid submission'
  );

  // A4 — enterprise-suggest GET (ROUTING_ONLY)
  // NOTE: Plan doc uses slug "suggest-enterprise" — actual DB slug is "enterprise-suggest"
  await testGET('enterprise/enterprise-suggest', 'A4', 'Enterprise Suggest — GET form definition [ROUTING_ONLY, slug: enterprise-suggest]');

  // A4a — enterprise-suggest POST (ROUTING_ONLY → persisted:false expected)
  await testPOST(
    'enterprise/enterprise-suggest',
    {
      locale: 'id',
      values: {
        businessNeed: ['digital-transformation', 'connectivity'],
        companySize: '11-50',
        digitalMaturity: 'basic',
        industry: 'retail',
        timeline: '3-6-months',
        email: 'test@contoh.co.id',
      },
      groups: [],
      files: [],
    },
    'A4a',
    'Enterprise Suggest — POST ROUTING_ONLY (expect persisted:false, no DB record)',
    { expectPersisted: false }
  );

  // A5 — enterprise event-register GET
  await testGET('enterprise/event-register', 'A5', 'Enterprise Event Register — GET form definition (REPEATER)');

  // A5a — enterprise event-register POST with groups (2 participants)
  await testPOST(
    'enterprise/event-register',
    {
      locale: 'id',
      values: {
        eventName: 'Linknet Enterprise Summit 2025',
        companyName: 'PT Teknologi Nusantara',
        companyEmail: 'pic@teknologinusantara.co.id',
        companyPhone: '+628444567890',
        companyAddress: 'Jl. TB Simatupang No. 15, Jakarta Selatan 12430',
        picName: 'Rendra Pratama',
        picEmail: 'rendra@teknologinusantara.co.id',
        picPhone: '+628555678901',
        notes: 'Phase 6 group/repeater test — 2 participants',
      },
      groups: [
        {
          groupKey: 'participants',
          sortOrder: 0,
          label: 'Participant 1',
          values: {
            firstName: 'Siti',
            lastName: 'Rahmawati',
            jobTitle: 'CTO',
            companyEmail: 'siti.r@teknologinusantara.co.id',
            phone: '+628666789012',
          },
        },
        {
          groupKey: 'participants',
          sortOrder: 1,
          label: 'Participant 2',
          values: {
            firstName: 'Fajar',
            lastName: 'Nugroho',
            jobTitle: 'IT Director',
            companyEmail: 'fajar.n@teknologinusantara.co.id',
            phone: '+628777890123',
          },
        },
      ],
      files: [],
    },
    'A5a',
    'Enterprise Event Register — POST with 2 participants (groups/repeater)'
  );

  // ──────────────────────────────────────────────────────────
  // [B] FIBER FORMS
  // ──────────────────────────────────────────────────────────
  console.log('\n══ [B] FIBER FORMS ═════════════════════════════════════════\n');

  // B1 — fiber-registration GET
  await testGET('fiber/fiber-registration', 'B1', 'Fiber Registration — GET form definition (FILE fields)');

  // B1a — fiber-registration POST without required file fields (test file-field absence handling)
  // Note: server does not enforce required at API level, submission stored with status STORED (no files)
  await testPOST(
    'fiber/fiber-registration',
    {
      locale: 'id',
      values: {
        companyName: 'PT Sinar Mandiri',
        npwpNumber: '01.234.567.8-001.000',
        nibNumber: '1234567890123',
        requiredBandwidth: '100mbps',
        serviceAddress: {
          street: 'Jl. Gatot Subroto Kav. 40',
          city: 'Jakarta Selatan',
          postalCode: '12930',
        },
        companyEmail: 'info@sinarmandiri.co.id',
        companyPhone: '+628888901234',
        infrastructureStatus: 'building',
        picName: 'Hendra Kusuma',
        picEmail: 'hendra@sinarmandiri.co.id',
      },
      groups: [],
      files: [],
    },
    'B1a',
    'Fiber Registration — POST without files (no server-side required enforcement)'
  );

  // B1b — fiber-registration POST with file URL references
  await testPOST(
    'fiber/fiber-registration',
    {
      locale: 'id',
      values: {
        companyName: 'PT Cahaya Fiber',
        npwpNumber: '09.876.543.2-002.000',
        nibNumber: '9876543210987',
        requiredBandwidth: '200mbps',
        serviceAddress: {
          street: 'Jl. HR Rasuna Said Kav. X-2',
          city: 'Jakarta Selatan',
          postalCode: '12950',
        },
        companyEmail: 'info@cahayafiber.co.id',
        companyPhone: '+628899012345',
        infrastructureStatus: 'ready',
        picName: 'Wahyu Santoso',
        picEmail: 'wahyu@cahayafiber.co.id',
        picPhone: '+628990123456',
        buildingType: 'perkantoran',
        additionalNotes: 'Phase 6 fiber test with file refs',
      },
      groups: [],
      files: [
        {
          fieldPath: 'npwpFile',
          originalName: 'npwp_cahayafiber.pdf',
          mimeType: 'application/pdf',
          size: 102400,
          url: 'https://storage.example.com/fiber/npwp_cahayafiber.pdf',
        },
        {
          fieldPath: 'nibFile',
          originalName: 'nib_cahayafiber.pdf',
          mimeType: 'application/pdf',
          size: 51200,
          url: 'https://storage.example.com/fiber/nib_cahayafiber.pdf',
        },
        {
          fieldPath: 'companySignatureFile',
          originalName: 'signature_cahayafiber.pdf',
          mimeType: 'application/pdf',
          size: 20480,
          url: 'https://storage.example.com/fiber/sig_cahayafiber.pdf',
        },
      ],
    },
    'B1b',
    'Fiber Registration — POST with file references (status=STORED expected)'
  );

  // B2 — fiber-inquiry GET + POST
  await testGET('fiber/fiber-inquiry', 'B2', 'Fiber Inquiry — GET form definition');

  await testPOST(
    'fiber/fiber-inquiry',
    {
      locale: 'id',
      values: {
        companyName: 'PT Indah Jaya Sentosa',
        needType: 'new-service',
        servicesInterest: ['dedicated-internet', 'mpls'],
        companyEmail: 'info@indahjayasentosa.co.id',
        companyPhone: '+629001234567',
        currentProvider: 'Provider Existing',
        preferredContactTime: 'morning',
        message: 'Phase 6 fiber inquiry test',
      },
      groups: [],
      files: [],
    },
    'B2a',
    'Fiber Inquiry — POST valid submission'
  );

  // B3 — fiber event-register GET + POST
  await testGET('fiber/event-register', 'B3', 'Fiber Event Register — GET form definition');

  await testPOST(
    'fiber/event-register',
    {
      locale: 'id',
      values: {
        eventName: 'Fiber Business Connectivity Forum',
        companyName: 'PT Sukses Koneksi',
        companyEmail: 'pic@sukseskoneksi.co.id',
        companyPhone: '+629112345678',
        picName: 'Agus Setiawan',
        picEmail: 'agus@sukseskoneksi.co.id',
        picPhone: '+629223456789',
        notes: 'Phase 6 fiber event test',
      },
      groups: [
        {
          groupKey: 'participants',
          sortOrder: 0,
          label: 'Participant 1',
          values: {
            firstName: 'Rina',
            lastName: 'Aprilia',
            jobTitle: 'Network Engineer',
            companyEmail: 'rina@sukseskoneksi.co.id',
            phone: '+629334567890',
          },
        },
      ],
      files: [],
    },
    'B3a',
    'Fiber Event Register — POST with 1 participant (group)'
  );

  // ──────────────────────────────────────────────────────────
  // [C] MEDIA FORMS
  // ──────────────────────────────────────────────────────────
  console.log('\n══ [C] MEDIA FORMS ═════════════════════════════════════════\n');

  // C1 — media-registration GET + POST
  await testGET('media/media-registration', 'C1', 'Media Registration — GET form definition');

  await testPOST(
    'media/media-registration',
    {
      locale: 'id',
      values: {
        companyName: 'PT Media Kreatif Digital',
        brandName: 'MediaKreatifDigital',
        campaignObjective: 'Brand awareness untuk peluncuran produk baru kuartal 2 tahun 2025 dengan target menjangkau segmen usia 25-40 tahun.',
        solutionsInterest: ['digital-ads', 'content-marketing'],
        platformType: ['social-media', 'display-ads'],
        industry: 'retail',
        budgetRange: '50jt-100jt',
        picName: 'Laras Dewi',
        picEmail: 'laras@mediakreatifdigital.co.id',
        picPhone: '+629445678901',
        preferredLaunchDate: '2025-06-01',
        notes: 'Phase 6 media registration test',
      },
      groups: [],
      files: [],
    },
    'C1a',
    'Media Registration — POST valid submission'
  );

  // C2 — media event-register GET + POST
  await testGET('media/event-register', 'C2', 'Media Event Register — GET form definition');

  await testPOST(
    'media/event-register',
    {
      locale: 'id',
      values: {
        eventName: 'Media Partner Summit 2025',
        companyName: 'PT Adverti Kreatif',
        companyEmail: 'pic@advertikreatif.co.id',
        companyPhone: '+629556789012',
        picName: 'Kevin Hartono',
        picEmail: 'kevin@advertikreatif.co.id',
        picPhone: '+629667890123',
        notes: 'Phase 6 media event test',
      },
      groups: [
        {
          groupKey: 'participants',
          sortOrder: 0,
          label: 'Participant 1',
          values: {
            firstName: 'Nadia',
            lastName: 'Pertiwi',
            jobTitle: 'Brand Manager',
            companyEmail: 'nadia@advertikreatif.co.id',
            phone: '+629778901234',
          },
        },
      ],
      files: [],
    },
    'C2a',
    'Media Event Register — POST with 1 participant (group)'
  );

  // ──────────────────────────────────────────────────────────
  // [D] VALIDATION & ERROR HANDLING TESTS
  // ──────────────────────────────────────────────────────────
  console.log('\n══ [D] VALIDATION & ERROR HANDLING ════════════════════════\n');

  // D1 — Invalid businessUnit param (enum validation via Zod params)
  await testPOST(
    'unknown-bu/some-form',
    { values: {}, groups: [], files: [] },
    'D1',
    'Invalid businessUnit param → expect 400',
    { expectStatus: 400 }
  );

  // D2 — Valid businessUnit but non-existent slug → 404
  await testGET('enterprise/non-existent-form-slug', 'D2', 'Non-existent slug → expect 404 (tested via GET)');
  // Override check — expect 404
  try {
    const res = await fetch(`${BASE_URL}/forms/enterprise/non-existent-form-slug`);
    if (res.status === 404) {
      log('✅', 'D2', 'Non-existent slug → 404 confirmed');
      passed++;
      // undo the double-count from testGET (which already counted fail)
      failed--;
    }
  } catch (_) {}

  // D3 — Missing `values` field entirely in body → 400 (Zod publicFormSubmissionSchema requires values)
  await testPOST(
    'enterprise/enterprise-consultation',
    { groups: [], files: [] }, // no "values" key
    'D3',
    'Missing required "values" field in body → expect 400',
    { expectStatus: 400 }
  );

  // D4 — values is wrong type (string instead of object) → 400
  await testPOST(
    'enterprise/enterprise-consultation',
    { values: 'not-an-object', groups: [], files: [] },
    'D4',
    'values is string instead of object → expect 400',
    { expectStatus: 400 }
  );

  // D5 — Invalid slug format (uppercase) → 400 from params regex
  await testPOST(
    'enterprise/Enterprise-Consultation',
    { values: {}, groups: [], files: [] },
    'D5',
    'Slug with uppercase chars → expect 400 (slug regex validation)',
    { expectStatus: 400 }
  );

  // D6 — GET with invalid slug format
  try {
    const res = await fetch(`${BASE_URL}/forms/enterprise/INVALID_SLUG`);
    if (res.status === 400) {
      log('✅', 'D6', `GET with invalid slug format → 400 confirmed`);
      passed++;
    } else {
      log('❌', 'D6', `GET with invalid slug format → expected 400, got ${res.status}`);
      failed++;
    }
  } catch (e) {
    log('❌', 'D6', `GET with invalid slug format → ERROR: ${e.message}`);
    failed++;
  }

  // ──────────────────────────────────────────────────────────
  // [E] FRONTEND STATUS CHECKS (static analysis, no browser)
  // ──────────────────────────────────────────────────────────
  console.log('\n══ [E] FRONTEND MIGRATION STATUS ══════════════════════════\n');

  const { existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  const WEB = 'C:/wamp64/www/linknet_corp_next/web';
  const WEBREF = 'C:/wamp64/www/linknet_corp_next/web_reference_only';

  const modals = [
    { file: 'components/base/modals/ModalFormRegistrationEnterprise.jsx', testId: 'E1', desc: 'ModalFormRegistrationEnterprise (Enterprise Consultation)' },
    { file: 'components/base/modals/ModalFormRegistrationEnterpriseSMB.jsx', testId: 'E2', desc: 'ModalFormRegistrationEnterpriseSMB (Enterprise SMB)' },
    { file: 'components/base/modals/ModalFormPartnershipEnterprise.jsx', testId: 'E3', desc: 'ModalFormPartnershipEnterprise (Enterprise Partnership)' },
    { file: 'components/base/modals/ModalFormSuggestEnterprise.jsx', testId: 'E4', desc: 'ModalFormSuggestEnterprise (Enterprise Suggest)' },
    { file: 'components/base/modals/ModalFormEventRegister.jsx', testId: 'E5', desc: 'ModalFormEventRegister (Event Register — all BU)' },
    { file: 'components/base/modals/ModalFormRegistrationFiber.jsx', testId: 'E6', desc: 'ModalFormRegistrationFiber (Fiber Registration)' },
    { file: 'components/base/modals/ModalFormInquiryFiber.jsx', testId: 'E7', desc: 'ModalFormInquiryFiber (Fiber Inquiry)' },
    { file: 'components/base/modals/ModalFormRegistrationMedia.jsx', testId: 'E8', desc: 'ModalFormRegistrationMedia (Media Registration)' },
  ];

  for (const m of modals) {
    const inWeb = existsSync(join(WEB, m.file));
    const inRef = existsSync(join(WEBREF, m.file));
    if (inWeb) {
      log('✅', m.testId, `${m.desc} → EXISTS in web/ (production)`);
      passed++;
    } else if (inRef) {
      log('⚠️', m.testId, `${m.desc} → MISSING from web/ (only in web_reference_only — NOT YET MIGRATED)`);
      // warning: not pass/fail
    } else {
      log('❌', m.testId, `${m.desc} → NOT FOUND in either web/ or web_reference_only/`);
      failed++;
    }
  }

  // Success/Incomplete pages
  const pages = [
    { file: 'app/[locale]/enterprise/form/success/page.jsx', testId: 'E9', desc: 'Enterprise Form Success Page' },
    { file: 'app/[locale]/enterprise/form/incomplete/page.jsx', testId: 'E10', desc: 'Enterprise Form Incomplete Page' },
  ];

  for (const p of pages) {
    const inWeb = existsSync(join(WEB, p.file));
    const inRef = existsSync(join(WEBREF, p.file));
    if (inWeb) {
      log('✅', p.testId, `${p.desc} → EXISTS in web/ (production)`);
      passed++;
    } else if (inRef) {
      log('⚠️', p.testId, `${p.desc} → MISSING from web/ (only in web_reference_only — NOT YET MIGRATED)`);
    } else {
      log('❌', p.testId, `${p.desc} → NOT FOUND anywhere`);
      failed++;
    }
  }

  // ──────────────────────────────────────────────────────────
  // [F] SUMMARY
  // ──────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  PHASE 6 — FINAL TEST RESULTS');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Total Tests : ${total}`);
  console.log(`  ✅ PASSED   : ${passed}`);
  console.log(`  ❌ FAILED   : ${failed}`);
  console.log('══════════════════════════════════════════════════════════');
  console.log('\n  NOTES:');
  console.log('  ⚠️  Items marked WARN are not counted in PASS/FAIL.');
  console.log('  ⚠️  Slug discrepancy: Plan says "smb-enterprise" → actual DB: "enterprise-smb-registration"');
  console.log('  ⚠️  Slug discrepancy: Plan says "suggest-enterprise" → actual DB: "enterprise-suggest"');
  console.log('  ⚠️  Server does NOT enforce required fields at API level (frontend-only validation).');
  console.log('  ⚠️  B1b stores submissions with status=STORED unless dispatch logs later mark them failed.');
  console.log('══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
