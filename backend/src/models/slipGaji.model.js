import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

export default class SlipGajiModel extends Model {}

SlipGajiModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    karyawan_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "m_karyawan",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    bulan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    tahun: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Data absensi
    total_hari_kerja: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_hadir: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_terlambat: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_absen: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_cuti: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_lembur_jam: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    // Gaji
    gaji_pokok: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      // SECURITY (Task 4.6 + 4.10): gaji_pokok tidak boleh negatif
      validate: {
        min: {
          args: [0],
          msg: "gaji_pokok tidak boleh negatif",
        },
      },
    },
    total_pendapatan: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    total_potongan: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    gaji_bersih: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    status: {
      type: DataTypes.ENUM("draft", "final"),
      defaultValue: "draft",
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "slip_gaji",
    tableName: "m_slip_gaji",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["karyawan_id", "bulan", "tahun"],
      },
    ],
  }
);
