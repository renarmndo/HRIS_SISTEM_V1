import KomponenGajiModel from "../../models/komponenGaji.model.js";

export default class KomponenGajiController {
  // Get semua komponen gaji
  static async getAll(req, res) {
    try {
      const { tipe, is_active } = req.query;
      const whereClause = {};

      if (tipe) whereClause.tipe = tipe;
      if (is_active !== undefined) whereClause.is_active = is_active === "true";

      const data = await KomponenGajiModel.findAll({
        where: whereClause,
        order: [
          ["tipe", "ASC"],
          ["nama", "ASC"],
        ],
      });

      return res.status(200).json({
        msg: "Berhasil mengambil data komponen gaji",
        data: data,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Get komponen by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await KomponenGajiModel.findByPk(id);

      if (!data) {
        return res.status(404).json({
          msg: "Komponen gaji tidak ditemukan",
        });
      }

      return res.status(200).json({
        msg: "Berhasil mengambil data komponen gaji",
        data: data,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Create komponen gaji
  static async create(req, res) {
    try {
      const { nama, tipe, metode, nilai_default, keterangan } = req.body;

      if (!nama || !tipe) {
        return res.status(400).json({
          msg: "Nama dan tipe komponen wajib diisi",
        });
      }

      if (!["bonus", "potongan"].includes(tipe)) {
        return res.status(400).json({
          msg: "Tipe harus 'bonus' atau 'potongan'",
        });
      }

      const data = await KomponenGajiModel.create({
        nama,
        tipe,
        metode: metode || "nominal",
        nilai_default: nilai_default || 0,
        keterangan,
        is_active: true,
      });

      return res.status(201).json({
        msg: "Berhasil menambah komponen gaji",
        data: data,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Update komponen gaji
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nama, tipe, metode, nilai_default, keterangan, is_active } =
        req.body;

      const komponen = await KomponenGajiModel.findByPk(id);

      if (!komponen) {
        return res.status(404).json({
          msg: "Komponen gaji tidak ditemukan",
        });
      }

      await komponen.update({
        nama: nama !== undefined ? nama : komponen.nama,
        tipe: tipe !== undefined ? tipe : komponen.tipe,
        metode: metode !== undefined ? metode : komponen.metode,
        nilai_default:
          nilai_default !== undefined ? nilai_default : komponen.nilai_default,
        keterangan: keterangan !== undefined ? keterangan : komponen.keterangan,
        is_active: is_active !== undefined ? is_active : komponen.is_active,
      });

      return res.status(200).json({
        msg: "Berhasil memperbarui komponen gaji",
        data: komponen,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Delete komponen gaji
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const komponen = await KomponenGajiModel.findByPk(id);

      if (!komponen) {
        return res.status(404).json({
          msg: "Komponen gaji tidak ditemukan",
        });
      }

      await komponen.destroy();

      return res.status(200).json({
        msg: "Berhasil menghapus komponen gaji",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }
}
