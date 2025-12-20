import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import KelolaKaryawanController from "../../controllers/hrd/kelolaKaryawan.controller.js";

const router = Router();

//get
router.get(
  "/hrd/add-karyawan",
  authMiddleware,
  roleMiddleware("hrd"),
  KelolaKaryawanController.getKaryawan
);

export default router;
