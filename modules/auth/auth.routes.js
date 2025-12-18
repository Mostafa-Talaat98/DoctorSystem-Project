import { Router } from "express";
import { patientSignUpSchema, doctorSignUpSchema } from "./auth.schema.js";
import { asyncHandler } from "../../utils/catchAsync.js";
import { registerPatient } from "./patient/auth.controller.js";
import { registerDoctor } from "./doctor/auth.controller.js";
import validateRequest  from "../middleware/validateRequest.middleware.js";

const authRouter = Router();
// > auth/register
// function ====> validate as middleleware
// comapre betwwen schema and the data from body

/*                      Doctor                       */

authRouter.post('/doctor/register', validateRequest(doctorSignUpSchema), asyncHandler(registerDoctor));
/*                      Patient                       */

authRouter.post('/patient/register', validateRequest(patientSignUpSchema), asyncHandler(registerPatient));
/*                      Shared                       */

// authRouter.post('/verifyEmailOtp', sendVerifyEmailOtp);


export default authRouter;
