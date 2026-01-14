import { Router } from "express";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import AbsensiController from "../../controllers/karyawan/absensi.controller.js";

const router = Router();

// absen masuk
router.post(
  "/karyawan/absen",
  authMiddleware,
  roleMiddleware("karyawan"),
  AbsensiController.absensiMasuk
);

// absen kaluar
router.put(
  "/karyawan/absen",
  authMiddleware,
  roleMiddleware("karyawan"),
  AbsensiController.absensiKeluar
);

router.get(
  "/karyawan/absen",
  authMiddleware,
  roleMiddleware("karyawan"),
  AbsensiController.getAbsensi
);

router.get(
  "/karyawan/absen/hariIni",
  authMiddleware,
  roleMiddleware("karyawan"),
  AbsensiController.getAbsensiHariIni
);

// get absensi mingguan
router.get(
  "/karyawan/absen/total",
  authMiddleware,
  roleMiddleware("karyawan"),
  AbsensiController.getDetailAbsensiMingguan
);

// get absensi bulanan
router.get(
  "/karyawan/absen/bulanan",
  authMiddleware,
  roleMiddleware("karyawan"),
  AbsensiController.getAbsensiBulanan
);

export default router;
