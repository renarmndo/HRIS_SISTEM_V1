import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

export default class AbsensiKaryawanModel extends Model {}

AbsensiKaryawanModel.init(
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
    },
    tanggal: {
      type: DataTypes.DATEONLY,
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
    status: {
      type: DataTypes.ENUM(
        "masuk",
        "tidak_hadir",
        "izin",
        "sakit",
        "libur",
        "cuti",
        "terlambat"
      ),
      defaultValue: "tidak_hadir",
      allowNull: false,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude_masuk: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    latitude_keluar: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },

    longitude_masuk: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },

    longitude_keluar: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    face_embedding_masuk: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    face_embedding_keluar: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    distance_masuk: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    disctance_keluar: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    menit_terlambat: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    validasi_lokasi_masuk: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    validasi_lokasi_keluar: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "absensi_karyawan",
    tableName: "m_absensi_karyawan",
    timestamps: true,
  }
);
