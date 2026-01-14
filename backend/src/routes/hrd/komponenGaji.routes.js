import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import KomponenGajiController from "../../controllers/hrd/komponenGaji.controller.js";

const router = Router();

// Get semua komponen gaji
router.get(
  "/hrd/komponen-gaji",
  authMiddleware,
  roleMiddleware("hrd"),
  KomponenGajiController.getAll
);

// Get komponen gaji by ID
router.get(
  "/hrd/komponen-gaji/:id",
  authMiddleware,
  roleMiddleware("hrd"),
  KomponenGajiController.getById
);

// Create komponen gaji
router.post(
  "/hrd/komponen-gaji",
  authMiddleware,
  roleMiddleware("hrd"),
  KomponenGajiController.create
);

// Update komponen gaji
router.put(
  "/hrd/komponen-gaji/:id",
  authMiddleware,
  roleMiddleware("hrd"),
  KomponenGajiController.update
);

// Delete komponen gaji
router.delete(
  "/hrd/komponen-gaji/:id",
  authMiddleware,
  roleMiddleware("hrd"),
  KomponenGajiController.delete
);

export default router;
