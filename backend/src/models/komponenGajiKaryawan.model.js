import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

export default class KomponenGajiKaryawanModel extends Model {}

KomponenGajiKaryawanModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    komponen_gaji_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "m_komponen_gaji",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
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
  },
  {
    sequelize,
    modelName: "komponen_gaji_karyawan",
    tableName: "m_komponen_gaji_karyawan",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["komponen_gaji_id", "karyawan_id"],
      },
    ],
  }
);
