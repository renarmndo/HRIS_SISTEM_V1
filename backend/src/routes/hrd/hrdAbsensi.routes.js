import { Router } from "express";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import HrdAbsensiController from "../../controllers/hrd/hrdAbsensi.controller.js";

const router = Router();

// Get absensi berdasarkan tanggal (semua karyawan)
router.get(
  "/hrd/absensi",
  authMiddleware,
  roleMiddleware("hrd"),
  HrdAbsensiController.getAbsensiByDate
);

// Get statistik absensi
router.get(
  "/hrd/absensi/stats",
  authMiddleware,
  roleMiddleware("hrd"),
  HrdAbsensiController.getAbsensiStats
);

// Get absensi bulanan karyawan tertentu
router.get(
  "/hrd/absensi/karyawan/:id",
  authMiddleware,
  roleMiddleware("hrd"),
  HrdAbsensiController.getAbsensiBulananKaryawan
);

// Create absensi manual
router.post(
  "/hrd/absensi",
  authMiddleware,
  roleMiddleware("hrd"),
  HrdAbsensiController.createAbsensiManual
);

// Update absensi
router.put(
  "/hrd/absensi/:id",
  authMiddleware,
  roleMiddleware("hrd"),
  HrdAbsensiController.updateAbsensi
);

export default router;
