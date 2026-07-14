# 🌾 Dashboard Satu Data Kedelai Jawa Timur

Dashboard analisis interaktif untuk memantau pergerakan harga konsumen, peta sebaran harga, tingkat produktivitas pertanian, serta kepatuhan harga kedelai terhadap Harga Acuan Pemerintah (HAP) di wilayah Provinsi Jawa Timur.

Proyek ini dibangun menggunakan **Next.js (App Router)** dan terintegrasi dengan **Supabase** sebagai database utama.

---

## 🚀 Fitur Utama

Dashboard ini dibagi menjadi beberapa modul utama yang dapat diakses melalui panel navigasi samping:

1. **Dashboard Tren Harga Jawa Timur (`/dashboard/harga-jatim`)**
   - Ringkasan indikator utama (KPI): Rata-rata Harga Provinsi, Harga Tertinggi & Terendah, dan Jumlah Daerah Melapor.
   - Grafik Tren Rata-rata Harga Kedelai secara berkala (multi-tahun).
   - Grafik 5 Daerah dengan Harga Terendah (Kantong Suplai).
   - Grafik Evaluasi Kebijakan Pelindungan terhadap Harga Acuan Pemerintah (HAP Rp11.000).

2. **Tabel Data Harga Kedelai (`/dashboard/tabel-harga`)**
   - Rincian harga kedelai per kabupaten/kota lengkap dengan deviasi terhadap HAP dan status kebijakan pelindungan.
   - Pencarian wilayah dan penyaringan baris data.
   - **Slicer Tahun & Bulan Interaktif** untuk melihat histori harga di periode tertentu.

3. **Peta Sebaran Harga (`/dashboard/peta-harga`)**
   - Visualisasi spasial tingkat harga kedelai per kabupaten/kota di Jawa Timur menggunakan peta interaktif.

4. **Tren & Peta Produktivitas Kedelai**
   - Modul khusus untuk memantau produktivitas panen kedelai Jawa Timur (`/dashboard/produktivitas-jatim`, `/dashboard/tabel-produktivitas`, `/dashboard/peta-produktivitas`).

---

## 🛠️ Stack Teknologi

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) & React 19
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Visualisasi Chart:** [Recharts](https://recharts.org/)
- **Visualisasi Peta:** [React Leaflet](https://react-leaflet.js.org/) / Leaflet
- **Manajemen Tabel:** [TanStack Table](https://tanstack.com/table/v8)

---

## 🔧 Panduan Instalasi & Pengembangan

### 1. Prasyarat
Pastikan Anda sudah menginstal Node.js versi 18 ke atas di komputer Anda.

### 2. Klon Repositori & Instal Dependensi
```bash
# Masuk ke direktori proyek
cd dashboard-kedelai

# Instal dependensi menggunakan npm
npm install
```

### 3. Konfigurasi Environment Variables (`.env.local`)
Buat file `.env.local` di root direktori dan sesuaikan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

### 5. Membangun untuk Produksi (Production Build)
```bash
npm run build
npm run start
```

---

## 📂 Struktur Direktori Proyek

```text
├── app/
│   ├── dashboard/                # Folder rute dan halaman dashboard utama
│   │   ├── harga-jatim/          # Analisis tren & evaluasi HAP
│   │   ├── tabel-harga/          # Tabel rincian dengan slicer waktu
│   │   └── peta-harga/           # Peta sebaran spasial
│   ├── layout.tsx                # Layout global Next.js
│   └── page.tsx                  # Landing page
├── components/
│   ├── dashboard/                # Komponen visualisasi (chart, table, map, kpi)
│   │   ├── chart-harga.tsx
│   │   ├── detailed-table-harga.tsx
│   │   └── map-harga.tsx
│   └── ui/                       # Komponen UI reusable (shadcn)
├── lib/
│   └── supabase.ts               # Inisialisasi client Supabase
├── package.json
└── README.md
```

---