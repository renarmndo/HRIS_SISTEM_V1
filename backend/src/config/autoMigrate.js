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
