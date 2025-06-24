import express from "express";
import { inviteUser } from "../controllers/team/invite.controller.js";
import { verifyInvite } from "../controllers/team/verifyInvite.controller.js";
import {
  protectedRoute,
  allowedTo,
  checkEmailVerified,
} from "../middlewares/auth.middleware.js";
import { catchError } from "../utils/catchError.js";

const router = express.Router();

router.post(
  "/invite",
  protectedRoute,
  checkEmailVerified,
  allowedTo("admin"),
  catchError(inviteUser)
);

router.get("/verify-invite/:token", catchError(verifyInvite));

export default router;
