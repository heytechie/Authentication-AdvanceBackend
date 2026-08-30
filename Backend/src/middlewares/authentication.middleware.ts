import {NextFunction, Request, Response} from "express";
import { verifyAccessToken } from "../utils/auth/jwt.js";
import {AppError} from "../utils/error/AppError.js";
import { authRepository } from "../modules/auth/auth.repository.js";

const authRepo = new authRepository();

export const authenticate = async(req: Request, _res: Response, next: NextFunction) => {
    try{
        const authorizationHeader = req.headers.authorization;
        if(!authorizationHeader) {
            throw new AppError("Authentication required", 401);
        }

        const [scheme,token] = authorizationHeader.split(" ");
        if(scheme !== "Bearer" || !token) {
            throw new AppError("Invalid authorization header", 401);
        }

        const payload = verifyAccessToken(token);
        if(!payload) {
            throw new AppError("Invalid or expired token", 401);
        }

        const session = await authRepo.findSessionByUserIdandSessionId(payload.sub, payload.sessionId);
        if(!session){
            throw new AppError("Session not found", 401);
        }

        if(session.isRevoked || session.expiresAt < new Date()) {
            throw new AppError("Session expired or revoked", 401);
        }

        req.user = {
            userId : payload.sub,
            sessionId: payload.sessionId
        }

        next();


    }catch(err){
        next(err);
    }
}