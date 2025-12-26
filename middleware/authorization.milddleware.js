import { UnAuthorizedException } from '../../utils/response/error.response.js';

export const authorizeUser = (allowedRoles = []) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      throw new UnAuthorizedException('Unauthorized');
    }

    if (!allowedRoles.length) {
      return next(); 
    }

    if (!allowedRoles.includes(user.role)) {
      throw new UnAuthorizedException('Access denied');
    }

    next();
  };
};