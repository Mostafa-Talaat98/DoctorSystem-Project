import jwt from 'jsonwebtoken';
import { UnAuthorizedException } from '../../utils/response/error.response.js';
import DoctorModel from '../../DB/models/DoctorSchema.js';
import PatientModel from '../../DB/models/patientSchema.js';
import { verifyToken } from '../../utils/security/jwtToken.js';

/**
 * @description Middleware to validate a JWT token, fetch the user, and attach it to req.user
 * @param {Array} models - Array of Mongoose models to search (e.g. [Doctor, Patient])
 * @param {string} tokenHeader - Header name where JWT is sent (default: "authorization")
 */
export const authenticateUser = (models = [DoctorModel, PatientModel], tokenHeader = 'authorization') => {
  return async (req, res, next) => {
    const authHeader = req.headers[tokenHeader];

    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw new UnAuthorizedException('Missing or invalid authorization header');

    const token = authHeader.split(' ')[1];

    const payload = verifyToken(token);
    if (!payload) throw new UnAuthorizedException('Invalid or expired token');

    const { userId } = payload;
    if (!userId) throw new UnAuthorizedException('Invalid token payload');

    let user = null;
    for (const model of models) {
      user = await model.findById(userId);
      if (user) break;
    }

    if (!user) throw new UnAuthorizedException('User not found');

    if (!user.isVerified) throw new UnAuthorizedException('Account not verified');

    req.user = user;

    next();
  };
};
