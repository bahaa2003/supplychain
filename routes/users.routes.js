import express from "express";
import { getAllEmployee } from "../controllers/users/users.controller.js";
import { catchError } from "../utils/catchError.js";
import {
  protectedRoute,
  allowedTo,
  checkEmailVerified,
} from "../middlewares/auth.middleware.js";
import {
  getUserAvatar,
  updateUserAvatar,
  deleteUserAvatar,
} from "../controllers/users/avatar.controller.js";

import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();
router.use(protectedRoute);

router.get("/get-all-employee", allowedTo("admin"), catchError(getAllEmployee));

router.get("/:id/avatar", protectedRoute, catchError(getUserAvatar));

router.patch(
  "/:id/avatar",
  protectedRoute,
  checkEmailVerified,
  allowedTo("admin"),
  upload.single("avatar"),
  catchError(updateUserAvatar)
);

router.delete(
  "/:id/avatar",
  protectedRoute,
  checkEmailVerified,
  allowedTo("admin"),
  catchError(deleteUserAvatar)
);

export default router;
