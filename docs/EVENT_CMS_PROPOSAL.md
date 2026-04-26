# Event CMS Proposal

## Goal

Merancang fondasi Event yang cukup matang untuk diimplementasikan bertahap, tetapi tetap sederhana untuk MVP. Fokus utama saat ini adalah `event list` dan `event detail`, bukan seluruh ekosistem event sekaligus.

## Recommendation Summary

- Event sebaiknya tetap menjadi resource konten dedicated seperti `news`, bukan langsung menjadi tipe Page Builder generik.
- Public rendering awal lebih aman menggunakan route dedicated `events`, bukan catch-all page CMS.
- MVP cukup mencakup `event list` dan `event detail`.
- Fitur seperti highlight, related articles, registration, recurring event, dan page-builder integration sebaiknya ditunda sampai use case dasarnya stabil.

## What Changed From The Previous Draft

- Scope MVP dipersempit ke list/detail.
- `event_highlights`, `event_article_relations`, dan `event_registrations` dipindahkan menjadi fase lanjutan.
- Routing MVP tidak lagi mengharuskan category page.
- Future flexibility untuk multi-event type tetap dijaga lewat field ringan di tabel `events`, tanpa membuat schema tambahan terlalu cepat.
- Recurring event diakui sebagai kebutuhan masa depan, tetapi belum dimodelkan pada MVP karena berpotensi over-engineered.

## MVP Scope

### Included

- Event list page
- Event detail page
- CMS CRUD untuk event content
- SEO metadata dasar per event
- Slug-based public routing

### Deferred

- Event registration internal
- Highlight / featured event ordering
- Related article relations
- Event category page khusus
- Page Builder component `event_list` / `event_highlight`
- Recurring event logic

## Proposed Data Model

### 1. `events`

Tujuan: resource utama untuk list/detail event publik dan CMS.

Fields MVP yang disarankan:

- `id: string`
- `event_type?: string`
- `title_en: string`
- `title_id?: string`
- `hero_title_en?: string`
- `hero_title_id?: string`
- `slug: string` unique
- `excerpt_en?: string`
- `excerpt_id?: string`
- `content_en: string`
- `content_id?: string`
- `event_thumbnail?: string`
- `hero_image?: string`
- `hero_image_mobile?: string`
- `venue_name?: string`
- `location_name?: string`
- `city?: string`
- `address?: string`
- `map_embed_url?: string`
- `directions_url?: string`
- `organizer_name?: string`
- `organizer_logo?: string`
- `external_registration_url?: string`
- `event_start_at: datetime`
- `event_end_at?: datetime`
- `status: ContentStatus` with default `DRAFT`
- `published_at?: datetime`
- `meta_desc?: string`
- `meta_keywords?: string`
- `custom_css?: string`
- `custom_js?: string`
- `view_count: int`
- `view_count_unique: int`
- `created_by_id: string`
- `updated_by_id?: string`
- `created_at: datetime`
- `updated_at: datetime`
- `deleted_at?: datetime`

Catatan:

- `event_type` cukup berupa string atau enum ringan untuk kebutuhan awal seperti `seminar`, `webinar`, `exhibition`, `offline`, atau `hybrid`.
- Belum perlu tabel `event_types` khusus pada MVP. Tabel lookup baru layak ditambah jika admin benar-benar membutuhkan icon, translation, ordering, atau governance khusus per type.
- `external_registration_url` dipilih sebagai kompromi ringan jika detail event perlu CTA ke platform eksternal, tanpa membangun sistem registrasi internal sejak awal.

### 2. `event_categories` as optional Phase 1.1

Jika filtering kategori benar-benar dibutuhkan setelah MVP list/detail berjalan, maka kategori bisa ditambahkan dengan pola yang meniru `news_categories`.

Fields yang disarankan:

