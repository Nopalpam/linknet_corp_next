# Form Field Mapping — Multi-BU Registration

> **Phase 1 Output** — Mapping lengkap semua field ke struktur FormField Prisma  
> **Sumber:** `web_reference_only/components/base/modals/` + `web_reference_only/data/constants/suggestEnterprise.js`  
> **Tanggal:** 28 April 2026

---

## Daftar Isi

1. [Form 1 — Enterprise Consultation](#1-enterprise-consultation)
2. [Form 2 — SMB Enterprise](#2-smb-enterprise)
3. [Form 3 — Enterprise Partnership](#3-enterprise-partnership)
4. [Form 4 — Suggest Enterprise (ROUTING_ONLY)](#4-suggest-enterprise)
5. [Form 5 — Event Register](#5-event-register)
6. [Form 6 — Fiber Registration](#6-fiber-registration)
7. [Form 7 — Fiber Inquiry](#7-fiber-inquiry)
8. [Form 8 — Media Registration](#8-media-registration)
9. [Shared Field Options Reference](#9-shared-field-options-reference)
10. [Conditional Rules Summary](#10-conditional-rules-summary)

---

## Konvensi Kolom

| Kolom | Keterangan |
|-------|-----------|
| `step_key` | Key unik step dalam DB (`form_steps.key`) |
| `field_path` | Nama variabel di `form` state (persis dari source code) |
| `field_key` | Key unik field dalam DB (`form_fields.key`) — snake_case |
| `label` | Label tampil ke user |
| `fieldType` | Enum `FormFieldType` di Prisma |
| `isRequired` | `true` / `false` / `conditional` (tergantung rule) |
| `payloadKey` | Key Salesforce CRM (hanya untuk form dengan integrasi CRM) |
| `defaultValue` | Nilai awal dari `INITIAL_FORM` |
| `placeholder` | Placeholder hint untuk input |

---

## 1. Enterprise Consultation

**Slug:** `enterprise-consultation` | **BU:** `ENTERPRISE` | **Category:** `REGISTRATION`  
**HandlingMode:** `SUBMISSION` | **CRM Integration:** Web-to-Lead (Salesforce)  
**File:** `ModalFormRegistrationEnterprise.jsx`

### Step 1 — `need_personal` (Need & Personal Details)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| need_personal | `FirstName` | `first_name` | First Name | `TEXT` | true | `FirstName` | `""` | Your first name |
| need_personal | `LastName` | `last_name` | Last Name | `TEXT` | true | `LastName` | `""` | Your last name |
| need_personal | `Email` | `email` | Company Email | `EMAIL` | true | `Email` | `""` | your@company.com |
| need_personal | `MobilePhone` | `mobile_phone` | Phone Number | `PHONE` | true | `MobilePhone` | `""` | 08xx-xxxx-xxxx |
| need_personal | `Department__c` | `department` | Your Department | `SELECT` | true | `Department__c` | `""` | Select department |
| need_personal | `Job_Level__c` | `job_level` | Your Role / Title | `SELECT` | true | `Job_Level__c` | `""` | Select role |

### Step 2 — `company` (Company Details)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| company | `Company` | `company_name` | Company Name | `TEXT` | true | `Company` | `""` | Your company name |
| company | `Business_Industry__c` | `business_industry` | Business Industry | `SELECT` | true | `Business_Industry__c` | `""` | Select industry |
| company | `Province__c` | `province` | Province | `SELECT` | true | `Province__c` | `""` | Select province |
| company | `City__c` | `city` | City | `SELECT` | true | `City__c` | `""` | Select city |
| company | `Kecamatan_Zipcode__c` | `ward_zip_code` | Ward / ZIP Code | `SELECT` | true | `Kecamatan_Zipcode__c` | `""` | Select ward/zip |
| company | `Building_Name__c` | `building_name` | Detail Address | `TEXT` | true | `Building_Name__c` | `""` | Office/Building name |

### Step 3 — `business_needs` (Business Needs)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| business_needs | `Solution__c` | `solution` | Solution | `MULTI_SELECT` | true (min 1) | `Solution__c` | `[]` | — |
| business_needs | `Timeline__c` | `timeline` | Timeline | `SELECT` | true | `Timeline__c` | `""` | Select timeline |
| business_needs | `Choose_your_Needs__c` | `choose_needs` | Choose Your Needs | `SELECT` | true | `Choose_your_Needs__c` | `""` | Select needs |
| business_needs | `Procurement_Method__c` | `procurement_method` | Procurement Method | `SELECT` | true | `Procurement_Method__c` | `""` | Select method |
| business_needs | `Specific_Needs__c` | `specific_needs` | Specific Needs | `TEXTAREA` | true | `Specific_Needs__c` | `""` | Describe your needs |
| business_needs | `Business_Objective__c` | `business_objective` | Business Challenge | `CHECKBOX_GROUP` | true (min 1) | `Business_Objective__c` | `[]` | — |

### Step 4 — `review` (Review & Hidden Payload)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| review | `Web_to_Lead__c` | `web_to_lead` | — | `HIDDEN` | false | `Web_to_Lead__c` | `true` | — |
| review | `LeadSource` | `lead_source` | — | `HIDDEN` | false | `LeadSource` | `"Website"` | — |
| review | `Promo_Website__c` | `promo_website` | — | `HIDDEN` | false | `Promo_Website__c` | `"Enterprise Consultation"` | — |
| review | `Page_Website__c` | `page_website` | — | `HIDDEN` | false | `Page_Website__c` | `"/enterprise/form"` | — |
| review | `Source_Website__c` | `source_website` | — | `HIDDEN` | false | `Source_Website__c` | `"Enterprise Website"` | — |
| review | `I_am_an_existing_Link_Net_Customer__c` | `existing_customer` | Existing Linknet Customer | `CHECKBOX` | false | `I_am_an_existing_Link_Net_Customer__c` | `false` | — |

### Field Options — Enterprise Consultation

**`Department__c`** (SELECT):
- `IT/ Network`
- `Management`
- `Supply Chain Management/ Procurement/ GA`
- `Other`

**`Job_Level__c`** (SELECT):
- `CEO`
- `CTO/Technical Director`
- `Engineering/Technical Officer`
- `IT Head/IT Manager/IT Staff`
- `Kepala Yayasan/Wakil`
- `Marketing Director/Manager`
- `Procurement/SCM`
- `Rektor/Kepala Sekolah/Wakil`
- `Sales Director/Manager`
- `Tim IT/Administrasi`

**`Business_Industry__c`** (SELECT): → lihat [Shared Options](#91-industry-options)

**`Province__c`** (SELECT): → lihat [Shared Options](#92-province--city--ward-cascading)

**`City__c`** (SELECT): cascading dari `Province__c` → lihat [Shared Options](#92-province--city--ward-cascading)

**`Kecamatan_Zipcode__c`** (SELECT): cascading dari `City__c` → lihat [Shared Options](#92-province--city--ward-cascading)

**`Solution__c`** (MULTI_SELECT):
- `Cloud`
- `Corporate TV`
- `Data Center`
- `Data Communication`
- `Internet`
- `IOT`
- `Managed Service`
- `Penetration Test`
- `SD-WAN`
- `Voice`
- `VSAT`

**`Timeline__c`** (SELECT):
- `Planned Project`
- `Urgent/ Unplanned`

**`Choose_your_Needs__c`** (SELECT):
- `Billing/ Subscription/ Contract`
- `Contact Sales Person`
- `Customer Care`
- `Sales/ Product`

**`Procurement_Method__c`** (SELECT):
- `Direct`
- `Short listed`
- `Tender`

**`Business_Objective__c`** (CHECKBOX_GROUP):
- `Adjust the digital transformation`
- `Business Process Automation`
- `Changing and uncertain business environment`
- `Customer Engagement`
- `Data Security and Privacy`

---

## 2. SMB Enterprise

**Slug:** `smb-enterprise` | **BU:** `ENTERPRISE` | **Category:** `REGISTRATION`  
**HandlingMode:** `SUBMISSION` | **CRM Integration:** tidak ada (internal)  
**File:** `ModalFormRegistrationEnterpriseSMB.jsx`

### Step 1 — `lokasi` (Layanan & Lokasi Pemasangan)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| lokasi | `internetService` | `internet_service` | Layanan Internet | `SELECT` | true | — | `""` | Pilih layanan |
| lokasi | `subscriptionTerm` | `subscription_term` | Jangka Waktu Berlangganan | `SELECT` | true | — | `""` | Pilih durasi |
| lokasi | `address` | `coverage_address` | Alamat Pemasangan | `ADDRESS_LOOKUP` | true | — | `""` | Cari alamat |
| lokasi | `site_id` | `coverage_site_id` | Site ID | `HIDDEN` | false | — | `""` | — |
| lokasi | `manualProvince` | `manual_province` | Provinsi (Manual) | `HIDDEN` | false | — | `""` | — |
| lokasi | `manualCity` | `manual_city` | Kota (Manual) | `HIDDEN` | false | — | `""` | — |
| lokasi | `manualZip` | `manual_zip` | Kode Pos (Manual) | `HIDDEN` | false | — | `""` | — |
| lokasi | `manualDetailAddress` | `manual_detail_address` | Alamat Detail (Manual) | `HIDDEN` | false | — | `""` | — |

> **Catatan:** `ADDRESS_LOOKUP` adalah komponen `CoverageCheckInput`. Mode bisa `AUTO` (via API coverage) atau `MANUAL` (pilih province/city/zip + detail address). Sub-field manual disimpan sebagai `HIDDEN` karena dikontrol oleh komponen.

### Step 2 — `personal_data` (Data Diri)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| personal_data | `companyName` | `company_name` | Nama Perusahaan | `TEXT` | true | — | `""` | Nama perusahaan |
| personal_data | `brandName` | `brand_name` | Nama Brand | `TEXT` | true | — | `""` | Nama brand |
| personal_data | `picName` | `pic_name` | Nama PIC | `TEXT` | true | — | `""` | Nama lengkap PIC |
| personal_data | `jobTitle` | `job_title` | Jabatan | `SELECT` | true | — | `""` | Pilih jabatan |
| personal_data | `companyEmail` | `company_email` | Email | `EMAIL` | true | — | `""` | email@perusahaan.com |
| personal_data | `phoneNumber` | `phone_number` | No HP | `PHONE` | true | — | `""` | 08xx-xxxx-xxxx |
| personal_data | `isBillingSameAsInstallation` | `billing_same_as_installation` | Alamat Penagihan = Alamat Instalasi | `CHECKBOX` | false | — | `false` | — |
| personal_data | `billingAddress` | `billing_address` | Alamat Penagihan | `TEXTAREA` | conditional | — | `""` | Masukkan alamat penagihan |

> **Rule:** `billingAddress` wajib diisi **jika** `isBillingSameAsInstallation = false`.

### Step 3 — `schedule` (Jadwal Instalasi)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| schedule | `installDate` | `install_date` | Tanggal Instalasi | `RADIO` | true | — | `""` | — |
| schedule | `installTimeSlot` | `install_time_slot` | Slot Waktu Instalasi | `RADIO` | true | — | `"09:00 - 12:00"` | — |

### Step 4 — `review` (Review — read-only, tidak ada field input)

### Field Options — SMB Enterprise

**`internetService`** (SELECT):
- `Broadband 30 Mbps - Rp 350.000/Bulan`
- `Broadband 50 Mbps - Rp 400.000/Bulan`
- `Broadband 100 Mbps - Rp 600.000/Bulan`
- `Broadband 200 Mbps - Rp 1.250.000/Bulan`

**`subscriptionTerm`** (SELECT):
- `12 Bulan`
- `24 Bulan`
- `36 Bulan`

**`jobTitle`** (SELECT):
- `Owner`
- `Direktur`
- `Manager`
- `Supervisor`
- `Staff`
- `Lainnya`

**`installDate`** (RADIO — RadioCardDate): _Dinamis: 5 hari ke depan dari tanggal form dibuka_  
Contoh seed (placeholder — data actual di-generate runtime dari CMS):
- `{ value: "2026-04-29", dayLabel: "Rabu", dateLabel: "29 Apr" }` *(+1 hari)*
- `{ value: "2026-04-30", dayLabel: "Kamis", dateLabel: "30 Apr" }` *(+2 hari)*
- `{ value: "2026-05-01", dayLabel: "Jumat", dateLabel: "1 Mei" }` *(+3 hari)*
- `{ value: "2026-05-02", dayLabel: "Sabtu", dateLabel: "2 Mei" }` *(+4 hari)*
- `{ value: "2026-05-03", dayLabel: "Minggu", dateLabel: "3 Mei" }` *(+5 hari)*

**`installTimeSlot`** (RADIO — RadioCard):
- `09:00 - 12:00` *(default, selected)*
- `15:00 - 18:00`
- `12:00 - 15:00` *(disabled)*

---

## 3. Enterprise Partnership

**Slug:** `enterprise-partnership` | **BU:** `ENTERPRISE` | **Category:** `PARTNERSHIP`  
**HandlingMode:** `SUBMISSION` | **CRM Integration:** Web-to-Lead (Salesforce)  
**File:** `ModalFormPartnershipEnterprise.jsx`

### Step 1 — `profile` (Profile)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| profile | `firstName` | `first_name` | First Name | `TEXT` | true | `FirstName` | `""` | Your first name |
| profile | `lastName` | `last_name` | Last Name | `TEXT` | true | `LastName` | `""` | Your last name |
| profile | `companyEmail` | `company_email` | Company Email | `EMAIL` | true | `Email` | `""` | your@company.com |
| profile | `phoneNumber` | `phone_number` | Phone Number | `PHONE` | true | `MobilePhone` | `""` | 08xx-xxxx-xxxx |
| profile | `department` | `department` | Your Department | `SELECT` | true | `Department__c` | `""` | Select department |
| profile | `roleTitle` | `role_title` | Your Role / Title | `SELECT` | true | `Job_Level__c` | `""` | Select role |
| profile | `typePartnership` | `type_partnership` | Type of Partnership | `SELECT` | true | `Type_of_Partnership__c` | `""` | Select type |
| profile | `otherPartnershipType` | `other_partnership_type` | Other Partnership Type | `TEXT` | conditional | `Other_Partnership_Type__c` | `""` | Describe partnership type |

> **Rule:** `otherPartnershipType` wajib diisi **jika** `typePartnership = "Others"`.

### Step 2 — `company` (Company Details)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| company | `companyName` | `company_name` | Company Name | `TEXT` | true | `Company` | `""` | Your company name |
| company | `businessIndustry` | `business_industry` | Business Industry | `SELECT` | true | `Business_Industry__c` | `""` | Select industry |
| company | `province` | `province` | Province | `SELECT` | true | `Province__c` | `""` | Select province |
| company | `city` | `city` | City | `SELECT` | true | `City__c` | `""` | Select city |
| company | `wardZipCode` | `ward_zip_code` | Ward / ZIP Code | `SELECT` | true | `Kecamatan_Zipcode__c` | `""` | Select ward/zip |
| company | `detailAddress` | `detail_address` | Detail Address | `TEXTAREA` | true | `Building_Name__c` | `""` | Full address detail |

**Hidden fields (review step — CRM payload):**

| step_key | field_path | field_key | fieldType | payloadKey | defaultValue |
|----------|-----------|-----------|-----------|-----------|-------------|
| review | `Web_to_Lead__c` | `web_to_lead` | `HIDDEN` | `Web_to_Lead__c` | `true` |
| review | `LeadSource` | `lead_source` | `HIDDEN` | `LeadSource` | `"Website"` |
| review | `Promo_Website__c` | `promo_website` | `HIDDEN` | `Promo_Website__c` | `"Enterprise Partnership"` |
| review | `Page_Website__c` | `page_website` | `HIDDEN` | `Page_Website__c` | `"/enterprise/form"` |
| review | `Source_Website__c` | `source_website` | `HIDDEN` | `Source_Website__c` | `"Enterprise Website"` |
| review | `I_am_an_existing_Link_Net_Customer__c` | `existing_customer` | `CHECKBOX` | `I_am_an_existing_Link_Net_Customer__c` | `false` |

### Field Options — Enterprise Partnership

**`department`** (SELECT): → sama dengan Enterprise Consultation `Department__c`

**`roleTitle`** (SELECT): → sama dengan Enterprise Consultation `Job_Level__c`

**`typePartnership`** (SELECT):
- `Referral Partnership`
- `Reseller Partnership`
- `Strategic Alliance`
- `Technology Partnership`
- `Others`

**`businessIndustry`** (SELECT): → lihat [Shared Options](#91-industry-options)

**`province` / `city` / `wardZipCode`** (SELECT): → lihat [Shared Options](#92-province--city--ward-cascading)

---

## 4. Suggest Enterprise

**Slug:** `suggest-enterprise` | **BU:** `ENTERPRISE` | **Category:** `RECOMMENDATION`  
**HandlingMode:** `ROUTING_ONLY` — **tidak ada form submission, tidak ada simpan ke DB**  
**File:** `ModalFormSuggestEnterprise.jsx`  
**Sumber Data:** `web_reference_only/data/constants/suggestEnterprise.js`

### Step 1 — `industry` (Industry)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| industry | `selectedIndustry` | `industry` | Industry | `RADIO` | false | — | `"all-industry"` | — |

> Field menggunakan komponen `RadioCard` dengan gambar/icon. Nilai `all-industry` = show all industries.

### Step 2 — `business_scale` (Business Scale)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| business_scale | `selectedScale` | `business_scale` | Business Scale | `RADIO` | false | — | `"all-scales"` | — |

### Step 3 — `needs` (Needs)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| needs | `selectedNeeds` | `business_needs` | Business Needs | `CHECKBOX_GROUP` | false | — | `[]` | — |

> Menggunakan `CheckboxCard`. Toggle `all-needs` → reset ke `[]`. Tidak ada minimum selection — user boleh tidak memilih untuk melihat semua rekomendasi.

### Field Options — Suggest Enterprise

**`industry`** (RADIO — RadioCard with image):

| value | label |
|-------|-------|
| `all-industry` | All Industry |
| `agriculture-forestry-fishing` | Agriculture, Forestry, Fishing |
| `entertainment-media-advertising` | Entertainment, Media & Advertising |
| `financial-service-institutions` | Financial Service Institutions |
| `food-beverage` | Food & Beverage |
| `general-services` | General Services |
| `government-affairs` | Government & Affairs |
| `holding-company` | Holding Company |
| `hospitality-services` | Hospitality Services |
| `it-telecommunication` | IT & Telecommunication |
| `manufacturing` | Manufacturing |
| `mining-and-oil-gas` | Mining and Oil & Gas |
| `property-construction` | Property & Construction |
| `retail-trade` | Retail Trade |
| `services` | Services |
| `transportation-public-utilities` | Transportation & Public Utilities |

**`businessScale`** (RADIO — RadioCard with image):

| value | label |
|-------|-------|
| `all-scales` | All Scales |
| `small-business` | Small Business (1-10 Employees) |
| `medium-enterprise` | Medium Enterprise (11-50 Employees) |
| `large-enterprise` | Large Enterprise (50+ Employees) |

**`businessNeeds`** (CHECKBOX_GROUP — CheckboxCard):

| value | label |
|-------|-------|
| `digital-transformation` | Adjust the digital transformation |
| `business-process-automation` | Business Process Automation |
| `customer-engagement` | Customer Engagement |
| `business-environment` | Changing and uncertain business environment |
| `data-security-privacy` | Data Security and Privacy |

---

## 5. Event Register

**Slug:** `event-register` | **BU:** `ENTERPRISE` / `FIBER` / `MEDIA` (3 entries terpisah di DB)  
**Category:** `EVENT` | **HandlingMode:** `SUBMISSION` | **CRM Integration:** Web-to-Lead  
**File:** `ModalFormEventRegister.jsx`  

> Form ini **shared** — modal logic sama, tapi disimpan sebagai 3 `form_module` terpisah per BU dengan `Source_Website__c` berbeda.

### Step 1 — `company` (Company Details)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| company | `participantCount` | `participant_count` | Jumlah Peserta | `SELECT` | conditional | `Participant_Count__c` | `""` | — |
| company | `companyName` | `company_name` | Company Name | `TEXT` | true | `Company` | `""` | Your company name |
| company | `businessIndustry` | `business_industry` | Business Industry | `SELECT` | true | `Business_Industry__c` | `""` | Select industry |
| company | `province` | `province` | Province | `SELECT` | true | `Province__c` | `""` | Select province |
| company | `city` | `city` | City | `SELECT` | true | `City__c` | `""` | Select city |
| company | `wardZipCode` | `ward_zip_code` | Ward / ZIP Code | `SELECT` | true | `Kecamatan_Zipcode__c` | `""` | Select ward/zip |
| company | `detailAddress` | `detail_address` | Detail Address | `TEXTAREA` | true | `Building_Name__c` | `""` | Full address detail |

> **Rule:** `participantCount` wajib jika `maxParticipants > 1`. Jika `maxParticipants = 1`, otomatis di-set `"1"`.

### Step 2 — `participant` (Participant Data — REPEATER)

Field berikut diulang sebanyak `participantCount` kali (1 s/d `maxParticipants`, default max 5).

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| participant | `participants[n].firstName` | `participant_first_name` | First Name | `TEXT` | true | `Participants__c[n].FirstName` | `""` | First name |
| participant | `participants[n].lastName` | `participant_last_name` | Last Name | `TEXT` | true | `Participants__c[n].LastName` | `""` | Last name |
| participant | `participants[n].companyEmail` | `participant_email` | Company Email | `EMAIL` | true | `Participants__c[n].Email` | `""` | email@company.com |
| participant | `participants[n].phoneNumber` | `participant_phone` | Phone Number | `PHONE` | true | `Participants__c[n].MobilePhone` | `""` | 08xx-xxxx-xxxx |
| participant | `participants[n].department` | `participant_department` | Department | `SELECT` | true | `Participants__c[n].Department__c` | `""` | Select department |
| participant | `participants[n].roleTitle` | `participant_role` | Role / Title | `SELECT` | true | `Participants__c[n].Job_Level__c` | `""` | Select role |

> **DB Mapping:** Step `participant` menggunakan `fieldType: REPEATER` sebagai parent. Semua field di atas adalah children dari REPEATER. Data disimpan ke `form_submission_groups` + `form_submission_group_values`.

**Hidden fields (payload context — dari parent page/event):**

| field_path | field_key | fieldType | payloadKey | defaultValue |
|-----------|-----------|-----------|-----------|-------------|
| `eventName` | `event_name` | `HIDDEN` | `Event_Name__c` | `""` (dari payload) |
| `maxParticipants` | `max_participants` | `HIDDEN` | — | `5` |
| `Web_to_Lead__c` | `web_to_lead` | `HIDDEN` | `Web_to_Lead__c` | `true` |
| `LeadSource` | `lead_source` | `HIDDEN` | `LeadSource` | `"Website"` |
| `Promo_Website__c` | `promo_website` | `HIDDEN` | `Promo_Website__c` | `""` (dari payload) |
| `Page_Website__c` | `page_website` | `HIDDEN` | `Page_Website__c` | `""` (dari payload) |
| `Source_Website__c` | `source_website` | `HIDDEN` | `Source_Website__c` | `""` (dari payload) |

### Field Options — Event Register

**`participantCount`** (SELECT): Dinamis berdasarkan `maxParticipants`
- `1 People` → `5 People` (maks sesuai `maxParticipants` dari CMS Event)

**`businessIndustry`** (SELECT): → lihat [Shared Options](#91-industry-options)

**`province` / `city` / `wardZipCode`** (SELECT): → lihat [Shared Options](#92-province--city--ward-cascading)

**`department`** (SELECT): → sama dengan Enterprise Consultation `Department__c`

**`roleTitle`** (SELECT): → sama dengan Enterprise Consultation `Job_Level__c`

---

## 6. Fiber Registration

**Slug:** `fiber-registration` | **BU:** `FIBER` | **Category:** `REGISTRATION`  
**HandlingMode:** `SUBMISSION` | **CRM Integration:** tidak ada (internal/bank data)  
**File:** `ModalFormRegistrationFiber.jsx`

### Step 1 — `personal` (Personal Details)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| personal | `fullName` | `full_name` | Full Name | `TEXT` | true | — | `""` | Your full name |
| personal | `companyEmail` | `company_email` | Company Email | `EMAIL` | true | — | `""` | your@company.com |
| personal | `phoneNumber` | `phone_number` | Phone Number | `PHONE` | true | — | `""` | 08xx-xxxx-xxxx |
| personal | `yourRole` | `your_role` | Your Role / Title | `SELECT` | true | — | `""` | Select role |

### Step 2 — `corporate` (Corporate Profile & Legal)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| corporate | `companyName` | `company_name` | Company Name | `TEXT` | true | — | `""` | Company legal name |
| corporate | `directorName` | `director_name` | Name of Incharge Director | `TEXT` | true | — | `""` | Director full name |
| corporate | `province` | `province` | Province | `SELECT` | true | — | `""` | Select province |
| corporate | `city` | `city` | City | `SELECT` | true | — | `""` | Select city |
| corporate | `zipCode` | `zip_code` | Ward / ZIP Code | `SELECT` | true | — | `""` | Select ZIP |
| corporate | `detailAddress` | `detail_address` | Detail Address | `TEXTAREA` | true | — | `""` | Full company address |
| corporate | `companyEstablishmentDate` | `company_establishment_date` | Company Establishment Date | `DATE` | true | — | `""` | — |
| corporate | `companyOperatingSince` | `company_operating_since` | Company Operating Since | `DATE` | true | — | `""` | — |
| corporate | `nibCompanyNumber` | `nib_number` | NIB Company | `TEXT` | true | — | `""` | Nomor Induk Berusaha |
| corporate | `npwpCompanyNumber` | `npwp_number` | No NPWP Company | `TEXT` | true | — | `""` | Nomor NPWP |
| corporate | `sppkpCompanyNumber` | `sppkp_number` | Company SPPKP Number | `TEXT` | true | — | `""` | Nomor SPPKP |
| corporate | `licensePermitNumber` | `license_permit_number` | License Permit Number | `TEXT` | true | — | `""` | Nomor izin usaha |
| corporate | `apjiiMembershipNumber` | `apjii_membership_number` | APJII Membership Number | `TEXT` | true | — | `""` | Nomor anggota APJII |
| corporate | `apjiiMembershipActiveDate` | `apjii_membership_active_date` | APJII Membership Active Date | `DATE` | true | — | `""` | — |

### Step 3 — `infrastructure` (Infrastructure Details & Requirements)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| infrastructure | `employeeCount` | `employee_count` | Number of Employees | `NUMBER` | true | — | `""` | e.g. 500 |
| infrastructure | `homepassedCount` | `homepassed_count` | Number of Existing Homepassed | `NUMBER` | true | — | `""` | e.g. 10000 |
| infrastructure | `customerCount` | `customer_count` | Number of Existing Customers | `NUMBER` | true | — | `""` | e.g. 5000 |
| infrastructure | `coverageArea` | `coverage_area` | Coverage Area | `TEXTAREA` | true | — | `""` | Daerah cakupan layanan |
| infrastructure | `ispInfrastructureCoverage` | `isp_infra_coverage` | ISP Infrastructure Coverage | `TEXTAREA` | true | — | `""` | Infrastruktur ISP yang dimiliki |
| infrastructure | `productTypeCount` | `product_type_count` | Types of Products | `NUMBER` | true | — | `""` | Jumlah tipe produk |
| infrastructure | `companySignatureFile` | `company_signature_file` | Upload Signature with Company Stamp | `FILE` | true | — | `null` | — |
| infrastructure | `utilizationConfirmed` | `utilization_confirmed` | Confirm utilization of Linknet Fiber Network Infrastructure | `CHECKBOX` | true | — | `false` | — |
| infrastructure | `wholesaleProductConfirmed` | `wholesale_product_confirmed` | Confirm Linknet Fiber Wholesale Product | `CHECKBOX` | true | — | `false` | — |

### Step 4 — `documents` (Upload Documents — semua opsional)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| documents | `npwpCompanyFile` | `npwp_file` | NPWP Company | `FILE` | false | — | `null` | — |
| documents | `nibCompanyFile` | `nib_file` | NIB Company | `FILE` | false | — | `null` | — |
| documents | `apjiiCertificateFile` | `apjii_cert_file` | APJII Participation Certificate | `FILE` | false | — | `null` | — |
| documents | `linknetProductStatementFile` | `linknet_product_statement_file` | Written statement of Linknet product | `FILE` | false | — | `null` | — |
| documents | `previousYearFinancialReportFile` | `financial_report_file` | Previous Year Financial Report | `FILE` | false | — | `null` | — |
| documents | `companyDeedFile` | `company_deed_file` | Company Deed of Establishment | `FILE` | false | — | `null` | — |
| documents | `deedAmendmentFile` | `deed_amendment_file` | Deed of Amendment | `FILE` | false | — | `null` | — |
| documents | `corporateTaxReportFile` | `corporate_tax_report_file` | Corporate Tax Report | `FILE` | false | — | `null` | — |

> **DB Mapping:** File uploads disimpan ke `form_submission_files`. `companySignatureFile` (required) disimpan bersama record infrastruktur. Optional files disimpan ke tabel yang sama tapi `isRequired = false`.

### Step 5 — `review` (Review — read-only, tidak ada field input)

### Field Options — Fiber Registration

**`yourRole`** (SELECT):
- `Owner`
- `Director`
- `Head of Operation`
- `Business Development`
- `Network Engineer`
- `Procurement`

**`province` / `city` / `zipCode`** (SELECT): → lihat [Shared Options](#92-province--city--ward-cascading)

> Catatan: Fiber Registration menggunakan `zipCode` (bukan `wardZipCode`). Cascading: province → city → zip.

---

## 7. Fiber Inquiry

**Slug:** `fiber-inquiry` | **BU:** `FIBER` | **Category:** `INQUIRY`  
**HandlingMode:** `SUBMISSION` | **CRM Integration:** tidak ada (internal)  
**File:** `ModalFormInquiryFiber.jsx`

### Step 1 — `needs_personal` (Needs & Personal Details)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| needs_personal | `needs` | `needs` | Needs | `SELECT` | true | — | `""` | Select needs |
| needs_personal | `fullName` | `full_name` | Full Name | `TEXT` | true | — | `""` | Your full name |
| needs_personal | `companyEmail` | `company_email` | Company Email | `EMAIL` | true | — | `""` | your@company.com |
| needs_personal | `phoneNumber` | `phone_number` | Phone Number | `PHONE` | true | — | `""` | 08xx-xxxx-xxxx |
| needs_personal | `yourRole` | `your_role` | Your Role / Title | `SELECT` | true | — | `""` | Select role |

### Step 2 — `company` (Company Details)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| company | `companyName` | `company_name` | Company Name | `TEXT` | true | — | `""` | Company name |
| company | `brandName` | `brand_name` | Brand Name | `TEXT` | true | — | `""` | Brand / DBA name |
| company | `province` | `province` | Province | `SELECT` | true | — | `""` | Select province |
| company | `city` | `city` | City | `SELECT` | true | — | `""` | Select city |
| company | `zipCode` | `zip_code` | Ward / ZIP Code | `SELECT` | true | — | `""` | Select ZIP |
| company | `detailAddress` | `detail_address` | Detail Address | `TEXTAREA` | true | — | `""` | Full address |

### Step 3 — `services` (Services & Message)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| services | `services` | `services` | Services | `SELECT` | conditional | — | `""` | Select service |
| services | `message` | `message` | Message | `TEXTAREA` | true | — | `""` | Describe your needs |

> **Rule:** `services` wajib **hanya jika** `needs !== "Support"` AND `needs !== "Partnership"`.  
> Saat `needs = "Support"` atau `needs = "Partnership"`, field `services` **tidak ditampilkan**.

### Step 4 — `review` (Review — read-only, tidak ada field input)

### Field Options — Fiber Inquiry

**`needs`** (SELECT):
- `Sales Inquiry`
- `Support`
- `Partnership`

**`yourRole`** (SELECT):
- `Owner`
- `Director`
- `Manager`
- `Supervisor`
- `Procurement`
- `IT Lead`
- `Network Engineer`
- `Business Development`
- `Other`

**`services`** (SELECT):
- `Dedicated Internet`
- `Metro Ethernet`
- `IP Transit`
- `Data Center Connectivity`
- `Managed Service`
- `Fiber Backbone Partnership`

**`province` / `city` / `zipCode`**: → lihat [Shared Options](#92-province--city--ward-cascading)

---

## 8. Media Registration

**Slug:** `media-registration` | **BU:** `MEDIA` | **Category:** `REGISTRATION`  
**HandlingMode:** `SUBMISSION` | **CRM Integration:** tidak ada (internal/bank data)  
**File:** `ModalFormRegistrationMedia.jsx`

### Step 1 — `personal` (Personal Details)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| personal | `fullName` | `full_name` | Full Name | `TEXT` | true | — | `""` | Your full name |
| personal | `companyEmail` | `company_email` | Company Email | `EMAIL` | true | — | `""` | your@company.com |
| personal | `phoneNumber` | `phone_number` | Phone Number | `PHONE` | true | — | `""` | 08xx-xxxx-xxxx |
| personal | `yourRole` | `your_role` | Your Role / Title | `SELECT` | true | — | `""` | Select role |

### Step 2 — `company` (Company Details)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| company | `companyName` | `company_name` | Company Name | `TEXT` | true | — | `""` | Company name |
| company | `brandName` | `brand_name` | Brand Name | `TEXT` | true | — | `""` | Brand / DBA name |
| company | `province` | `province` | Province | `SELECT` | true | — | `""` | Select province |
| company | `city` | `city` | City | `SELECT` | true | — | `""` | Select city |
| company | `zipCode` | `zip_code` | Ward / ZIP Code | `SELECT` | true | — | `""` | Select ZIP |
| company | `detailAddress` | `detail_address` | Detail Address | `TEXTAREA` | true | — | `""` | Full address |

### Step 3 — `services` (Services & Message)

| step_key | field_path | field_key | label | fieldType | isRequired | payloadKey | defaultValue | placeholder |
|----------|-----------|-----------|-------|-----------|-----------|-----------|-------------|-------------|
| services | `solutionsInterest` | `solutions_interest` | Solutions Interest | `MULTI_SELECT` | true (min 1) | — | `[]` | — |
| services | `platformType` | `platform_type` | Platform Type | `SELECT` | true | — | `""` | Select platform |
| services | `message` | `message` | Message | `TEXTAREA` | true | — | `""` | Your specific needs |

### Step 4 — `review` (Review — read-only, tidak ada field input)

### Field Options — Media Registration

**`yourRole`** (SELECT):
- `Owner`
- `Director`
- `Marketing Manager`
- `Brand Manager`
- `Partnership Lead`
- `Media Planner`

**`solutionsInterest`** (MULTI_SELECT):
- `OTT Solutions`
- `IPTV Services`
- `Hospitality Entertainment`
- `Media Advertising`

**`platformType`** (SELECT):
- `Content Only`
- `APK`
- `Library`

**`province` / `city` / `zipCode`**: → lihat [Shared Options](#92-province--city--ward-cascading)

---

## 9. Shared Field Options Reference

### 9.1 Industry Options

Digunakan di: Enterprise Consultation (`Business_Industry__c`), Enterprise Partnership (`businessIndustry`), Event Register (`businessIndustry`)

| value (display) | Catatan |
|-----------------|---------|
| Agriculture, Forestry, Fishing | |
| Entertainment, Media & Advertising | |
| Financial Service Institutions | |
| Food & Beverage | |
| General Services | |
| Government & Affairs | |
| Holding Company | |
| Hospitality Services | |
| IT & Telecommunication | |
| Manufacturing | |
| Mining and Oil & Gas | |
| Property & Construction | |
| Retail Trade | |
| Services | |
| Transportation & Public Utilities | |

> Nilai `value` = `label` (tidak di-slugify untuk CRM forms).

### 9.2 Province / City / Ward Cascading

Digunakan di semua form kecuali SMB Enterprise (yang menggunakan `ADDRESS_LOOKUP`).

**Province:**
- `DKI Jakarta`
- `Jawa Barat`
- `Jawa Tengah`
- `DI Yogyakarta`
- `Jawa Timur`
- `Banten`

**City by Province:**

| Province | Cities |
|----------|--------|
| DKI Jakarta | Jakarta Selatan, Jakarta Barat, Jakarta Pusat |
| Jawa Barat | Bandung, Bekasi, Bogor |
| Jawa Tengah | Semarang, Solo, Magelang |
| DI Yogyakarta | Yogyakarta, Sleman, Bantul |
| Jawa Timur | Surabaya, Sidoarjo, Malang |
| Banten | Tangerang, Tangerang Selatan, Serang |

> Fiber Registration & Fiber Inquiry & Media Registration menggunakan `zipCode` (ZIP-only cascading), bukan `wardZipCode` (ward + ZIP).

**Ward/ZIP by City** (untuk `wardZipCode` — Enterprise forms & Event Register):

| City | Ward / ZIP Options |
|------|--------------------|
| Jakarta Selatan | Kebayoran Baru, Setiabudi, Tebet |
| Jakarta Barat | Kembangan, Palmerah, Cengkareng |
| Jakarta Pusat | Menteng, Tanah Abang, Kemayoran |
| Bandung | Coblong, Lengkong, Sukajadi |
| Bekasi | Bekasi Selatan, Bekasi Timur, Jatiasih |
| Bogor | Bogor Tengah, Bogor Barat, Cigombong |
| Semarang | Banyumanik, Candisari, Tembalang |
| Solo | Banjarsari, Laweyan, Jebres |
| Magelang | Magelang Tengah, Magelang Utara, Mertoyudan |
| Yogyakarta | Gondokusuman, Jetis, Umbulharjo |
| Sleman | Depok, Ngaglik, Mlati |
| Bantul | Banguntapan, Kasihan, Sewon |
| Surabaya | Tegalsari, Wonokromo, Rungkut |
| Sidoarjo | Buduran, Candi, Gedangan |
| Malang | Klojen, Lowokwaru, Blimbing |
| Tangerang | Ciledug, Karawaci, Pinang |
| Tangerang Selatan | Serpong, Pondok Aren, Ciputat |
| Serang | Curug, Kasemen, Walantaka |

**ZIP by City** (untuk `zipCode` — Fiber & Media forms):

| City | ZIP Options |
|------|-------------|
| Jakarta Selatan | 12190, 12870 |
| Jakarta Barat | 11530, 11610 |
| Jakarta Pusat | 10110, 10510 |
| Bandung | 40115, 40286 |
| Bekasi | 17121, 17144 |
| Bogor | 16111, 16161 |
| Semarang | 50135, 50241 |
| Solo | 57111, 57139 |
| Yogyakarta | 55198, 55281 |
| Sleman | 55284, 55581 |
| Surabaya | 60189, 60231 |
| Malang | 65111, 65145 |
| Tangerang | 15143, 15157 |
| Tangerang Selatan | 15310, 15314 |
| Serang | 42111, 42116 |
| Bantul | *(tidak ada di Fiber/Media)* |
| Sidoarjo | *(tidak ada di Fiber/Media)* |
| Magelang | *(tidak ada di Fiber/Media)* |

---

## 10. Conditional Rules Summary

Tabel ini merangkum semua rule yang perlu di-seed ke tabel `form_field_rules`.

| form_slug | field_key | rule_type | trigger_field | trigger_value | effect |
|-----------|-----------|-----------|---------------|---------------|--------|
| `smb-enterprise` | `billing_address` | `SHOW_IF` | `billing_same_as_installation` | `false` | Tampilkan field billing address |
| `smb-enterprise` | `billing_address` | `REQUIRE_IF` | `billing_same_as_installation` | `false` | Wajib diisi jika tidak sama |
| `enterprise-partnership` | `other_partnership_type` | `SHOW_IF` | `type_partnership` | `"Others"` | Tampilkan field other type |
| `enterprise-partnership` | `other_partnership_type` | `REQUIRE_IF` | `type_partnership` | `"Others"` | Wajib diisi jika Others |
| `event-register` | `participant_count` | `REQUIRE_IF` | `max_participants` | `> 1` | Wajib jika max > 1 |
| `fiber-inquiry` | `services` | `SHOW_IF` | `needs` | `"Sales Inquiry"` | Tampilkan hanya saat Sales Inquiry |
| `fiber-inquiry` | `services` | `REQUIRE_IF` | `needs` | `"Sales Inquiry"` | Wajib hanya saat Sales Inquiry |
| `fiber-inquiry` | `services` | `HIDE_IF` | `needs` | `"Support"` | Sembunyikan saat Support |
| `fiber-inquiry` | `services` | `HIDE_IF` | `needs` | `"Partnership"` | Sembunyikan saat Partnership |

> **Catatan untuk Fiber Inquiry:** Implementasi di source code menggunakan fungsi `isServiceStepWithoutService(needs)` yang return `true` untuk Support & Partnership. Logika ini berarti `services` field hanya muncul dan diwajibkan saat `needs = "Sales Inquiry"`.

---

## 11. Form Module Summary (10 Entries DB)

| # | slug | businessUnit | category | handlingMode | steps | fields (approx) |
|---|------|-------------|----------|-------------|-------|-----------------|
| 1 | `enterprise-consultation` | `ENTERPRISE` | `REGISTRATION` | `SUBMISSION` | 4 | 22 |
| 2 | `smb-enterprise` | `ENTERPRISE` | `REGISTRATION` | `SUBMISSION` | 4 | 10 |
| 3 | `enterprise-partnership` | `ENTERPRISE` | `PARTNERSHIP` | `SUBMISSION` | 2 | 14 |
| 4 | `suggest-enterprise` | `ENTERPRISE` | `RECOMMENDATION` | `ROUTING_ONLY` | 3 | 3 |
| 5 | `event-register` | `ENTERPRISE` | `EVENT` | `SUBMISSION` | 2 | 14 (+ repeater) |
| 6 | `event-register` | `FIBER` | `EVENT` | `SUBMISSION` | 2 | 14 (+ repeater) |
| 7 | `event-register` | `MEDIA` | `EVENT` | `SUBMISSION` | 2 | 14 (+ repeater) |
| 8 | `fiber-registration` | `FIBER` | `REGISTRATION` | `SUBMISSION` | 5 | 27 |
| 9 | `fiber-inquiry` | `FIBER` | `INQUIRY` | `SUBMISSION` | 4 | 12 |
| 10 | `media-registration` | `MEDIA` | `REGISTRATION` | `SUBMISSION` | 4 | 11 |

---

*Dokumen ini adalah output Phase 1. Gunakan sebagai referensi utama saat membuat seeder scripts di Phase 2.*
