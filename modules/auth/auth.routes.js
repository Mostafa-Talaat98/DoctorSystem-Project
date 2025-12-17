import { Router } from "express";
import { register } from "./auth.controller";

const authRouter = Router();
// > auth/register
// function ====> validate as middleleware
// comapre betwwen schema and the data from body
authRouter.post("/register", validateRequest(registerSchema), register);

export default authRouter;