- `id: string`
- `name_en: string`
- `name_id?: string`
- `slug: string` unique
- `description?: string`
- `position: int`
- `is_active: boolean`
- `created_by?: string`
- `updated_by?: string`
- `created_at: datetime`
- `updated_at: datetime`
- `deleted_at?: datetime`

Catatan:

- Jika category page dan category filter belum dibutuhkan, tabel ini dapat ditunda.

## Future Flexibility Without Over-Engineering

### Multi-event type

- Gunakan `event_type` di tabel `events` untuk MVP.
- Ini cukup fleksibel untuk membedakan event online, offline, hybrid, webinar, atau seminar.
- Jika nanti ada kebutuhan icon, translation, ordering, atau permission per type, barulah `event_types` bisa dipromosikan menjadi tabel terpisah.

### Recurring event

- Jangan modelkan recurrence di MVP.
- Recurring event hampir selalu menambah kompleksitas pada slug, SEO, registrasi, status publik, dan kalender.
- Jika kebutuhan recurring terbukti nyata, opsi yang lebih aman adalah:
	- tambahkan `parent_event_id` dan `recurrence_rule`, atau
	- simpan setiap occurrence sebagai event terpisah dengan relasi ke master series.
- Keputusan itu sebaiknya ditunda sampai ada use case konkret, karena belum tentu semua recurring event di bisnis ini benar-benar butuh machine-readable recurrence.

### Registration

- Jangan buat `event_registrations` di MVP.
- Jika bisnis butuh CTA lebih cepat, gunakan `external_registration_url` terlebih dulu.
- Registrasi internal baru masuk fase berikutnya saat sudah jelas apakah tujuannya lead capture, RSVP, seat management, atau check-in.

### Related content

- Jangan buat `event_article_relations` di MVP.
- Jika detail page hanya butuh konten event, relasi ke article belum wajib.
- Relasi ini baru bernilai jika newsroom coverage benar-benar menjadi bagian penting dari alur event.

## Proposed Relations

### MVP

- Tidak ada relasi wajib selain audit relation ke user pembuat/pengubah.

### Optional after MVP

- `event_categories 1:N events`
- `events N:M news` via `event_article_relations`
- `events 1:N event_registrations`
- `events 1:N event_occurrences` jika recurring benar-benar dibutuhkan

## Public API Proposal

Base namespace yang disarankan: `/api/v1/public/events`

### List events

`GET /public/events`

Query params MVP yang disarankan:

- `page`
- `limit`
- `search`
- `event_type`
- `state` (`upcoming`, `ongoing`, `ended`)
- `sortBy`
- `sortOrder`

Response shape yang disarankan:

- `data: EventListItem[]`
- `pagination: { currentPage, totalPages, totalItems, itemsPerPage }`

Field minimal `EventListItem`:

- `id`
- `slug`
- `event_type`
- `title_en/title_id`
- `excerpt_en/excerpt_id`
- `event_thumbnail`
- `event_start_at`
- `event_end_at`
- `public_state`
- `location_name`
- `venue_name`

### Event detail

`GET /public/events/:slug`

Response MVP yang disarankan:

- `data: EventDetail`

Field penting `EventDetail`:

- semua field utama dari `events`
- `public_state`
- `external_registration_url`

## CMS API Proposal

Base namespace yang disarankan: `/api/v1/cms/events`

### Event content CRUD

- `GET /cms/events`
- `GET /cms/events/:id`
- `POST /cms/events`
- `PUT /cms/events/:id`
- `DELETE /cms/events/:id`

Filter list CMS MVP yang disarankan:

- `page`
- `limit`
- `search`
- `status`
- `event_type`
- `state`
- `sortBy`
- `sortOrder`

### Optional after MVP

- `GET /cms/event-categories`
- `POST /cms/event-categories`
- `PUT /cms/event-categories/:id`
- `PATCH /cms/event-categories/:id/status`

## Next.js Routing Proposal

### Recommended MVP routing

