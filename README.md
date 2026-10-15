# Sistem Pemantauan Pengurusan Risiko

Sistem web berpusat untuk merekod, menyemak dan memantau risiko serta tindakan kawalan. Menggantikan rekod berasaskan hamparan Excel dengan aliran data yang terkawal dan boleh dijejak.

**Status:** Pembangunan — v1.0 (berdasarkan Spesifikasi Induk bertarikh 14 Oktober 2026)

---

## Ciri Utama

| Modul | Keterangan |
|---|---|
| **Dashboard** | Ringkasan risiko mengikut tahap (Rendah/Sederhana/Tinggi), tindakan lewat, rekod menunggu semakan |
| **Daftar Risiko** | Rekod risiko dengan penilaian tahunan, tindakan rawatan dan bukti |
| **Keberkesanan** | Ukuran keberkesanan tindakan mengikut tahun dengan trend sejarah |
| **Pihak Berkepentingan** | Jadual pemantauan berkala (April / Ogos / Disember) |
| **Laporan** | Tiga tab laporan dengan eksport PDF dan Excel |
| **Audit** | Jejak perubahan lengkap dengan pengguna dan masa |

---

## Peranan Pengguna

| Peranan | Tindakan Utama |
|---|---|
| **Super Admin** | Urus pengguna, peranan, unit; akses penuh |
| **Pegawai Risiko** | Semak, sahkan atau pulangkan rekod; jana laporan |
| **Unit / Bahagian** | Isi, hantar dan kemaskini rekod unit sendiri |
| **Pengurusan / Pemantau** | Lihat dashboard dan laporan; tiada ubah data |

---

## Teknologi

- **Rangka kerja:** [Next.js 15](https://nextjs.org/) (App Router)
- **Bahasa:** TypeScript
- **ORM:** [Prisma](https://www.prisma.io/) + PostgreSQL
- **Auth:** [NextAuth.js v5](https://authjs.dev/)
- **Gaya:** Tailwind CSS
- **Pengesahan:** Zod
- **Eksport:** jspdf + xlsx

---

## Mula Pantas

### Keperluan

- Node.js 18+
- PostgreSQL 14+

### Langkah Persediaan

```bash
# 1. Klon repositori
git clone https://github.com/rhazes305/Risk_Management.git
cd Risk_Management/risk-management

# 2. Pasang kebergantungan
npm install

# 3. Salin dan konfigurasikan pemboleh ubah persekitaran
cp .env.example .env
# Edit .env — masukkan DATABASE_URL dan AUTH_SECRET

# 4. Jana Prisma client dan migrasi pangkalan data
npm run db:generate
npm run db:push

# 5. Muatkan data awal (opsional — data sampel dari Excel)
npm run db:seed

# 6. Jalankan pelayan pembangunan
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) dalam pelayar.

### Akaun Seed (untuk pembangunan sahaja)

| E-mel | Kata Laluan | Peranan |
|---|---|---|
| admin@risiko.gov.my | Password123! | Super Admin |
| pegawai@risiko.gov.my | Password123! | Pegawai Risiko |
| unit.dit@risiko.gov.my | Password123! | Unit DIT |

> **Penting:** Tukar kata laluan sebelum digunakan di persekitaran pengeluaran.

---

## Struktur Projek

```
risk-management/
├── prisma/
│   ├── schema.prisma       # Skema pangkalan data (9 entiti)
│   └── seed.ts             # Data awal dari Excel
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Halaman log masuk / keluar
│   │   ├── dashboard/      # Dashboard utama
│   │   ├── risks/          # Daftar risiko
│   │   ├── effectiveness/  # Analisis keberkesanan
│   │   ├── stakeholders/   # Pihak berkepentingan
│   │   ├── reports/        # Laporan (3 tab)
│   │   ├── admin/          # Pengurusan pengguna & unit (Super Admin)
│   │   └── api/            # API Routes
│   ├── components/         # Komponen React
│   │   ├── ui/             # Komponen asas (butang, borang, jadual)
│   │   ├── dashboard/      # Komponen dashboard
│   │   ├── risks/          # Komponen daftar risiko
│   │   ├── reports/        # Komponen laporan
│   │   └── layout/         # Navigasi, pengepala
│   ├── lib/
│   │   ├── auth.ts         # Konfigurasi NextAuth
│   │   ├── prisma.ts       # Singleton Prisma client
│   │   ├── constants.ts    # Pemalar, matriks risiko, kebenaran
│   │   └── validations.ts  # Skema pengesahan Zod
│   ├── types/
│   │   └── index.ts        # Jenis TypeScript teras
│   └── middleware.ts       # Perlindungan laluan & RBAC
└── docs/
    └── SPESIFIKASI.md      # Spesifikasi induk sistem
```

---

## Aliran Kerja Rekod

```
Draf → Menunggu Semakan → Disahkan
                ↓
         Perlu Pembetulan → Menunggu Semakan (semula)
                                      ↓
                                  Ditutup
```

---

## Keputusan Terbuka

Perkara berikut **perlu disahkan** oleh pemilik proses sebelum sistem boleh digunakan secara rasmi:

- [ ] Matriks kemungkinan × akibat, skala dan ambang rendah/sederhana/tinggi
- [ ] Nama rasmi dan kuasa peranan Pengurusan/Pemantau (termasuk akses eksport)
- [ ] Aliran kelulusan dan pihak yang boleh menutup rekod
- [ ] Dasar tempoh simpanan rekod, audit dan sandaran
- [ ] Format kepala laporan dan logo rasmi
- [ ] Kaedah migrasi data dari Excel

Rujuk **Seksyen 11.2** dalam [Spesifikasi Induk](docs/SPESIFIKASI.md).

---

## Lesen

Projek ini adalah hak milik organisasi. Tidak dibenarkan diedarkan secara awam tanpa kebenaran.
