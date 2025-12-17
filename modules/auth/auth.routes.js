import { Router } from "express";
import { register } from "./auth.controller.js";
import { verifyPhoneOtp } from "./auth.controller.js";
const authRouter = Router();
// > auth/register
// function ====> validate as middleleware
// comapre betwwen schema and the data from body
authRouter.post("/register", validateRequest(registerSchema), register);
authRouter.post("/verifyPhoneOtp", verifyPhoneOtp);
export default authRouter;
