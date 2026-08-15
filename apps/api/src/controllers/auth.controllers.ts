import { ApiError } from "../middleware/auth.middleware";
import type { Request, Response } from "express";
import {
  findUserByEmail,
  findRefreshToken,
  createUser,
  deleteRefreshToken,
  deleteAllRefreshTokens,
} from "@devdraw/db";
import { issueTokens } from "../services/auth.services";
import { config } from "../config/config";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new ApiError(409, "Email already registered");

  const hashPassword = await Bun.password.hash(password);

  const user = await createUser({ name, email, password: hashPassword });

  const accessToken = await issueTokens(user.id, res);

  res.status(201).json({ user, accessToken });
};

export const signin = async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  const user = await findUserByEmail(email);
  if (!user || !(await Bun.password.verify(password, user.password)))
    throw new ApiError(401, "Invalid email or password");

  const accessToken = await issueTokens(user.id, res, rememberMe ?? true);

  const { password: _, ...safeUser } = user;

  res.json({ user: safeUser, accessToken });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token");

  const stored = await findRefreshToken(token);
  if (!stored || stored.expiresAt < new Date())
    throw new ApiError(401, "Invalid or expired refresh token");

  const accessToken = jwt.sign({ sub: stored.userId }, config.jwtSecret, { expiresIn: "15m" });

  res.json({ accessToken });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (token) await deleteRefreshToken(token);
  res.clearCookie("refreshToken", { path: "/api/v1/auth" });
  res.json({ message: "Logged out" });
};

export const logoutall = async (req: Request, res: Response) => {
  if (!(req as any).userId) throw new ApiError(401, "Not authenticated");
  await deleteAllRefreshTokens((req as any).userId);
  res.clearCookie("refreshToken", { path: "/api/v1/auth" });
  res.json({ message: "Logged out everywhere" });
};
