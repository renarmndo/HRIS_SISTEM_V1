import UsersModel from "./users.model.js";

// KARYAWAN
import KaryawanModel from "./karyawan.model.js";
import KaryawanFaceModel from "./face_karyawanModel.js";
import AbsensiKaryawanModel from "./absensiModel.js";

// HRD
import LokasiKantorModel from "./lokasiKantor.model.js";

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

// Relasi 1:N
KaryawanModel.hasMany(AbsensiKaryawanModel, {
  foreignKey: "karyawan_id",
  as: "absensi",
});

AbsensiKaryawanModel.belongsTo(KaryawanModel, {
  foreignKey: "karyawan_id",
  as: "karyawan",
});

export { UsersModel, KaryawanFaceModel, KaryawanModel };
