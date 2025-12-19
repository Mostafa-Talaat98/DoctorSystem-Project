export const verifyGmailAccount = async (idToken) => {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.WEB_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email_verified) {
    throw new BadRequestException('Fail To Verify This Account');
  }
  return payload;
};
