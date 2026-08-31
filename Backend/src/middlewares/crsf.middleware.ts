import type {Request, Response, NextFunction} from 'express';
import {CSRF_COOKIE_NAME, CSRF_HEADER_NAME} from '../modules/security/csrf.service.js'
import {AppError} from '../utils/error/index.js'

export const csrfProtectionMiddleware = (req:Request,res:Response,next:NextFunction)=>{
    try{
        const csrfTokenFromCookie = req.cookies[CSRF_COOKIE_NAME];
        const csrfTokenFromHeader = req.headers[CSRF_HEADER_NAME];

        if(!csrfTokenFromCookie || !csrfTokenFromHeader){
            throw new AppError('CSRF token missing', 403);
        }

        if(csrfTokenFromCookie !== csrfTokenFromHeader){
            throw new AppError('CSRF token mismatch -> Invalid token', 403);
        }

        next();
    }catch(err){
        next(err)
    }
}