import express from "express";
import { getAllEmployee } from "../controllers/users/users.controller.js";
import { catchError } from "../utils/catchError.js";
import { roles } from "../enums/role.enum.js";
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

router.get(
  "/get-all-employee",
  allowedTo(roles.ADMIN),
  catchError(getAllEmployee)
);

router.get("/:employeeId/avatar", protectedRoute, catchError(getUserAvatar));

router.patch(
  "/:employeeId/avatar",
  protectedRoute,
  checkEmailVerified,
  allowedTo(roles.ADMIN),
  upload.single("avatar"),
  catchError(updateUserAvatar)
);

router.delete(
  "/:employeeId/avatar",
  protectedRoute,
  checkEmailVerified,
  allowedTo(roles.ADMIN),
  catchError(deleteUserAvatar)
);

export default router;
