import KomponenGajiModel from "../../models/komponenGaji.model.js";
import KomponenGajiKaryawanModel from "../../models/komponenGajiKaryawan.model.js";
import KaryawanModel from "../../models/karyawan.model.js";
import { Op } from "sequelize";
import { isValidFloat, isValidUUID, isNonEmptyString } from "../../utils/validators.js";

// Helper: filter karyawan_ids yang benar-benar ada di m_karyawan
async function filterValidKaryawanIds(karyawan_ids) {
  if (!Array.isArray(karyawan_ids) || karyawan_ids.length === 0) return [];
  const valid = await KaryawanModel.findAll({
    where: { id: { [Op.in]: karyawan_ids } },
    attributes: ["id"],
  });
  return valid.map((k) => k.id);
}

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
        include: [
          {
            model: KomponenGajiKaryawanModel,
            as: "karyawan_assignments",
            include: [
              {
                model: KaryawanModel,
                as: "karyawan",
                attributes: ["id", "nama_lengkap", "jabatan"],
              },
            ],
          },
        ],
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

      if (!isValidUUID(id)) {
        return res.status(400).json({
          msg: "ID komponen gaji tidak valid",
        });
      }

      const data = await KomponenGajiModel.findByPk(id, {
        include: [
          {
            model: KomponenGajiKaryawanModel,
            as: "karyawan_assignments",
            include: [
              {
                model: KaryawanModel,
                as: "karyawan",
                attributes: ["id", "nama_lengkap", "jabatan"],
              },
            ],
          },
        ],
      });

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
      const { nama, tipe, metode, nilai_default, keterangan, karyawan_ids } = req.body;

      if (!isNonEmptyString(nama, { minLen: 1, maxLen: 100 })) {
        return res.status(400).json({
          msg: "Nama komponen wajib diisi dan maksimal 100 karakter",
        });
      }

      if (!["bonus", "potongan"].includes(tipe)) {
        return res.status(400).json({
          msg: "Tipe harus 'bonus' atau 'potongan'",
        });
      }

      if (metode !== undefined && metode !== null && metode !== "") {
        if (!["nominal", "persentase", "per_hari", "per_jam", "per_keterlambatan"].includes(metode)) {
          return res.status(400).json({
            msg: "Metode harus 'nominal', 'persentase', 'per_hari', 'per_jam', atau 'per_keterlambatan'",
          });
        }
      }

      if (nilai_default !== undefined && nilai_default !== null && nilai_default !== "") {
        if (!isValidFloat(nilai_default, { min: 0 })) {
          return res.status(400).json({
            msg: "Nilai default harus berupa angka positif",
          });
        }
      }

      const data = await KomponenGajiModel.create({
        nama,
        tipe,
        metode: metode || "nominal",
        nilai_default: nilai_default || 0,
        keterangan,
        is_active: true,
      });

      // Simpan asignasi karyawan jika ada
      if (Array.isArray(karyawan_ids) && karyawan_ids.length > 0) {
        const validIds = await filterValidKaryawanIds(karyawan_ids);
        if (validIds.length > 0) {
          const assignments = validIds.map((kid) => ({
            komponen_gaji_id: data.id,
            karyawan_id: kid,
          }));
          await KomponenGajiKaryawanModel.bulkCreate(assignments);
        }
      }

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
      const { nama, tipe, metode, nilai_default, keterangan, is_active, karyawan_ids } =
        req.body;

      if (!isValidUUID(id)) {
        return res.status(400).json({
          msg: "ID komponen gaji tidak valid",
        });
      }

      if (nama !== undefined) {
        if (!isNonEmptyString(nama, { minLen: 1, maxLen: 100 })) {
          return res.status(400).json({
            msg: "Nama komponen tidak boleh kosong dan maksimal 100 karakter",
          });
        }
      }

      if (tipe !== undefined) {
        if (!["bonus", "potongan"].includes(tipe)) {
          return res.status(400).json({
            msg: "Tipe harus 'bonus' atau 'potongan'",
          });
        }
      }

      if (metode !== undefined) {
        if (!["nominal", "persentase", "per_hari", "per_jam", "per_keterlambatan"].includes(metode)) {
          return res.status(400).json({
            msg: "Metode harus 'nominal', 'persentase', 'per_hari', 'per_jam', atau 'per_keterlambatan'",
          });
        }
      }

      if (nilai_default !== undefined && nilai_default !== null) {
        if (!isValidFloat(nilai_default, { min: 0 })) {
          return res.status(400).json({
            msg: "Nilai default harus berupa angka positif",
          });
        }
      }

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

      // Update asignasi karyawan jika dikirim
      if (Array.isArray(karyawan_ids)) {
        await KomponenGajiKaryawanModel.destroy({
          where: { komponen_gaji_id: id },
        });
        if (karyawan_ids.length > 0) {
          const validIds = await filterValidKaryawanIds(karyawan_ids);
          if (validIds.length > 0) {
            const assignments = validIds.map((kid) => ({
              komponen_gaji_id: id,
              karyawan_id: kid,
            }));
            await KomponenGajiKaryawanModel.bulkCreate(assignments);
          }
        }
      }

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

      if (!isValidUUID(id)) {
        return res.status(400).json({
          msg: "ID komponen gaji tidak valid",
        });
      }

      const komponen = await KomponenGajiModel.findByPk(id);

      if (!komponen) {
        return res.status(404).json({
          msg: "Komponen gaji tidak ditemukan",
        });
      }

      await KomponenGajiKaryawanModel.destroy({
        where: { komponen_gaji_id: id },
      });
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
