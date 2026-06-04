import {
  KaryawanModel,
  UsersModel,
  PengajuanCutiModel,
} from "../../models/index.model.js";
import AbsensiKaryawanModel from "../../models/absensiModel.js";
import sequelize from "../../config/sequelize.js";
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
    // FIX (Task 3.13): Sama seperti updateStatus di pengajuanCuti.controller,
    // jika disetujui, otomatis create record absensi untuk setiap hari cuti
    // (skip jika sudah ada record "masuk"/"terlambat").
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { status, catatan_approval } = req.body;
      const hrd_id = req.user.id;

      if (!["disetujui", "ditolak"].includes(status)) {
        await transaction.rollback();
        return res.status(400).json({
          msg: "Status harus 'disetujui' atau 'ditolak'",
        });
      }

      const pengajuan = await PengajuanCutiModel.findByPk(id, { transaction });
      if (!pengajuan) {
        await transaction.rollback();
        return res.status(404).json({
          msg: "Pengajuan cuti tidak ditemukan",
        });
      }

      if (pengajuan.status !== "pending") {
        await transaction.rollback();
        return res.status(400).json({
          msg: "Pengajuan ini sudah diproses sebelumnya",
        });
      }

      await pengajuan.update(
        {
          status,
          catatan_approval: catatan_approval || null,
          approved_by: hrd_id,
          approved_at: new Date(),
        },
        { transaction },
      );

      if (status === "disetujui") {
        const startDate = new Date(pengajuan.tanggal_mulai);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(pengajuan.tanggal_selesai);
        endDate.setHours(0, 0, 0, 0);
        const cutiRecords = [];
        const skippedRecords = [];

        for (
          let date = new Date(startDate);
          date <= endDate;
          date.setDate(date.getDate() + 1)
        ) {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const d = String(date.getDate()).padStart(2, "0");
          const tanggal = `${y}-${m}-${d}`;

          const existingAbsensi = await AbsensiKaryawanModel.findOne({
            where: {
              karyawan_id: pengajuan.karyawan_id,
              tanggal,
            },
            transaction,
          });

          if (!existingAbsensi) {
            cutiRecords.push({
              karyawan_id: pengajuan.karyawan_id,
              tanggal,
              status: "cuti",
              keterangan: `Cuti ${pengajuan.jenis_cuti}: ${pengajuan.alasan}`,
            });
          } else if (
            existingAbsensi.status === "masuk" ||
            existingAbsensi.status === "terlambat"
          ) {
            // Skip - karyawan sudah hadir pada tanggal ini.
            skippedRecords.push({
              tanggal,
              existing_status: existingAbsensi.status,
            });
          } else {
            await existingAbsensi.update(
              {
                status: "cuti",
                keterangan: `Cuti ${pengajuan.jenis_cuti}: ${pengajuan.alasan}`,
              },
              { transaction },
            );
          }
        }

        if (cutiRecords.length > 0) {
          await AbsensiKaryawanModel.bulkCreate(cutiRecords, { transaction });
        }
      }

      await transaction.commit();

      return res.status(200).json({
        msg: `Pengajuan cuti berhasil ${
          status === "disetujui" ? "disetujui" : "ditolak"
        }`,
        data: pengajuan,
      });
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (rbErr) {
        console.error("Rollback gagal:", rbErr.message);
      }
      console.error("Error quickUpdatePengajuanStatus:", error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }

  /**
   * Get analytics data untuk dashboard HRD (chart data)
   */
  static async getHrdAnalytics(req, res) {
    try {
      // FIX (Task 3.20): gunakan single bulk query untuk 7 hari sekaligus,
      // bukan 7x findAll dalam loop. Juga pakai GROUP BY di SQL untuk
      // department breakdown sehingga tidak load semua row.
      const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
      const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");

      // 1. Department Breakdown (GROUP BY di SQL)
      const deptRows = await KaryawanModel.findAll({
        where: { is_active: true },
        attributes: [
          "departement",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: ["departement"],
        raw: true,
      });

      const departmentData = deptRows.map((row) => ({
        name: row.departement || "Tidak Ada Departemen",
        value: parseInt(row.count, 10) || 0,
      }));

      // 2. Weekly Trend (7 hari terakhir) - FIX (Task 3.20):
      //    sebelumnya query 7x (N+1), sekarang 1x.
      const last7Dates = [];
      for (let i = 6; i >= 0; i--) {
        last7Dates.push(moment().subtract(i, "days").format("YYYY-MM-DD"));
      }

      const last7Absensi = await AbsensiKaryawanModel.findAll({
        where: {
          tanggal: { [Op.in]: last7Dates },
        },
        attributes: ["tanggal", "status"],
        raw: true,
      });

      const last7Map = new Map();
      for (const d of last7Dates) {
        last7Map.set(d, { hadir: 0, terlambat: 0, tidak_hadir: 0 });
      }
      last7Absensi.forEach((a) => {
        const bucket = last7Map.get(a.tanggal);
        if (!bucket) return;
        if (a.status === "masuk") bucket.hadir++;
        else if (a.status === "terlambat") bucket.terlambat++;
        else bucket.tidak_hadir++;
      });

      const last7Days = last7Dates.map((d) => ({
        date: moment(d).format("DD MMM"),
        ...last7Map.get(d),
      }));

      // 3. Attendance Distribution (bulan ini) - pakai GROUP BY
      const distRows = await AbsensiKaryawanModel.findAll({
        where: {
          tanggal: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
        attributes: [
          "status",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: ["status"],
        raw: true,
      });

      const distMap = {};
      distRows.forEach((r) => {
        distMap[r.status] = parseInt(r.count, 10) || 0;
      });

      const attendanceDistribution = [
        { name: "Hadir", value: distMap.masuk || 0, color: "#10b981" },
        { name: "Terlambat", value: distMap.terlambat || 0, color: "#f59e0b" },
        { name: "Izin", value: distMap.izin || 0, color: "#8b5cf6" },
        { name: "Sakit", value: distMap.sakit || 0, color: "#ef4444" },
        { name: "Cuti", value: distMap.cuti || 0, color: "#3b82f6" },
        { name: "Alpha", value: distMap.alpha || 0, color: "#6b7280" },
      ].filter((item) => item.value > 0);

      return res.status(200).json({
        msg: "Berhasil mendapatkan data analytics HRD",
        data: {
          departmentBreakdown: departmentData,
          weeklyTrend: last7Days,
          attendanceDistribution,
        },
      });
    } catch (error) {
      console.error("Error getHrdAnalytics:", error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }
}
