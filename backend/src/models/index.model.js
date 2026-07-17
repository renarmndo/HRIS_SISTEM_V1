import UsersModel from "./users.model.js";

// KARYAWAN
import KaryawanModel from "./karyawan.model.js";
import KaryawanFaceModel from "./face_karyawanModel.js";
import AbsensiKaryawanModel from "./absensiModel.js";
import LemburModel from "./lembur.model.js";

// HRD
import LokasiKantorModel from "./lokasiKantor.model.js";

// CUTI
import KuotaCutiModel from "./kuotaCutiModel.js";
import PengajuanCutiModel from "./pengajuanCutiModel.js";

// PENGGAJIAN
import KomponenGajiModel from "./komponenGaji.model.js";
import SlipGajiModel from "./slipGaji.model.js";
import DetailSlipGajiModel from "./detailSlipGaji.model.js";

// ─── Relasi Users ↔ Karyawan (1:1) ────────────────────────────
UsersModel.hasOne(KaryawanModel, {
  foreignKey: "user_id",
  as: "profile",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

KaryawanModel.belongsTo(UsersModel, {
  foreignKey: "user_id",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ─── Relasi Karyawan ↔ Face Data (1:1) ────────────────────────
KaryawanModel.hasOne(KaryawanFaceModel, {
  foreignKey: "karyawan_id",
  as: "face",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

KaryawanFaceModel.belongsTo(KaryawanModel, {
  foreignKey: "karyawan_id",
  as: "karyawan",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ─── Relasi 1:N Absensi ───────────────────────────────────────
KaryawanModel.hasMany(AbsensiKaryawanModel, {
  foreignKey: "karyawan_id",
  as: "absensi",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

AbsensiKaryawanModel.belongsTo(KaryawanModel, {
  foreignKey: "karyawan_id",
  as: "karyawan",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Relasi Absensi ↔ User (HRD yang mengabsenkan manual)
UsersModel.hasMany(AbsensiKaryawanModel, {
  foreignKey: "diabsen_oleh",
  as: "absensi_manual",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

AbsensiKaryawanModel.belongsTo(UsersModel, {
  foreignKey: "diabsen_oleh",
  as: "pengabsen",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// ─── Relasi 1:N Pengajuan Cuti ────────────────────────────────
KaryawanModel.hasMany(PengajuanCutiModel, {
  foreignKey: "karyawan_id",
  as: "pengajuan_cuti",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

PengajuanCutiModel.belongsTo(KaryawanModel, {
  foreignKey: "karyawan_id",
  as: "karyawan",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Relasi Pengajuan Cuti ↔ User (HRD yang approve)
UsersModel.hasMany(PengajuanCutiModel, {
  foreignKey: "approved_by",
  as: "cuti_approved",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

PengajuanCutiModel.belongsTo(UsersModel, {
  foreignKey: "approved_by",
  as: "approver",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// ─── Relasi 1:N Slip Gaji ─────────────────────────────────────
KaryawanModel.hasMany(SlipGajiModel, {
  foreignKey: "karyawan_id",
  as: "slip_gaji",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

SlipGajiModel.belongsTo(KaryawanModel, {
  foreignKey: "karyawan_id",
  as: "karyawan",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ─── Relasi Detail Slip Gaji ↔ Slip Gaji (1:N) ───────────────
SlipGajiModel.hasMany(DetailSlipGajiModel, {
  foreignKey: "slip_gaji_id",
  as: "details",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

DetailSlipGajiModel.belongsTo(SlipGajiModel, {
  foreignKey: "slip_gaji_id",
  as: "slip_gaji",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ─── Relasi Detail Slip Gaji ↔ Komponen Gaji ─────────────────
KomponenGajiModel.hasMany(DetailSlipGajiModel, {
  foreignKey: "komponen_id",
  as: "detail_slip",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

DetailSlipGajiModel.belongsTo(KomponenGajiModel, {
  foreignKey: "komponen_id",
  as: "komponen",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// ─── Relasi Lembur ────────────────────────────────────────────
KaryawanModel.hasMany(LemburModel, {
  foreignKey: "karyawan_id",
  as: "lembur",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

LemburModel.belongsTo(KaryawanModel, {
  foreignKey: "karyawan_id",
  as: "karyawan",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

UsersModel.hasMany(LemburModel, {
  foreignKey: "approved_by",
  as: "lembur_approved",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

LemburModel.belongsTo(UsersModel, {
  foreignKey: "approved_by",
  as: "approver",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

export {
  UsersModel,
  KaryawanFaceModel,
  KaryawanModel,
  KuotaCutiModel,
  PengajuanCutiModel,
  KomponenGajiModel,
  SlipGajiModel,
  DetailSlipGajiModel,
  LokasiKantorModel,
  AbsensiKaryawanModel,
  LemburModel,
};
