import UsersModel from "../../models/users.model.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export default class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, role, status } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          msg: "Data tidak boleh kosong",
        });
      }

      //   chek apakah sudah ada email
      const users = await UsersModel.findOne({
        where: {
          email: email,
        },
      });

      if (users) {
        return res.status(400).json({
          msg: "Email sudah digunakan",
        });
      }

      const usernameExisting = await UsersModel.findOne({
        where: {
          username: username,
        },
      });

      if (usernameExisting) {
        return res.status(400).json({
          msg: "Username sudah digunakan",
        });
      }

      //   hash password
      const hashedPassword = await argon2.hash(password);

      //   create new user
      const result = await UsersModel.create({
        username: username,
        email: email,
        password: hashedPassword,
        role: role,
        status: status,
      });

      // hilangkan password dari object
      const userWithoutPassword = {
        id: result.id,
        username: result.username,
        email: result.email,
        role: result.role,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return res.status(201).json({
        msg: "Berhasil Menambahkan User",
        data: userWithoutPassword,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          msg: "Email dan Password tidak boleh kosong",
        });
      }

      //   chek apakah user ada
      const user = await UsersModel.findOne({
        where: {
          email: email,
        },
      });

      if (!user) {
        return res.status(400).json({
          msg: "Email Dan Password tidak valid",
        });
      }

      // chek status
      if (user.status === "tidak_aktif") {
        return res.status(400).json({
          msg: "Akun sudah dinonaktifkan oleh admin",
        });
      }

      //   compare password
      const passwordValid = await argon2.verify(user.password, password);

      if (!passwordValid) {
        return res.status(400).json({
          msg: "Email dan Password tidak Valid",
        });
      }

      const secret = process.env.JWT_TOKEN;
      const expiredin = process.env.JWT_EXPIRED;
      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
      };

      const deletePass = user.toJSON();
      delete deletePass.password;

      const token = jwt.sign(payload, secret, {
        expiresIn: expiredin,
      });

      return res.status(200).json({
        msg: "Login Berhasil",
        data: deletePass,
        token: token,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // update dan reset password
  static async updatePassword(req, res) {
    try {
      const { id } = req.params;
      const { username, email, password, role, status } = req.body;

      // cek field lain (password jangan dicek)
      if (!username || !email || !role || !status) {
        return res.status(400).json({
          msg: "Data tidak boleh kosong (kecuali password)",
        });
      }

      const user = await UsersModel.findOne({ where: { id } });

      if (!user) {
        return res.status(404).json({
          msg: "User tidak ditemukan",
        });
      }

      // siapkan objek payload update
      const updateData = {
        username,
        email,
        role,
        status,
      };

      // jika password diisi → hash dan update
      if (password && password.trim() !== "") {
        updateData.password = await argon2.hash(password);
      }

      // update database
      await UsersModel.update(updateData, { where: { id } });

      // return tanpa password
      const payload = user.toJSON();
      delete payload.password;

      return res.status(200).json({
        msg: password
          ? "Password berhasil diperbarui"
          : "Data berhasil diperbarui tanpa mengubah password",
        data: payload,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // delete akun
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // cari user
      const user = await UsersModel.findByPk(id);

      if (!user) {
        return res.status(404).json({
          msg: "User tidak ditemukan",
        });
      }

      await user.destroy();
      return res.status(200).json({
        msg: "Berhasil menghapus akun",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }
}
