# Contact Us Data Bank - Visual Guide

## 📐 Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ 🏠 Home > Contact Us Data Bank                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐│
│  │ 📧 Total    │  │ 🆕 New      │  │ 👁️ Read     │  │ ✅ Repl││
│  │    12       │  │    4        │  │    5        │  │    3   ││
│  │  Messages   │  │  Messages   │  │  Messages   │  │  Msgs  ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────┘│
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Contact Messages                    [🗑️ Delete (2)] [💾 Export]│
│  Kelola dan lihat pesan dari formulir kontak                    │
│                                                                  │
│  ┌──────────────────────────────┐  ┌────────────────────────┐  │
│  │ 🔍 Search...                 │  │ Status: [All Status ▼] │  │
│  └──────────────────────────────┘  └────────────────────────┘  │
│                                                                  │
│  ℹ️ Menampilkan 8 dari 12 pesan                                 │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ☑️ │ Nama        │ Email        │ Phone        │ Subject    │..│
│  ───┼─────────────┼──────────────┼──────────────┼────────────┼──│
│  ☑️ │ Ahmad Rizki │ ahmad@...    │ +62 812-...  │ Layanan... │..│
│  ☐ │ Siti Nur... │ siti@...     │ +62 813-...  │ Kendala... │..│
│  ☑️ │ Budi San... │ budi@...     │ +62 821-...  │ Inquiry... │..│
│  ☐ │ Dewi Les... │ dewi@...     │ +62 856-...  │ Request... │..│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Component Breakdown

### 1. Statistics Cards (4 Cards)

```
┌──────────────────────┐
│ 📧 Total Messages    │
│                      │
│        12            │  ← Large number
│                      │
└──────────────────────┘

Colors:
- Total: Blue (bg-blue-100, text-blue-600)
- New: Blue (bg-blue-100, text-blue-600)
- Read: Yellow (bg-yellow-100, text-yellow-600)
- Replied: Green (bg-green-100, text-green-600)
```

### 2. Table Header Section

```
┌────────────────────────────────────────────────────────┐
│ Contact Messages          [🗑️ Delete (2)] [💾 Export] │
│ Kelola dan lihat pesan dari formulir kontak           │
│                                                        │
│ 🔍 Search Box               📊 Status Filter          │
│                                                        │
│ ℹ️ Info: "Menampilkan X dari Y pesan"                 │
└────────────────────────────────────────────────────────┘

Actions:
- Delete Selected: Red button (only shows if items selected)
- Export Data: Brand blue button (always visible)
```

### 3. Data Table

```
┌──┬─────────────┬──────────────┬──────────────┬────────────┬────────────┬────────┬──────────┐
│☑️│ Nama        │ Email        │ Phone        │ Subject    │ Tanggal    │ Status │ Aksi     │
├──┼─────────────┼──────────────┼──────────────┼────────────┼────────────┼────────┼──────────┤
│☑️│ Ahmad Rizki │ ahmad@ex.com │ +62 812-...  │ Layanan... │ 03 Feb...  │ 🔵 NEW │ 👁️ 🗑️   │
│☐│ Siti Nur... │ siti@ex.com  │ +62 813-...  │ Kendala... │ 02 Feb...  │ 🟡 READ│ 👁️ 🗑️   │
└──┴─────────────┴──────────────┴──────────────┴────────────┴────────────┴────────┴──────────┘

Features:
- Checkbox column for bulk selection
- Sortable columns (ready for implementation)
- Truncated text with ellipsis
- Status badges with colors
- Action buttons: View (blue), Delete (red)
```

### 4. Detail Modal

```
┌───────────────────────────────────────────────────────┐
│ 📧 Detail Pesan Kontak                         [✕]   │
│    Informasi lengkap pesan dari Ahmad Rizki          │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────────────┐  ┌──────────────────┐ │
│  │ Status: 🔵 NEW           │  │ Tanggal Diterima │ │
│  │                          │  │ 03 Feb 2024      │ │
│  └──────────────────────────┘  └──────────────────┘ │
│                                                       │
│  ┌──────────────────────────┐  ┌──────────────────┐ │
│  │ 👤 Ahmad Rizki           │  │ 📧 ahmad@ex.com  │ │
│  └──────────────────────────┘  └──────────────────┘ │
│                                                       │
│  ┌──────────────────────────┐  ┌──────────────────┐ │
│  │ 📱 +62 812-3456-7890     │  │ 💬 Layanan Fiber │ │
│  └──────────────────────────┘  └──────────────────┘ │
│                                                       │
│  📄 Pesan:                                           │
│  ┌───────────────────────────────────────────────┐  │
│  │ Halo, saya ingin menanyakan tentang paket    │  │
│  │ fiber untuk area Jakarta Selatan...          │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  ℹ️ Quick Actions                                    │
│  Klik email atau telepon untuk langsung menghubungi  │
│                                                       │
│                      [Tutup] [Tandai Sudah Dibaca]   │
└───────────────────────────────────────────────────────┘

Features:
- Large, centered modal
- Click outside to close
- Clickable email/phone (mailto:, tel:)
- Mark as read button
- Clean, organized layout
```

