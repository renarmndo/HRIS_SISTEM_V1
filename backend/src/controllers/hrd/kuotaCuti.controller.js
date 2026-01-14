import KuotaCutiModel from "../../models/kuotaCutiModel.js";

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

      const data = await KuotaCutiModel.findOne({
        where: {
          bulan: parseInt(bulan),
          tahun: parseInt(tahun),
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

      if (!bulan || !tahun || !total_hari_kerja || !kuota_cuti) {
        return res.status(400).json({
          msg: "Bulan, tahun, total hari kerja, dan kuota cuti wajib diisi",
        });
      }

      // Validasi bulan 1-12
      if (bulan < 1 || bulan > 12) {
        return res.status(400).json({
          msg: "Bulan harus antara 1-12",
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

      const data = await KuotaCutiModel.findByPk(id);

      if (!data) {
        return res.status(404).json({
          msg: "Kuota cuti tidak ditemukan",
        });
      }

      // Jika bulan/tahun diubah, cek duplikasi
      if ((bulan && bulan !== data.bulan) || (tahun && tahun !== data.tahun)) {
        const existing = await KuotaCutiModel.findOne({
          where: {
            bulan: parseInt(bulan || data.bulan),
            tahun: parseInt(tahun || data.tahun),
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
