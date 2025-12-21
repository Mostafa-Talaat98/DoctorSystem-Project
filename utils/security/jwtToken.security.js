import jwt from "jsonwebtoken";
import ms from "ms";
import { UnAuthorizedException } from "../response/error.response.js";
import RefreshTokenModel from "../../DB/models/refreshToken.model.js";
import { Token } from "../types/token/token.types.js";

export const getAuthConfig = (type) => {
  const isAccess = type === "ACCESS_TOKEN";
  return {
    key: isAccess
      ? process.env.ACCESS_TOKEN_KEY
      : process.env.REFRESH_TOKEN_KEY,
    secret: isAccess
      ? process.env.ACCESS_TOKEN_SECRET
      : process.env.REFRESH_TOKEN_SECRET,
    duration: isAccess
      ? process.env.ACCESS_TOKEN_DURATION
      : process.env.REFRESH_TOKEN_DURATION,
  };
};

export const verifyToken = (tokenType, token) => {
  const { secret } = getAuthConfig(tokenType);
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new UnAuthorizedException(`Invalid or expired ${tokenType}`);
  }
};

export const createToken = async (payload, tokenType, userId = null) => {
  const { secret, duration } = getAuthConfig(tokenType);

  const token = jwt.sign(payload, secret, { expiresIn: duration });

  if (tokenType === Token.REFRESH_TOKEN && userId) {
    await RefreshTokenModel.create({
      token,
      userId,
      expiresAt: new Date(Date.now() + ms(duration)),
    });
  }

  return token;
};

export const validateToken = async (req, models, tokenType) => {
  const { key } = getAuthConfig(tokenType);
  const token = req.cookies[key];
  const payload = verifyToken(tokenType, token);

  if (tokenType === Token.REFRESH_TOKEN) {
    const storedToken = await RefreshTokenModel.findOne({ token });
    if (!storedToken)
      throw new UnAuthorizedException("Session expired or does not exist");
    if (storedToken.isRevoked)
      throw new UnAuthorizedException("This session has been revoked");
  }

  let user = null;

  for (const model of models) {
    user = await model.findById(payload.userId).lean();

    if (user) {
      user.role = model.modelName.toLowerCase() ;
      break;
    }
  }

  

  if (!user) throw new UnAuthorizedException("User no longer exists");

  return user;
};
