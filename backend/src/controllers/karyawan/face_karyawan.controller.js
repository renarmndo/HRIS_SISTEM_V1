import KaryawanFaceModel from "../../models/face_karyawanModel.js";
import KaryawanModel from "../../models/karyawan.model.js";

export default class FaceKaryawanController {
  static async registerFace(req, res) {
    try {
      const user_id = req.user.id;
      const { face_embedding } = req.body || {};

      if (!face_embedding) {
        return res.status(400).json({
          msg: "Scan Wajah tidak boleh kosong",
        });
      }

      const karyawan = await KaryawanModel.findOne({
        where: {
          user_id,
        },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data Karyawan tidak ditemukan",
        });
      }

      const karyawan_id = karyawan.id;

      //   chek apakah image sudah pernah di register
      const existingFace = await KaryawanFaceModel.findOne({
        where: {
          karyawan_id,
        },
      });

      if (existingFace) {
        return res.status(400).json({
          msg: "Data wajah sudah terdaftar",
        });
      }

      //   create face
      const faceKaryawan = await KaryawanFaceModel.create({
        karyawan_id,
        face_embedding: face_embedding,
        training_count: 1,
      });

      return res.status(201).json({
        msg: "Berhasil mendapatkan wajah",
        data: faceKaryawan,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  //   update
  static async updateFace(req, res) {
    try {
      const user_id = req.user.id;

      const { face_embedding, face_image_url } = req.body;

      const karyawan = await KaryawanModel.findOne({
        where: {
          user_id,
        },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Karyawan tidak ditemukan",
        });
      }

      const karyawan_id = karyawan.id;

      const face = await KaryawanFaceModel.findOne({
        where: {
          karyawan_id,
        },
      });

      if (!face) {
        return res.status(404).json({
          msg: "Data Wajah belum terdaftar",
        });
      }

      await face.update({
        face_embedding: face_embedding,
        face_image_url: face_image_url,
        training_count: face.training_count + 1,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi Kesalahan pada server",
      });
    }
  }

  static async getFaceData(req, res) {
    try {
      const user_id = req.user.id;

      const karyawan = await KaryawanModel.findOne({
        where: {
          user_id: user_id,
        },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      const face = await KaryawanFaceModel.findOne({
        where: {
          karyawan_id: karyawan.id,
        },
      });

      if (!face) {
        return res.status(404).json({
          msg: "Data wajah tidak tersedia",
        });
      }

      return res.status(200).json({
        msg: "Berhasil Mendapatkan data wajah",
        data: face,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }
}
