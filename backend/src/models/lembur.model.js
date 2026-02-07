import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import KaryawanModel from "./karyawan.model.js";
import UserModel from "./users.model.js";

const LemburModel = sequelize.define(
  "lembur",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    karyawan_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "M_karyawan",
        key: "id",
      },
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    jam_mulai: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    jam_selesai: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    total_jam: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "m_users",
        key: "id",
      },
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "lembur",
    timestamps: true,
  },
);

// Relations
LemburModel.belongsTo(KaryawanModel, {
  foreignKey: "karyawan_id",
  as: "karyawan",
});

LemburModel.belongsTo(UserModel, {
  foreignKey: "approved_by",
  as: "approver",
});

export default LemburModel;
