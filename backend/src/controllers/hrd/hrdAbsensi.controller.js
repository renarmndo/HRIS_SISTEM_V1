import { KaryawanModel, UsersModel } from "../../models/index.model.js";
import AbsensiKaryawanModel from "../../models/absensiModel.js";
import { Op } from "sequelize";
import moment from "moment";

export default class HrdAbsensiController {
  /**
   * Get semua absensi pada tanggal tertentu
   * Termasuk karyawan yang belum absen
   */
  static async getAbsensiByDate(req, res) {
    try {
      const { tanggal } = req.query;

      // Default ke hari ini jika tidak ada tanggal
      const targetDate = tanggal || moment().format("YYYY-MM-DD");

      // Ambil semua karyawan aktif
      const karyawanList = await KaryawanModel.findAll({
        where: { is_active: true },
        include: [
          {
            model: UsersModel,
            as: "user",
            attributes: ["id", "email"],
          },
        ],
        order: [["nama_lengkap", "ASC"]],
      });

      // Ambil data absensi untuk tanggal tersebut
      const absensiList = await AbsensiKaryawanModel.findAll({
        where: { tanggal: targetDate },
      });

      // Map absensi ke karyawan_id untuk akses cepat
      const absensiMap = {};
      absensiList.forEach((absen) => {
        absensiMap[absen.karyawan_id] = absen;
      });

      // Gabungkan data karyawan dengan absensi
      const result = karyawanList.map((karyawan) => {
        const absensi = absensiMap[karyawan.id];
        return {
          karyawan_id: karyawan.id,
          user_id: karyawan.user_id,
          nama_lengkap: karyawan.nama_lengkap,
          jabatan: karyawan.jabatan,
          departement: karyawan.departement,
          email: karyawan.user?.email,
          absensi: absensi
            ? {
                id: absensi.id,
                tanggal: absensi.tanggal,
                jam_masuk: absensi.jam_masuk,
                jam_keluar: absensi.jam_keluar,
                status: absensi.status,
                keterangan: absensi.keterangan,
                menit_terlambat: absensi.menit_terlambat,
                is_manual: absensi.is_manual,
                diabsen_oleh: absensi.diabsen_oleh,
              }
            : null,
        };
      });

      return res.status(200).json({
        msg: "Berhasil mendapatkan data absensi",
        data: {
          tanggal: targetDate,
          total_karyawan: karyawanList.length,
          sudah_absen: absensiList.length,
          belum_absen: karyawanList.length - absensiList.length,
          list: result,
        },
      });
    } catch (error) {
      console.error("Error getAbsensiByDate:", error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }

  /**
   * Get statistik absensi untuk tanggal tertentu
   */
  static async getAbsensiStats(req, res) {
    try {
      const { tanggal } = req.query;
      const targetDate = tanggal || moment().format("YYYY-MM-DD");

      // Hitung total karyawan aktif
      const totalKaryawan = await KaryawanModel.count({
        where: { is_active: true },
      });

      // Ambil semua absensi pada tanggal tersebut
      const absensiList = await AbsensiKaryawanModel.findAll({
        where: { tanggal: targetDate },
      });

      // Hitung per status
      const stats = {
        hadir: 0,
        terlambat: 0,
        tidak_hadir: 0,
        izin: 0,
        sakit: 0,
        cuti: 0,
        libur: 0,
      };

      absensiList.forEach((absen) => {
        if (absen.status === "masuk") {
          stats.hadir++;
        } else if (stats[absen.status] !== undefined) {
          stats[absen.status]++;
        }
      });

      // Karyawan yang belum absen = tidak hadir (jika sudah lewat jam kerja)
      const belumAbsen = totalKaryawan - absensiList.length;

      return res.status(200).json({
        msg: "Berhasil mendapatkan statistik absensi",
        data: {
          tanggal: targetDate,
          total_karyawan: totalKaryawan,
          sudah_absen: absensiList.length,
          belum_absen: belumAbsen,
          stats: stats,
        },
      });
    } catch (error) {
      console.error("Error getAbsensiStats:", error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }

  /**
   * HRD membuat absensi manual untuk karyawan
   */
  static async createAbsensiManual(req, res) {
    try {
      const hrd_id = req.user.id; // ID HRD yang login
      const {
        karyawan_id,
        tanggal,
        jam_masuk,
        jam_keluar,
        status,
        keterangan,
      } = req.body;

      // Validasi input
      if (!karyawan_id || !tanggal || !status) {
        return res.status(400).json({
          msg: "Karyawan, tanggal, dan status wajib diisi",
        });
      }

      // Cek apakah karyawan ada
      const karyawan = await KaryawanModel.findByPk(karyawan_id);
      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      // Cek apakah sudah ada absensi untuk tanggal tersebut
      const existingAbsensi = await AbsensiKaryawanModel.findOne({
        where: {
          karyawan_id: karyawan_id,
          tanggal: tanggal,
        },
      });

      if (existingAbsensi) {
        return res.status(400).json({
          msg: "Karyawan sudah memiliki data absensi pada tanggal tersebut. Gunakan fitur update untuk mengubah data.",
        });
      }

      // Buat absensi manual
      const absensi = await AbsensiKaryawanModel.create({
        karyawan_id,
        tanggal,
        jam_masuk: jam_masuk || null,
        jam_keluar: jam_keluar || null,
        status,
        keterangan: keterangan || `Diabsen manual oleh HRD`,
        is_manual: true,
        diabsen_oleh: hrd_id,
        validasi_lokasi_masuk: true,
        validasi_lokasi_keluar: true,
      });

      return res.status(201).json({
        msg: "Berhasil membuat absensi manual",
        data: absensi,
      });
    } catch (error) {
      console.error("Error createAbsensiManual:", error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }

  /**
   * HRD mengupdate data absensi
   */
  static async updateAbsensi(req, res) {
    try {
      const hrd_id = req.user.id;
      const { id } = req.params;
      const { jam_masuk, jam_keluar, status, keterangan } = req.body;

      // Cari absensi
      const absensi = await AbsensiKaryawanModel.findByPk(id);
      if (!absensi) {
        return res.status(404).json({
          msg: "Data absensi tidak ditemukan",
        });
      }

      // Update data
      const updateData = {};
      if (jam_masuk !== undefined) updateData.jam_masuk = jam_masuk;
      if (jam_keluar !== undefined) updateData.jam_keluar = jam_keluar;
      if (status !== undefined) updateData.status = status;
      if (keterangan !== undefined) updateData.keterangan = keterangan;

      // Tandai bahwa data diubah oleh HRD
      updateData.diabsen_oleh = hrd_id;
      updateData.is_manual = true;

      await absensi.update(updateData);

      return res.status(200).json({
        msg: "Berhasil memperbarui data absensi",
        data: absensi,
      });
    } catch (error) {
      console.error("Error updateAbsensi:", error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }

  /**
   * Get absensi bulanan untuk karyawan tertentu
   */
  static async getAbsensiBulananKaryawan(req, res) {
    try {
      const { id } = req.params; // karyawan_id
      const { bulan, tahun } = req.query;

      const bulanTarget = bulan ? parseInt(bulan) : new Date().getMonth() + 1;
      const tahunTarget = tahun ? parseInt(tahun) : new Date().getFullYear();

      // Validasi bulan
      if (bulanTarget < 1 || bulanTarget > 12) {
        return res.status(400).json({
          msg: "Bulan harus antara 1-12",
        });
      }

      // Cari karyawan
      const karyawan = await KaryawanModel.findByPk(id, {
        include: [
          {
            model: UsersModel,
            as: "user",
            attributes: ["id", "email"],
          },
        ],
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      // Hitung tanggal awal dan akhir bulan
      const startOfMonth = new Date(tahunTarget, bulanTarget - 1, 1);
      const endOfMonth = new Date(tahunTarget, bulanTarget, 0);
      const startDate = startOfMonth.toISOString().split("T")[0];
      const endDate = endOfMonth.toISOString().split("T")[0];

      // Ambil data absensi
      const absensiList = await AbsensiKaryawanModel.findAll({
        where: {
          karyawan_id: id,
          tanggal: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [["tanggal", "ASC"]],
      });

      // Hitung statistik
      const stats = {
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

      // Format data
      const data = absensiList.map((item) => ({
        id: item.id,
        tanggal: item.tanggal,
        hari: moment(item.tanggal).format("dddd"),
        jam_masuk: item.jam_masuk ? item.jam_masuk.slice(0, 5) : null,
        jam_keluar: item.jam_keluar ? item.jam_keluar.slice(0, 5) : null,
        status: item.status,
        keterangan: item.keterangan,
        menit_terlambat: item.menit_terlambat || 0,
        is_manual: item.is_manual,
      }));

      return res.status(200).json({
        msg: "Berhasil mendapatkan data absensi bulanan",
        data: {
          karyawan: {
            id: karyawan.id,
            nama_lengkap: karyawan.nama_lengkap,
            jabatan: karyawan.jabatan,
            departement: karyawan.departement,
            email: karyawan.user?.email,
          },
          bulan: bulanTarget,
          tahun: tahunTarget,
          stats: stats,
          absensi: data,
        },
      });
    } catch (error) {
      console.error("Error getAbsensiBulananKaryawan:", error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }
}
