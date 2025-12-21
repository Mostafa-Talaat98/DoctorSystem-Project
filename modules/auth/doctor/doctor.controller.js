import { Router } from 'express';
import { doctorSignUpSchema, registerWithGoogleSchema } from '../auth.schema.js';
import { validateRequest } from '../../middleware/validateRequest.middleware.js';
import { doctorRegisterWithGmail, registerDoctor } from './doctor.service.js';

const doctorRouter = Router();

doctorRouter.post('/doctor/register', validateRequest(doctorSignUpSchema), registerDoctor);

doctorRouter.post('/doctor/google/register', validateRequest(registerWithGoogleSchema), doctorRegisterWithGmail);

export default doctorRouter;
