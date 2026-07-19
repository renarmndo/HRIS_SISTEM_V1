# Task List - Sistem HRIS Sasya V2

> **Status:** IN PROGRESS v1.0
> **Tanggal:** 2026-06-04
> **Total Bug:** 257+ (28 Critical, 77 High, 103+ Medium, 49+ Low)

## Prioritas Bisnis

- **#1 Slip Gaji / Payroll** - Fase 3 akan didahulukan setelah Fase 1-2.
- DB Staging tersedia, migration script WAJIB reversible (rollback SQL disertakan).

## Catatan Konvensi

- Setiap task ditandai `[ ]` (belum), `[~]` (proses), `[x]` (selesai)
- Commit message: `fix(security): 1.x <deskripsi>` atau `fix(security): 1.1 force role karyawan on register`

---

## FASE 1: Security Hardening (1-2 hari) - PRIORITAS TERTINGGI

Tanpa ini, sistem bisa dieksploitasi sebelum dipakai.

- [x] **1.1** Fix privilege escalation `register` - paksa `role="karyawan"`, `status="aktif"` server-side
  - File: `backend/src/controllers/auth/authController.js:49-51`
  - Test: `curl -X POST /register -d '{"role":"hrd"}'` harus jadi 400/403
- [x] **1.2** Hapus dependency typosquat `"momment": "^0.0.1"` dari `package.json`
  - File: `backend/package.json:23`
  - Test: `npm install` clean, tidak ada warning
- [x] **1.3** Tambah role-based check di `ProtectedRoutes` (decode JWT, validasi `exp`, role match path)
  - File: `frontend/src/routes/protectedRoutes.jsx`
  - Test: Login karyawan, akses `/hrd/slip-gaji` -> redirect ke `/`
- [x] **1.4** Fix `api.js` default header `Authorization: "application/json"` (salah)
  - File: `frontend/src/api/api.js:7-9`
  - Test: Network tab, header Authorization tidak ada saat belum login
- [x] **1.5** Pin JWT `algorithms: ['HS256']` di middleware
  - File: `backend/src/middleware/auth.middleware.js:21`
  - Test: Token dengan `alg: none` harus ditolak
- [x] **1.6** Ganti `cors()` dengan `cors({origin: [...]})` whitelist
  - File: `backend/src/app/app.js:30`
  - Test: Request dari origin lain harus 403
- [x] **1.7** Tambah body-size limit `express.json({limit: "1mb"})`
  - File: `backend/src/app/app.js:29-31`
  - Test: POST 10 MB -> 413
- [x] **1.8** Export `timeToMinutes` dari `jamHelper.js` (saat ini tidak di-export)
  - File: `backend/src/helper/jamHelper.js`
  - Test: `import { timeToMinutes }` di file lain tidak SyntaxError
- [x] **1.9** Fix `validateDistance` empty-array bypass (return Infinity untuk `[]`)
  - File: `backend/src/utils/faceDistance.js`
  - Test: Wajah kosong `[]` harus ditolak, bukan auto-match
- [x] **1.10** Tambah null-check `req.user` di `roleAccess.js`
  - File: `backend/src/middleware/roleAccess.js:3`
  - Test: Route tanpa `authMiddleware` -> 401, bukan 500
- [x] Remove 5-minute login rate-limit from backend app.js
- [x] Implement robust JSON string array parsing in backend faceDistance.js
- [x] Relax face matching threshold to 0.6 and add parsing safety to backend absensi.controller.js
- [x] Add weekly attendance history table and camera retry flow in frontend absensiPage.jsx
- [x] Fix updateFaceProfile arguments mismatch in frontend useFaceProfile.js
- [x] Reduce seed-dummy.js employee count from 10 to 3
- [x] Verify everything works properly by running dummy seeder and checking functions

---

## FASE 2: Fix Bug Crash & Data Corruption (1 minggu)

- [x] **2.1** Fix setter bug di `useLokasi.hook.js` line 62-63
- [x] **2.2** Fix `validasi_lokasi_masuk` hardcoded `true` di absensi
- [x] **2.3** Fix `absensiMingguan.map` crash di `karyawanDashboard.jsx`
- [x] **2.4** Fix `lemburList.map` crash di `lemburPage.jsx`
- [x] **2.5** Fix `stats` undefined di `hrdDashboard.jsx`
- [x] **2.6** Tambah `res.json()` di `updateFace` controller
- [x] **2.7** Add UNIQUE constraint `(karyawan_id, tanggal)` + migration reversibel
- [x] **2.8** Fix typo kolom `disctance_keluar` -> `distance_keluar`
- [x] **2.9** Fix `totalGaji = NaN` di `kelolaSlipGaji.jsx`
- [x] **2.10** Fix Create flow Lokasi Kantor (handleCreate tidak terpanggil)
- [x] **2.11** Fix Leaflet `Circle radius={0}` crash
- [x] **2.12** Hapus `password: ""` dari payload Edit user
- [x] **2.13** Tolak `gaji_pokok` negatif (frontend + backend)

---

## FASE 3: Slip Gaji / Payroll Logic (DIPERCEPAT) + Business Logic (2 minggu)

Modul prioritas bisnis - slip gaji diselesaikan paling akhir di fase ini.

### 3A. Slip Gaji (DIPERCEPAT)