### 5. Delete Confirmation Modal

```
┌─────────────────────────────────────┐
│                                     │
│        ⚠️                            │
│                                     │
│   Hapus Pesan Kontak                │
│                                     │
│   Apakah Anda yakin ingin          │
│   menghapus pesan dari              │
│   Ahmad Rizki?                      │
│   Tindakan ini tidak dapat          │
│   dibatalkan.                       │
│                                     │
│     [Batal]    [Ya, Hapus]          │
│                                     │
└─────────────────────────────────────┘

Features:
- Warning icon (red)
- Clear warning message
- Contact name highlighted
- Two action buttons
```

### 6. Bulk Delete Modal

```
┌─────────────────────────────────────┐
│                                     │
│        ⚠️                            │
│                                     │
│   Delete Multiple Messages          │
│                                     │
│   Are you sure you want to         │
│   delete 5 messages?                │
│   This action cannot be undone.    │
│                                     │
│     [Cancel]    [Confirm]           │
│                                     │
└─────────────────────────────────────┘

Features:
- Shows count of selected items
- Same warning style as single delete
- Reusable component
```

## 🎨 Color Scheme

### Status Colors
```css
NEW:
  - Light: bg-blue-100, text-blue-800
  - Dark: bg-blue-900, text-blue-300
  - Badge: Blue rounded-full

READ:
  - Light: bg-yellow-100, text-yellow-800
  - Dark: bg-yellow-900, text-yellow-300
  - Badge: Yellow rounded-full

REPLIED:
  - Light: bg-green-100, text-green-800
  - Dark: bg-green-900, text-green-300
  - Badge: Green rounded-full
```

### Action Buttons
```css
View Button:
  - bg-brand-600 hover:bg-brand-700
  - text-white

Delete Button:
  - bg-red-600 hover:bg-red-700
  - text-white

Export Button:
  - bg-brand-600 hover:bg-brand-700
  - text-white

Cancel/Close:
  - border border-gray-300
  - text-gray-700
  - hover:bg-gray-50
```

## 📱 Responsive Breakpoints

### Desktop (lg: ≥1024px)
- 4 columns for statistics cards
- Full table with all columns visible
- Wide modals (max-w-3xl)

### Tablet (md: 768px - 1023px)
- 2 columns for statistics cards
- Scrollable table
- Medium modals (max-w-2xl)

### Mobile (< 768px)
- 1 column for statistics cards
- Scrollable table (horizontal scroll)
- Full-width modals with padding
- Stacked filter inputs

## 🔍 Interactive States

### Hover States
```
Table Row:
  - hover:bg-gray-50 (light)
  - dark:hover:bg-gray-800 (dark)

Buttons:
  - Darker shade on hover
  - Smooth transition (transition-colors)

Links:
  - Underline on hover
  - Brand color
```

### Focus States
```
Inputs:
  - ring-2 ring-brand-500
  - border-transparent

Checkboxes:
  - ring-2 ring-brand-500
  - Indeterminate state for "select all"
```

### Active States
```
Selected Rows:
  - Checkbox checked
  - Count shown in delete button
  - Visual feedback
```

## 📊 Empty States

### No Data
```
┌────────────────────────────────┐
│                                │
│          📭                     │
│                                │
│    Tidak ada data              │
│    Belum ada pesan kontak      │
│    yang masuk                  │
│                                │
└────────────────────────────────┘
```

### No Search Results
```
┌────────────────────────────────┐
│                                │
│          🔍                     │
│                                │
│    Tidak ada hasil             │
│    Coba kata kunci lain        │
│                                │
└────────────────────────────────┘
```

## 🎯 User Flow

```
1. User lands on page
   ↓
2. Sees statistics (Total, New, Read, Replied)
   ↓
3. Can search or filter
   ↓
4. Views list of contacts in table
   ↓
5. Actions available:
   ├─ Click "View" → Opens detail modal
   │   ├─ Click email → Opens email client
   │   ├─ Click phone → Opens phone dialer
   │   └─ Click "Mark as Read" → Updates status
   │
   ├─ Click "Delete" → Opens delete confirmation
   │   └─ Confirms → Deletes contact
   │
   ├─ Select multiple → Shows bulk delete button
   │   └─ Click bulk delete → Opens bulk delete modal
   │
   └─ Click "Export" → Triggers download (when integrated)
```

---

**Last Updated**: February 3, 2024
