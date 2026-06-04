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

// relasi
UsersModel.hasOne(KaryawanModel, {
  foreignKey: "user_id",
  as: "profile",
});

KaryawanModel.belongsTo(UsersModel, {
  foreignKey: "user_id",
  as: "user",
});

// relasi 2
KaryawanModel.hasOne(KaryawanFaceModel, {
  foreignKey: "karyawan_id",
  as: "face",
});

KaryawanFaceModel.belongsTo(KaryawanModel, {
  foreignKey: "karyawan_id",
  as: "karyawan",
});

// Relasi 1:N Absensi
KaryawanModel.hasMany(AbsensiKaryawanModel, {
  foreignKey: "karyawan_id",
  as: "absensi",
});

AbsensiKaryawanModel.belongsTo(KaryawanModel, {
  foreignKey: "karyawan_id",
  as: "karyawan",
});

// Relasi 1:N Pengajuan Cuti
KaryawanModel.hasMany(PengajuanCutiModel, {
  foreignKey: "karyawan_id",
  as: "pengajuan_cuti",
});

PengajuanCutiModel.belongsTo(KaryawanModel, {
  foreignKey: "karyawan_id",
  as: "karyawan",
});

// Relasi Slip Gaji
KaryawanModel.hasMany(SlipGajiModel, {
  foreignKey: "karyawan_id",
  as: "slip_gaji",
});

SlipGajiModel.belongsTo(KaryawanModel, {
  foreignKey: "karyawan_id",
  as: "karyawan",
});

// Relasi Detail Slip Gaji
SlipGajiModel.hasMany(DetailSlipGajiModel, {
  foreignKey: "slip_gaji_id",
  as: "details",
});

DetailSlipGajiModel.belongsTo(SlipGajiModel, {
  foreignKey: "slip_gaji_id",
  as: "slip_gaji",
});

DetailSlipGajiModel.belongsTo(KomponenGajiModel, {
  foreignKey: "komponen_id",
  as: "komponen",
});

// Relasi Lembur (Task 3.19)
// hasMany di sini agar caller bisa pakai `KaryawanModel.findByPk(...)` 
// lalu `karyawan.getLembur()` dengan alias "lembur".
// belongsTo KaryawanModel dengan alias "karyawan" sudah di-define
// di lembur.model.js, sehingga tidak boleh dideklarasikan ulang di sini
// (akan menyebabkan SequelizeAssociationError duplicate alias).
KaryawanModel.hasMany(LemburModel, {
  foreignKey: "karyawan_id",
  as: "lembur",
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
  // FIX (Task 3.19): re-export model yang sebelumnya di-import tapi
  // tidak di-export, sehingga caller lain tidak perlu import path
  // panjang berulang kali.
  LokasiKantorModel,
  AbsensiKaryawanModel,
  LemburModel,
};
