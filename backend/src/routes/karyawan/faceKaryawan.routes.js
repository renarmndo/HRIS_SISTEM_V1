import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import FaceKaryawanController from "../../controllers/karyawan/face_karyawan.controller.js";

const router = Router();

// registrasi wajah
router.post(
  "/karyawan/face",
  authMiddleware,
  roleMiddleware("karyawan"),
  FaceKaryawanController.registerFace
);

// update face
router.put(
  "/karyawan/face",
  authMiddleware,
  roleMiddleware("karyawan"),
  FaceKaryawanController.updateFace
);

// get
router.get(
  "/karyawan/face",
  authMiddleware,
  roleMiddleware("karyawan"),
  FaceKaryawanController.getFaceData
);

export default router;
