import ms from "ms";

export const setResponseCookie = (res, key, payload, httpOnly, durationInMS) => {
  res.cookie(key, payload, {
    httpOnly: httpOnly,
    sameSite: 'strict',
    maxAge: ms(durationInMS),
    secure: process.env.NODE_ENV === 'production',
  });
};
