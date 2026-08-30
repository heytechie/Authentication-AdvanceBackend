import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.config.js";
import type {JWTPayload} from "../../modules/auth/auth.types.js";

const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET;
const JWT_ACCESS_TOKEN_EXPIRATION = env.JWT_ACCESS_TOKEN_EXPIRATION;
const JWT_REFRESH_TOKEN_EXPIRATION = env.JWT_REFRESH_TOKEN_EXPIRATION;

export const signJwt = (payload: JWTPayload):string=>{
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: `${JWT_ACCESS_TOKEN_EXPIRATION}` as SignOptions["expiresIn"]
    })
}

export const signRefreshJwt = (payload: JWTPayload):string=>{
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn:  `${JWT_REFRESH_TOKEN_EXPIRATION}` as SignOptions["expiresIn"]
    })
}

export const verifyAccessToken = (token: string):JWTPayload | null=>{
    try{
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload;
        return decoded;
    }catch(err){
        return null;
    }
}

export const verifyRefreshToken = (token:string):JWTPayload | null=>{
    try{
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
        return decoded;
    }catch(err){
        return null;
    }
}