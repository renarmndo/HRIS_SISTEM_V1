import {
  KaryawanModel,
  UsersModel,
  PengajuanCutiModel,
} from "../../models/index.model.js";
import AbsensiKaryawanModel from "../../models/absensiModel.js";
import { Op } from "sequelize";
import moment from "moment";

export default class HrdDashboardController {
  /**
   * Get semua statistik untuk dashboard HRD
   */
  static async getDashboardStats(req, res) {
    try {
      const today = moment().format("YYYY-MM-DD");

      // 1. Total Karyawan Aktif
      const totalKaryawan = await KaryawanModel.count({
        where: { is_active: true },
      });

      // 2. Pengajuan Cuti Pending
      const pengajuanCutiPending = await PengajuanCutiModel.count({
        where: { status: "pending" },
      });

      // 3. Absensi Hari Ini
      const absensiHariIni = await AbsensiKaryawanModel.findAll({
        where: { tanggal: today },
      });

      // Hitung statistik absensi
      let hadirCount = 0;
      let terlambatCount = 0;
      let izinCount = 0;
      let sakitCount = 0;
      let cutiCount = 0;

      absensiHariIni.forEach((absen) => {
        switch (absen.status) {
          case "masuk":
            hadirCount++;
            break;
          case "terlambat":
            terlambatCount++;
            break;
          case "izin":
            izinCount++;
            break;
          case "sakit":
            sakitCount++;
            break;
          case "cuti":
            cutiCount++;
            break;
        }
      });

      // Total hadir = masuk + terlambat
      const totalHadir = hadirCount + terlambatCount;

      // Persentase kehadiran
      const persenKehadiran =
        totalKaryawan > 0 ? Math.round((totalHadir / totalKaryawan) * 100) : 0;

      return res.status(200).json({
        msg: "Berhasil mendapatkan statistik dashboard",
        data: {
          totalKaryawan,
          pengajuanCutiPending,
          pengajuanIzinPending: izinCount, // Izin dari absensi hari ini
          absensiHariIni: {
            hadir: hadirCount,
            terlambat: terlambatCount,
            izin: izinCount,
            sakit: sakitCount,
            cuti: cutiCount,
            totalHadir,
            persenKehadiran,
          },
        },
      });
    } catch (error) {
      console.error("Error getDashboardStats:", error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }

  /**
   * Get pengajuan cuti terbaru untuk dashboard
   */
  static async getPengajuanCutiTerbaru(req, res) {
    try {
      const pengajuanList = await PengajuanCutiModel.findAll({
        include: [
          {
            model: KaryawanModel,
            as: "karyawan",
            attributes: ["id", "nama_lengkap", "jabatan", "departement"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });

      const data = pengajuanList.map((item) => ({
        id: item.id,
        karyawan: {
          id: item.karyawan?.id,
          nama: item.karyawan?.nama_lengkap,
          jabatan: item.karyawan?.jabatan,
          departement: item.karyawan?.departement,
        },
        jenis_cuti: item.jenis_cuti,
        tanggal_mulai: item.tanggal_mulai,
        tanggal_selesai: item.tanggal_selesai,
        jumlah_hari: item.jumlah_hari,
        alasan: item.alasan,
        status: item.status,
        createdAt: item.createdAt,
      }));

      return res.status(200).json({
        msg: "Berhasil mendapatkan pengajuan cuti terbaru",
        data,
      });
    } catch (error) {
      console.error("Error getPengajuanCutiTerbaru:", error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }

  /**
   * Quick approve/reject pengajuan cuti dari dashboard
   */
  static async quickUpdatePengajuanStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, catatan_approval } = req.body;
      const hrd_id = req.user.id;

      if (!["disetujui", "ditolak"].includes(status)) {
        return res.status(400).json({
          msg: "Status harus 'disetujui' atau 'ditolak'",
        });
      }

      const pengajuan = await PengajuanCutiModel.findByPk(id);
      if (!pengajuan) {
        return res.status(404).json({
          msg: "Pengajuan cuti tidak ditemukan",
        });
      }

      if (pengajuan.status !== "pending") {
        return res.status(400).json({
          msg: "Pengajuan ini sudah diproses sebelumnya",
        });
      }

      await pengajuan.update({
        status,
        catatan_approval: catatan_approval || null,
        approved_by: hrd_id,
        approved_at: new Date(),
      });

      return res.status(200).json({
        msg: `Pengajuan cuti berhasil ${
          status === "disetujui" ? "disetujui" : "ditolak"
        }`,
        data: pengajuan,
      });
    } catch (error) {
      console.error("Error quickUpdatePengajuanStatus:", error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }
}
