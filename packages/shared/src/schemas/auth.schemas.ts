import { z } from "zod";

// Primitives
export const emailSchema = z.email("Invalid email").trim().toLowerCase();
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Needs a lowercase letter")
  .regex(/[A-Z]/, "Needs an uppercase letter")
  .regex(/[0-9]/, "Needs a number");
export const nameSchema = z.string().trim().min(2).max(80);
export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores");

// Auth forms
export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const signinSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

// Profile forms
export const updateMeSchema = z.object({
  name: nameSchema,
  email:emailSchema,
  // Later we will add this in controllers
  // username: usernameSchema,
  // avatarUrl: z.url().max(500).nullable(),
  // bio: z.string().trim().max(300).nullable(),
});

export const patchMeSchema = updateMeSchema.partial().refine(
  (d) => Object.keys(d).length > 0,
  { message: "At least one field is required" }
);

export const deleteMeSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

// Password recovery forms
export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Token is required"),
  password: passwordSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ["newPassword"],
    message: "New password must be different",
  });

// Types
export type Signup = z.infer<typeof signupSchema>;
export type Signin = z.infer<typeof signinSchema>;
export type UpdateMe = z.infer<typeof updateMeSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
