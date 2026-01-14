import AbsensiKaryawanModel from "../../models/absensiModel.js";
import { validateDistance } from "../../utils/faceDistance.js";
import KaryawanFaceModel from "../../models/face_karyawanModel.js";
import KaryawanModel from "../../models/karyawan.model.js";
import LokasiKantorModel from "../../models/lokasiKantor.model.js";
import { lokasiDistance } from "../../utils/lokasiDistance.js";
import { Op } from "sequelize";
import moment from "moment";

export default class AbsensiController {
  static async absensiMasuk(req, res) {
    try {
      const user_id = req.user.id;
      const { face_embedding_masuk, latitude_masuk, longitude_masuk } =
        req.body;

      if (!face_embedding_masuk) {
        return res.status(400).json({
          msg: "Absensi Gagal, Silahkan absensi ulang",
        });
      }

      const karyawan = await KaryawanModel.findOne({
        where: { user_id: user_id },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan untuk user ini",
        });
      }

      const karyawan_id = karyawan.id;

      // --- VALIDASI TANGGAL (FIX BUG DISINI) ---
      const now = new Date();
      // Format manual YYYY-MM-DD agar sesuai local time (WIB), bukan UTC
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const tanggalDB = `${year}-${month}-${day}`; // Hasil: "2025-12-10"

      // 1. CEK DUPLIKASI ABSEN DULUAN (Best Practice: Cek DB dulu sebelum hitung face recognition berat)
      const existingMasuk = await AbsensiKaryawanModel.findOne({
        where: {
          karyawan_id,
          tanggal: tanggalDB, // Pastikan tipe data di DB adalah DATEONLY atau string 'YYYY-MM-DD'
        },
      });

      if (existingMasuk) {
        return res.status(400).json({
          msg: "Anda sudah melakukan absensi masuk hari ini",
        });
      }
      // -----------------------------------------------------------

      const karyawanFace = await KaryawanFaceModel.findOne({
        where: { karyawan_id: karyawan_id },
      });

      if (!karyawanFace) {
        return res.status(404).json({
          msg: "Data Wajah belum terdaftar, Silahkan lakukan registrasi wajah pada sistem",
        });
      }

      const storedEmbedding = karyawanFace.face_embedding;

      // Hitung jarak wajah
      const distance = validateDistance(face_embedding_masuk, storedEmbedding);
      const threshold = 0.6;

      if (distance > threshold) {
        return res.status(400).json({
          msg: "Wajah tidak cocok, Absensi Ditolak",
          distance,
        });
      }

      // Data jam masuk kantor
      const lokasiKantor = await LokasiKantorModel.findOne();

      if (!lokasiKantor) {
        return res.status(400).json({
          msg: "Data lokasi kantor belum diinput oleh HRD",
        });
      }

      // Hitung Jarak Lokasi
      const jarak = lokasiDistance(
        Number(latitude_masuk),
        Number(longitude_masuk),
        Number(lokasiKantor.latitude),
        Number(lokasiKantor.longitude)
      );

      const radius = lokasiKantor.radius_absen_meter;
      const validasiLokasiMasuk = jarak <= radius;

      // Format Jam (HH:MM)
      const jamAbsen = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      // Tentukan Status (Masuk/Terlambat)
      let statusKehadiran = "masuk";
      if (lokasiKantor.jam_masuk) {
        const jamMasukStr = lokasiKantor.jam_masuk; // "08:00:00"
        const [jadwalJam, jadwalMenit] = jamMasukStr.split(":");

        const jadwalMasuk = new Date();
        jadwalMasuk.setHours(jadwalJam, jadwalMenit, 0, 0);

        if (now > jadwalMasuk) {
          statusKehadiran = "terlambat";
        }
      }

      if (!lokasiKantor.jam_masuk) {
        return res.status(400).json({
          msg: "Jam Masuk kantor belum di set",
        });
      }

      const jamMasukKantorStr = lokasiKantor.jam_masuk.slice(0, 5);

      // konverso
      const menitMasukKantor = timeToMinutes(jamMasukKantorStr);
      const menitAbsen = timeToMinutes(jamAbsen);
      let menitTerlambat = 0;

      if (menitAbsen > menitMasukKantor) {
        menitTerlambat = menitAbsen - menitMasukKantor;
        statusKehadiran = "terlambat";
      }

      // Simpan Absensi
      const absensi = await AbsensiKaryawanModel.create({
        karyawan_id,
        tanggal: tanggalDB, // Gunakan tanggal yang sudah diformat benar
        jam_masuk: jamAbsen,
        latitude_masuk,
        longitude_masuk,
        face_embedding_masuk,
        distance_masuk: distance,
        validasi_lokasi_masuk: true, // Atau gunakan variable validasiLokasiMasuk jika ingin dinamis
        menit_terlambat: menitTerlambat,
        status: statusKehadiran,
        keterangan: "Tanpa Keterangan",
      });

      return res.status(201).json({
        msg: validasiLokasiMasuk
          ? "Absensi Masuk Berhasil"
          : "Absensi Masuk Berhasil (Diluar Radius Kantor)", // Tergantung kebijakan perusahaan Anda mau reject atau warn
        data: {
          jam: jamAbsen,
          status: statusKehadiran,
          jarak: jarak.toFixed(2),
        },
      });
    } catch (error) {
      console.error(error); // Gunakan console.error agar tampil merah di terminal
      return res.status(500).json({
        msg: "Terjadi Kesalahan Pada Server",
        error: error.message, // Opsional: kirim pesan error dev
      });
    }
  }

  static async absensiKeluar(req, res) {
    try {
      const user_id = req.user.id;
      const { face_embedding_keluar, latitude_keluar, longitude_keluar } =
        req.body;

      // 1. Validasi Input
      if (!face_embedding_keluar) {
        return res.status(400).json({
          msg: "Absensi Keluar Gagal, Data wajah tidak terdeteksi",
        });
      }

      // 2. Cari Karyawan
      const karyawan = await KaryawanModel.findOne({ where: { user_id } });
      if (!karyawan) {
        return res.status(404).json({ msg: "Data karyawan tidak ditemukan" });
      }
      const karyawan_id = karyawan.id;

      // 3. Format Tanggal Hari Ini (YYYY-MM-DD) - Sesuai Local Time
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const tanggalDB = `${year}-${month}-${day}`;

      // 4. Cari Data Absensi HARI INI
      const absensiHariIni = await AbsensiKaryawanModel.findOne({
        where: {
          karyawan_id: karyawan_id,
          tanggal: tanggalDB,
        },
      });

      // Validasi: Belum Absen Masuk
      if (!absensiHariIni) {
        return res.status(400).json({
          msg: "Anda belum melakukan absensi masuk hari ini. Silahkan absen masuk terlebih dahulu.",
        });
      }

      // Validasi: Sudah Absen Keluar Sebelumnya
      if (absensiHariIni.jam_keluar) {
        return res.status(400).json({
          msg: "Anda sudah melakukan absensi keluar hari ini.",
          jam_keluar: absensiHariIni.jam_keluar,
        });
      }

      // 5. Validasi Wajah (Face Recognition)
      const karyawanFace = await KaryawanFaceModel.findOne({
        where: { karyawan_id: karyawan_id },
      });

      if (!karyawanFace) {
        return res
          .status(404)
          .json({ msg: "Data referensi wajah tidak ditemukan" });
      }

      const storedEmbedding = karyawanFace.face_embedding;
      const distance = validateDistance(face_embedding_keluar, storedEmbedding);
      const threshold = 0.6; // Samakan dengan absen masuk

      if (distance > threshold) {
        return res.status(400).json({
          msg: "Wajah tidak cocok, Absensi Keluar Ditolak",
          distance,
        });
      }

      // 6. Validasi Lokasi (Opsional: Tergantung kebijakan, apakah pulang harus di kantor?)
      const lokasiKantor = await LokasiKantorModel.findOne();
      if (!lokasiKantor) {
        return res.status(400).json({ msg: "Data lokasi kantor belum diatur" });
      }

      const jarak = lokasiDistance(
        Number(latitude_keluar),
        Number(longitude_keluar),
        Number(lokasiKantor.latitude),
        Number(lokasiKantor.longitude)
      );

      const radius = lokasiKantor.radius_absen_meter;
      const validasiLokasiKeluar = jarak <= radius;

      // 7. Siapkan Data Update
      const jamKeluar = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      // (Opsional) Hitung Durasi Kerja Sederhana
      // jam_masuk format "HH:MM", kita hitung selisih jam
      const [jamMasuk, menitMasuk] = absensiHariIni.jam_masuk
        .split(":")
        .map(Number);
      const [jamKeluarNow, menitKeluarNow] = jamKeluar.split(":").map(Number);

      const dateMasuk = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        jamMasuk,
        menitMasuk
      );
      const dateKeluar = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        jamKeluarNow,
        menitKeluarNow
      );

      const diffMs = dateKeluar - dateMasuk; // selisih dalam milidetik
      const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // jam
      const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // menit
      const durasiKerja = `${diffHrs} Jam ${diffMins} Menit`;

      // 8. Lakukan Update ke Database
      // Kita update record yang sudah ditemukan tadi (absensiHariIni)
      absensiHariIni.jam_keluar = jamKeluar;
      absensiHariIni.latitude_keluar = latitude_keluar;
      absensiHariIni.longitude_keluar = longitude_keluar;
      absensiHariIni.face_embedding_keluar = face_embedding_keluar;
      absensiHariIni.distance_keluar = distance;
      absensiHariIni.validasi_lokasi_keluar = validasiLokasiKeluar;

      // Jika Anda punya kolom 'durasi', bisa diisi disini. Jika tidak, abaikan.
      // absensiHariIni.durasi = durasiKerja;

      await absensiHariIni.save(); // Simpan perubahan

      return res.status(200).json({
        msg: validasiLokasiKeluar
          ? "Absensi Keluar Berhasil"
          : "Absensi Keluar Berhasil (Diluar Radius Kantor)",
        data: {
          jam_masuk: absensiHariIni.jam_masuk,
          jam_keluar: jamKeluar,
          durasi_kerja: durasiKerja,
          jarak: jarak.toFixed(2) + " Meter",
        },
      });
    } catch (error) {
      console.error("Error Absen Keluar:", error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }

  // get absensi hari ini
  static async getAbsensi(req, res) {
    try {
      const user_id = req.user.id;

      // data karyawan
      const karyawan = await KaryawanModel.findOne({
        where: {
          user_id: user_id,
        },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Karyawan tidak ditemukan",
        });
      }

      const lokasiKantor = await LokasiKantorModel.findOne();
      if (!lokasiKantor) {
        return res.status(400).json({
          msg: "Konfigurasi Kantor belum di setting",
        });
      }

      const now = new Date();

      // Format YYYY-MM-DD untuk query database
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayDB = `${year}-${month}-${day}`;

      // Hitung minggu ini (Senin - Minggu)
      const currentDay = now.getDay(); // 0=Sunday, 1=Monday, etc.
      const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;

      const mondayDate = new Date(now);
      mondayDate.setDate(now.getDate() - distanceToMonday);
      mondayDate.setHours(0, 0, 0, 0); // Set to start of day

      const sundayDate = new Date(mondayDate);
      sundayDate.setDate(mondayDate.getDate() + 6);
      sundayDate.setHours(23, 59, 59, 999); // Set to end of day

      // Format tanggal untuk query (gunakan format yang sama dengan database)
      const startOfWeek = mondayDate.toISOString().split("T")[0];
      const endOfWeek = sundayDate.toISOString().split("T")[0];

      // DEBUG: Tampilkan tanggal range
      console.log("Range Minggu:", startOfWeek, "s/d", endOfWeek);

      const absenToday = await AbsensiKaryawanModel.findOne({
        where: {
          karyawan_id: karyawan.id,
          tanggal: todayDB,
        },
      });

      // Ambil data mingguan dengan format tanggal yang konsisten
      const weeklyLogin = await AbsensiKaryawanModel.findAll({
        where: {
          karyawan_id: karyawan.id,
          tanggal: {
            [Op.between]: [startOfWeek, endOfWeek],
          },
        },
        order: [["tanggal", "asc"]],
      });

      // DEBUG: Tampilkan data yang ditemukan
      console.log("Data Mingguan:", weeklyLogin.length, "records");

      // kalkulasi
      let stats = {
        onTime: 0,
        late: 0,
        absent: 0,
        totalDays: weeklyLogin.length,
        attendanceRate: 0,
      };

      weeklyLogin.forEach((log) => {
        console.log("Status log:", log.status); // DEBUG
        if (log.status === "masuk" || log.status === "hadir") {
          stats.onTime++;
        } else if (log.status === "terlambat") {
          stats.late++;
        }
      });

      if (stats.totalDays > 0) {
        // Rate = (Hadir / Total Absen Masuk) * 100
        stats.attendanceRate = Math.round(
          ((stats.onTime + stats.late) / stats.totalDays) * 100
        );
      }

      // 7. Hitung Keterlambatan Hari Ini (Menit)
      let lateMinutes = 0;
      if (
        absenToday &&
        absenToday.status === "terlambat" &&
        lokasiKantor.jam_masuk
      ) {
        // Logika hitung selisih menit
        const [jamJadwal, menitJadwal] = lokasiKantor.jam_masuk.split(":");
        const [jamMasuk, menitMasuk] = absenToday.jam_masuk.split(":");

        const jadwalDate = new Date(now.setHours(jamJadwal, menitJadwal, 0));
        const masukDate = new Date(now.setHours(jamMasuk, menitMasuk, 0));

        const diff = (masukDate - jadwalDate) / 60000; // ms to minutes
        if (diff > 0) lateMinutes = Math.floor(diff);
      }

      return res.status(200).json({
        msg: "Berhasil Mendapatkan data",
        data: {
          karyawan: {
            nama: karyawan.nama_lengkap,
            posisi: karyawan.jabatan,
            shift: `${lokasiKantor.jam_masuk?.slice(
              0,
              5
            )} - ${lokasiKantor.jam_keluar?.slice(0, 5)}`, // Ambil HH:MM
          },
          kantor: {
            latitude: parseFloat(lokasiKantor.latitude),
            longitude: parseFloat(lokasiKantor.longitude),
            radius: lokasiKantor.radius_absen_meter,
          },
          hariIni: {
            checkIn: absenToday?.jam_masuk
              ? absenToday.jam_masuk.slice(0, 5)
              : null,
            checkOut: absenToday?.jam_keluar
              ? absenToday.jam_keluar.slice(0, 5)
              : null,
            status: absenToday?.status
              ? absenToday.status === "masuk"
                ? "On Time"
                : absenToday.status === "terlambat"
                ? "Late"
                : absenToday.status
              : null,
            lateMinutes: lateMinutes,
          },
          mingguIni: {
            onTime: stats.onTime,
            late: stats.late,
            totalDays: stats.totalDays,
            attendanceRate: stats.attendanceRate,
          },
        },
      });
    } catch (error) {
      console.error("Error Get Dashboard:", error);
      return res.status(500).json({ msg: "Gagal memuat data dashboard" });
    }
  }

  // hari ini
  static async getAbsensiHariIni(req, res) {
    try {
      const user_id = req.user.id;

      // chek apakah user id ini ada
      const karyawan = await KaryawanModel.findOne({
        where: {
          user_id: user_id,
        },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data Karyawan tidak ditemukan",
        });
      }
      const karyawan_id = karyawan.id;

      const startHari = new Date();
      startHari.setHours(0, 0, 0, 0);

      const endHari = new Date();
      endHari.setHours(23, 59, 59, 999);

      const absensiHariIni = await AbsensiKaryawanModel.findOne({
        where: {
          karyawan_id: karyawan_id,
          createdAt: {
            [Op.between]: [startHari, endHari],
          },
        },
      });

      if (!absensiHariIni) {
        return res.json({
          checkIn: null,
          checkOut: null,
          status: null,
          lateMinutes: 0,
        });
      }

      return res.status(200).json({
        msg: "Berhasil Mendapatkan data",
        data: {
          id: absensiHariIni.id,
          tanggal: absensiHariIni.tanggal,
          checkIn: absensiHariIni.jam_masuk,
          checkOut: absensiHariIni.jam_keluar,
          status: absensiHariIni.status,
          keterangan: absensiHariIni.keterangan,
          jarakMasuk: absensiHariIni.distance_masuk,
          jarakKeluar: absensiHariIni.distance_keluar,
          menit_terlambat: absensiHariIni.menit_terlambat,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi Kesalahan Pada Server",
      });
    }
  }

  static async getDetailAbsensiMingguan(req, res) {
    try {
      const user_id = req.user.id;

      if (!user_id) {
        return res.status(404).json({
          msg: "User id tidak ditemukan",
        });
      }

      // check apakah karyawan ada
      const karyawan = await KaryawanModel.findOne({
        where: {
          user_id: user_id,
        },
      });

      if (!karyawan) {
        return res.status(400).json({
          msg: "Data Karyawan Tidak Ditemukan",
        });
      }

      const karyawan_id = karyawan.id;

      // Gunakan moment dengan timezone yang benar
      const startOfWeek = moment().startOf("isoWeek").toDate();
      const endOfWeek = moment().endOf("isoWeek").toDate();

      // ambil data absensi
      const absensiMingguan = await AbsensiKaryawanModel.findAll({
        where: {
          karyawan_id: karyawan_id,
          tanggal: {
            [Op.between]: [startOfWeek, endOfWeek],
          },
        },
        order: [["tanggal", "asc"]],
      });

      const data = absensiMingguan.map((item) => ({
        hari: moment(item.tanggal).format("dddd"),
        tanggal: item.tanggal,
        jam_masuk: item.jam_masuk,
        jam_keluar: item.jam_keluar,
        status: item.status,
        keterangan: item.keterangan,
      }));

      return res.status(200).json({
        msg: "Berhasil Mendapatkan data",
        data: data,
      });
    } catch (error) {
      console.error(error); // Gunakan console.error untuk error
      return res.status(500).json({
        msg: "Terjadi Kesalahan pada server",
        error: error.message, // Tambahkan pesan error untuk debugging
      });
    }
  }

  // Get absensi bulanan dengan filter
  static async getAbsensiBulanan(req, res) {
    try {
      const user_id = req.user.id;
      const { bulan, tahun } = req.query;

      // Default ke bulan dan tahun sekarang jika tidak ada parameter
      const bulanTarget = bulan ? parseInt(bulan) : new Date().getMonth() + 1;
      const tahunTarget = tahun ? parseInt(tahun) : new Date().getFullYear();

      // Validasi bulan
      if (bulanTarget < 1 || bulanTarget > 12) {
        return res.status(400).json({
          msg: "Bulan harus antara 1-12",
        });
      }

      // Cari karyawan
      const karyawan = await KaryawanModel.findOne({
        where: { user_id: user_id },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      // Hitung tanggal awal dan akhir bulan
      const startOfMonth = new Date(tahunTarget, bulanTarget - 1, 1);
      const endOfMonth = new Date(tahunTarget, bulanTarget, 0);

      // Format tanggal untuk query
      const startDate = startOfMonth.toISOString().split("T")[0];
      const endDate = endOfMonth.toISOString().split("T")[0];

      // Ambil data absensi bulan tersebut
      const absensiList = await AbsensiKaryawanModel.findAll({
        where: {
          karyawan_id: karyawan.id,
          tanggal: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [["tanggal", "ASC"]],
      });

      // Hitung statistik
      let stats = {
        totalHari: absensiList.length,
        hadir: 0,
        terlambat: 0,
        cuti: 0,
        izin: 0,
        sakit: 0,
        tidakHadir: 0,
      };

      absensiList.forEach((item) => {
        switch (item.status) {
          case "masuk":
            stats.hadir++;
            break;
          case "terlambat":
            stats.terlambat++;
            break;
          case "cuti":
            stats.cuti++;
            break;
          case "izin":
            stats.izin++;
            break;
          case "sakit":
            stats.sakit++;
            break;
          case "tidak_hadir":
            stats.tidakHadir++;
            break;
        }
      });

      // Format data untuk response
      const data = absensiList.map((item) => ({
        id: item.id,
        tanggal: item.tanggal,
        hari: moment(item.tanggal).format("dddd"),
        jam_masuk: item.jam_masuk ? item.jam_masuk.slice(0, 5) : null,
        jam_keluar: item.jam_keluar ? item.jam_keluar.slice(0, 5) : null,
        status: item.status,
        keterangan: item.keterangan,
        menit_terlambat: item.menit_terlambat || 0,
      }));

      return res.status(200).json({
        msg: "Berhasil mendapatkan data absensi bulanan",
        data: {
          bulan: bulanTarget,
          tahun: tahunTarget,
          stats: stats,
          absensi: data,
        },
      });
    } catch (error) {
      console.error("Error getAbsensiBulanan:", error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }
}
