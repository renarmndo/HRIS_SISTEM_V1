import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import KaryawanDashboardController from "../../controllers/karyawan/karyawanDashboard.controller.js";

const router = Router();

// Get analytics data untuk dashboard karyawan
router.get(
  "/karyawan/dashboard/analytics",
  authMiddleware,
  roleMiddleware("karyawan"),
  KaryawanDashboardController.getKaryawanAnalytics,
);

export default router;
