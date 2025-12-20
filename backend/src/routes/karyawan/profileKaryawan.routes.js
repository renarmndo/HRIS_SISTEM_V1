import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import DataDiriKaryawan from "../../controllers/karyawan/dataDiri.controller.js";

const router = Router();

// create
router.post(
  "/karyawan/profile",
  authMiddleware,
  roleMiddleware("karyawan"),
  DataDiriKaryawan.create
);

// update
router.put(
  "/karyawan/profile",
  authMiddleware,
  roleMiddleware("karyawan"),
  DataDiriKaryawan.update
);

// GET
router.get(
  "/karyawan/profile",
  authMiddleware,
  roleMiddleware("karyawan"),
  DataDiriKaryawan.getProfile
);

export default router;
