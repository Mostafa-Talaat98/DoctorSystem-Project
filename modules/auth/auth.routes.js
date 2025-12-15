import { Router } from 'express';
import validateRequest from '../middleware/validateRequest.middleware.js';
import { loginSchema, registerSchema } from './auth.schema.js';

const authRouter = Router();
// > auth/register
// function ====> validate as middleleware
// comapre betwwen schema and the data from body
authRouter.post('/register', validateRequest(registerSchema), (req, res) => {});
authRouter.post('/login', validateRequest(loginSchema), (req, res) => {});

export default authRouter;
