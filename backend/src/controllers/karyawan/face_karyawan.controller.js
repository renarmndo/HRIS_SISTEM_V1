import KaryawanFaceModel from "../../models/face_karyawanModel.js";
import KaryawanModel from "../../models/karyawan.model.js";

export default class FaceKaryawanController {
  static async registerFace(req, res) {
    try {
      const user_id = req.user.id;
      const { face_embedding } = req.body || {};

      if (
        !face_embedding ||
        !Array.isArray(face_embedding) ||
        face_embedding.length === 0
      ) {
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

      // Validasi: Pastikan data pribadi sudah diisi
      if (!karyawan.nama_lengkap || !karyawan.alamat) {
        return res.status(400).json({
          msg: "Harap lengkapi data pribadi Anda terlebih dahulu sebelum melakukan registrasi wajah",
          incomplete_fields: {
            nama_lengkap: !karyawan.nama_lengkap,
            alamat: !karyawan.alamat,
          },
        });
      }

      const karyawan_id = karyawan.id;

      //   cek apakah image sudah pernah di register
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
        msg: "Berhasil mendaftarkan wajah",
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

      const { face_embedding, face_image_url } = req.body || {};

      // SECURITY (Task 2.6 + 4.12): require face_embedding to avoid wiping
      if (
        !face_embedding ||
        !Array.isArray(face_embedding) ||
        face_embedding.length === 0
      ) {
        return res.status(400).json({
          msg: "face_embedding wajib diisi dan harus berupa array numerik",
        });
      }

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

      const currentTrainingCount = face.training_count || 0;

      await face.update({
        face_embedding: face_embedding,
        face_image_url: face_image_url ?? face.face_image_url,
        training_count: currentTrainingCount + 1,
      });

      // FIX (Task 2.6): previously this function never sent a response,
      // causing the client request to hang until timeout.
      return res.status(200).json({
        msg: "Berhasil memperbarui data wajah",
        data: {
          karyawan_id,
          training_count: currentTrainingCount + 1,
        },
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
