import type { Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto"
import { config } from "../config/config";
import { prisma } from "@devdraw/prisma";

const REFRESH_DAYS = 30;

export const issueTokens = async (userId:string,res:Response) => {
    // create the accesstoken
    const accessToken =  jwt.sign({sub:userId},config.jwtSecret,{expiresIn:"15min"});

    // create the refreshToken
    const refreshToken = crypto.randomBytes(32).toString("hex");

    // save the RefreshToken
    await prisma.refreshToken.create({
        data:{
            token:refreshToken,
            userId,
            expiresAt:new Date(Date.now() +  REFRESH_DAYS * 86_400_000)
        }
    });
    
    // set the cookies
    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:config.isProduction,
        sameSite:"lax",
        maxAge:REFRESH_DAYS*86_400_000,
        path: "/api/v1/auth",
    });

    // return accesstoken
    return accessToken;
};