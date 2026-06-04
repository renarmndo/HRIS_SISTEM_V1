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
    // Catatan: log di atas dicetak setelah blok CREATE TABLE IF NOT EXISTS
    // selesai. Langkah-langkah ALTER TABLE / constraint di bawah ini
    // masing-masing idempotent dan error-nya sudah di-handle per-blok
    // (lihat "Migration error (non-fatal)" di catch), namun pesan
    // "Migrations completed" sebenarnya muncul di tengah. Pemeriksaan
    // terakhir ada di baris akhir runMigrations() di bawah.

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

    // Task 2.7: Add UNIQUE constraint (karyawan_id, tanggal) to prevent
    // duplicate attendance rows. Idempotent and reversible.
    try {
      const [uniqIdx] = await sequelize.query(`
        SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_NAME = 'm_absensi_karyawan'
          AND INDEX_NAME = 'uniq_absensi_karyawan_tanggal'
        LIMIT 1
      `);
      if (uniqIdx.length === 0) {
        // Deduplicate first: keep the earliest row per (karyawan_id, tanggal).
        // Jika createdAt sama persis, hapus yang memiliki ID string lebih besar/berbeda.
        await sequelize.query(`
          DELETE a FROM m_absensi_karyawan a
          INNER JOIN m_absensi_karyawan b
          ON a.karyawan_id = b.karyawan_id
             AND a.tanggal = b.tanggal
             AND (a.createdAt > b.createdAt OR (a.createdAt = b.createdAt AND a.id > b.id))
        `);
        await sequelize.query(`
          ALTER TABLE m_absensi_karyawan
          ADD CONSTRAINT uniq_absensi_karyawan_tanggal UNIQUE (karyawan_id, tanggal)
        `);
        console.log(
          "Added UNIQUE constraint uniq_absensi_karyawan_tanggal on m_absensi_karyawan",
        );
      } else {
        console.log(
          "Unique index uniq_absensi_karyawan_tanggal already exists, skipping...",
        );
      }
    } catch (uniqueConstraintError) {
      console.log(
        "Non-fatal error while adding unique constraint uniq_absensi_karyawan_tanggal:",
        uniqueConstraintError.message,
      );
    }

    // Task 2.8: Rename typo column disctance_keluar -> distance_keluar.
    // Skip if the new name already exists (idempotent on re-runs).
    try {
      const [typoCol] = await sequelize.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'm_absensi_karyawan' AND COLUMN_NAME = 'disctance_keluar'
      `);
      if (typoCol.length > 0) {
        const [hasNewCol] = await sequelize.query(`
          SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'm_absensi_karyawan' AND COLUMN_NAME = 'distance_keluar'
        `);
        if (hasNewCol.length === 0) {
          await sequelize.query(`
            ALTER TABLE m_absensi_karyawan
            CHANGE COLUMN disctance_keluar distance_keluar DECIMAL(8, 2) NULL
          `);
          console.log(
            "Renamed column disctance_keluar -> distance_keluar on m_absensi_karyawan",
          );
        } else {
          // Both columns exist: copy values then drop the typo one
          await sequelize.query(`
            UPDATE m_absensi_karyawan
            SET distance_keluar = disctance_keluar
            WHERE distance_keluar IS NULL AND disctance_keluar IS NOT NULL
          `);
          await sequelize.query(`
            ALTER TABLE m_absensi_karyawan DROP COLUMN disctance_keluar
          `);
          console.log(
            "Dropped typo column disctance_keluar (data migrated to distance_keluar)",
          );
        }
      } else {
        console.log(
          "Column distance_keluar already correct, skipping rename...",
        );
      }
    } catch (columnRenameError) {
      console.log(
        "Non-fatal error while renaming column disctance_keluar:",
        columnRenameError.message,
      );
    }

    // Task 3.18: Tambah FK constraints pada kolom yang belum punya.
    // Idempotent: cek INFORMATION_SCHEMA.TABLE_CONSTRAINTS dulu.
    // Rollback: ALTER TABLE ... DROP FOREIGN KEY <name>;
    await ensureFK(
      "m_absensi_karyawan",
      "karyawan_id",
      "M_karyawan",
      "id",
      "fk_absensi_karyawan",
    );
    await ensureFK(
      "m_pengajuan_cuti",
      "karyawan_id",
      "M_karyawan",
      "id",
      "fk_pengajuan_cuti_karyawan",
    );
    await ensureFK(
      "m_slip_gaji",
      "karyawan_id",
      "M_karyawan",
      "id",
      "fk_slip_gaji_karyawan",
    );
    await ensureFK(
      "m_detail_slip_gaji",
      "slip_gaji_id",
      "m_slip_gaji",
      "id",
      "fk_detail_slip_gaji_slip",
    );
    await ensureFK(
      "m_detail_slip_gaji",
      "komponen_id",
      "m_komponen_gaji",
      "id",
      "fk_detail_slip_gaji_komponen",
    );
    await ensureFK(
      "detail_face_karyawan",
      "karyawan_id",
      "M_karyawan",
      "id",
      "fk_face_karyawan",
    );
    await ensureFK(
      "lembur",
      "karyawan_id",
      "M_karyawan",
      "id",
      "fk_lembur_karyawan",
    );

    console.log("All migrations finished");
  } catch (error) {
    console.log("Migration error (non-fatal):", error.message);
  }
}

// Helper: tambah FK constraint jika belum ada. Idempotent.
// Untuk rollback, gunakan:
//   ALTER TABLE <child> DROP FOREIGN KEY <constraintName>;
async function ensureFK(childTable, childCol, parentTable, parentCol, constraintName) {
  try {
    const [exists] = await sequelize.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
       WHERE TABLE_NAME = ? AND CONSTRAINT_NAME = ?
       LIMIT 1`,
      { replacements: [childTable, constraintName] },
    );
    if (exists.length === 0) {
      // Tambahkan hanya jika kolomnya sudah ada.
      const [colExists] = await sequelize.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_NAME = ? AND COLUMN_NAME = ?
         LIMIT 1`,
        { replacements: [childTable, childCol] },
      );
      if (colExists.length > 0) {
        await sequelize.query(
          `ALTER TABLE \`${childTable}\`
           ADD CONSTRAINT \`${constraintName}\`
           FOREIGN KEY (\`${childCol}\`) REFERENCES \`${parentTable}\` (\`${parentCol}\`)
           ON DELETE RESTRICT ON UPDATE CASCADE`,
        );
        console.log(
          `Added FK ${constraintName}: ${childTable}.${childCol} -> ${parentTable}.${parentCol}`,
        );
      } else {
        console.log(
          `Skipped FK ${constraintName}: column ${childTable}.${childCol} missing`,
        );
      }
    } else {
      console.log(`FK ${constraintName} already exists, skipping...`);
    }
  } catch (e) {
    console.log(`FK ${constraintName} skipped (error):`, e.message);
  }
}

async function startSerevr() {
  try {
    // Run migrations first
    await runMigrations();

    // Sync tabel; jika ada index/kolom yang sudah ada, error dibungkus
    // (non-fatal) agar server tetap bisa start. Tabel hasil create
    // sebelumnya di runMigrations() sudah cukup untuk menjalankan API.
    try {
      await sequelize.sync({ alter: false });
      console.log("Database table berhasil dibuat");
    } catch (syncErr) {
      console.log(
        "Sync error (non-fatal, server tetap start):",
        syncErr.message,
      );
    }

    app.listen(port, () => {
      console.log(`Server running in http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

startSerevr();
