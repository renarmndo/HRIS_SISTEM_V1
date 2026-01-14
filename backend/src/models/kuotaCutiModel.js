import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

export default class KuotaCutiModel extends Model {}

KuotaCutiModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    bulan: {
      type: DataTypes.INTEGER, // 1-12
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
    total_hari_kerja: {
      type: DataTypes.INTEGER, // contoh: 28 hari kerja
      allowNull: false,
      defaultValue: 22,
    },
    kuota_cuti: {
      type: DataTypes.INTEGER, // contoh: 7 hari cuti yang diperbolehkan
      allowNull: false,
      defaultValue: 7,
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "kuota_cuti",
    tableName: "m_kuota_cuti",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["bulan", "tahun"],
      },
    ],
  }
);
