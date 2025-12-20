import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

export default class KaryawanFaceModel extends Model {}

KaryawanFaceModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    karyawan_id: {
      type: DataTypes.UUID,
      unique: true,
      allowNull: false,
    },
    face_embedding: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    face_image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    training_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "face_karyawan",
    tableName: "detail_face_karyawan",
    timestamps: true,
  }
);
