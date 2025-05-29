import express from "express";
import { createPlatformAdmin } from "../controllers/setup/createPlatformAdmin.controller.js";
import { catchError } from "../utils/catchError.js";

const router = express.Router();

router.post('/create-platform-admin', catchError(createPlatformAdmin));

export default router;
