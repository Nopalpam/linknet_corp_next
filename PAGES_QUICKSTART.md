# 🚀 Pages Module - Quick Start Guide

## Akses Pages Module

1. **Login ke CMS**
2. **Klik menu "Pages"** di sidebar
3. **Halaman Pages List akan muncul**

---

## 📋 Pages List

### Fitur:
- **Search:** Ketik di search box untuk mencari pages
- **Filter Status:** Pilih status (All, Draft, Published, Archived)
- **Table:**
  - Title + Slug
  - Status badge
  - Last updated date
  - Actions (Edit, Delete)

### Actions:
- **Create Page:** Klik tombol "Create Page" di kanan atas
- **Edit:** Klik tombol "Edit" pada row
- **Delete:** Klik tombol "Delete" (akan ada konfirmasi)

---

## ✏️ Create New Page

### Step 1: Basic Info
1. Klik "Create Page"
2. Enter **Title** (required)
3. **Slug** akan auto-generate (bisa diedit manual)
4. Pilih **Status** (Draft/Published/Archived)

### Step 2: SEO Settings (Optional)
1. Scroll ke bawah
2. Isi **Meta Title** (untuk SEO)
3. Isi **Meta Description**
4. Isi **Meta Keywords** (pisahkan dengan koma)

### Step 3: Save
1. Klik "Create Page"
2. Akan redirect ke Edit Page

---

## 🎨 Edit Page & Page Builder

### Edit Page Settings:
1. Di **right panel**, edit:
   - Title
   - Slug
   - Status
   - Meta Title
   - Meta Description
   - Meta Keywords
2. Klik "Save Changes"

### Open Page Builder:
1. Klik tombol **"Open Page Builder"**
2. Modal akan terbuka dengan 3 panel

---

## 🏗️ Using Page Builder

### Layout:
```
┌──────────────┬────────────────────┬──────────────┐
│   Component  │                    │  Component   │
│   Library    │      Canvas        │  Settings    │
│   (Left)     │     (Center)       │   (Right)    │
└──────────────┴────────────────────┴──────────────┘
```

### Left Panel - Add Components:
**Layout:**
- Section
- Divider

**Content:**
- Heading
- Text

**Media:**
- Image

**Interactive:**
- Button

**Cara pakai:**
- Klik component untuk menambahkan ke canvas

### Center Panel - Canvas:
- **View:** Preview halaman real-time
- **Click:** Pilih component untuk edit
- **Selected:** Component akan highlight biru
- **Delete:** Klik icon trash saat selected

### Right Panel - Edit Properties:
- Panel akan muncul saat component dipilih
- Edit properties sesuai component type
- Changes akan langsung terlihat di canvas

---

## 📦 Component Guide

### 1. Section
**Gunakan untuk:** Container utama
**Properties:**
- Background Color
- Padding

**Tips:** Tambahkan Section dulu, baru isi dengan component lain

### 2. Heading
**Gunakan untuk:** Judul/heading
**Properties:**
- Text
- Level (H1-H6)
- Font Size
- Color
- Text Align

### 3. Text
**Gunakan untuk:** Paragraf/deskripsi
**Properties:**
- Text (multiline)
- Font Size
- Color
- Text Align

### 4. Image
**Gunakan untuk:** Gambar
**Properties:**
- Image URL
- Alt Text
- Width

### 5. Button
**Gunakan untuk:** Call-to-action
**Properties:**
- Button Text
- Link (URL)
- Background Color
- Text Color
- Padding
- Border Radius

### 6. Divider
**Gunakan untuk:** Pemisah section
**Properties:**
- Height
- Color
- Margin

---

## 💡 Best Practices

### Structure:
```
Section
├── Heading (H2)
├── Text
├── Image
└── Button
```

### Workflow:
1. **Planning:** Plan struktur page dulu
2. **Section First:** Mulai dengan Section
3. **Content:** Tambahkan Heading → Text → Media
4. **CTA:** Akhiri dengan Button
5. **Separator:** Gunakan Divider antar section

### Styling:
- **Consistency:** Gunakan font size yang konsisten
- **Spacing:** Berikan padding yang cukup
- **Colors:** Sesuaikan dengan brand
- **Alignment:** Perhatikan text alignment

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Click component | Select |
| Click canvas | Deselect |
| Delete icon | Remove component |

---

## 🎯 Common Use Cases

### 1. About Us Page
```
Section
├── Heading (H1): "About Us"
├── Text: Company description
└── Divider

Section
├── Heading (H2): "Our Vision"
└── Text: Vision statement

Section
├── Image: Team photo
└── Text: Team description
```

### 2. Landing Page
```
Section (Hero)
├── Heading (H1): Main headline
├── Text: Subheadline
└── Button: "Get Started"

Section (Features)
├── Heading (H2): "Features"
├── Text: Feature 1
├── Text: Feature 2
└── Text: Feature 3

Section (CTA)
├── Heading (H2): "Ready to start?"
└── Button: "Sign Up Now"
```

### 3. Product Page
```
Section
├── Heading (H1): Product name
├── Image: Product image
├── Text: Product description
└── Button: "Buy Now"

Section
├── Heading (H2): "Specifications"
└── Text: Specs list

Section
├── Heading (H2): "Gallery"
├── Image: Gallery 1
└── Image: Gallery 2
```

---

## 🐛 Troubleshooting

### Page tidak muncul di list?
- Check status filter (All/Draft/Published)
- Try search dengan title atau slug

### Component tidak bisa diedit?
- Pastikan component sudah **dipilih** (highlight biru)
- Klik component di canvas dulu

### Settings tidak muncul?
- Pilih component di canvas
- Pastikan ada component yang selected

### Save tidak berhasil?
- Check koneksi internet
- Check console untuk error
- Coba refresh dan save lagi

### Image tidak muncul?
- Pastikan URL image valid
- Coba buka URL di browser baru
- Check CORS jika dari external domain

---

## ✅ Checklist Sebelum Publish

- [ ] Title sudah benar
- [ ] Slug sudah sesuai (SEO friendly)
- [ ] Meta Title terisi
- [ ] Meta Description terisi (150-160 karakter)
- [ ] Meta Keywords terisi
- [ ] Content sudah lengkap
- [ ] Image semua muncul
- [ ] Button link sudah benar
- [ ] Preview sudah OK
- [ ] Status: PUBLISHED

---

## 🆘 Need Help?

### Documentation:
- `PAGES_IMPLEMENTATION_COMPLETE.md` - Full technical docs
- `README.md` - Project overview

### Support:
- Contact admin untuk technical support
- Check backend logs untuk error details

---

## 🎉 Tips & Tricks

1. **Start Simple:** Mulai dengan struktur sederhana dulu
2. **Preview Often:** Selalu preview setelah perubahan
3. **Save Frequently:** Jangan lupa save setelah edit
4. **Use Sections:** Gunakan Section untuk grouping
5. **Consistent Spacing:** Maintain padding yang sama
6. **Brand Colors:** Gunakan color palette yang konsisten
7. **Mobile-Friendly:** Pertimbangkan tampilan mobile
8. **SEO Matters:** Isi semua SEO fields dengan baik

---

**Happy building! 🚀**
