import sequelize from "./src/config/sequelize.js";
import {
  UsersModel,
  KaryawanFaceModel,
  KaryawanModel,
  KuotaCutiModel,
  PengajuanCutiModel,
  KomponenGajiModel,
  SlipGajiModel,
  DetailSlipGajiModel,
  LokasiKantorModel,
  AbsensiKaryawanModel,
  LemburModel,
} from "./src/models/index.model.js";
import argon2 from "argon2";

async function seedDummy() {
  try {
    // 1. Koneksi & Sinkronisasi
    await sequelize.authenticate();
    console.log("Koneksi database berhasil.");

    // Matikan Foreign Key Checks sementara untuk membersihkan tabel
    console.log("Membersihkan data lama...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    
    // Urutan hapus data dari dependensi terdalam
    await DetailSlipGajiModel.destroy({ where: {}, force: true });
    await SlipGajiModel.destroy({ where: {}, force: true });
    await PengajuanCutiModel.destroy({ where: {}, force: true });
    await LemburModel.destroy({ where: {}, force: true });
    await AbsensiKaryawanModel.destroy({ where: {}, force: true });
    await KaryawanFaceModel.destroy({ where: {}, force: true });
    await KaryawanModel.destroy({ where: {}, force: true });
    await UsersModel.destroy({ where: {}, force: true });
    await KomponenGajiModel.destroy({ where: {}, force: true });
    await KuotaCutiModel.destroy({ where: {}, force: true });
    await LokasiKantorModel.destroy({ where: {}, force: true });

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Data lama berhasil dibersihkan.");

    // 2. Seeding UsersModel (12 Users: 2 HRD, 10 Karyawan)
    console.log("Seeding Users...");
    const hashedPassword = await argon2.hash("password123");
    
    const hrdUsers = [];
    for (let i = 1; i <= 2; i++) {
      const hrd = await UsersModel.create({
        username: `hrd_${i}`,
        email: `hrd${i}@company.com`,
        password: hashedPassword,
        role: "hrd",
        status: "aktif",
      });
      hrdUsers.push(hrd);
    }

    const karyawanUsers = [];
    for (let i = 1; i <= 10; i++) {
      const kryUser = await UsersModel.create({
        username: `karyawan_${i}`,
        email: `karyawan${i}@company.com`,
        password: hashedPassword,
        role: "karyawan",
        status: "aktif",
      });
      karyawanUsers.push(kryUser);
    }
    console.log(`Berhasil membuat ${hrdUsers.length} user HRD dan ${karyawanUsers.length} user karyawan.`);

    // 3. Seeding LokasiKantorModel (10 Lokasi Kantor)
    console.log("Seeding Lokasi Kantor...");
    const locationsData = [
      { nama_perusahaan: "HQ Jakarta", latitude: -6.20880000, longitude: 106.84560000, radius_absen_meter: 100, jam_masuk: "08:00:00", jam_keluar: "17:00:00" },
      { nama_perusahaan: "Cabang Bandung", latitude: -6.91750000, longitude: 107.61910000, radius_absen_meter: 150, jam_masuk: "08:00:00", jam_keluar: "17:00:00" },
      { nama_perusahaan: "Cabang Surabaya", latitude: -7.25750000, longitude: 112.75210000, radius_absen_meter: 100, jam_masuk: "08:30:00", jam_keluar: "17:30:00" },
      { nama_perusahaan: "Cabang Medan", latitude: 3.59520000, longitude: 98.67220000, radius_absen_meter: 200, jam_masuk: "08:00:00", jam_keluar: "17:00:00" },
      { nama_perusahaan: "Cabang Yogyakarta", latitude: -7.79560000, longitude: 110.36950000, radius_absen_meter: 120, jam_masuk: "08:00:00", jam_keluar: "17:00:00" },
      { nama_perusahaan: "Cabang Makassar", latitude: -5.14770000, longitude: 119.43270000, radius_absen_meter: 100, jam_masuk: "08:00:00", jam_keluar: "17:00:00" },
      { nama_perusahaan: "Cabang Bali", latitude: -8.67050000, longitude: 115.21260000, radius_absen_meter: 150, jam_masuk: "08:30:00", jam_keluar: "17:30:00" },
      { nama_perusahaan: "Cabang Balikpapan", latitude: -1.26540000, longitude: 116.83120000, radius_absen_meter: 100, jam_masuk: "08:00:00", jam_keluar: "17:00:00" },
      { nama_perusahaan: "Cabang Palembang", latitude: -2.99090000, longitude: 104.75660000, radius_absen_meter: 100, jam_masuk: "08:00:00", jam_keluar: "17:00:00" },
      { nama_perusahaan: "Cabang Semarang", latitude: -6.96670000, longitude: 110.41670000, radius_absen_meter: 100, jam_masuk: "08:00:00", jam_keluar: "17:00:00" },
    ];
    const lokasiList = await LokasiKantorModel.bulkCreate(locationsData);
    console.log(`Berhasil membuat ${lokasiList.length} lokasi kantor.`);

    // 4. Seeding KuotaCutiModel (10 Kuota Cuti Bulanan unik di tahun 2026)
    console.log("Seeding Kuota Cuti...");
    const kuotaCutiData = [];
    const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober"];
    for (let m = 1; m <= 10; m++) {
      kuotaCutiData.push({
        bulan: m,
        tahun: 2026,
        total_hari_kerja: 22,
        kuota_cuti: 2,
        keterangan: `Kuota cuti bulan ${namaBulan[m - 1]} 2026`,
        is_active: true,
      });
    }
    const kuotaCutiList = await KuotaCutiModel.bulkCreate(kuotaCutiData);
    console.log(`Berhasil membuat ${kuotaCutiList.length} data kuota cuti.`);

    // 5. Seeding KomponenGajiModel (10 Komponen Gaji)
    console.log("Seeding Komponen Gaji...");
    const komponenGajiData = [
      { nama: "Tunjangan Transport", tipe: "bonus", metode: "nominal", nilai_default: 350000, keterangan: "Tunjangan biaya transport bulanan", is_active: true },
      { nama: "Tunjangan Makan", tipe: "bonus", metode: "nominal", nilai_default: 500000, keterangan: "Uang makan bulanan", is_active: true },
      { nama: "Tunjangan Kesehatan", tipe: "bonus", metode: "nominal", nilai_default: 300000, keterangan: "Tunjangan asuransi kesehatan mandiri", is_active: true },
      { nama: "Bonus Kinerja", tipe: "bonus", metode: "nominal", nilai_default: 1500000, keterangan: "Apresiasi kinerja bulanan", is_active: true },
      { nama: "Insentif Kerajinan", tipe: "bonus", metode: "nominal", nilai_default: 200000, keterangan: "Diberikan untuk yang tidak pernah absen", is_active: true },
      { nama: "Potongan BPJS Kesehatan", tipe: "potongan", metode: "nominal", nilai_default: 120000, keterangan: "Potongan iuran BPJS Kesehatan", is_active: true },
      { nama: "Potongan BPJS Ketenagakerjaan", tipe: "potongan", metode: "nominal", nilai_default: 180000, keterangan: "Potongan iuran JHT BPJS Ketenagakerjaan", is_active: true },
      { nama: "Potongan Keterlambatan", tipe: "potongan", metode: "nominal", nilai_default: 50000, keterangan: "Potongan karena telat hadir", is_active: true },
      { nama: "Potongan Absen Tanpa Kabar", tipe: "potongan", metode: "nominal", nilai_default: 150000, keterangan: "Potongan tidak hadir tanpa keterangan", is_active: true },
      { nama: "Potongan PPh21 Pajak", tipe: "potongan", metode: "nominal", nilai_default: 100000, keterangan: "Potongan estimasi pajak penghasilan", is_active: true },
    ];
    const komponenList = await KomponenGajiModel.bulkCreate(komponenGajiData);
    console.log(`Berhasil membuat ${komponenList.length} komponen gaji.`);

    // 6. Seeding KaryawanModel (10 Karyawan dikaitkan ke 10 User Karyawan)
    console.log("Seeding Karyawan...");
    const departments = ["IT Support", "Software Engineering", "Human Resource", "Finance & Account", "Marketing & Growth"];
    const jabatans = [
      ["Junior Support", "Senior Support"],
      ["Software Engineer", "Tech Lead"],
      ["HR Staff", "HR Manager"],
      ["Accountant", "Finance Lead"],
      ["Content Writer", "Marketing Lead"]
    ];

    const karyawanList = [];
    const namaBelakang = ["Pratama", "Sari", "Wijaya", "Kurniawan", "Lestari", "Hidayat", "Putri", "Setiawan", "Utami", "Santoso"];
    
    for (let i = 0; i < 10; i++) {
      const user = karyawanUsers[i];
      const deptIdx = i % departments.length;
      const jabSubIdx = i % 2;
      const department = departments[deptIdx];
      const jabatan = jabatans[deptIdx][jabSubIdx];
      
      const karyawan = await KaryawanModel.create({
        user_id: user.id,
        nama_lengkap: `Karyawan ${namaBelakang[i]}`,
        tanggal_masuk: `2025-01-${10 + i}`,
        alamat: `Jl. Kemang Timur Raya No. ${15 + i}, Jakarta Selatan`,
        department: department,
        jabatan: jabatan,
        gaji_pokok: 5000000 + (i * 750000), // Gaji berkisar antara 5jt - 11.75jt
        is_active: true,
      });
      karyawanList.push(karyawan);
    }
    console.log(`Berhasil membuat ${karyawanList.length} data karyawan.`);

    // 7. Seeding KaryawanFaceModel (10 Data Wajah 1:1 Karyawan)
    console.log("Seeding Wajah Karyawan...");
    const faceList = [];
    for (let i = 0; i < 10; i++) {
      const karyawan = karyawanList[i];
      const embedding = Array.from({ length: 128 }, () => Math.random() * 0.2 - 0.1); // Dummy 128 float embedding
      const face = await KaryawanFaceModel.create({
        karyawan_id: karyawan.id,
        face_embedding: embedding,
        face_image_url: `http://localhost:5000/uploads/faces/dummy_face_${i + 1}.jpg`,
        training_count: 1,
      });
      faceList.push(face);
    }
    console.log(`Berhasil membuat ${faceList.length} data wajah karyawan.`);

    // 8. Seeding AbsensiKaryawanModel (50 Absensi: 5 hari kerja * 10 Karyawan)
    console.log("Seeding Absensi Karyawan...");
    const absensiList = [];
    const workingDays = ["2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16", "2026-07-17"]; // Senin-Jumat

    for (let k = 0; k < 10; k++) {
      const karyawan = karyawanList[k];
      for (let d = 0; d < workingDays.length; d++) {
        const tanggal = workingDays[d];
        // Custom distribution: kebanyakan "masuk", beberapa "terlambat" atau "izin/sakit"
        let status = "masuk";
        let jam_masuk = "07:55:00";
        let jam_keluar = "17:05:00";
        let menit_terlambat = 0;
        let keterangan = "Hadir tepat waktu";

        const roll = Math.random();
        if (roll < 0.15) {
          status = "terlambat";
          jam_masuk = "08:18:00";
          menit_terlambat = 18;
          keterangan = "Terlambat karena macet lalu lintas";
        } else if (roll >= 0.15 && roll < 0.20) {
          status = "sakit";
          jam_masuk = null;
          jam_keluar = null;
          keterangan = "Sakit surat dokter terlampir";
        } else if (roll >= 0.20 && roll < 0.23) {
          status = "izin";
          jam_masuk = null;
          jam_keluar = null;
          keterangan = "Izin keperluan keluarga mendesak";
        }

        const abs = await AbsensiKaryawanModel.create({
          karyawan_id: karyawan.id,
          tanggal: tanggal,
          jam_masuk: jam_masuk,
          jam_keluar: jam_keluar,
          status: status,
          keterangan: keterangan,
          latitude_masuk: -6.20880000 + (Math.random() * 0.0005 - 0.00025),
          longitude_masuk: 106.84560000 + (Math.random() * 0.0005 - 0.00025),
          latitude_keluar: jam_keluar ? -6.20880000 + (Math.random() * 0.0005 - 0.00025) : null,
          longitude_keluar: jam_keluar ? 106.84560000 + (Math.random() * 0.0005 - 0.00025) : null,
          distance_masuk: jam_masuk ? parseFloat((Math.random() * 50).toFixed(2)) : null,
          distance_keluar: jam_keluar ? parseFloat((Math.random() * 50).toFixed(2)) : null,
          menit_terlambat: menit_terlambat || null,
          validasi_lokasi_masuk: jam_masuk ? true : false,
          validasi_lokasi_keluar: jam_keluar ? true : false,
          is_manual: false,
        });
        absensiList.push(abs);
      }
    }
    console.log(`Berhasil membuat ${absensiList.length} data absensi karyawan.`);

    // 9. Seeding LemburModel (10 Data Lembur)
    console.log("Seeding Lembur...");
    const lemburList = [];
    for (let i = 0; i < 10; i++) {
      const karyawan = karyawanList[i];
      const approvedBy = hrdUsers[i % 2].id;
      const lembur = await LemburModel.create({
        karyawan_id: karyawan.id,
        tanggal: "2026-07-15",
        jam_mulai: "18:00:00",
        jam_selesai: "20:30:00",
        total_jam: 2.50,
        keterangan: "Penyelesaian deployment sistem release v2.0",
        status: i % 3 === 0 ? "pending" : i % 3 === 1 ? "approved" : "rejected",
        approved_by: i % 3 === 1 ? approvedBy : null,
        approved_at: i % 3 === 1 ? new Date() : null,
        rejection_reason: i % 3 === 2 ? "Keterangan kurang spesifik" : null,
      });
      lemburList.push(lembur);
    }
    console.log(`Berhasil membuat ${lemburList.length} data lembur.`);

    // 10. Seeding PengajuanCutiModel (10 Data Pengajuan Cuti)
    console.log("Seeding Pengajuan Cuti...");
    const cutiList = [];
    const jenisCuti = ["tahunan", "sakit", "penting", "lainnya"];
    for (let i = 0; i < 10; i++) {
      const karyawan = karyawanList[i];
      const approvedBy = hrdUsers[i % 2].id;
      const statusCuti = i % 3 === 0 ? "pending" : i % 3 === 1 ? "disetujui" : "ditolak";
      
      const cuti = await PengajuanCutiModel.create({
        karyawan_id: karyawan.id,
        tanggal_mulai: "2026-08-10",
        tanggal_selesai: "2026-08-12",
        jumlah_hari: 3,
        jenis_cuti: jenisCuti[i % jenisCuti.length],
        alasan: "Acara keluarga penting / pemeriksaan medis berkala",
        status: statusCuti,
        catatan_approval: statusCuti === "disetujui" ? "Silakan serah terima pekerjaan sebelum cuti" : statusCuti === "ditolak" ? "SDM departemen sedang minim di tanggal tersebut" : null,
        approved_by: statusCuti === "disetujui" ? approvedBy : null,
        approved_at: statusCuti === "disetujui" ? new Date() : null,
      });
      cutiList.push(cuti);
    }
    console.log(`Berhasil membuat ${cutiList.length} data pengajuan cuti.`);

    // 11. Seeding SlipGajiModel (10 Slip Gaji - 1 per Karyawan di bulan Juni 2026)
    console.log("Seeding Slip Gaji...");
    const slipList = [];
    for (let i = 0; i < 10; i++) {
      const karyawan = karyawanList[i];
      const gajiPokok = parseFloat(karyawan.gaji_pokok);
      
      // Hitung pendapatan & potongan simulasi
      const bonusTransport = 350000;
      const bonusMakan = 500000;
      const potonganBpjsKes = 120000;
      const potonganBpjsKet = 180000;

      const totalPendapatan = gajiPokok + bonusTransport + bonusMakan;
      const totalPotongan = potonganBpjsKes + potonganBpjsKet;
      const gajiBersih = totalPendapatan - totalPotongan;

      const slip = await SlipGajiModel.create({
        karyawan_id: karyawan.id,
        bulan: 6,
        tahun: 2026,
        total_hari_kerja: 22,
        total_hadir: 20,
        total_terlambat: 1,
        total_absen: 1,
        total_cuti: 0,
        total_lembur_jam: 3.50,
        gaji_pokok: gajiPokok,
        total_pendapatan: totalPendapatan,
        total_potongan: totalPotongan,
        gaji_bersih: gajiBersih,
        status: i % 2 === 0 ? "final" : "draft",
        catatan: `Slip gaji bulan Juni 2026 untuk ${karyawan.nama_lengkap}`,
      });
      slipList.push(slip);
    }
    console.log(`Berhasil membuat ${slipList.length} data slip gaji.`);

    // 12. Seeding DetailSlipGajiModel (20 Detail Slip Gaji - 2 per Slip Gaji)
    console.log("Seeding Detail Slip Gaji...");
    let detailCount = 0;
    
    // Cari komponen tunjangan transport (bonus) dan BPJS Kesehatan (potongan)
    const compTransport = komponenList.find(c => c.nama === "Tunjangan Transport");
    const compBpjsKes = komponenList.find(c => c.nama === "Potongan BPJS Kesehatan");

    for (let i = 0; i < 10; i++) {
      const slip = slipList[i];

      // Tambah detail bonus transport
      await DetailSlipGajiModel.create({
        slip_gaji_id: slip.id,
        komponen_id: compTransport ? compTransport.id : null,
        nama_komponen: "Tunjangan Transport",
        tipe: "bonus",
        nilai: 350000.00,
        keterangan: "Tunjangan transport bulanan standard",
      });
      detailCount++;

      // Tambah detail potongan BPJS
      await DetailSlipGajiModel.create({
        slip_gaji_id: slip.id,
        komponen_id: compBpjsKes ? compBpjsKes.id : null,
        nama_komponen: "Potongan BPJS Kesehatan",
        tipe: "potongan",
        nilai: 120000.00,
        keterangan: "Iuran BPJS Kesehatan bulanan",
      });
      detailCount++;
    }
    console.log(`Berhasil membuat ${detailCount} detail slip gaji.`);

    console.log("\n==================================================");
    console.log("DUMMY DATA SEEDING COMPLETED SUCCESSFULLY!");
    console.log("==================================================");
    console.log(`- Users Model         : 12 data (2 HRD, 10 Karyawan)`);
    console.log(`- Karyawan Model      : 10 data`);
    console.log(`- Face Karyawan Model : 10 data`);
    console.log(`- Lokasi Kantor Model : 10 data`);
    console.log(`- Kuota Cuti Model    : 10 data`);
    console.log(`- Komponen Gaji Model : 10 data`);
    console.log(`- Absensi Model       : 50 data`);
    console.log(`- Lembur Model        : 10 data`);
    console.log(`- Pengajuan Cuti Model: 10 data`);
    console.log(`- Slip Gaji Model     : 10 data`);
    console.log(`- Detail Slip Model   : 20 data`);
    console.log("==================================================");

    process.exit(0);
  } catch (error) {
    console.error("Gagal melakukan dummy seeding:", error);
    process.exit(1);
  }
}

seedDummy();
