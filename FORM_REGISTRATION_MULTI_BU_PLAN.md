# Form Registration Multi-BU — Analisa & Rencana Implementasi

> Dokumen ini dibuat berdasarkan analisa file referensi:
> `web_reference_only/components/showcase/FormRegistration.jsx` dan seluruh modal form terkait.
>
> **Scope:** Enterprise · Fiber · Media (Corporate **tidak termasuk**)
> **Tanggal Analisa:** 28 April 2026

---

## Daftar Isi

1. [Analisa Form per BU](#1-analisa-form-per-bu)
2. [Breakdown Fitur per BU](#2-breakdown-fitur-per-bu)
3. [Database — Status & Rules](#3-database--status--rules)
4. [Struktur CMS](#4-struktur-cms)
5. [Rencana Implementasi (Phase-based)](#5-rencana-implementasi-phase-based)
6. [Prompt Siap Pakai per Phase](#6-prompt-siap-pakai-per-phase)

---

## 1. Analisa Form per BU

### 1.1 Enterprise

#### A. Enterprise Consultation Form
**File:** `ModalFormRegistrationEnterprise.jsx`
**Total Steps:** 4
**FormCategory (DB):** `REGISTRATION`
**Integration:** CRM Web-to-Lead (Salesforce)

| Step | Nama Step | Field |
|------|-----------|-------|
| 1 | Need & Personal | FirstName\*, LastName\*, Email\*, MobilePhone\*, Department__c\*, Job_Level__c\* |
| 2 | Company | Company\*, Business_Industry__c\*, Province__c\*, City__c\*, Kecamatan_Zipcode__c\*, Building_Name__c\* |
| 3 | Business Needs | Solution__c\* (multi-select), Timeline__c\*, Choose_your_Needs__c\*, Procurement_Method__c\*, Specific_Needs__c\*, Business_Objective__c\* (multi-select) |
| 4 | Review | Read-only summary + Confirm & Submit |

**Opsi Dropdown:**
- Department: IT/Network, Management, Supply Chain/Procurement/GA, Other
- Job Level: 10 opsi (CEO, CTO, IT Head, dll)
- Industry: 15 opsi (Agriculture, Financial, Manufacturing, dll)
- Solution: 11 opsi (Cloud, Corporate TV, Data Center, SD-WAN, dll)
- Timeline: Planned Project / Urgent
- Needs: Billing, Contact Sales, Customer Care, Sales/Product
- Procurement: Direct, Short listed, Tender
- Business Challenge: 5 opsi (checkbox group)

**Validasi:**
- Email: `EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Phone: `PHONE_REGEX = /^0\d{9,}$/`
- Semua field wajib diisi sebelum lanjut ke step berikutnya
- `Solution__c` dan `Business_Objective__c` minimal pilih 1

**Payload Context (dari parent):**
```js
{ Promo_Website__c, Page_Website__c, Source_Website__c }
```

---

#### B. SMB Enterprise Registration
**File:** `ModalFormRegistrationEnterpriseSMB.jsx`
**Total Steps:** 4
**FormCategory (DB):** `REGISTRATION`
**Integration:** Internal (submission) + Coverage Check API

| Step | Nama Step | Field |
|------|-----------|-------|
| 1 | Layanan & Lokasi | internetService\* (select), subscriptionTerm\* (select), Coverage Check via `CoverageCheckInput` (address, site_id, province, city, zip, detailAddress) |
| 2 | Data Diri | companyName\*, brandName\*, picName\*, jobTitle\* (select), companyEmail\*, phoneNumber\*, isBillingSameAsInstallation (checkbox), billingAddress\* (conditional) |
| 3 | Jadwal Instalasi | installDate\* (RadioCardDate dari 5 opsi), installTimeSlot\* (RadioCard: 3 slot) |
| 4 | Review | Read-only summary + Confirm & Submit |

**Opsi Dropdown:**
- Internet Service: 4 paket (30Mbps–200Mbps dengan harga)
- Subscription Term: 12/24/36 Bulan
- Job Title: Owner, Direktur, Manager, Supervisor, Staff, Lainnya
- Install Date: dynamic (5 hari ke depan)
- Time Slot: 09:00-12:00 (default), 12:00-15:00 (disabled), 15:00-18:00

**Fitur Khusus:**
- `CoverageCheckInput` — integrasi coverage API untuk verifikasi area layanan
- `billingAddress` muncul hanya jika `isBillingSameAsInstallation = false`
- `installDate` dari `INSTALL_DATE_OPTIONS` (dynamic dari CMS)
- `installTimeSlot` dari `TIME_SLOTS` (bisa diatur dari CMS)

**Validasi:**
- Email format, Phone format
- Billing address wajib jika tidak sama dengan instalasi
- Install date dan time slot wajib dipilih

---

#### C. Partnership Enterprise
**File:** `ModalFormPartnershipEnterprise.jsx`
**Total Steps:** 2
**FormCategory (DB):** `PARTNERSHIP`
**Integration:** CRM Web-to-Lead

| Step | Nama Step | Field |
|------|-----------|-------|
| 1 | Profile | firstName\*, lastName\*, companyEmail\*, phoneNumber\*, department\*, roleTitle\*, typePartnership\*, otherPartnershipType (conditional) |
| 2 | Company | companyName\*, businessIndustry\*, province\*, city\*, wardZipCode\*, detailAddress\* |

**Opsi Dropdown:**
- Department: IT/Network, Management, Supply Chain/Procurement/GA, Other
- Role Title: 10 opsi (sama dengan Enterprise Consultation)
- Type Partnership: Referral, Reseller, Strategic Alliance, Technology, Others
- Industry: 15 opsi (sama dengan Enterprise Consultation)
- Province → City → Ward/ZIP: cascading dropdown

**Fitur Khusus:**
- `otherPartnershipType` muncul hanya jika `typePartnership === "Others"`

**Validasi:**
- Email format, Phone format
- `otherPartnershipType` wajib jika typePartnership adalah "Others"

---

#### D. Suggest Enterprise
**File:** `ModalFormSuggestEnterprise.jsx`
**Total Steps:** 3
**FormCategory (DB):** `RECOMMENDATION`
**HandlingMode (DB):** `ROUTING_ONLY`
**Integration:** Tidak ada (hanya redirect)

| Step | Label | Field |
|------|-------|-------|
| 1 | Industry | RadioCard — pilih satu industri |
| 2 | Business Scale | RadioCard — pilih skala bisnis |
| 3 | Needs | CheckboxCard — pilih 1+ kebutuhan |

**Sumber Data:** `@/data/constants/suggestEnterprise` (constants file)
- `ALL_INDUSTRY_VALUE`, `ALL_NEEDS_VALUE`, `ALL_SCALE_VALUE`
- `BUSINESS_NEED_OPTIONS`, `BUSINESS_SCALE_OPTIONS`, `INDUSTRY_OPTIONS`

**Flow:**
- User memilih Industry → Business Scale → Needs
- Sistem meredirect ke halaman produk/solusi yang relevan
- **Tidak ada form submission ke database**

---

#### E. Register Event (Enterprise)
**File:** `ModalFormEventRegister.jsx` (shared, digunakan semua BU)
**Total Steps:** 2
**FormCategory (DB):** `EVENT`
**Integration:** Internal + CRM Web-to-Lead

| Step | Label | Field |
|------|-------|-------|
| 1 | Company | participantCount\* (1–maxParticipants), companyName\*, businessIndustry\*, province\*, city\*, wardZipCode\*, detailAddress\* |
| 2 | Participant | Per-participant: firstName\*, lastName\*, companyEmail\*, phoneNumber\*, department\*, roleTitle\* |

**Payload Context (dari parent / halaman event):**
```js
{
  eventName: 'Golf Gala 2025 by Linknet Enterprise',
  Promo_Website__c: '...',
  Page_Website__c: '...',
  Source_Website__c: '...',
  maxParticipants: 5
}
```

**Fitur Khusus:**
- `participantCount` mengontrol jumlah slot peserta yang wajib diisi
- Participant diisi dalam bentuk repeater/group (1 hingga maxParticipants)
- `maxParticipants` bisa berbeda per event (dikontrol dari CMS Event)

---

#### F. Success Page (Enterprise)
**Route:** `/[locale]/enterprise/form/success?name=...&needs=...`

| `needs` param | Konten |
|---------------|--------|
| *(default)* | Success Enterprise generic |
| `Register Event` | Success Register Event |
| `Sales Inquiry` | Success Sales Inquiry |
| `Support` | Success Support |
| `Partnership` | Success Partnership |

---

### 1.2 Fiber

#### A. Fiber Registration
**File:** `ModalFormRegistrationFiber.jsx`
**Total Steps:** 5
**FormCategory (DB):** `REGISTRATION`
**Integration:** Internal (bank data)

| Step | Nama Step | Field |
|------|-----------|-------|
| 1 | Personal | fullName\*, companyEmail\*, phoneNumber\*, yourRole\* (select) |
| 2 | Corporate | companyName\*, directorName\*, province\*, city\*, zipCode\*, detailAddress\*, companyEstablishmentDate\* (date), companyOperatingSince\* (date), nibCompanyNumber\*, npwpCompanyNumber\*, sppkpCompanyNumber\*, licensePermitNumber\*, apjiiMembershipNumber\*, apjiiMembershipActiveDate\* (date) |
| 3 | Infrastructure | employeeCount\*, homepassedCount\*, customerCount\*, coverageArea\* (textarea), ispInfrastructureCoverage\* (textarea), productTypeCount\* |
| 4 | Documents | companySignatureFile\* (**wajib**), npwpCompanyFile, nibCompanyFile, apjiiCertificateFile, linknetProductStatementFile, previousYearFinancialReportFile, companyDeedFile, deedAmendmentFile, corporateTaxReportFile (**semua opsional kecuali signature**) |
| 5 | Review | Read-only summary + Confirm & Submit |

**Opsi Dropdown:**
- Role: Owner, Director, Head of Operation, Business Development, Network Engineer, Procurement
- Province → City → ZIP: cascading (DKI Jakarta, Jabar, Jateng, DIY, Jatim, Banten)

**Fitur Khusus:**
- `InputDate` untuk date fields
- `InputFile` untuk upload dokumen (tipe file ditentukan MIME type)
- File opsional: boleh kosong, bisa dilengkapi kemudian
- `utilizationConfirmed` & `wholesaleProductConfirmed`: checkbox konfirmasi (wajib dicentang)

**Validasi:**
- Email format, Phone format
- `companySignatureFile` wajib diisi
- Semua file opsional tidak wajib
- Kedua checkbox konfirmasi wajib `true`

---

#### B. Fiber Inquiry
**File:** `ModalFormInquiryFiber.jsx`
**Total Steps:** 4
**FormCategory (DB):** `INQUIRY`
**Integration:** Internal + CRM (opsional)

| Step | Nama Step | Field |
|------|-----------|-------|
| 1 | Needs & Personal | needs\* (select: Sales Inquiry/Support/Partnership), fullName\*, companyEmail\*, phoneNumber\*, yourRole\* |
| 2 | Company | companyName\*, brandName\*, province\*, city\*, zipCode\*, detailAddress\* |
| 3 | Services | services\* (conditional: **tidak muncul** jika needs=Support/Partnership), message\* |
| 4 | Review | Read-only summary + Confirm & Submit |

**Opsi Dropdown:**
- Needs: Sales Inquiry, Support, Partnership
- Role: Owner, Director, Manager, Supervisor, Procurement, IT Lead, Network Engineer, Business Development, Other
- Services: Dedicated Internet, Metro Ethernet, IP Transit, Data Center Connectivity, Managed Service, Fiber Backbone Partnership
- Province → City → ZIP: cascading

**Fitur Khusus:**
- Step 3 "Services" field `services` **disembunyikan** jika needs = Support atau Partnership
- Ini adalah form inquiry, bukan registrasi penuh — data lebih ringkas

**Validasi:**
- `services` wajib **hanya jika** needs = Sales Inquiry

---

#### C. Incomplete Registration
**Route:** `/[locale]/enterprise/form/incomplete?name=...`
**Bukan modal** — halaman full-page
**Fungsi:** Notifikasi bahwa registrasi belum lengkap (dokumen belum dilengkapi)

---

#### D. Register Event (Fiber)
Sama dengan Register Event Enterprise, namun Source_Website__c berbeda.

---

#### E. Success Page (Fiber)
**Route:** `/[locale]/enterprise/form/success?name=...&needs=...`
Variants needs: *(default)*, `Sales Inquiry`, `Support`, `Partnership`, `Register Event`

---

### 1.3 Media

#### A. Media Registration
**File:** `ModalFormRegistrationMedia.jsx`
**Total Steps:** 4
**FormCategory (DB):** `REGISTRATION`
**Integration:** Internal (bank data)

| Step | Nama Step | Field |
|------|-----------|-------|
| 1 | Personal | fullName\*, companyEmail\*, phoneNumber\*, yourRole\* (select) |
| 2 | Company | companyName\*, brandName\*, province\*, city\*, zipCode\*, detailAddress\* |
| 3 | Services | solutionsInterest\* (multi-select), platformType\* (select), message\* (textarea) |
| 4 | Review | Read-only summary + Confirm & Submit |

**Opsi Dropdown:**
- Role: Owner, Director, Marketing Manager, Brand Manager, Partnership Lead, Media Planner
- Province → City → ZIP: cascading
- Solutions Interest (multi-select): *dari CMS / bank data*
- Platform Type: *dari CMS / bank data*

**Validasi:**
- Email format, Phone format
- `solutionsInterest`: minimal pilih 1
- `platformType` dan `message` wajib

---

#### B. Register Event (Media)
Sama dengan Register Event Enterprise/Fiber, Source_Website__c berbeda.

---

#### C. Success Page (Media)
**Route:** `/[locale]/enterprise/form/success?name=...&needs=...`
Variants: *(default)*, `Register Event`

---

### 1.4 Perbedaan Utama Antar BU

| Aspek | Enterprise | Fiber | Media |
|-------|-----------|-------|-------|
| Total form (modal) | 5 | 3 | 2 |
| Jumlah steps | 2–4 | 4–5 | 4 |
| Upload dokumen | ❌ | ✅ (Fiber Reg) | ❌ |
| Coverage Check API | ✅ (SMB) | ❌ | ❌ |
| Form ROUTING_ONLY | ✅ (Suggest) | ❌ | ❌ |
| Halaman Incomplete | ❌ | ✅ | ❌ |
| CRM Web-to-Lead | ✅ (Consultation, Partnership) | opsional | ❌ |
| Event Register (shared) | ✅ | ✅ | ✅ |
| Success page shared | ✅ | ✅ | ✅ |

---

## 2. Breakdown Fitur per BU

### 2.1 Enterprise — 5 Form Modules

| Slug | Nama | Category | HandlingMode | CMS Bank Data |
|------|------|----------|--------------|---------------|
| `enterprise-consultation` | Enterprise Consultation | REGISTRATION | SUBMISSION | ✅ |
| `smb-enterprise` | SMB Enterprise | REGISTRATION | SUBMISSION | ✅ |
| `enterprise-partnership` | Enterprise Partnership | PARTNERSHIP | SUBMISSION | ✅ |
| `suggest-enterprise` | Suggest Enterprise | RECOMMENDATION | ROUTING_ONLY | ✅ |
| `event-register` | Event Registration | EVENT | SUBMISSION | ✅ (terhubung CMS Event) |

### 2.2 Fiber — 3 Form Modules

| Slug | Nama | Category | HandlingMode | CMS Bank Data |
|------|------|----------|--------------|---------------|
| `fiber-registration` | Fiber Registration | REGISTRATION | SUBMISSION | ✅ (+ file upload) |
| `fiber-inquiry` | Fiber Inquiry | INQUIRY | SUBMISSION | ✅ |
| `event-register` | Event Registration | EVENT | SUBMISSION | ✅ (terhubung CMS Event) |

### 2.3 Media — 2 Form Modules

| Slug | Nama | Category | HandlingMode | CMS Bank Data |
|------|------|----------|--------------|---------------|
| `media-registration` | Media Registration | REGISTRATION | SUBMISSION | ✅ |
| `event-register` | Event Registration | EVENT | SUBMISSION | ✅ (terhubung CMS Event) |

**Total: 10 Form Module entries** (3 event-register berbeda BU tapi shared modal logic)

---

## 3. Database — Status & Rules

### ⚠️ Aturan Database (WAJIB DIPATUHI)

| Rule | Status |
|------|--------|
| ❌ Tidak boleh recreate database | WAJIB |
| ❌ Tidak boleh drop/alter existing table | WAJIB |
| ✅ Hanya insert/seed data baru | WAJIB |
| ✅ Gunakan naming aman (tidak konflik) | WAJIB |
| ✅ Isolated hanya untuk modul ini | WAJIB |

### 3.1 Status Schema Saat Ini

**KABAR BAIK: Tidak ada migrasi database yang diperlukan.**

Semua tabel sudah tersedia di schema Prisma saat ini:

| Tabel | Status | Keterangan |
|-------|--------|------------|
| `form_modules` | ✅ Tersedia | Mendukung businessUnit, slug, category, handlingMode |
| `form_steps` | ✅ Tersedia | Mendukung multi-step dengan key, title, actionLabel |
| `form_fields` | ✅ Tersedia | Mendukung semua fieldType yang dibutuhkan |
| `form_field_options` | ✅ Tersedia | Untuk dropdown/radio/multi-select options |
| `form_field_rules` | ✅ Tersedia | Untuk conditional logic (show/hide/require) |
| `form_response_configs` | ✅ Tersedia | Untuk routing ke success/incomplete page |
| `form_integration_configs` | ✅ Tersedia | Untuk CRM Web-to-Lead integration |
| `form_submissions` | ✅ Tersedia | Untuk menyimpan data submission |
| `form_submission_values` | ✅ Tersedia | Untuk flat field values |
| `form_submission_groups` | ✅ Tersedia | Untuk repeater (participants) |
| `form_submission_group_values` | ✅ Tersedia | Untuk nilai dalam group |
| `form_submission_files` | ✅ Tersedia | Untuk file upload (Fiber Registration) |

### 3.2 Enum yang Digunakan

```prisma
enum BusinessUnit {
  ENTERPRISE   // ✅ Digunakan
  FIBER        // ✅ Digunakan
  MEDIA        // ✅ Digunakan
}

enum FormCategory {
  REGISTRATION   // Enterprise Consultation, SMB, Fiber Reg, Media Reg
  INQUIRY        // Fiber Inquiry
  PARTNERSHIP    // Enterprise Partnership
  RECOMMENDATION // Suggest Enterprise
  EVENT          // Event Register (semua BU)
}

enum FormHandlingMode {
  SUBMISSION      // Semua form kecuali Suggest
  ROUTING_ONLY    // Suggest Enterprise
}

enum FormFieldType {
  TEXT, EMAIL, PHONE, NUMBER, TEXTAREA, SELECT,
  MULTI_SELECT, CHECKBOX, CHECKBOX_GROUP, RADIO,
  DATE, FILE, FILE_GROUP, ADDRESS_LOOKUP, REPEATER, HIDDEN
}
```

### 3.3 Yang Perlu Dibuat (Seeder Only)

Cukup buat **seeder scripts** untuk mengisi:
1. `form_modules` — 10 records (per BU per slug)
2. `form_steps` — sesuai jumlah step tiap form
3. `form_fields` — semua field per form (dengan fieldType, path, label, validation)
4. `form_field_options` — semua dropdown/radio/checkbox options
5. `form_field_rules` — conditional logic (billingAddress, otherPartnershipType, services)
6. `form_response_configs` — routing success/incomplete
7. `form_integration_configs` — CRM config untuk Enterprise forms

### 3.4 Naming Convention (Safe — Tidak Konflik)

| Entitas | Contoh Slug/Path |
|---------|-----------------|
| Form Module Slug | `enterprise-consultation`, `smb-enterprise`, `fiber-registration`, `media-registration` |
| Step Key | `need_personal`, `company`, `business_needs`, `review` |
| Field Path | `FirstName`, `Email`, `Company`, `Solution__c` (Salesforce), `fullName`, `companyName` |
| Field Key | sama dengan path (snake_case untuk non-CRM) |
| Integration Key | `crm_web_to_lead`, `internal` |
| Response Config Key | `success_default`, `success_event`, `success_inquiry`, `incomplete` |

---

## 4. Struktur CMS

### 4.1 Menu CMS yang Dibutuhkan

```
CMS Sidebar
├── 📋 Form Modules (Global)
│   ├── Semua Form Modules (list dengan filter BU + category)
│   └── Submissions (list dengan filter BU + form)
│
├── 🏢 Enterprise
│   ├── Form: Enterprise Consultation
│   │   ├── Definisi Form (Steps + Fields + Options)
│   │   ├── Rules (Conditional Logic)
│   │   ├── Response Config
│   │   └── Submissions
│   ├── Form: SMB Enterprise
│   ├── Form: Enterprise Partnership
│   ├── Form: Suggest Enterprise
│   └── Form: Event Registration (Enterprise)
│
├── 📡 Fiber
│   ├── Form: Fiber Registration
│   │   └── (termasuk section Upload Documents)
│   ├── Form: Fiber Inquiry
│   └── Form: Event Registration (Fiber)
│
└── 📺 Media
    ├── Form: Media Registration
    └── Form: Event Registration (Media)
```

### 4.2 Integrasi dengan CMS Event (Existing)

Modul `event-register` per BU harus terhubung dengan CMS Event yang sudah ada:

- CMS Event menyimpan: `eventName`, `maxParticipants`, `Promo_Website__c`, `Page_Website__c`, `Source_Website__c`
- Saat user membuka Register Event dari halaman event, data di atas dikirim sebagai payload ke modal
- Form module `event-register` menyimpan context ini di `FormSubmission.eventName`, `promoWebsite`, `pageWebsite`, `sourceWebsite`
- **Tidak perlu tabel baru** — gunakan field yang sudah ada di `form_submissions`

### 4.3 Permissions yang Sudah Ada

```typescript
FORM_MODULES_READ: 'form_modules.read'
FORM_MODULES_CREATE: 'form_modules.create'
FORM_MODULES_UPDATE: 'form_modules.update'
FORM_MODULES_DELETE: 'form_modules.delete'
FORM_SUBMISSIONS_READ: 'form_submissions.read'
FORM_SUBMISSIONS_DELETE: 'form_submissions.delete'
```

Permissions di atas sudah terdaftar di `backend/src/constants/permissions.ts` — tidak perlu tambah baru.

---

## 5. Rencana Implementasi (Phase-based)

---

### Phase 1 — Analisa & Mapping Data

**Objective:** Pastikan semua field, step, option, rule, dan response config sudah terdefinisi dengan benar sebelum masuk ke implementasi.

**Scope Pekerjaan:**
- [ ] Mapping lengkap field path tiap form ke skema FormField
- [ ] Definisikan semua FormFieldOption per field dropdown/radio
- [ ] Identifikasi semua FormFieldRule (conditional logic)
- [ ] Definisikan semua FormResponseConfig per form
- [ ] Definisikan FormIntegrationConfig untuk CRM forms
- [ ] Validasi naming convention (tidak ada konflik slug/path)
- [ ] Dokumentasikan mapping field CRM (payloadKey Salesforce)

**Output/Deliverables:**
- `FORM_FIELD_MAPPING.md` — tabel lengkap semua field per form
- `FORM_RULES_MAPPING.md` — tabel conditional rules
- `FORM_CRM_MAPPING.md` — mapping field Salesforce
- Daftar 10 slug yang akan di-seed

---

### Phase 2 — Seeder Scripts

**Objective:** Buat seeder scripts TypeScript yang aman, idempotent, dan terisolasi untuk mengisi seluruh data definisi form ke database.

**Scope Pekerjaan:**
- [ ] Buat file seeder per BU:
  - `seed-enterprise-forms.ts`
  - `seed-fiber-forms.ts`
  - `seed-media-forms.ts`
- [ ] Setiap seeder: upsert FormModule → Steps → Fields → Options → Rules → ResponseConfigs → IntegrationConfigs
- [ ] Gunakan `prisma.$transaction` untuk atomicity
- [ ] Implementasi idempotent (jika dijalankan ulang, tidak duplikat)
- [ ] Buat `seed-form-registration.ts` sebagai entry point yang memanggil semua seeder BU
- [ ] Test seeder di development database
- [ ] Verifikasi data terbuat dengan benar via API

**Output/Deliverables:**
- `backend/prisma/seeds/seed-enterprise-forms.ts`
- `backend/prisma/seeds/seed-fiber-forms.ts`
- `backend/prisma/seeds/seed-media-forms.ts`
- `backend/prisma/seeds/seed-form-registration.ts` (entry point)
- Bukti seed berhasil (screenshot API response)

---

### Phase 3 — Backend API Validation

**Objective:** Pastikan API yang ada sudah cukup untuk mendukung semua use case, tambahkan endpoint atau logika yang kurang.

**Scope Pekerjaan:**
- [ ] Verifikasi endpoint `GET /forms/:businessUnit/:slug` untuk semua 10 form module
- [ ] Verifikasi endpoint `POST /forms/:businessUnit/:slug/submissions` untuk submission
- [ ] Test submission dengan file upload (Fiber Registration — `multipart/form-data`)
- [ ] Pastikan `FormDispatchMode` dan integrasi CRM berjalan untuk Enterprise forms
- [ ] Tambahkan endpoint/logic untuk ROUTING_ONLY (Suggest Enterprise) jika belum ada
- [ ] Verifikasi `FormResponseConfig` routing ke success/incomplete page berfungsi
- [ ] Test conditional logic rule (billingAddress, otherPartnershipType, services field)

**Output/Deliverables:**
- Semua endpoint terverifikasi dengan Postman/Insomnia collection
- Test cases untuk submission tiap form
- Dokumentasi response format

---

### Phase 4 — Frontend Integration (web/)

**Objective:** Integrasikan semua modal form di folder `web/` (production) dengan backend API, menggantikan hardcoded dummy data dari `web_reference_only/`.

**Scope Pekerjaan:**

**4a. Shared Infrastructure:**
- [ ] Buat hook `useFormModule(businessUnit, slug)` untuk fetch definisi form dari API
- [ ] Buat hook `useFormSubmission(businessUnit, slug)` untuk submit form
- [ ] Buat helper `buildFormPayload(formData, module)` untuk mapping form state ke API payload
- [ ] Setup file upload handler untuk Fiber Registration

**4b. Per-Modal Integration:**
- [ ] `ModalFormRegistrationEnterprise` — connect ke `enterprise/enterprise-consultation`
- [ ] `ModalFormRegistrationEnterpriseSMB` — connect ke `enterprise/smb-enterprise`
- [ ] `ModalFormPartnershipEnterprise` — connect ke `enterprise/enterprise-partnership`
- [ ] `ModalFormSuggestEnterprise` — connect ke `enterprise/suggest-enterprise` (ROUTING_ONLY)
- [ ] `ModalFormEventRegister` — connect ke `{BU}/event-register` (dynamic BU dari context)
- [ ] `ModalFormRegistrationFiber` — connect ke `fiber/fiber-registration` (+ file upload)
- [ ] `ModalFormInquiryFiber` — connect ke `fiber/fiber-inquiry`
- [ ] `ModalFormRegistrationMedia` — connect ke `media/media-registration`

**4c. Success & Incomplete Pages:**
- [ ] Pastikan `/[locale]/enterprise/form/success` membaca param `needs` dengan benar
- [ ] Pastikan `/[locale]/enterprise/form/incomplete` berfungsi untuk Fiber

**Output/Deliverables:**
- Semua modal terkoneksi ke backend API
- Hardcoded dummy data digantikan dengan data dinamis dari CMS
- Success/incomplete page berfungsi dengan benar

---

### Phase 5 — CMS UI (Frontend CMS)

**Objective:** Bangun halaman CMS di `frontend/` untuk mengelola Form Modules dan melihat submissions per BU.

**Scope Pekerjaan:**
- [ ] Halaman list Form Modules (filter by BU, category, status)
- [ ] Halaman detail Form Module (view steps, fields, options, rules)
- [ ] Halaman edit Form Module (update status DRAFT→ACTIVE→ARCHIVED)
- [ ] Halaman list Submissions per form (dengan filter date, search email)
- [ ] Halaman detail Submission (view semua nilai, files, dispatch logs)
- [ ] Integrasi permission FORM_MODULES_READ/UPDATE dan FORM_SUBMISSIONS_READ

**Output/Deliverables:**
- Halaman CMS Form Modules lengkap
- Halaman CMS Submissions lengkap
- Role-based access sesuai permission

---

### Phase 6 — Testing & Validasi

**Objective:** Pastikan seluruh alur form berjalan sempurna end-to-end, tidak ada fitur yang terlewat.

**Scope Pekerjaan:**
- [ ] **Enterprise Consultation** — submit form + verifikasi CRM dispatch
- [ ] **SMB Enterprise** — coverage check + submit + verifikasi data tersimpan
- [ ] **Enterprise Partnership** — submit dengan typePartnership="Others" (test conditional)
- [ ] **Suggest Enterprise** — pilih flow → verifikasi redirect yang benar
- [ ] **Event Register (Enterprise)** — maxParticipants=5, isi semua peserta + submit
- [ ] **Fiber Registration** — upload semua dokumen + submit + verifikasi file tersimpan
- [ ] **Fiber Inquiry** — test needs=Support (services field hidden) + submit
- [ ] **Fiber Incomplete** — verifikasi halaman incomplete dapat diakses
- [ ] **Media Registration** — submit + verifikasi data tersimpan
- [ ] **Event Register (Fiber)** — test dengan maxParticipants berbeda
- [ ] **Event Register (Media)** — test
- [ ] **Success pages** — verifikasi semua `needs` variants menampilkan konten yang benar
- [ ] **Validasi form** — test semua error message muncul dengan benar
- [ ] **Multi-step navigation** — back/forward tiap form

**Output/Deliverables:**
- Checklist testing tercentang semua
- Zero regresi pada halaman eksisting
- Semua submission masuk ke database dengan benar
- CRM dispatch log berhasil (untuk Enterprise forms)

---

## 6. Prompt Siap Pakai per Phase

---

### Prompt Phase 1 — Mapping Data

```
Saya sedang mengimplementasikan Form Registration Multi-BU (Enterprise, Fiber, Media) di project Next.js + Express + Prisma.

Tugas kamu di Phase 1:
Buatkan mapping lengkap untuk form berikut ke struktur FormField Prisma:

1. Enterprise Consultation (4 steps: Need & Personal, Company, Business Needs, Review)
2. SMB Enterprise (4 steps: Layanan & Lokasi, Data Diri, Jadwal Instalasi, Review)
3. Enterprise Partnership (2 steps: Profile, Company)
4. Suggest Enterprise (3 steps: Industry, Business Scale, Needs) — ROUTING_ONLY
5. Event Register (2 steps: Company, Participant — dengan repeater peserta)
6. Fiber Registration (5 steps: Personal, Corporate, Infrastructure, Documents, Review)
7. Fiber Inquiry (4 steps: Needs & Personal, Company, Services, Review)
8. Media Registration (4 steps: Personal, Company, Services, Review)

Untuk setiap form, berikan tabel dengan kolom:
- step_key, field_path, field_key, label, fieldType, isRequired, payloadKey (jika CRM), defaultValue, placeholder

Referensi fieldType: TEXT, EMAIL, PHONE, NUMBER, TEXTAREA, SELECT, MULTI_SELECT, CHECKBOX, 
CHECKBOX_GROUP, RADIO, DATE, FILE, FILE_GROUP, ADDRESS_LOOKUP, REPEATER, HIDDEN

File referensi ada di: web_reference_only/components/base/modals/
```

---

### Prompt Phase 2 — Seeder Scripts

```
Saya sedang membuat seeder scripts untuk Form Registration Multi-BU di project Next.js + Express + Prisma.

Context:
- Database: PostgreSQL via Prisma
- Schema sudah ada: form_modules, form_steps, form_fields, form_field_options, form_field_rules, form_response_configs, form_integration_configs
- BusinessUnit enum: ENTERPRISE, FIBER, MEDIA
- FormCategory enum: REGISTRATION, INQUIRY, PARTNERSHIP, RECOMMENDATION, EVENT
- FormHandlingMode: SUBMISSION, ROUTING_ONLY

Aturan seeder:
- ❌ Jangan drop/recreate tabel
- ✅ Gunakan upsert (createOrUpdate) supaya idempotent
- ✅ Gunakan prisma.$transaction untuk atomicity
- ✅ Isolated, hanya untuk modul ini

Tugas kamu:
Buatkan file seeder TypeScript: `backend/prisma/seeds/seed-enterprise-forms.ts`

Isi seeder untuk form-form Enterprise berikut:
1. enterprise-consultation — REGISTRATION, SUBMISSION
   - Steps: need_personal (step 1), company (step 2), business_needs (step 3), review (step 4)
   - Fields: [gunakan mapping dari Phase 1]
2. smb-enterprise — REGISTRATION, SUBMISSION
3. enterprise-partnership — PARTNERSHIP, SUBMISSION
4. suggest-enterprise — RECOMMENDATION, ROUTING_ONLY
5. event-register — EVENT, SUBMISSION

Sertakan IntegrationConfig CRM Web-to-Lead untuk enterprise-consultation dan enterprise-partnership.
Sertakan FormResponseConfig untuk routing success/incomplete.
```

---

### Prompt Phase 3 — Backend API Validation

```
Saya perlu memvalidasi semua backend API untuk Form Registration Multi-BU.

API yang sudah ada di backend/src/modules/form-modules/:
- GET  /api/v1/forms/:businessUnit/:slug — fetch form definition
- POST /api/v1/forms/:businessUnit/:slug/submissions — submit form

Tugas kamu:
1. Verifikasi apakah endpoint GET sudah me-return steps, fields, options, rules, responseConfigs dengan benar
2. Verifikasi apakah endpoint POST bisa menangani:
   a. Flat field values (enterprise-consultation)
   b. Group/repeater values (event-register — multiple participants)
   c. File uploads (fiber-registration — multipart/form-data)
   d. ROUTING_ONLY handling (suggest-enterprise — tidak simpan submission, hanya routing)
3. Verifikasi FormFieldRule type SHOW/HIDE sudah diimplementasikan atau belum
4. Verifikasi FormDispatch untuk CRM Web-to-Lead integration

Jika ada yang kurang, tambahkan implementasinya.

File yang relevan:
- backend/src/modules/form-modules/formModule.service.ts
- backend/src/modules/form-modules/formModule.controller.ts
- backend/src/modules/form-modules/formSubmissionDispatch.service.ts
- backend/prisma/schema.prisma
```

---

### Prompt Phase 4 — Frontend Integration

```
Saya perlu mengintegrasikan modal form di folder web/ (production) dengan backend API.

Saat ini modal menggunakan hardcoded data dari web_reference_only/.
Target: semua modal fetch definisi dari API dan submit ke API.

Form modules yang perlu diintegrasikan:
1. web/components/base/modals/ModalFormRegistrationEnterprise.jsx → enterprise/enterprise-consultation
2. web/components/base/modals/ModalFormRegistrationEnterpriseSMB.jsx → enterprise/smb-enterprise
3. web/components/base/modals/ModalFormPartnershipEnterprise.jsx → enterprise/enterprise-partnership
4. web/components/base/modals/ModalFormSuggestEnterprise.jsx → enterprise/suggest-enterprise
5. web/components/base/modals/ModalFormEventRegister.jsx → {BU}/event-register (dynamic)
6. web/components/base/modals/ModalFormRegistrationFiber.jsx → fiber/fiber-registration
7. web/components/base/modals/ModalFormInquiryFiber.jsx → fiber/fiber-inquiry
8. web/components/base/modals/ModalFormRegistrationMedia.jsx → media/media-registration

Tugas kamu:
1. Buat shared hook: useFormModule(businessUnit, slug) untuk fetch form definition
2. Buat shared hook: useFormSubmission(businessUnit, slug) untuk submit
3. Integrasikan ModalFormRegistrationEnterprise sebagai contoh pertama
4. Pastikan:
   - Dropdown options datang dari API (FormFieldOption)
   - Conditional logic (show/hide field) mengikuti FormFieldRule
   - Submit payload dikirim ke API dengan format yang benar
   - Success redirect mengikuti FormResponseConfig
   - Loading state dan error handling

API Base URL: dari env NEXT_PUBLIC_API_URL
Endpoint: GET/POST /api/v1/forms/:businessUnit/:slug
```

---

### Prompt Phase 5 — CMS UI

```
Saya perlu membangun halaman CMS untuk mengelola Form Modules di folder frontend/ (Next.js admin CMS).

Backend API yang tersedia (admin):
- GET  /api/v1/cms/form-modules — list semua form modules
- GET  /api/v1/cms/form-modules/:id — detail form module
- PUT  /api/v1/cms/form-modules/:id — update form module
- GET  /api/v1/cms/form-submissions — list submissions
- GET  /api/v1/cms/form-submissions/:id — detail submission

Permission yang digunakan:
- FORM_MODULES_READ, FORM_MODULES_UPDATE
- FORM_SUBMISSIONS_READ

Tugas kamu:
1. Halaman: /cms/form-modules
   - Tabel dengan kolom: Name, BU, Category, Status, Submissions Count, Updated At
   - Filter: businessUnit (All/Enterprise/Fiber/Media), category, status
   - Action: View Detail, Toggle Status (DRAFT→ACTIVE→ARCHIVED)

2. Halaman: /cms/form-modules/:id
   - Tab: Overview | Steps & Fields | Rules | Response Config | Submissions
   - Overview: info dasar (nama, slug, BU, category, status)
   - Steps & Fields: tree view steps → fields (read-only)
   - Submissions: list 20 terbaru dengan search email

3. Halaman: /cms/form-submissions
   - Tabel dengan kolom: Form Name, BU, Primary Name, Email, Status, Received At
   - Filter: businessUnit, formSlug, dateRange
   - Click row → detail submission

Gunakan komponen UI yang sudah ada di frontend/src/components/.
```

---

### Prompt Phase 6 — Testing Checklist

```
Saya perlu melakukan testing end-to-end untuk Form Registration Multi-BU.

Buatkan testing checklist lengkap dan eksekusi testing berikut:

ENTERPRISE:
[ ] Enterprise Consultation — submit form lengkap, verifikasi submission di DB + CRM dispatch log
[ ] SMB Enterprise — lakukan coverage check (success), isi semua step, submit, verifikasi data
[ ] SMB Enterprise — billing berbeda dari instalasi (conditional address field)
[ ] Enterprise Partnership — typePartnership=Others (otherPartnershipType muncul), submit
[ ] Suggest Enterprise — pilih Industry → Scale → Needs, verifikasi redirect URL
[ ] Event Register — maxParticipants=3, isi 3 peserta, submit, verifikasi groups di DB

FIBER:
[ ] Fiber Registration — isi semua step termasuk upload companySignatureFile (wajib), submit
[ ] Fiber Registration — coba submit tanpa signature file → error
[ ] Fiber Registration — centang utilizationConfirmed + wholesaleProductConfirmed
[ ] Fiber Inquiry — needs=Sales Inquiry, isi services, submit
[ ] Fiber Inquiry — needs=Support, verifikasi services field tidak muncul, submit
[ ] Fiber Inquiry — needs=Partnership, verifikasi services field tidak muncul, submit
[ ] Fiber Incomplete Page — akses /id/enterprise/form/incomplete?name=Test

MEDIA:
[ ] Media Registration — isi semua step, solutionsInterest minimal 1, submit
[ ] Media Registration — coba submit tanpa solutionsInterest → error

SUCCESS PAGES:
[ ] /enterprise/form/success?name=Yuta — konten default
[ ] /enterprise/form/success?name=Yuta&needs=Register+Event — konten event
[ ] /enterprise/form/success?name=Yuta&needs=Sales+Inquiry — konten inquiry
[ ] /enterprise/form/success?name=Yuta&needs=Support — konten support
[ ] /enterprise/form/success?name=Yuta&needs=Partnership — konten partnership

VALIDASI FORM:
[ ] Semua required field menampilkan error message jika kosong
[ ] Email invalid → error message format email
[ ] Phone invalid (tidak diawali 0) → error message format phone
[ ] Multi-step: back button kembali ke step sebelumnya dengan data tetap terisi
```

---

## Ringkasan Eksekusi

| Phase | Estimasi Scope | Dependencies |
|-------|---------------|--------------|
| 1 — Mapping Data | Analisa saja, dokumen | File referensi modal |
| 2 — Seeder Scripts | 3 file seeder TS | Phase 1 complete |
| 3 — Backend Validation | Review + fix backend | Phase 2 complete |
| 4 — Frontend Integration | 8 modal + hooks | Phase 3 complete |
| 5 — CMS UI | 3 halaman CMS | Phase 2 complete |
| 6 — Testing | E2E testing semua form | Phase 3, 4, 5 complete |

**Phase 3 dan 5 bisa berjalan paralel** setelah Phase 2 selesai.
**Phase 4 dan 5 bisa dimulai bersamaan** karena tidak saling bergantung langsung.

---

*Dokumen ini dibuat secara otomatis berdasarkan analisa kode referensi. Perbarui dokumen jika ada perubahan requirement.*
