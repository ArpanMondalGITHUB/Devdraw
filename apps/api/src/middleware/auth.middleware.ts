import type{ ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import {config} from "../config/config"


export class ApiError extends Error{
    constructor(public statusCode:number,message:string){
        super(message);
    }
}

export const validate =
  (schema: ZodType, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }
    Object.assign(req[source], result.data); // keep trimmed/lowercased values
    next();
};

export const errorHandler = (
  err:unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  // Prisma unique-constraint violation → duplicate email race lost
  if (typeof err === "object" && err !== null && (err as any).code === "P2002") {
    return res.status(409).json({ message: "Email already registered" });
  }
  console.error(err); // real logging: swap for pino when you need it
  return res.status(500).json({ message: "Internal server error" });
};


export const requireAuth = async(req:Request,res:Response , next:NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ","");
  if(!token) throw new ApiError(401,"Not authorized");
  try {
    const payload = jwt.verify(token,config.jwtSecret) as {sub:string};
    (req as any).userId = payload.sub;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
};
