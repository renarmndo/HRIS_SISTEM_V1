import sequelize from "./src/config/sequelize.js";

async function patchColumns() {
  try {
    console.log("🔍 Checking columns in m_absensi_karyawan...");
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
        console.log(`➕ Adding column ${col.name}...`);
        await sequelize.query(`ALTER TABLE m_absensi_karyawan ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Column ${col.name} added successfully!`);
      } else {
        console.log(`ℹ️ Column ${col.name} already exists.`);
      }
    }

    console.log("🎉 All DB columns patched successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error patching columns:", error);
    process.exit(1);
  }
}

patchColumns();
