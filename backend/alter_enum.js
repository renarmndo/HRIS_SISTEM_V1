import sequelize from "./src/config/sequelize.js";

async function alterTable() {
  try {
    await sequelize.authenticate();
    console.log("Koneksi database berhasil.");

    await sequelize.query("ALTER TABLE m_komponen_gaji MODIFY COLUMN metode ENUM('nominal', 'persentase', 'per_hari', 'per_jam', 'per_keterlambatan') DEFAULT 'nominal' NOT NULL");
    
    console.log("Berhasil ALTER TABLE m_komponen_gaji.");
    process.exit(0);
  } catch (error) {
    console.error("Error altering table:", error);
    process.exit(1);
  }
}

alterTable();
