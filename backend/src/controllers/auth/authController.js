import UsersModel from "../../models/users.model.js";
import KaryawanModel from "../../models/karyawan.model.js";
import sequelize from "../../config/sequelize.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { isNonEmptyString, isValidEmail, isValidUUID } from "../../utils/validators.js";

const ALLOWED_ROLES = new Set(["karyawan", "hrd"]);
const ALLOWED_STATUS = new Set(["aktif", "tidak_aktif"]);

export default class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, role, status, department, jabatan } = req.body;

      // SECURITY (Task 4.2): schema validation sederhana
      if (!isNonEmptyString(username, { minLen: 3, maxLen: 50 })) {
        return res.status(400).json({
          msg: "Username harus 3-50 karakter",
        });
      }
      if (!isValidEmail(email)) {
        return res.status(400).json({
          msg: "Format email tidak valid",
        });
      }
      if (!isNonEmptyString(password, { minLen: 6, maxLen: 128 })) {
        return res.status(400).json({
          msg: "Password harus 6-128 karakter",
        });
      }

      const userRole = ALLOWED_ROLES.has(role) ? role : "karyawan";
      const userStatus = ALLOWED_STATUS.has(status) ? status : "aktif";

      //   cek apakah sudah ada email
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

      //   create new user and employee profile in a transaction
      let result;
      await sequelize.transaction(async (t) => {
        result = await UsersModel.create({
          username: username,
          email: email,
          password: hashedPassword,
          role: userRole,
          status: userStatus,
        }, { transaction: t });

        // Buat profil karyawan default secara otomatis jika role karyawan
        if (userRole === "karyawan") {
          await KaryawanModel.create({
            user_id: result.id,
            nama_lengkap: username,
            tanggal_masuk: new Date(),
            alamat: "-",
            department: department || "-",
            jabatan: jabatan || "Karyawan",
            gaji_pokok: 0,
            is_active: userStatus === "aktif",
          }, { transaction: t });
        }
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
        msg: "Berhasil Menambahkan User dan Profil Karyawan",
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
      if (!isValidEmail(email)) {
        return res.status(400).json({
          msg: "Format email tidak valid",
        });
      }
      if (typeof password !== "string" || password.length < 6 || password.length > 128) {
        return res.status(400).json({
          msg: "Password tidak valid",
        });
      }

      //   cek apakah user ada
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

      // cek status
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
      const { username, email, password, role, status, department, jabatan } = req.body;

      // SECURITY (Task 4.2): UUID validation
      if (!isValidUUID(id)) {
        return res.status(400).json({ msg: "ID user tidak valid" });
      }

      // SECURITY (Task 4.9): Whitelist role & status values
      if (!ALLOWED_ROLES.has(role)) {
        return res.status(400).json({ msg: "Role tidak valid" });
      }
      if (!ALLOWED_STATUS.has(status)) {
        return res.status(400).json({ msg: "Status tidak valid" });
      }

      // cek field lain (password jangan dicek)
      if (!isNonEmptyString(username, { minLen: 3, maxLen: 50 })) {
        return res.status(400).json({ msg: "Username harus 3-50 karakter" });
      }
      if (!isValidEmail(email)) {
        return res.status(400).json({ msg: "Format email tidak valid" });
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

      // SECURITY (Task 4.2): password policy
      if (password && password.trim() !== "") {
        if (typeof password !== "string" || password.length < 6 || password.length > 128) {
          return res.status(400).json({
            msg: "Password harus 6-128 karakter",
          });
        }
        updateData.password = await argon2.hash(password);
      }

      // update database
      await sequelize.transaction(async (t) => {
        await UsersModel.update(updateData, { where: { id }, transaction: t });

        // Sinkronisasi status, department & jabatan ke m_karyawan jika user adalah/menjadi karyawan
        if (role === "karyawan" || user.role === "karyawan") {
          const profileUpdate = {
            is_active: status === "aktif"
          };
          if (department !== undefined) {
            profileUpdate.department = department;
          }
          if (jabatan !== undefined) {
            profileUpdate.jabatan = jabatan;
          }

          const existingProfile = await KaryawanModel.findOne({ where: { user_id: id }, transaction: t });
          if (existingProfile) {
            await KaryawanModel.update(profileUpdate, { where: { user_id: id }, transaction: t });
          } else {
            await KaryawanModel.create({
              user_id: id,
              nama_lengkap: username,
              tanggal_masuk: new Date(),
              alamat: "-",
              department: department || "-",
              jabatan: jabatan || "Karyawan",
              gaji_pokok: 0,
              is_active: status === "aktif"
            }, { transaction: t });
          }
        }
      });

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

      if (!isValidUUID(id)) {
        return res.status(400).json({ msg: "ID user tidak valid" });
      }

      // cari user
      const user = await UsersModel.findByPk(id);

      if (!user) {
        return res.status(404).json({
          msg: "User tidak ditemukan",
        });
      }

      // SECURITY: jangan izinkan HRD menghapus dirinya sendiri
      if (user.id === req.user.id) {
        return res.status(400).json({
          msg: "Tidak dapat menghapus akun Anda sendiri",
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
