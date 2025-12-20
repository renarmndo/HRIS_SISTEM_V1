import UsersModel from "../../models/users.model.js";

export default class KelolaKaryawanController {
  static async getKaryawan(req, res) {
    try {
      const karyawan = await UsersModel.findAll({
        order: [["createdAt", "desc"]],
      });

      if (!karyawan) {
        return res.status(500).json({
          msg: "Tidak ada data",
          data: [],
        });
      }

      const payloat = karyawan.map((data) => {
        const { password, ...userWithoutPass } = data.toJSON();
        return userWithoutPass;
      });

      return res.status(200).json({
        msg: "Berhasil mendapatkan data",
        data: payloat,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }
}
