import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

export default class DetailSlipGajiModel extends Model {}

DetailSlipGajiModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    slip_gaji_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    komponen_id: {
      type: DataTypes.UUID,
      allowNull: true, // Nullable untuk komponen manual
    },
    nama_komponen: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipe: {
      type: DataTypes.ENUM("bonus", "potongan"),
      allowNull: false,
    },
    nilai: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "detail_slip_gaji",
    tableName: "m_detail_slip_gaji",
    timestamps: true,
  }
);
