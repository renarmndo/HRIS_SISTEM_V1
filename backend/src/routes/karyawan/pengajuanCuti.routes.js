import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import PengajuanCutiController from "../../controllers/karyawan/pengajuanCuti.controller.js";

const router = Router();

// ============ KARYAWAN ROUTES ============

// Ajukan cuti
router.post(
  "/karyawan/cuti/ajukan",
  authMiddleware,
  roleMiddleware("karyawan"),
  PengajuanCutiController.ajukanCuti
);

// Get pengajuan cuti sendiri
router.get(
  "/karyawan/cuti/saya",
  authMiddleware,
  roleMiddleware("karyawan"),
  PengajuanCutiController.getCutiSaya
);

// Get sisa kuota cuti
router.get(
  "/karyawan/cuti/sisa-kuota",
  authMiddleware,
  roleMiddleware("karyawan"),
  PengajuanCutiController.getSisaKuota
);

// Cancel pengajuan cuti
router.delete(
  "/karyawan/cuti/:id",
  authMiddleware,
  roleMiddleware("karyawan"),
  PengajuanCutiController.cancelPengajuan
);

// ============ HRD ROUTES ============

// Get semua pengajuan cuti (untuk approval)
router.get(
  "/hrd/pengajuan-cuti",
  authMiddleware,
  roleMiddleware("hrd"),
  PengajuanCutiController.getAllPengajuan
);

// Approve/Reject pengajuan cuti
router.put(
  "/hrd/pengajuan-cuti/:id/status",
  authMiddleware,
  roleMiddleware("hrd"),
  PengajuanCutiController.updateStatus
);

export default router;
