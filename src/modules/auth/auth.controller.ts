import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import {
  registerService,
  loginService,
  logoutService,
  refreshTokenService,
  getMeService,
  oauthLoginService,
} from "./auth.service";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await registerService(req.body);
  res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
  sendResponse(res, 201, true, "Registration successful", {
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await loginService(req.body);
  res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
  sendResponse(res, 200, true, "Login successful", {
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  await logoutService(req.user!.id);
  res.clearCookie("refreshToken");
  sendResponse(res, 200, true, "Logged out successfully");
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await refreshTokenService(token);
  res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
  sendResponse(res, 200, true, "Token refreshed", {
    accessToken: result.accessToken,
  });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await getMeService(req.user!.id);
  sendResponse(res, 200, true, "Profile fetched", user);
});

export const oauthCallback = catchAsync(
  async (req: Request, res: Response) => {
    const { accessToken, refreshToken } = await oauthLoginService(req.user);
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    // frontend এ redirect করে token পাঠাও
    res.redirect(
      `${process.env.CLIENT_URL}/oauth-success?token=${accessToken}`
    );
  }
);