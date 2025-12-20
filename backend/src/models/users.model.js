import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

export default class UsersModel extends Model {}

UsersModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("hrd", "karyawan"),
      defaultValue: "karyawan",
    },
    status: {
      type: DataTypes.ENUM("aktif", "tidak_aktif"),
      defaultValue: "aktif",
    },
  },
  {
    sequelize,
    modelName: "users",
    tableName: "m_users",
    timestamps: true,
  }
);
