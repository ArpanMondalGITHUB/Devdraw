import { z } from "zod"

export const idSchema = z.uuid("Invalid id");

export const emailSchema = z.email("Invalid email").trim().toLowerCase();

export const passwordSchema = z
.string()
.min(8,"Password must be at least 8 characters")
.max(72,"Password must be at most 72 characters")
.regex(/[a-z]/,"Needs a lower case letter")
.regex(/[A-Z]/,"Needs a uppercase case letter")
.regex(/[0-9]/,"Needs a number");

export const tokenSchema = z.string().trim().min(1,"Tokekn is required");

export const nameSchema = z.string().trim().min(2).max(80);

export const usernameSchema = z
.string()
.trim()
.min(3)
.max(30)
.regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores");

export const userRoleSchema =  z.enum(["user","admin"]);

// Auth / Session

export const signupSchema = z.object({
    name:nameSchema,
    email:emailSchema,
    password:passwordSchema
});

export const signinSchema = z.object({
    email:emailSchema,
    password:z.string().min(1,"Password is required")
});

export const refreahTokenSchema = z.object({
    refreshToken:tokenSchema
});

// Current user

export const updateMeSchema = z.object({
    name:nameSchema,
    username:usernameSchema,
    avatarUrl: z.url().max(500).nullable(),
     bio: z.string().trim().max(300).nullable(),
});

export const patchMeSchema = updateMeSchema.partial().refine(
    (d) => Object.keys(d).length > 0,
    { message: "At least one field is required" }
);

export const deleteMeSchema = z.object({
  password: z.string().min(1, "Password is required"),
});


// User CRUD ADMIN 

export const userIdParamsSchema = z.object({id:idSchema});

export const listUsersQuerySchema = z.object({
    page:z.coerce.number().int().min(1).default(1),
    limit:z.coerce.number().int().min(1).max(100).default(20),
    role:userRoleSchema.optional(),
    sortBy:z.enum(["createdAt","email","name"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createUserSchema = signupSchema.extend({
    usename:usernameSchema.optional(),
    role:userRoleSchema.default("user")
});

export const updateUserSchema = z.object({
    name:nameSchema,
    username:usernameSchema.nullable(),
    email:emailSchema,
    role:userRoleSchema,
    avatarUrl:z.url().max(500).nullable(),
    bio:z.string().trim().max(300).nullable()
});

export const patchUserSchema = updateUserSchema.partial().refine(
  (d) => Object.keys(d).length > 0,
  { message: "At least one field is required" }
);


// Password recovery

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
    token:tokenSchema,
    password:passwordSchema
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

export const verifyEmailQuerySchema = z.object({ token: tokenSchema });

export const googleCallbackQuerySchema = z.object({
  code: z.string().trim().min(1).optional(),
  state: z.string().trim().optional(),
  error: z.string().optional(), // Google sends error instead of code on denial
});


export type Signup = z.infer<typeof signupSchema>;
export type Signin = z.infer<typeof signinSchema>;
export type UpdateMe = z.infer<typeof updateMeSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;