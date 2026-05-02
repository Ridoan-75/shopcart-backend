import crypto from "crypto";

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const getOTPExpiry = (minutes = 5): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};