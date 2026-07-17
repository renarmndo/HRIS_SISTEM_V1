import sequelize from "./src/config/sequelize.js";
import UsersModel from "./src/models/users.model.js";
import argon2 from "argon2";

async function seedHRD() {
  try {
    // Pastikan koneksi ke database berhasil
    await sequelize.authenticate();
    console.log("Koneksi database berhasil.");

    // Cek apakah user HRD sudah ada
    const existingHrd = await UsersModel.findOne({
      where: { role: "hrd" },
    });

    if (existingHrd) {
      console.log(
        `User HRD sudah ada: ${existingHrd.email} (${existingHrd.username})`,
      );
      process.exit(0);
    }

    // Informasi Akun HRD Baru
    const username = "adminhrd";
    const email = "hrd@company.com";
    const passwordRaw = "admin12345"; // Anda bisa mengubah password ini nanti

    // Hash password menggunakan argon2
    const hashedPassword = await argon2.hash(passwordRaw);

    // Buat user baru
    const hrdUser = await UsersModel.create({
      username: username,
      email: email,
      password: hashedPassword,
      role: "hrd",
      status: "aktif",
    });

    console.log("==================================================");
    console.log("BERHASIL MENAMBAHKAN USER HRD BARU!");
    console.log("==================================================");
    console.log(`Username : ${hrdUser.username}`);
    console.log(`Email    : ${hrdUser.email}`);
    console.log(`Password : ${passwordRaw}`);
    console.log(`Role     : ${hrdUser.role}`);
    console.log("==================================================");

    process.exit(0);
  } catch (error) {
    console.error("Gagal melakukan seeding HRD:", error.message);
    process.exit(1);
  }
}

seedHRD();
