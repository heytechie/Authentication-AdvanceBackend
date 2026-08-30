import {NextFunction, Request, Response} from "express";
import {AppError} from '../utils/error/index.js'
import { AuthPermissionService } from "../modules/auth/permissions/auth.permission.js";
import { authRepository } from "../modules/auth/auth.repository.js"


const authPermissionService = new AuthPermissionService(new authRepository());

export const authorize=(requiredPermissions:string)=>{
    return async (req:Request,res:Response,next:NextFunction)=>{
        try{
            if(!req.user){
                throw new AppError("User not authenticated",401);
            }
            const access = await authPermissionService.getEffectivePermissions(req.user.userId);
            const hasPermission = access.permissions.includes(requiredPermissions);
            if(!hasPermission){
                throw new AppError("User not authorized",403);
            }
            req.user.roles = access.roles;
            req.user.permissions = access.permissions;
            next();

        }catch(err){
            next(err);
        }
    }
}