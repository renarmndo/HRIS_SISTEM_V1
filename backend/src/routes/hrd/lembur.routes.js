import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import HrdLemburController from "../../controllers/hrd/lembur.controller.js";

const router = Router();

// Get all overtime requests
router.get(
  "/hrd/lembur",
  authMiddleware,
  roleMiddleware("hrd"),
  HrdLemburController.getAllLembur,
);

// Get overtime statistics
router.get(
  "/hrd/lembur/stats",
  authMiddleware,
  roleMiddleware("hrd"),
  HrdLemburController.getLemburStats,
);

// Approve overtime
router.put(
  "/hrd/lembur/:id/approve",
  authMiddleware,
  roleMiddleware("hrd"),
  HrdLemburController.approveLembur,
);

// Reject overtime
router.put(
  "/hrd/lembur/:id/reject",
  authMiddleware,
  roleMiddleware("hrd"),
  HrdLemburController.rejectLembur,
);

export default router;
