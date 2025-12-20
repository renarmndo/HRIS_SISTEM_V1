import LokasiKantorModel from "../../models/lokasiKantor.model.js";

export default class LokasiPerusahaanController {
  static async create(req, res) {
    try {
      const {
        nama_perusahaan,
        latitude,
        longitude,
        radius_absen_meter,
        jam_masuk,
        jam_keluar,
      } = req.body;

      if (!nama_perusahaan || !latitude || !longitude) {
        return res.status(400).json({
          msg: "Data tidak boleh kosong",
        });
      }

      const lokasiPerusahaan = await LokasiKantorModel.create({
        nama_perusahaan: nama_perusahaan,
        latitude: latitude,
        longitude: longitude,
        radius_absen_meter: radius_absen_meter,
        jam_masuk: jam_masuk,
        jam_keluar: jam_keluar,
      });

      return res.status(201).json({
        msg: "Berhasil Menambahkan Data",
        data: lokasiPerusahaan,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  //   update
  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        nama_perusahaan,
        latitude,
        longitude,
        radius_absen_meter,
        jam_masuk,
        jam_keluar,
      } = req.body;

      if (!nama_perusahaan || !latitude || !longitude) {
        return res.status(400).json({
          msg: "Data tidak boleh kosong",
        });
      }

      //   chek apakah id
      const lokasiPerusahaan = await LokasiKantorModel.findByPk(id);

      if (!lokasiPerusahaan) {
        return res.status(404).json({
          msg: "Data tidak ditemukan",
        });
      }

      await lokasiPerusahaan.update({
        nama_perusahaan: nama_perusahaan,
        latitude: latitude,
        longitude: longitude,
        radius_absen_meter: radius_absen_meter,
        jam_masuk: jam_masuk,
        jam_keluar: jam_keluar,
      });

      return res.status(200).json({
        msg: "Berhasil memperbarui data",
        data: lokasiPerusahaan,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi Kesalahan Pada Server",
      });
    }
  }

  //   get data perusahaan
  static async getData(req, res) {
    try {
      const dataPerusahaan = await LokasiKantorModel.findOne({
        order: [["createdAt", "desc"]],
      });

      return res.status(200).json({
        msg: "Berhasil mendapatkan data",
        data: dataPerusahaan,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi Kesalahan pada server",
      });
    }
  }
}
