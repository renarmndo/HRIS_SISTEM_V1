import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

export default class KomponenGajiModel extends Model {}

KomponenGajiModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipe: {
      type: DataTypes.ENUM("bonus", "potongan"),
      allowNull: false,
    },
    metode: {
      type: DataTypes.ENUM("nominal", "persentase", "per_hari", "per_jam"),
      allowNull: false,
      defaultValue: "nominal",
    },
    nilai_default: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
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
    modelName: "komponen_gaji",
    tableName: "m_komponen_gaji",
    timestamps: true,
  }
);
