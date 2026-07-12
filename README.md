# UNIVERSITAS ANAK BANGSA (UNABA)
## Sistem Informasi Aktivitas & Presensi Kampus (Campus Activity & Attendance System)

Sistem Informasi Aktivitas & Presensi Kampus (UNIVERSITAS ANAK BANGSA) adalah sebuah platform full-stack modern yang dirancang untuk mengelola repositori aktivitas mahasiswa, direktori profil mahasiswa, presensi digital, serta rekapitulasi data partisipasi secara komprehensif.

Aplikasi ini menggunakan perpaduan teknologi **React.js** pada sisi frontend, **Express.js** pada sisi backend, dan model relasional **MySQL** sebagai database penyimpanan utama.

---

## 🚀 Fitur Utama

1. **Autentikasi Multi-Role & JWT Session**
   - Mendukung login menggunakan Username/SIM ID dan password dengan pengamanan hashing **bcrypt**.
   - Dilengkapi sistem token JWT (JSON Web Token) yang aman dengan masa kedaluwarsa 24 jam.
   - Akun default administrator:
     - **Username:** `Admin`
     - **Password:** `unaba123`
   - Akun default mahasiswa:
     - **Username:** `riko`
     - **Password:** `student123`

2. **Student Directory CRUD**
   - Manajemen lengkap (Create, Read, Update, Delete) informasi profil mahasiswa.
   - Atribut data: NIM/ID, Nama Lengkap, Program Studi, Fakultas, Email Akademik, Username, dan Password terenkripsi.

3. **Campus Activities CRUD**
   - Pengorganisasian agenda kampus secara real-time.
   - Atribut data: Nama Kegiatan, Deskripsi, Tanggal, Jam Mulai, Lokasi/Ruangan, Penyelenggara, dan Status Keaktifan (Active / Completed).

4. **Digital Presence Check-In**
   - Portal mandiri untuk pelaporan kehadiran mahasiswa maupun pencatatan manual oleh Administrator.
   - Atribut presensi: Mahasiswa, Kegiatan, Tanggal, Jam Log (input manual), dan Status Kehadiran (Present / Sick / Permission / Absent).
   - *Validasi:* Mahasiswa diizinkan melakukan beberapa kali absensi pada kegiatan yang sama untuk mendukung sesi multi-hari.

5. **Analytics & Attendance Recap**
   - Dashboard statistik real-time yang menyajikan ringkasan total mahasiswa, kegiatan, dan persentase kehadiran dalam bentuk grafik batang interaktif (menggunakan Recharts).
   - Halaman rekapitulasi granular dengan filter status presensi dan pencarian instan.
   - Utilitas ekspor data langsung ke file **Excel (CSV format)** dan **Cetak PDF** dengan lembar stylesheet print-optimasi khusus.

---

## 📂 Struktur Direktori Projek

```text
/
├── data/                      # Direktori database penyimpanan lokal (JSON backup)
│   └── db.json                # Ledger data simulasi relasional berulang (auto-generated)
├── server/                    # Backend Source Code (Node.js + Express)
│   ├── db.ts                  # Engine in-memory & file-based database controller
│   └── routes.ts              # Endpoint REST API & Controller Validasi Logika
├── src/                       # Frontend Source Code (Vite + React.js)
│   ├── components/            # Komponen visual modular global (Navbar, Sidebar, dll.)
│   ├── context/               # State provider global (AuthContext untuk sesi login JWT)
│   ├── pages/                 # Halaman interaktif (Login, Dashboard, CRUD, Recap)
│   ├── types.ts               # Deklarasi tipe data TypeScript (Interface Kontrak)
│   ├── App.tsx                # Konfigurasi rute React Router & pelindung sesi (Guard)
│   ├── index.css              # Entrypoint styling Tailwind CSS & print media queries
│   └── main.tsx               # Entrypoint inisiasi React Virtual DOM
├── .env.example               # Contoh konfigurasi environment variable sistem
├── index.html                 # Dokumen HTML utama browser
├── metadata.json              # File manifest platform AI Studio
├── package.json               # Daftar dependency aplikasi dan skrip otomasi npm
├── schema.sql                 # Rancangan skema database MySQL lengkap
├── tsconfig.json              # Konfigurasi TypeScript compiler
└── vite.config.ts             # Konfigurasi Vite bundler
```

---

## 🛠️ Panduan Instalasi dan Menjalankan Aplikasi

### Prasyarat Utama
Pastikan perangkat Anda telah terpasang:
- **Node.js** (Versi 18 ke atas disarankan)
- **NPM** (Bawaan Node.js)
- **MySQL Server** (Apabila Anda ingin mendeploy skema `.sql` di server database nyata)

### Langkah-Langkah Menjalankan di Lingkungan Lokal:

