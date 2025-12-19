import jwt from "jsonwebtoken"

export const createToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
  return token;
};

export const verifyToken = (token) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET) || null;
  return payload;
};
