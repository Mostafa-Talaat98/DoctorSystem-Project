import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.ENC_SECRET_KEY; 

export const encodeString = async (plainText) => {
  return  CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
};

export const decodeString = (cipherText) => {
  return CryptoJS.AES.decrypt(cipherText, SECRET_KEY).toString(CryptoJS.enc.Utf8);
};