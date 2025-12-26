import { Router } from 'express';
import { doctorSignUpSchema, registerWithGoogleSchema } from '../auth.schema.js';
import { validateRequest } from '../../../middleware/validateRequest.middleware.js';
import { doctorRegisterWithGmail, registerDoctor } from './doctor.service.js';

const doctorAuthRouter = Router();

doctorAuthRouter.post('/doctor/register', validateRequest(doctorSignUpSchema), registerDoctor);

doctorAuthRouter.post('/doctor/google/register', validateRequest(registerWithGoogleSchema), doctorRegisterWithGmail);

export default doctorAuthRouter;
