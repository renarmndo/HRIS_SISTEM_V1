import KuotaCutiModel from "../../models/kuotaCutiModel.js";
import SlipGajiModel from "../../models/slipGaji.model.js";
import { isValidInt, isValidUUID } from "../../utils/validators.js";

export default class KuotaCutiController {
  // Get all kuota cuti
  static async getAll(req, res) {
    try {
      const { tahun } = req.query;

      const whereClause = {};
      if (tahun) {
        whereClause.tahun = parseInt(tahun);
      }

      const data = await KuotaCutiModel.findAll({
        where: whereClause,
        order: [
          ["tahun", "DESC"],
          ["bulan", "ASC"],
        ],
      });

      return res.status(200).json({
        msg: "Berhasil mengambil data kuota cuti",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Get kuota cuti by bulan dan tahun
  static async getByBulanTahun(req, res) {
    try {
      const { bulan, tahun } = req.params;

      if (!isValidInt(bulan, { min: 1, max: 12 }) || !isValidInt(tahun, { min: 1970, max: 2100 })) {
        return res.status(400).json({
          msg: "Bulan (1-12) atau tahun (1970-2100) tidak valid",
        });
      }

      const data = await KuotaCutiModel.findOne({
        where: {
          bulan: parseInt(bulan, 10),
          tahun: parseInt(tahun, 10),
        },
      });

      if (!data) {
        return res.status(404).json({
          msg: "Kuota cuti untuk bulan dan tahun tersebut tidak ditemukan",
        });
      }

      return res.status(200).json({
        msg: "Berhasil mengambil data kuota cuti",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Create kuota cuti
  static async create(req, res) {
    try {
      const { bulan, tahun, total_hari_kerja, kuota_cuti, keterangan } =
        req.body;

      if (bulan === undefined || tahun === undefined || total_hari_kerja === undefined || kuota_cuti === undefined) {
        return res.status(400).json({
          msg: "Bulan, tahun, total hari kerja, dan kuota cuti wajib diisi",
        });
      }

      if (!isValidInt(bulan, { min: 1, max: 12 })) {
        return res.status(400).json({
          msg: "Bulan harus berupa angka bulat antara 1-12",
        });
      }

      const currentYear = new Date().getFullYear();
      if (!isValidInt(tahun, { min: currentYear - 1, max: currentYear + 5 })) {
        return res.status(400).json({
          msg: `Tahun tidak valid (hanya diperbolehkan antara ${currentYear - 1} hingga ${currentYear + 5})`,
        });
      }

      if (!isValidInt(total_hari_kerja, { min: 1, max: 31 })) {
        return res.status(400).json({
          msg: "Total hari kerja harus berupa angka bulat antara 1-31",
        });
      }

      if (!isValidInt(kuota_cuti, { min: 0, max: 31 })) {
        return res.status(400).json({
          msg: "Kuota cuti harus berupa angka bulat positif maksimal 31",
        });
      }

      // Validasi bulan 1-12
      if (bulan < 1 || bulan > 12) {
        return res.status(400).json({
          msg: "Bulan harus antara 1-12",
        });
      }

      // Cek apakah slip gaji pada periode bulan & tahun tersebut sudah ada yang berstatus final
      const slipFinal = await SlipGajiModel.findOne({
        where: {
          bulan: parseInt(bulan),
          tahun: parseInt(tahun),
          status: "final",
        },
      });

      if (slipFinal) {
        return res.status(400).json({
          msg: `Tidak dapat menambahkan kuota cuti karena slip gaji periode bulan ${bulan} tahun ${tahun} sudah berstatus final`,
        });
      }

      // Cek apakah sudah ada kuota untuk bulan dan tahun tersebut
      const existing = await KuotaCutiModel.findOne({
        where: {
          bulan: parseInt(bulan),
          tahun: parseInt(tahun),
        },
      });

      if (existing) {
        return res.status(400).json({
          msg: "Kuota cuti untuk bulan dan tahun tersebut sudah ada",
        });
      }

      const data = await KuotaCutiModel.create({
        bulan: parseInt(bulan),
        tahun: parseInt(tahun),
        total_hari_kerja: parseInt(total_hari_kerja),
        kuota_cuti: parseInt(kuota_cuti),
        keterangan: keterangan || null,
      });

      return res.status(201).json({
        msg: "Berhasil menambahkan kuota cuti",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Update kuota cuti
  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        bulan,
        tahun,
        total_hari_kerja,
        kuota_cuti,
        keterangan,
        is_active,
      } = req.body;

      if (!isValidUUID(id)) {
        return res.status(400).json({
          msg: "ID kuota cuti tidak valid",
        });
      }

      if (bulan !== undefined) {
        if (!isValidInt(bulan, { min: 1, max: 12 })) {
          return res.status(400).json({
            msg: "Bulan harus berupa angka bulat antara 1-12",
          });
        }
      }

      if (tahun !== undefined) {
        if (!isValidInt(tahun, { min: 1970, max: 2100 })) {
          return res.status(400).json({
            msg: "Tahun harus berupa angka bulat antara 1970-2100",
          });
        }
      }

      if (total_hari_kerja !== undefined) {
        if (!isValidInt(total_hari_kerja, { min: 1, max: 31 })) {
          return res.status(400).json({
            msg: "Total hari kerja harus berupa angka bulat antara 1-31",
          });
        }
      }

      if (kuota_cuti !== undefined) {
        if (!isValidInt(kuota_cuti, { min: 0, max: 31 })) {
          return res.status(400).json({
            msg: "Kuota cuti harus berupa angka bulat positif maksimal 31",
          });
        }
      }

      const data = await KuotaCutiModel.findByPk(id);

      if (!data) {
        return res.status(404).json({
          msg: "Kuota cuti tidak ditemukan",
        });
      }

      const targetBulan = bulan ? parseInt(bulan) : data.bulan;
      const targetTahun = tahun ? parseInt(tahun) : data.tahun;

      const slipFinal = await SlipGajiModel.findOne({
        where: {
          bulan: targetBulan,
          tahun: targetTahun,
          status: "final",
        },
      });

      if (slipFinal) {
        return res.status(400).json({
          msg: `Tidak dapat memperbarui kuota cuti karena slip gaji periode bulan ${targetBulan} tahun ${targetTahun} sudah berstatus final`,
        });
      }

      // Jika bulan/tahun diubah, cek duplikasi
      if ((bulan && bulan !== data.bulan) || (tahun && tahun !== data.tahun)) {
        const existing = await KuotaCutiModel.findOne({
          where: {
            bulan: targetBulan,
            tahun: targetTahun,
          },
        });

        if (existing && existing.id !== id) {
          return res.status(400).json({
            msg: "Kuota cuti untuk bulan dan tahun tersebut sudah ada",
          });
        }
      }

      await data.update({
        bulan: bulan ? parseInt(bulan) : data.bulan,
        tahun: tahun ? parseInt(tahun) : data.tahun,
        total_hari_kerja: total_hari_kerja
          ? parseInt(total_hari_kerja)
          : data.total_hari_kerja,
        kuota_cuti: kuota_cuti ? parseInt(kuota_cuti) : data.kuota_cuti,
        keterangan: keterangan !== undefined ? keterangan : data.keterangan,
        is_active: is_active !== undefined ? is_active : data.is_active,
      });

      return res.status(200).json({
        msg: "Berhasil memperbarui kuota cuti",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Delete kuota cuti
  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        return res.status(400).json({
          msg: "ID kuota cuti tidak valid",
        });
      }

      const data = await KuotaCutiModel.findByPk(id);

      if (!data) {
        return res.status(404).json({
          msg: "Kuota cuti tidak ditemukan",
        });
      }

      await data.destroy();

      return res.status(200).json({
        msg: "Berhasil menghapus kuota cuti",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }
}
