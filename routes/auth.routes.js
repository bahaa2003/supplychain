import express from "express";
import { register } from "../controllers/auth/register.controller.js";
import { verifyEmail } from "../controllers/auth/verifyEmail.controller.js";
import { resendVerificationEmail } from "../controllers/auth/resendVerificationEmail.controller.js";
import { login } from "../controllers/auth/login.controller.js";
import { logout } from "../controllers/auth/logout.controller.js";
import { enable2FA } from "../controllers/auth/enable2fa.controller.js";
import { verify2FA } from "../controllers/auth/verify2fa.controller.js";
import { confirm2FALogin } from "../controllers/auth/confirm2faLogin.controller.js";
import { forgotPassword } from "../controllers/auth/forgotPassword.controller.js";
import { resetPassword } from "../controllers/auth/resetPassword.controller.js";
import { catchError } from "../utils/catchError.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { completeRegistration } from "../controllers/auth/completeRegistration.controller.js";
import { registerCompanyValidator } from "../validators/registerCompany.validator.js";

import { validationExecution } from "../middleware/validation.middleware.js";
const router = express.Router();

router.post(
  "/register",
  registerCompanyValidator(),
  validationExecution,
  catchError(register)
);
router.post("/login", catchError(login));
router.post("/logout", protectedRoute, catchError(logout));

router.post("/enable-2fa", protectedRoute, catchError(enable2FA));
router.post("/verify-2fa", protectedRoute, catchError(verify2FA));
router.post("/confirm-2fa-login", catchError(confirm2FALogin));

router.post("/forgot-password", catchError(forgotPassword));
router.post("/reset-password", catchError(resetPassword));

router.patch("/complete-registration", catchError(completeRegistration));
router.get("/verify/:token", catchError(verifyEmail));
router.get(
  "/resend-verification",
  protectedRoute,
  catchError(resendVerificationEmail)
);

export default router;
