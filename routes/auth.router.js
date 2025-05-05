import express from "express";
import { signIn, signUp } from "../controller/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup",signUp);
authRouter.post("/signin" ,signIn);

export default authRouter;
