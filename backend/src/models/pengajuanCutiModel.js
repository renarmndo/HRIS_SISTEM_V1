import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

export default class PengajuanCutiModel extends Model {}

PengajuanCutiModel.init(
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
    tanggal_mulai: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tanggal_selesai: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    jumlah_hari: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jenis_cuti: {
      type: DataTypes.ENUM(
        "tahunan",
        "sakit",
        "melahirkan",
        "penting",
        "lainnya"
      ),
      defaultValue: "tahunan",
      allowNull: false,
    },
    alasan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "disetujui", "ditolak"),
      defaultValue: "pending",
      allowNull: false,
    },
    catatan_approval: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "pengajuan_cuti",
    tableName: "m_pengajuan_cuti",
    timestamps: true,
  }
);
