import CryptoJS from "crypto-js";



export const encodeString = async (plainText) => {
  const SECRET_KEY = process.env.ENC_SECRET_KEY;
  return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
};

export const decodeString = (cipherText) => {
  const SECRET_KEY = process.env.ENC_SECRET_KEY;
  return CryptoJS.AES.decrypt(cipherText, SECRET_KEY).toString(CryptoJS.enc.Utf8);
};