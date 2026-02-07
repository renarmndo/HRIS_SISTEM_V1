import LemburModel from "../../models/lembur.model.js";
import KaryawanModel from "../../models/karyawan.model.js";
import moment from "moment";

export default class LemburController {
  // Karyawan: Create overtime request
  static async createLembur(req, res) {
    try {
      const userId = req.user.id;
      const { tanggal, jam_mulai, jam_selesai, keterangan } = req.body;

      // Validate input
      if (!tanggal || !jam_mulai || !jam_selesai) {
        return res.status(400).json({
          msg: "Tanggal, jam mulai, dan jam selesai wajib diisi",
        });
      }

      // Get karyawan data
      const karyawan = await KaryawanModel.findOne({
        where: { user_id: userId },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      // Calculate total hours
      const start = moment(jam_mulai, "HH:mm");
      const end = moment(jam_selesai, "HH:mm");

      // Handle overnight shifts
      if (end.isBefore(start)) {
        end.add(1, "day");
      }

      const duration = moment.duration(end.diff(start));
      const totalJam = duration.asHours();

      if (totalJam <= 0 || totalJam > 24) {
        return res.status(400).json({
          msg: "Total jam lembur tidak valid",
        });
      }

      // Create overtime request
      const lembur = await LemburModel.create({
        karyawan_id: karyawan.id,
        tanggal,
        jam_mulai,
        jam_selesai,
        total_jam: totalJam.toFixed(2),
        keterangan: keterangan || "",
        status: "pending",
      });

      return res.status(201).json({
        msg: "Berhasil mengajukan lembur",
        data: lembur,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }

  // Karyawan: Get own overtime history
  static async getMyLembur(req, res) {
    try {
      const userId = req.user.id;
      const { status, bulan, tahun } = req.query;

      const karyawan = await KaryawanModel.findOne({
        where: { user_id: userId },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      const whereClause = {
        karyawan_id: karyawan.id,
      };

      if (status) {
        whereClause.status = status;
      }

      // Filter by month and year
      if (bulan && tahun) {
        const startOfMonth = moment(`${tahun}-${bulan}-01`).format(
          "YYYY-MM-DD",
        );
        const endOfMonth = moment(startOfMonth)
          .endOf("month")
          .format("YYYY-MM-DD");
        whereClause.tanggal = {
          [require("sequelize").Op.between]: [startOfMonth, endOfMonth],
        };
      }

      const lemburList = await LemburModel.findAll({
        where: whereClause,
        order: [["tanggal", "DESC"]],
      });

      // Calculate statistics
      const stats = {
        total_pending: lemburList.filter((l) => l.status === "pending").length,
        total_approved: lemburList.filter((l) => l.status === "approved")
          .length,
        total_rejected: lemburList.filter((l) => l.status === "rejected")
          .length,
        total_jam_approved: lemburList
          .filter((l) => l.status === "approved")
          .reduce((sum, l) => sum + parseFloat(l.total_jam), 0)
          .toFixed(2),
      };

      return res.status(200).json({
        msg: "Berhasil mengambil data lembur",
        data: lemburList,
        stats,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Karyawan: Delete pending overtime
  static async deleteLembur(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const karyawan = await KaryawanModel.findOne({
        where: { user_id: userId },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      const lembur = await LemburModel.findOne({
        where: {
          id,
          karyawan_id: karyawan.id,
        },
      });

      if (!lembur) {
        return res.status(404).json({
          msg: "Data lembur tidak ditemukan",
        });
      }

      if (lembur.status !== "pending") {
        return res.status(400).json({
          msg: "Hanya lembur dengan status pending yang dapat dihapus",
        });
      }

      await lembur.destroy();

      return res.status(200).json({
        msg: "Berhasil menghapus pengajuan lembur",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }
}
