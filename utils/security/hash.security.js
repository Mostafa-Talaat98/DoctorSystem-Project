import bcrypt from "bcrypt";

const SALT_ROUNDS = 12 ;

export const hashString = async (plainText) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(plainText, salt); 
  return hash;
};

export const compareHash = async (plainText, hashedValue) => {
  return await bcrypt.compare(plainText, hashedValue);
};