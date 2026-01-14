import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import KuotaCutiController from "../../controllers/hrd/kuotaCuti.controller.js";

const router = Router();

// Get all kuota cuti
router.get(
  "/hrd/kuota-cuti",
  authMiddleware,
  roleMiddleware("hrd"),
  KuotaCutiController.getAll
);

// Get kuota cuti by bulan dan tahun
router.get(
  "/hrd/kuota-cuti/:bulan/:tahun",
  authMiddleware,
  roleMiddleware("hrd"),
  KuotaCutiController.getByBulanTahun
);

// Create kuota cuti
router.post(
  "/hrd/kuota-cuti",
  authMiddleware,
  roleMiddleware("hrd"),
  KuotaCutiController.create
);

// Update kuota cuti
router.put(
  "/hrd/kuota-cuti/:id",
  authMiddleware,
  roleMiddleware("hrd"),
  KuotaCutiController.update
);

// Delete kuota cuti
router.delete(
  "/hrd/kuota-cuti/:id",
  authMiddleware,
  roleMiddleware("hrd"),
  KuotaCutiController.delete
);

export default router;
