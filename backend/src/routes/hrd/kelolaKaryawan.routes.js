import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import KelolaKaryawanController from "../../controllers/hrd/kelolaKaryawan.controller.js";

const router = Router();

// Get semua users (untuk halaman Data Users - manage akun)
router.get(
  "/hrd/users",
  authMiddleware,
  roleMiddleware("hrd"),
  KelolaKaryawanController.getUsers
);

// Get karyawan saja (role=karyawan) dengan profil + gaji
router.get(
  "/hrd/karyawan",
  authMiddleware,
  roleMiddleware("hrd"),
  KelolaKaryawanController.getKaryawanOnly
);

// Update gaji pokok
router.put(
  "/hrd/karyawan/:id/gaji-pokok",
  authMiddleware,
  roleMiddleware("hrd"),
  KelolaKaryawanController.updateGajiPokok
);

export default router;
