import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    // FIX (Task 3.17): set timezone +07:00 (WIB) agar semua DATE/DATETIME
    // di-interpret & dikonversi dengan zona Indonesia, bukan server local.
    // Sebelumnya tidak ada timezone, Sequelize default = "Z" (UTC) sehingga
    // `new Date()` di Node (WIB) jadi 7 jam lebih lambat saat di-insert.
    timezone: "+07:00",
    // FIX (Task 3.17): charset utf8mb4 + emoji-friendly collations
    // agar nama karyawan ber-emoji / aksen non-ASCII tidak corrupt.
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

export default sequelize;
