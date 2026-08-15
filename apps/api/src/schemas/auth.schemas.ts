import { z } from "zod";

// Backend-only schemas (no form behind these on the frontend)
export const idSchema = z.uuid("Invalid id");
export const tokenSchema = z.string().trim().min(1, "Token is required");
export const userRoleSchema = z.enum(["user", "admin"]);
export const refreshTokenSchema = z.object({ refreshToken: tokenSchema });

export const userIdParamsSchema = z.object({ id: idSchema });

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  role: userRoleSchema.optional(),
  sortBy: z.enum(["createdAt", "email", "name"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  username: z.string().trim().min(3).max(30).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: userRoleSchema.default("user"),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  username: z.string().trim().min(3).max(30).nullable(),
  email: z.string().email(),
  role: userRoleSchema,
  avatarUrl: z.url().max(500).nullable(),
  bio: z.string().trim().max(300).nullable(),
});

export const patchUserSchema = updateUserSchema.partial().refine(
  (d) => Object.keys(d).length > 0,
  { message: "At least one field is required" }
);

export const verifyEmailQuerySchema = z.object({ token: tokenSchema });

export const googleCallbackQuerySchema = z.object({
  code: z.string().trim().min(1).optional(),
  state: z.string().trim().optional(),
  error: z.string().optional(),
});
