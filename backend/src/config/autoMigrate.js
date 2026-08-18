import sequelize from "./sequelize.js";

export async function ensureFakeGpsColumns() {
  try {
    const [columns] = await sequelize.query("SHOW COLUMNS FROM m_absensi_karyawan");
    const existingCols = columns.map((c) => c.Field);

    const colsToAdd = [
      { name: "accuracy_masuk", type: "DECIMAL(8, 2) NULL" },
      { name: "accuracy_keluar", type: "DECIMAL(8, 2) NULL" },
      { name: "ip_address_masuk", type: "VARCHAR(45) NULL" },
      { name: "ip_address_keluar", type: "VARCHAR(45) NULL" },
      { name: "is_suspect_masuk", type: "TINYINT(1) DEFAULT 0" },
      { name: "is_suspect_keluar", type: "TINYINT(1) DEFAULT 0" },
      { name: "suspect_reason_masuk", type: "VARCHAR(255) NULL" },
      { name: "suspect_reason_keluar", type: "VARCHAR(255) NULL" },
    ];

    for (const col of colsToAdd) {
      if (!existingCols.includes(col.name)) {
        await sequelize.query(`ALTER TABLE m_absensi_karyawan ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Auto-migration: Column ${col.name} added to m_absensi_karyawan`);
      }
    }
  } catch (error) {
    console.error("⚠️ Auto-migration error:", error.message);
  }
}

export async function ensureKomponenGajiKaryawanTable() {
  try {
    const [tables] = await sequelize.query(
      "SHOW TABLES LIKE 'm_komponen_gaji_karyawan'"
    );

    if (tables.length === 0) {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS \`m_komponen_gaji_karyawan\` (
          \`id\` CHAR(36) NOT NULL,
          \`komponen_gaji_id\` CHAR(36) NOT NULL,
          \`karyawan_id\` CHAR(36) NOT NULL,
          \`createdAt\` DATETIME NOT NULL,
          \`updatedAt\` DATETIME NOT NULL,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`uk_komponen_karyawan\` (\`komponen_gaji_id\`, \`karyawan_id\`),
          FOREIGN KEY (\`komponen_gaji_id\`) REFERENCES \`m_komponen_gaji\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (\`karyawan_id\`) REFERENCES \`m_karyawan\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✅ Auto-migration: Table m_komponen_gaji_karyawan created");
    } else {
      // Tabel sudah ada, cek apakah kolom yang diperlukan sudah lengkap
      const [columns] = await sequelize.query(
        "SHOW COLUMNS FROM m_komponen_gaji_karyawan"
      );
      const existingCols = columns.map((c) => c.Field);

      const requiredCols = [
        { name: "id", type: "CHAR(36) NOT NULL" },
        { name: "komponen_gaji_id", type: "CHAR(36) NOT NULL" },
        { name: "karyawan_id", type: "CHAR(36) NOT NULL" },
        { name: "createdAt", type: "DATETIME NOT NULL" },
        { name: "updatedAt", type: "DATETIME NOT NULL" },
      ];

      for (const col of requiredCols) {
        if (!existingCols.includes(col.name)) {
          await sequelize.query(
            `ALTER TABLE \`m_komponen_gaji_karyawan\` ADD COLUMN \`${col.name}\` ${col.type}`
          );
          console.log(
            `✅ Auto-migration: Column ${col.name} added to m_komponen_gaji_karyawan`
          );
        }
      }

      // Cek apakah foreign key constraints sudah ada
      const [constraints] = await sequelize.query(`
        SELECT CONSTRAINT_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'm_komponen_gaji_karyawan'
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      const existingFKs = constraints.map((c) => c.CONSTRAINT_NAME);

      // Tambahkan FK constraint untuk komponen_gaji_id jika belum ada
      const hasKomponenFK = constraints.some(
        (c) =>
          c.CONSTRAINT_NAME &&
          c.CONSTRAINT_NAME.includes("komponen_gaji")
      );
      if (!hasKomponenFK) {
        try {
          await sequelize.query(`
            ALTER TABLE \`m_komponen_gaji_karyawan\`
            ADD CONSTRAINT \`fk_kgk_komponen_gaji_id\`
            FOREIGN KEY (\`komponen_gaji_id\`) REFERENCES \`m_komponen_gaji\`(\`id\`)
            ON DELETE CASCADE ON UPDATE CASCADE
          `);
          console.log(
            "✅ Auto-migration: FK komponen_gaji_id added to m_komponen_gaji_karyawan"
          );
        } catch (e) {
          if (e.code !== "ER_DUP_KEY" && e.errno !== 1061) {
            console.log(
              "⚠️ FK komponen_gaji_id skip (might already exist):",
              e.message
            );
          }
        }
      }

      // Tambahkan FK constraint untuk karyawan_id jika belum ada
      const hasKaryawanFK = constraints.some(
        (c) =>
          c.CONSTRAINT_NAME &&
          c.CONSTRAINT_NAME.includes("karyawan")
      );
      if (!hasKaryawanFK) {
        try {
          await sequelize.query(`
            ALTER TABLE \`m_komponen_gaji_karyawan\`
            ADD CONSTRAINT \`fk_kgk_karyawan_id\`
            FOREIGN KEY (\`karyawan_id\`) REFERENCES \`m_karyawan\`(\`id\`)
            ON DELETE CASCADE ON UPDATE CASCADE
          `);
          console.log(
            "✅ Auto-migration: FK karyawan_id added to m_komponen_gaji_karyawan"
          );
        } catch (e) {
          if (e.code !== "ER_DUP_KEY" && e.errno !== 1061) {
            console.log(
              "⚠️ FK karyawan_id skip (might already exist):",
              e.message
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("⚠️ Auto-migration m_komponen_gaji_karyawan error:", error.message);
  }
}
