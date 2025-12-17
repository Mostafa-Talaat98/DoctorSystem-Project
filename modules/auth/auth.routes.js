import { Router } from 'express';
import validateRequest from '../middleware/validateRequest.middleware.js';
import { otpValidationSchema, signInWithEmailSchema, signInWithPhoneSchema, signUpSchema } from './auth.schema.js';

const authRouter = Router();
// > auth/register
// function ====> validate as middleleware
// comapre betwwen schema and the data from body

authRouter.post('/register', validateRequest(signUpSchema), (req, res) => {});
authRouter.post('/login', validateRequest(signInWithPhoneSchema), (req, res) => {});
authRouter.post('/confirm-login', validateRequest(otpValidationSchema), (req, res) => {});


export default authRouter;
