import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import LemburController from "../../controllers/karyawan/lembur.controller.js";

const router = Router();

// Create overtime request
router.post(
  "/karyawan/lembur",
  authMiddleware,
  roleMiddleware("karyawan"),
  LemburController.createLembur,
);

// Get own overtime history
router.get(
  "/karyawan/lembur",
  authMiddleware,
  roleMiddleware("karyawan"),
  LemburController.getMyLembur,
);

// Delete pending overtime
router.delete(
  "/karyawan/lembur/:id",
  authMiddleware,
  roleMiddleware("karyawan"),
  LemburController.deleteLembur,
);

export default router;
