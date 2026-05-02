import { Role } from "../../types/enum";

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IOtpVerifyPayload {
  email: string;
  otp: string;
}

export interface IResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface IChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface ITokenPayload {
  id: string;
  email: string;
  role: Role;
}

export interface IOAuthProfile {
  googleId?: string;
  facebookId?: string;
  name: string;
  email: string;
  avatar?: string;
}