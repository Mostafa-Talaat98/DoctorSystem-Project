import { Router } from "express";
import { register, verifyPhoneOtp } from "./auth.controller.js";
import validateRequest from "../../middleware/validateRequest.js";
import { signUpSchema } from "./auth.schema.js";

const authRouter = Router();

authRouter.post("/register", validateRequest(signUpSchema), register);
authRouter.post("/verifyPhoneOtp", verifyPhoneOtp);

export default authRouter;
