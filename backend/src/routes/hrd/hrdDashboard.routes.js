import { Router } from "express";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import HrdDashboardController from "../../controllers/hrd/hrdDashboard.controller.js";

const router = Router();

// Get dashboard stats
router.get(
  "/hrd/dashboard/stats",
  authMiddleware,
  roleMiddleware("hrd"),
  HrdDashboardController.getDashboardStats
);

// Get pengajuan cuti terbaru
router.get(
  "/hrd/dashboard/pengajuan-cuti",
  authMiddleware,
  roleMiddleware("hrd"),
  HrdDashboardController.getPengajuanCutiTerbaru
);

// Quick approve/reject pengajuan cuti
router.put(
  "/hrd/dashboard/pengajuan-cuti/:id",
  authMiddleware,
  roleMiddleware("hrd"),
  HrdDashboardController.quickUpdatePengajuanStatus
);

export default router;