- List page: `app/[locale]/events/page.tsx`
- Detail page: `app/[locale]/events/[slug]/page.tsx`

### Why dedicated routes first

- Sejalan dengan pola `newsroom` existing.
- Menghindari coupling awal ke Page Builder catch-all.
- Lebih mudah menambahkan SEO metadata, 404 khusus event, dan transisi ke API publik dedicated.

### Rendering strategy

- Gunakan server components dengan fetch ke public API.
- Detail page gunakan `generateMetadata` berbasis slug.
- Awali dengan `dynamic = 'force-dynamic'` atau `revalidate` pendek, lalu optimalkan setelah kontrak API stabil.

### Future integration with Page Builder

Setelah resource Event stabil, baru pertimbangkan tipe seperti:

- `event_list`
- `event_highlight`

Fungsinya sebagai consumer data event dari DB, bukan penyimpan data event di JSON page builder.

## Suggested Validation Rules

- `slug` lowercase, alphanumeric, hyphenated
- `event_start_at` wajib
- `event_end_at >= event_start_at` jika diisi
- event published tidak boleh tanpa `title_en`, `content_en`, `event_start_at`
- `external_registration_url` harus valid URL jika diisi

## Suggested Public State Derivation

Urutan evaluasi MVP yang disarankan:

1. Jika `now < event_start_at`, hasil `upcoming`
2. Jika `event_end_at` ada dan `event_start_at <= now <= event_end_at`, hasil `ongoing`
3. Jika `event_end_at` ada dan `now > event_end_at`, hasil `ended`
4. Jika `event_end_at` kosong dan `now > event_start_at`, default `ended`

Catatan:

- `cancelled` atau `postponed` belum perlu masuk MVP kecuali memang sudah ada kebutuhan operasional yang jelas.
- Jika kebutuhan itu muncul cepat, cukup tambahkan satu field override ringan, bukan sistem state yang besar sejak awal.

## Risks and Limitations

### 1. Schema overlap dengan `news`

Karena Event dan News sama-sama konten editorial, ada risiko duplication. Namun event tetap layak dipisah karena memiliki dimensi waktu, venue, dan lifecycle publik yang tidak ada di news.

### 2. Timezone handling

Semua field waktu harus jelas timezone-nya. Ini risiko utama karena badge `upcoming` dan `ongoing` sangat sensitif terhadap SSR dan perbedaan environment.

### 3. Slug changes

Jika slug event boleh diubah setelah publish, perlu strategi redirect atau slug history agar link publik tidak patah.

### 4. Recurring event is intentionally deferred

Ini bukan kekurangan desain, tetapi keputusan scope. Menambahkan recurrence terlalu cepat justru memperbesar risiko salah model data.

### 5. Page Builder overlap

Memaksa Event masuk Page Builder terlalu cepat akan memperlebar scope: preview admin, source DB, route detail, dan API publik harus matang bersamaan. Itu tidak ideal untuk MVP.

## Recommended Phasing

### Phase A - MVP

- Tambah schema `events`
- Tambah public list/detail endpoints
- Tambah route `events` di Next.js public web

### Phase B - Optional structure

- Tambah `event_categories` jika filter kategori benar-benar dibutuhkan
- Tambah event type governance jika `event_type` string sudah tidak cukup
- Tambah `event_highlights` hanya jika homepage atau landing page memerlukannya

### Phase C - Advanced event operations

- Tambah `event_registrations` jika bisnis memilih registrasi internal
- Tambah `event_article_relations` jika newsroom coverage perlu dihubungkan langsung
- Evaluasi recurring event jika use case-nya sudah nyata

## Final Recommendation

- Implement Event sebagai resource content dedicated yang meniru pola dasar `news`.
- Jaga MVP tetap kecil: list dan detail dahulu.
- Tunda relasi kompleks, highlight, dan registration sampai kebutuhan nyatanya terbukti.
- Pertahankan page-builder sebagai consumer sekunder setelah API Event stabil.