1. **Clone atau Ekstrak File Projek**
   Pastikan seluruh file berada di direktori kerja Anda.

2. **Pasang Seluruh Dependency Projek**
   Jalankan perintah berikut di terminal root projek:
   ```bash
   npm install
   ```

3. **Inisiasi Environment File**
   Salin berkas `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   *Catatan:* Sesi server Node.js akan mendeteksi token penandatangan JWT dari variabel `JWT_SECRET` secara otomatis.

4. **Jalankan Server Full-Stack (Dev Mode)**
   Boot aplikasi gabungan (Backend Express + Frontend Vite Dev Middleware) menggunakan perintah:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan secara instan dan dapat diakses melalui browser Anda di tautan:
   [http://localhost:3000](http://localhost:3000)

5. **Mendeploy Database ke MySQL Nyata**
   - Jalankan MySQL Server Anda.
   - Buat database baru bernama `unaba_campus_activity`.
   - Jalankan script SQL yang ada pada file `schema.sql` di terminal MySQL atau melalui phpMyAdmin/DBeaver untuk membuat tabel relasional lengkap beserta foreign keys, indexes, dan seed data dasar:
     ```bash
     mysql -u root -p unaba_campus_activity < schema.sql
     ```

6. **Membuat Build Produksi**
   Untuk mengompilasi aplikasi untuk keperluan deployment komersial:
   ```bash
   npm run build
   ```
   Hasil build static web dan backend yang terbundel dalam format CommonJS akan tersimpan di dalam folder `dist/`. Jalankan server produksi dengan skrip:
   ```bash
   npm run start
   ```

---

## 📝 Penjelasan Fungsi Berkas Utama

- **`schema.sql`**: Berisi skrip DDL lengkap untuk inisialisasi database MySQL. Mendefinisikan relasi tabel `users`, `students`, `activities`, dan `absences` dengan penegakan integritas data berupa Primary Key, Foreign Key (`ON DELETE CASCADE`), dan Unique Constraints.
- **`server.ts`**: Merupakan pintu masuk utama (entrypoint) backend server. Berfungsi meredireksi lalu lintas HTTP API, melayani file statis, serta menginisiasi *Vite Development Middleware* agar frontend dan backend terintegrasi sempurna di satu port tunggal (`3000`).
- **`server/db.ts`**: Pengendali data lokal berbasis JSON. Digunakan untuk menyimulasikan data relasional MySQL secara persisten selama masa pengembangan/preview tanpa mengandalkan server eksternal, sehingga aplikasi langsung berfungsi penuh saat dijalankan pertama kali.
- **`server/routes.ts`**: Mendefinisikan seluruh logic REST API sesuai spesifikasi teknis yang diminta (Login validation, JWT token signing, CRUD Students, CRUD Activities, Logging Attendance, dan kalkulasi Analytics Recap).
- **`src/types.ts`**: Menyediakan definisi tipe objek TypeScript (User, Student, Activity, Attendance) untuk memastikan keamanan tipe (type-safety) dan pencegahan bug selama pemrograman.
- **`src/context/AuthContext.tsx`**: Mengelola state login pengguna secara global, menyimpan token di `localStorage` agar tidak hilang saat reload, dan mengatur default header Axios Authorization Bearer secara otomatis.
- **`src/App.tsx`**: Pengendali navigasi client-side menggunakan `react-router-dom`. Mengamankan halaman administrasi (CRUD) hanya untuk akun `admin`, serta mengarahkan pengguna yang tidak sah kembali ke halaman login.
- **`src/pages/Login.tsx`**: Halaman login yang memuat teks branding display raksasa **UNIVERSITAS ANAK BANGSA** (berukuran 50px bold hitam) serta formulir input kredensial yang interaktif dan responsif.
- **`src/pages/Dashboard.tsx`**: Berisi panel analytics utama. Menyajikan metrik jumlah total entitas, pemberitahuan penting, serta grafik batang visualisasi kehadiran mahasiswa per kegiatan.
- **`src/pages/StudentData.tsx` & `ActivityData.tsx`**: Menyajikan tampilan antarmuka tabel interaktif, kolom pencarian cepat, serta form modal yang elegan untuk operasi tambah/ubah data mahasiswa dan agenda kegiatan.
- **`src/pages/Attendance.tsx`**: Antarmuka bagi administrator untuk mencatat presensi mahasiswa, serta bagi mahasiswa untuk melakukan check-in mandiri dengan pembatasan input yang aman dan adaptif sesuai role akun.
- **`src/pages/AttendanceRecap.tsx`**: Halaman laporan lengkap. Dilengkapi pencarian dan filter status kehadiran, tombol ekspor langsung ke Excel (CSV), serta opsi Cetak PDF yang otomatis menyembunyikan elemen navigasi browser agar menghasilkan laporan kertas yang profesional.
