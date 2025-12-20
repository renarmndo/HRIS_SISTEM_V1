import { Router } from "express";
import AuthController from "../../controllers/auth/authController.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/roleAccess.js";

const router = Router();

// register
router.post(
  "/auth/register",
  authMiddleware,
  roleMiddleware("hrd"),
  AuthController.register
);

// login
router.post("/auth/login", AuthController.login);

// update password
router.put(
  "/hrd/add-karyawan/:id",
  authMiddleware,
  roleMiddleware("hrd"),
  AuthController.updatePassword
);

// delete
router.delete(
  "/hrd/delete-user/:id",
  authMiddleware,
  roleMiddleware("hrd"),
  AuthController.deleteUser
);

export default router;
