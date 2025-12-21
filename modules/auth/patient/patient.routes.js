import { Router } from 'express';
import { patientSignUpSchema, registerWithGoogleSchema } from '../auth.schema.js';
import { patientRegisterWithGmail, registerPatient } from './patient.controller.js';
import { validateRequest } from '../../middleware/validateRequest.middleware.js';

const patientRouter = Router();

patientRouter.post('/patient/register', validateRequest(patientSignUpSchema), registerPatient);

patientRouter.post('/patient/google/register', validateRequest(registerWithGoogleSchema), patientRegisterWithGmail);

export default patientRouter;
