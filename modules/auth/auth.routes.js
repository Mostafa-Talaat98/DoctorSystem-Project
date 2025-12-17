import { Router } from "express";
import { register } from "./auth.controller.js";
import validateRequest from "../../middleware/validateRequest.js";
import { verifyEmailOtp } from "./auth.controller.js";
const authRouter = Router();
// > auth/register
// function ====> validate as middleleware
// comapre betwwen schema and the data from body
authRouter.post("/register", validateRequest(signUpSchema), register);
authRouter.post("/verifyEmailOtp", verifyEmailOtp);
export default authRouter;
