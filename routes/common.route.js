import { protectedRoute } from "./../middlewares/auth.middleware.js";
import { getEnum } from "../controllers/common/getEnum.controller.js";
import express from "express";
const router = express.Router();

router.get("/enums/:enumName", protectedRoute, getEnum);

export default router;
