import { DoctorModel } from '../../DB/models/doctor.model.js';
import { PatientModel } from '../../DB/models/patient.model.js';
import { UnAuthorizedException } from '../../utils/response/error.response.js';
import { validateToken } from '../../utils/security/jwtToken.security.js';
import { Token } from '../../utils/types/token/token.types.js';

export const authenticateUser = (models = [DoctorModel, PatientModel]) => {
  return async (req, res, next) => {
    
    const user = await validateToken(req, models, Token.ACCESS_TOKEN);

    if (!user.isVerified) throw new UnAuthorizedException('Account not verified');

    req.user = user;

    next();
  };
};
