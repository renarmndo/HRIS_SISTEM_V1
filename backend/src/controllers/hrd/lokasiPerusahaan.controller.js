import LokasiKantorModel from "../../models/lokasiKantor.model.js";
import { isValidLatitude, isValidLongitude, isValidInt, isValidUUID } from "../../utils/validators.js";

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

      if (!nama_perusahaan || latitude === undefined || longitude === undefined || latitude === "" || longitude === "") {
        return res.status(400).json({
          msg: "Nama perusahaan, latitude, dan longitude wajib diisi",
        });
      }

      if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
        return res.status(400).json({
          msg: "Koordinat GPS tidak valid (latitude -90 s/d 90, longitude -180 s/d 180)",
        });
      }

      if (radius_absen_meter !== undefined && radius_absen_meter !== null && radius_absen_meter !== "") {
        if (!isValidInt(radius_absen_meter, { min: 1 })) {
          return res.status(400).json({
            msg: "Radius absensi harus berupa angka bulat positif minimal 1 meter",
          });
        }
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

      if (!isValidUUID(id)) {
        return res.status(400).json({
          msg: "ID lokasi tidak valid",
        });
      }

      if (!nama_perusahaan || latitude === undefined || longitude === undefined || latitude === "" || longitude === "") {
        return res.status(400).json({
          msg: "Nama perusahaan, latitude, dan longitude wajib diisi",
        });
      }

      if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
        return res.status(400).json({
          msg: "Koordinat GPS tidak valid (latitude -90 s/d 90, longitude -180 s/d 180)",
        });
      }

      if (radius_absen_meter !== undefined && radius_absen_meter !== null && radius_absen_meter !== "") {
        if (!isValidInt(radius_absen_meter, { min: 1 })) {
          return res.status(400).json({
            msg: "Radius absensi harus berupa angka bulat positif minimal 1 meter",
          });
        }
      }

      //   cek apakah id
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
