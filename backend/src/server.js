import app from "./app/app.js";
import dotenv from "dotenv";
dotenv.config();
import sequelize from "./config/sequelize.js";
import {} from "./models/index.model.js";

const port = process.env.PORT || 5000;

// Manual migration untuk kolom baru
async function runMigrations() {
  try {
    // Cek apakah kolom gaji_pokok sudah ada
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'M_karyawan' AND COLUMN_NAME = 'gaji_pokok'
    `);

    if (columns.length === 0) {
      // Tambah kolom gaji_pokok jika belum ada
      await sequelize.query(`
        ALTER TABLE M_karyawan ADD COLUMN gaji_pokok DECIMAL(15,2) DEFAULT 0
      `);
      console.log("Added column gaji_pokok to M_karyawan");
    } else {
      console.log("Column gaji_pokok already exists, skipping...");
    }

    // Buat tabel komponen gaji jika belum ada
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS m_komponen_gaji (
        id CHAR(36) PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        tipe ENUM('bonus', 'potongan') NOT NULL,
        metode ENUM('nominal', 'persentase', 'per_hari', 'per_jam') DEFAULT 'nominal',
        nilai_default DECIMAL(15,2) DEFAULT 0,
        keterangan TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Buat tabel slip gaji jika belum ada
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS m_slip_gaji (
        id CHAR(36) PRIMARY KEY,
        karyawan_id CHAR(36) NOT NULL,
        bulan INT NOT NULL,
        tahun INT NOT NULL,
        total_hari_kerja INT DEFAULT 0,
        total_hadir INT DEFAULT 0,
        total_terlambat INT DEFAULT 0,
        total_absen INT DEFAULT 0,
        total_cuti INT DEFAULT 0,
        total_lembur_jam DECIMAL(10,2) DEFAULT 0,
        gaji_pokok DECIMAL(15,2) DEFAULT 0,
        total_pendapatan DECIMAL(15,2) DEFAULT 0,
        total_potongan DECIMAL(15,2) DEFAULT 0,
        gaji_bersih DECIMAL(15,2) DEFAULT 0,
        status ENUM('draft', 'final') DEFAULT 'draft',
        catatan TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_slip (karyawan_id, bulan, tahun)
      )
    `);

    // Buat tabel detail slip gaji jika belum ada
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS m_detail_slip_gaji (
        id CHAR(36) PRIMARY KEY,
        slip_gaji_id CHAR(36) NOT NULL,
        komponen_id CHAR(36),
        nama_komponen VARCHAR(255) NOT NULL,
        tipe ENUM('bonus', 'potongan') NOT NULL,
        nilai DECIMAL(15,2) DEFAULT 0,
        keterangan VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("Migrations completed successfully");

    // Cek dan tambah kolom untuk absensi manual HRD
    const [absensiCols1] = await sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'm_absensi_karyawan' AND COLUMN_NAME = 'diabsen_oleh'
    `);
    if (absensiCols1.length === 0) {
      await sequelize.query(`
        ALTER TABLE m_absensi_karyawan ADD COLUMN diabsen_oleh CHAR(36) NULL
      `);
      console.log("Added column diabsen_oleh to m_absensi_karyawan");
    }

    const [absensiCols2] = await sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'm_absensi_karyawan' AND COLUMN_NAME = 'is_manual'
    `);
    if (absensiCols2.length === 0) {
      await sequelize.query(`
        ALTER TABLE m_absensi_karyawan ADD COLUMN is_manual BOOLEAN DEFAULT FALSE
      `);
      console.log("Added column is_manual to m_absensi_karyawan");
    }
  } catch (error) {
    console.log("Migration error (non-fatal):", error.message);
  }
}

async function startSerevr() {
  try {
    // Run migrations first
    await runMigrations();

    await sequelize.sync({ alter: false });
    console.log("Database table berhasil dibuat");

    app.listen(port, () => {
      console.log(`Server runnin in http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

startSerevr();
