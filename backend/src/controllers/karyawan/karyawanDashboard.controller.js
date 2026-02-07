import AbsensiKaryawanModel from "../../models/absensiModel.js";
import KaryawanModel from "../../models/karyawan.model.js";
import { Op } from "sequelize";
import moment from "moment";

export default class KaryawanDashboardController {
  /**
   * Get analytics data untuk dashboard karyawan
   */
  static async getKaryawanAnalytics(req, res) {
    try {
      const user_id = req.user.id;

      // Dapatkan data karyawan
      const karyawan = await KaryawanModel.findOne({
        where: { user_id },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      const karyawan_id = karyawan.id;

      // Data bulan ini
      const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
      const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");

      // Absensi bulan ini
      const absensiMonthly = await AbsensiKaryawanModel.findAll({
        where: {
          karyawan_id,
          tanggal: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
        order: [["tanggal", "ASC"]],
      });

      // Hitung statistik
      let masuk = 0;
      let terlambat = 0;
      let izin = 0;
      let sakit = 0;
      let cuti = 0;
      let alpha = 0;

      absensiMonthly.forEach((item) => {
        switch (item.status) {
          case "masuk":
            masuk++;
            break;
          case "terlambat":
            terlambat++;
            break;
          case "izin":
            izin++;
            break;
          case "sakit":
            sakit++;
            break;
          case "cuti":
            cuti++;
            break;
          case "alpha":
            alpha++;
            break;
        }
      });

      // Data untuk chart bulanan (7 hari terakhir)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = moment().subtract(i, "days");
        const dateStr = date.format("YYYY-MM-DD");
        const dayName = date.format("ddd");

        const absensi = absensiMonthly.find((item) => item.tanggal === dateStr);

        last7Days.push({
          date: date.format("DD MMM"),
          day: dayName,
          hadir:
            absensi && ["masuk", "terlambat"].includes(absensi.status) ? 1 : 0,
          terlambat: absensi && absensi.status === "terlambat" ? 1 : 0,
          status: absensi?.status || "alpha",
        });
      }

      // Data untuk pie chart
      const attendanceBreakdown = [
        { name: "Hadir", value: masuk, color: "#10b981" },
        { name: "Terlambat", value: terlambat, color: "#f59e0b" },
        { name: "Izin", value: izin, color: "#8b5cf6" },
        { name: "Sakit", value: sakit, color: "#ef4444" },
        { name: "Cuti", value: cuti, color: "#3b82f6" },
        { name: "Alpha", value: alpha, color: "#6b7280" },
      ].filter((item) => item.value > 0);

      return res.status(200).json({
        msg: "Berhasil mendapatkan data analytics",
        data: {
          summary: {
            masuk,
            terlambat,
            izin,
            sakit,
            cuti,
            alpha,
            totalHadir: masuk + terlambat,
            totalAbsen: absensiMonthly.length,
          },
          weeklyTrend: last7Days,
          attendanceBreakdown,
        },
      });
    } catch (error) {
      console.error("Error getKaryawanAnalytics:", error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }
}
