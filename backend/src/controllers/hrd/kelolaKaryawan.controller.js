import UsersModel from "../../models/users.model.js";
import KaryawanModel from "../../models/karyawan.model.js";

export default class KelolaKaryawanController {
  // Get semua users (untuk halaman Data Users - manage akun)
  static async getUsers(req, res) {
    try {
      const users = await UsersModel.findAll({
        order: [["createdAt", "desc"]],
        attributes: ["id", "username", "email", "role", "status", "createdAt"],
      });

      return res.status(200).json({
        msg: "Berhasil mendapatkan data users",
        data: users,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Get karyawan saja (role=karyawan) dengan data profil + gaji
  static async getKaryawanOnly(req, res) {
    try {
      const users = await UsersModel.findAll({
        where: { role: "karyawan" },
        order: [["createdAt", "desc"]],
        attributes: ["id", "username", "email", "status", "createdAt"],
        include: [
          {
            model: KaryawanModel,
            as: "profile",
            attributes: [
              "id",
              "nama_lengkap",
              "tanggal_masuk",
              "alamat",
              "departement",
              "jabatan",
              "gaji_pokok",
              "is_active",
            ],
          },
        ],
      });

      const payload = users.map((data) => {
        const userData = data.toJSON();
        return {
          ...userData,
          nama_lengkap: userData.profile?.nama_lengkap || userData.username,
          departement: userData.profile?.departement || "-",
          jabatan: userData.profile?.jabatan || "-",
          gaji_pokok: userData.profile?.gaji_pokok || 0,
          karyawan_id: userData.profile?.id || null,
          profil_lengkap: !!userData.profile,
        };
      });

      return res.status(200).json({
        msg: "Berhasil mendapatkan data karyawan",
        data: payload,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Update gaji pokok karyawan
  static async updateGajiPokok(req, res) {
    try {
      const { id } = req.params; // user_id
      const { gaji_pokok } = req.body;

      if (gaji_pokok === undefined) {
        return res.status(400).json({
          msg: "Gaji pokok wajib diisi",
        });
      }

      // Cari karyawan berdasarkan user_id
      const karyawan = await KaryawanModel.findOne({
        where: { user_id: id },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan. Karyawan harus melengkapi profil terlebih dahulu.",
        });
      }

      await karyawan.update({
        gaji_pokok: parseFloat(gaji_pokok) || 0,
      });

      return res.status(200).json({
        msg: "Berhasil memperbarui gaji pokok",
        data: karyawan,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }
}