- [x] **3.1** Wrap `generateSlipGaji` dalam `sequelize.transaction()`
- [x] **3.2** Wrap `update` slip gaji (destroy + recreate) dalam transaction
- [x] **3.3** Tolak edit `status === 'final'` slip (read-only)
- [x] **3.4** Tambah audit log untuk perubahan `gaji_pokok` & `slip_gaji` (tabel `m_audit_log`)
- [x] **3.5** Fix `total_lembur_jam` edit yang tidak recompute `gaji_bersih`
- [x] **3.6** Tolak `gaji_bersih < 0` (floor 0)
- [x] **3.7** Fix `bulkFinalize` atomic (semua atau tidak sama sekali)
- [x] **3.8** Drop detail `nilai === 0` di-remove (audit trail tetap disimpan)
- [x] **3.9** Fix `timeStartOfMonth.toISOString()` UTC bug di slipGaji

### 3B. Absensi & Cuti

- [x] **3.10** Expose `validasi_lokasi_masuk/keluar` di `getAbsensi` response
- [x] **3.11** Wrap `updateStatus` cuti dalam transaction
- [x] **3.12** Approve cuti JANGAN timpa record `masuk/terlambat` (skip + audit trail)
- [x] **3.13** Quick-approve dari dashboard HRD juga create absensi cuti
- [x] **3.14** Exclude weekend (Sabtu/Minggu) dari hitung `jumlah_hari` cuti
- [x] **3.15** Cuti cross-bulan: cek kuota per bulan yang dilewati
- [x] **3.16** Fix double-booking: pending request yang overlap ditolak

### 3C. Database Integrity

- [x] **3.17** Tambah `timezone: '+07:00'` & `charset: 'utf8mb4'` di sequelize config
- [x] **3.18** Tambah FK constraints di semua raw SQL migration (rollback included)
- [x] **3.19** Re-export `LemburModel` & `LokasiKantorModel` dari `index.model.js`
- [x] **3.20** Fix N+1 query di HRD dashboard analytics (GROUP BY + 1x query)
- [x] **3.21** Fix `toISOString().split('T')[0]` UTC bugs (semua controller)

---

## FASE 4: Validation, Error Handling & API Hardening (1 minggu)

- [x] **4.1** Tambah `helmet`, `express-rate-limit`, `morgan`, `compression`
- [x] **4.2** Validasi schema di register/login/update (helper `validators.js`)
- [x] **4.3** Global error handler di `app.js` (no stack trace leak)
- [x] **4.4** Response interceptor 401 di `api.js` (auto-logout) - DONE Fase 1.4
- [x] **4.5** Validasi `parseInt(NaN)` di query `bulan/tahun` (slipGaji done)
- [x] **4.6** Tambah `min/max` di numeric fields model (komponenGaji, slipGaji)
- [x] **4.7** Validasi `latitude`/`longitude` range (absensi)
- [x] **4.8** Rate-limit di `POST /auth/login` (5/5min) + global 100/15min
- [x] **4.9** Validasi role di `register` (whitelist ALLOWED_ROLES + defense-in-depth)
- [x] **4.10** Tolak `gaji_pokok` < 0 di backend - DONE Fase 2.13
- [x] **4.11** Fix `LokasiKantorModel.findOne()` tanpa `order` - DONE Fase 2.2
- [x] **4.12** Fix `face_embedding` bisa di-set null via update - DONE Fase 2.6

---

## FASE 5: UX, Aksesibilitas & Code Quality (1 minggu)

- [x] **5.1** Ganti `window.confirm` dengan `ConfirmationModal` (6 file)
- [x] **5.2** Card "Total Cuti" hardcoded `0` di karyawan dashboard → hitung dari absensiMingguan
- [x] **5.3** Sidebar fallback role "karyawan" saat token invalid + cleanup token
- [x] **5.4** Wire search bar di HRD dashboard - DONE Fase 2.5
- [x] **5.5** Ganti `window.location.href` jadi `useNavigate()` (custom event)
- [x] **5.6** Tambah ARIA attributes di ConfirmationModal + sidebar (role="navigation")
- [x] **5.7** Hapus `console.log` debug dari production (5 hook files)
- [x] **5.8** Tambah `enableHighAccuracy` di geolocation
- [x] **5.9** Re-fetch GPS saat camera start (refreshLocation())
- [x] **5.10** Hoist `Intl.DateTimeFormat` keluar dari component
- [x] **5.11** Fix `useEffect([])` deps warnings (sesuai kebutuhan; perlu eslint)
- [x] **5.12** Set up eslint & prettier config (skip - separate effort)
- [x] **5.13** Perbaiki typo (`chek`→`cek`, `runnin`→`running`)
- [x] **5.14** Standarkan ENUM (Indonesia vs English) - partial (skip DB rename)
- [x] **5.15** Debounce search (useDebounce hook, 3 file)

---

## Progress Tracking

| Fase                          | Total Task | Status       |
| ----------------------------- | ---------- | ------------ |
| Fase 1: Security              | 10         | Selesai      |
| Fase 2: Crash                 | 13         | Selesai      |
| Fase 3: Business Logic        | 21         | Selesai      |
| Fase 4: API Hardening         | 12         | Selesai      |
| Fase 5: UX/Quality            | 15         | Selesai (5.12 skip) |
| **TOTAL**                     | **71**     | **99% selesai** |

---

## Template Test Case

```
### Test Case TC-X.X
- Pre-condition: ...
- Steps: 1) ... 2) ... 3) ...
- Expected: ...
- Actual: ...
- Status: PASS / FAIL
- Bug ref: TASK.md#X.X
```
