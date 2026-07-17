import LemburModel from "../../models/lembur.model.js";
import KaryawanModel from "../../models/karyawan.model.js";
import UserModel from "../../models/users.model.js";
import moment from "moment";
import { Op } from "sequelize";

export default class HrdLemburController {
  // HRD: Get all overtime requests
  static async getAllLembur(req, res) {
    try {
      const { status, karyawan_id, start_date, end_date } = req.query;

      const whereClause = {};

      if (status) {
        whereClause.status = status;
      }

      if (karyawan_id) {
        whereClause.karyawan_id = karyawan_id;
      }

      if (start_date && end_date) {
        whereClause.tanggal = {
          [Op.between]: [start_date, end_date],
        };
      }

      const lemburList = await LemburModel.findAll({
        where: whereClause,
        include: [
          {
            model: KaryawanModel,
            as: "karyawan",
            attributes: ["id", "nama_lengkap", "jabatan", "department"],
          },
          {
            model: UserModel,
            as: "approver",
            attributes: ["id", "username", "email"],
          },
        ],
        order: [
          ["status", "ASC"], // pending first
          ["tanggal", "DESC"],
        ],
      });

      return res.status(200).json({
        msg: "Berhasil mengambil data lembur",
        data: lemburList,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // HRD: Get overtime statistics
  static async getLemburStats(req, res) {
    try {
      const { bulan, tahun } = req.query;

      let whereClause = {};

      if (bulan && tahun) {
        const startOfMonth = moment(`${tahun}-${bulan}-01`).format(
          "YYYY-MM-DD",
        );
        const endOfMonth = moment(startOfMonth)
          .endOf("month")
          .format("YYYY-MM-DD");
        whereClause.tanggal = {
          [Op.between]: [startOfMonth, endOfMonth],
        };
      }

      const allLembur = await LemburModel.findAll({
        where: whereClause,
      });

      const stats = {
        total_pending: allLembur.filter((l) => l.status === "pending").length,
        total_approved: allLembur.filter((l) => l.status === "approved").length,
        total_rejected: allLembur.filter((l) => l.status === "rejected").length,
        total_jam_approved: allLembur
          .filter((l) => l.status === "approved")
          .reduce((sum, l) => sum + parseFloat(l.total_jam), 0)
          .toFixed(2),
        total_jam_pending: allLembur
          .filter((l) => l.status === "pending")
          .reduce((sum, l) => sum + parseFloat(l.total_jam), 0)
          .toFixed(2),
      };

      return res.status(200).json({
        msg: "Berhasil mengambil statistik lembur",
        data: stats,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // HRD: Approve overtime
  static async approveLembur(req, res) {
    try {
      const { id } = req.params;
      const hrd_id = req.user.id;

      const lembur = await LemburModel.findByPk(id, {
        include: [
          {
            model: KaryawanModel,
            as: "karyawan",
            attributes: ["nama_lengkap"],
          },
        ],
      });

      if (!lembur) {
        return res.status(404).json({
          msg: "Data lembur tidak ditemukan",
        });
      }

      if (lembur.status !== "pending") {
        return res.status(400).json({
          msg: "Hanya lembur dengan status pending yang dapat disetujui",
        });
      }

      await lembur.update({
        status: "approved",
        approved_by: hrd_id,
        approved_at: new Date(),
        rejection_reason: null,
      });

      return res.status(200).json({
        msg: `Lembur ${lembur.karyawan?.nama_lengkap || ""} berhasil disetujui`,
        data: lembur,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // HRD: Reject overtime
  static async rejectLembur(req, res) {
    try {
      const { id } = req.params;
      const { rejection_reason } = req.body;
      const hrd_id = req.user.id;

      if (!rejection_reason) {
        return res.status(400).json({
          msg: "Alasan penolakan wajib diisi",
        });
      }

      const lembur = await LemburModel.findByPk(id, {
        include: [
          {
            model: KaryawanModel,
            as: "karyawan",
            attributes: ["nama_lengkap"],
          },
        ],
      });

      if (!lembur) {
        return res.status(404).json({
          msg: "Data lembur tidak ditemukan",
        });
      }

      if (lembur.status !== "pending") {
        return res.status(400).json({
          msg: "Hanya lembur dengan status pending yang dapat ditolak",
        });
      }

      await lembur.update({
        status: "rejected",
        approved_by: hrd_id,
        approved_at: new Date(),
        rejection_reason,
      });

      return res.status(200).json({
        msg: `Lembur ${lembur.karyawan?.nama_lengkap || ""} berhasil ditolak`,
        data: lembur,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }
}
