import { Router } from "express";
import { roleMiddleware } from "../../middleware/roleAccess.js";
import LokasiPerusahaanController from "../../controllers/hrd/lokasiPerusahaan.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

// create
router.post(
  "/hrd/lokasi",
  authMiddleware,
  roleMiddleware("hrd"),
  LokasiPerusahaanController.create
);

router.put(
  "/hrd/lokasi/:id",
  authMiddleware,
  roleMiddleware("hrd"),
  LokasiPerusahaanController.update
);

// get
router.get(
  "/hrd/lokasi",
  authMiddleware,
  roleMiddleware("hrd"),
  LokasiPerusahaanController.getData
);

export default router;
