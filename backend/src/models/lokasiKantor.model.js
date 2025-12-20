import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

export default class LokasiKantorModel extends Model {}

LokasiKantorModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    nama_perusahaan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    radius_absen_meter: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      allowNull: false,
    },
    jam_masuk: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    jam_keluar: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "lokasi_perusahaan",
    tableName: "m_lokasi_perusahan",
    timestamps: true,
  }
);
