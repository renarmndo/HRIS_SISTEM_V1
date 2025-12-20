import KaryawanModel from "../../models/karyawan.model.js";

export default class DataDiriKaryawan {
  static async create(req, res) {
    try {
      const user_id = req.user.id;
      const { nama_lengkap, alamat } = req.body;

      if (!nama_lengkap || !alamat) {
        return res.status(400).json({
          msg: "Data tidak boleh kosong",
        });
      }

      //   chek apakah si karyawan id ini ada
      const karyawan = await KaryawanModel.findOne({
        where: {
          user_id: user_id,
        },
      });

      if (karyawan) {
        return res.status(400).json({
          msg: "Detail data diri sudah ada",
        });
      }

      //   create data
      const dataUser = await KaryawanModel.create({
        user_id: user_id,
        nama_lengkap: nama_lengkap,
        tanggal_masuk: new Date(),
        alamat: alamat,
        departement: "Bisnis",
        jabatan: "Karyawan",
        is_active: true,
      });

      return res.status(201).json({
        msg: "Berhasil menambahkan data ",
        data: dataUser,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  static async update(req, res) {
    try {
      const user_id = req.user.id;
      const { nama_lengkap, alamat } = req.body;

      if (!nama_lengkap || !alamat) {
        return res.status(400).json({
          msg: "Data tidak boleh kosong",
        });
      }

      //   chek apakah si userid ini ada
      const karyawanProfile = await KaryawanModel.findOne({
        where: {
          user_id: user_id,
        },
      });

      if (!karyawanProfile) {
        return res.status(404).json({
          msg: "Data tidak ditemukan",
        });
      }

      //   kalau ada update data
      const updateProfile = await KaryawanModel.update(
        {
          nama_lengkap: nama_lengkap,
          alamat: alamat,
        },
        {
          where: {
            user_id: user_id,
          },
        }
      );

      const updateUser = await KaryawanModel.findOne({
        where: {
          user_id,
        },
      });

      return res.status(200).json({
        msg: "Berhasil memperbarui data",
        data: updateUser,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const user_id = req.user.id;
      if (!user_id) {
        return res.status(400).json({
          msg: "User tidak ditemukan, silahkan login terlebih dahulu",
        });
      }

      //   chek apakah data ada
      const profileUser = await KaryawanModel.findOne({
        where: {
          user_id,
        },
      });

      if (!profileUser) {
        return res.status(404).json({
          msg: "Data profile tidak ditemukan",
        });
      }

      return res.status(200).json({
        msg: "Berhasil mendapatkan data",
        data: profileUser,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }
}
