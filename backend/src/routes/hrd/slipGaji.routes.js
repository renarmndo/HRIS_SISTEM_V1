import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import SlipGajiController from "../../controllers/hrd/slipGaji.controller.js";

const router = Router();

// ============ HRD ROUTES ============

// Generate slip gaji untuk semua karyawan
router.post(
  "/hrd/slip-gaji/generate",
  authMiddleware,
  roleMiddleware("hrd"),
  SlipGajiController.generateSlipGaji
);

// Get semua slip gaji per bulan
router.get(
  "/hrd/slip-gaji",
  authMiddleware,
  roleMiddleware("hrd"),
  SlipGajiController.getAllByBulan
);

// Get detail slip gaji by ID
router.get(
  "/hrd/slip-gaji/:id",
  authMiddleware,
  roleMiddleware("hrd"),
  SlipGajiController.getById
);

// Update slip gaji (edit komponen)
router.put(
  "/hrd/slip-gaji/:id",
  authMiddleware,
  roleMiddleware("hrd"),
  SlipGajiController.update
);

// Finalize slip gaji
router.put(
  "/hrd/slip-gaji/:id/finalize",
  authMiddleware,
  roleMiddleware("hrd"),
  SlipGajiController.finalize
);

// ============ KARYAWAN ROUTES ============

// Get slip gaji sendiri
router.get(
  "/karyawan/slip-gaji",
  authMiddleware,
  roleMiddleware("karyawan"),
  SlipGajiController.getSlipGajiSaya
);

// Get detail slip gaji sendiri by ID
router.get(
  "/karyawan/slip-gaji/:id",
  authMiddleware,
  roleMiddleware("karyawan"),
  SlipGajiController.getSlipGajiSayaById
);

export default router;
