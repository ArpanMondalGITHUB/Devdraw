import { ApiError } from './../middleware/auth.middleware';
import type { Request, Response } from "express";
import {prisma} from "@devdraw/prisma"
import { issueTokens } from "../services/auth.services";
import { config } from "../config/config";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
   // take the data using req.body
   const{ name, email, password} = req.body;

   // check for the existingUser
   const existingUser = await prisma.user.findUnique({where:{email},select:{id:true}});
   if(existingUser) throw new ApiError(409,"Email already registered");

   // hash password
   const hashPassword = await Bun.password.hash(password);

   // create the user
   const user = await prisma.user.create({
      data:{name,email,password:hashPassword},
      select:{id:true,name:true,email:true,createdAt:true}
   });

   // auto login
   const accessToken = await issueTokens(user.id,res);

   res.status(201).json({user,accessToken})

};

export const signin = async (req: Request, res: Response) => {
   // get the data from the form
   const { email, password } = req.body;

   // check user in db 
   const user = await prisma.user.findUnique({ where: { email } });
   if(!user || !await (Bun.password.verify(password,user.password))) 
      throw new ApiError(401,"Invalid email or password");

   // get tokens
   const accessToken = await issueTokens(user.id,res);
   
   // removes the password
   const {password:_,...safeUser} = user;

   res.json({user:safeUser,accessToken})
};

export const refresh = async (req: Request, res: Response) => {
   // get refreshtoken
   const token = req.cookies?.refreshToken;
   if(!token) throw new ApiError(401,"no refresh token");
   
   
   const existingToken = await prisma.refreshToken.findUnique({where:{token}});
   if(!existingToken || existingToken.expiresAt < new Date())
      throw new ApiError(401,"Invalid or expired refresh token");

   const accessToken = jwt.sign({ sub: existingToken.userId }, config.jwtSecret!, { expiresIn: "15m" });

   res.json({accessToken})
};

export const logout = async (req: Request, res: Response) => {
   const token = req.cookies?.refreshToken;
   if(token) await prisma.refreshToken.deleteMany({where:{token}});
   res.clearCookie("refreshToken", { path: "/api/v1/auth" });
   res.json({message:"logged out"})
};

export const logoutall = async (req: Request, res: Response) => {
   if (!(req as any).userId) throw new ApiError(401, "Not authenticated");
   await prisma.refreshToken.deleteMany({ where: { userId: (req as any).userId } });
   res.clearCookie("refreshToken",{ path: "/api/v1/auth" });
   res.json({ message: "Logged out everywhere" });
};
