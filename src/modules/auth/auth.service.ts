import bcrypt from "bcryptjs";
import { db } from "../../config/db";
import { AppError } from "../../utils/apiError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/generateToken";
import { Role } from "../../types/enum";

// ─── Register ──────────────────────────────────────────────────────────────────
export const registerService = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}) => {
  const existing = await db.user.findUnique({
    where: { email: payload.email },
  });
  if (existing) throw new AppError("Email already registered", 409);

  const hashed = await bcrypt.hash(payload.password, 12);

  const user = await db.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashed,
      phone: payload.phone,
      role: (payload.role as Role) ?? Role.USER,
      isEmailVerified: true,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  const tokenPayload = { id: user.id, email: user.email, role: user.role as Role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  await db.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { user, accessToken, refreshToken };
};

// ─── Login ─────────────────────────────────────────────────────────────────────
export const loginService = async (payload: {
  email: string;
  password: string;
}) => {
  const user = await db.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) throw new AppError("Invalid credentials", 401);
  if (!user.password)
    throw new AppError("Please use Google or Facebook login", 400);
  if (!user.isActive) throw new AppError("Account is inactive", 403);

  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) throw new AppError("Invalid credentials", 401);

  const tokenPayload = { id: user.id, email: user.email, role: user.role as Role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  await db.user.update({
    where: { id: user.id },
    data: { refreshToken, lastLoginAt: new Date() },
  });

  const { password, refreshToken: _rt, otp, otpExpiry, resetToken, resetTokenExpiry, emailVerifyToken, emailVerifyExpiry, ...safeUser } = user;

  return { user: safeUser, accessToken, refreshToken };
};

// ─── Logout ────────────────────────────────────────────────────────────────────
export const logoutService = async (userId: string) => {
  await db.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};

// ─── Refresh Token ─────────────────────────────────────────────────────────────
export const refreshTokenService = async (token: string) => {
  if (!token) throw new AppError("Refresh token required", 401);

  const decoded = verifyRefreshToken(token);
  const user = await db.user.findUnique({ where: { id: decoded.id } });

  if (!user || user.refreshToken !== token)
    throw new AppError("Invalid refresh token", 401);

  const tokenPayload = { id: user.id, email: user.email, role: user.role as Role };
  const accessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  await db.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  return { accessToken, refreshToken: newRefreshToken };
};

// ─── Get Me ────────────────────────────────────────────────────────────────────
export const getMeService = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

// ─── OAuth Login (Google / Facebook) ──────────────────────────────────────────
export const oauthLoginService = async (oauthUser: any) => {
  const tokenPayload = {
    id: oauthUser.id,
    email: oauthUser.email,
    role: oauthUser.role as Role,
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  await db.user.update({
    where: { id: oauthUser.id },
    data: { refreshToken, lastLoginAt: new Date() },
  });

  return { accessToken, refreshToken };
};