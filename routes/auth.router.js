import express from "express";
import { signIn, signUp, verify } from "../controller/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup",signUp);
authRouter.post("/signin" ,signIn);
authRouter.get("/verify/:token", verify);

export default authRouter;
