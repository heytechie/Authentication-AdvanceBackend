import { AppError } from "../../../utils/error/AppError.js";
import {authRepository} from "../auth.repository.js";
import { authPermissionCache } from "./auth.permission.cache.js";

export class AuthPermissionService{
    constructor(private authRepo : authRepository){}

    async getEffectivePermissions(userId:string){
        const cached = await authPermissionCache.get(userId);

        if(cached){
            return cached;
        }

        const user = await this.authRepo.getUserPermissions(userId);
        if(!user){
            throw new AppError("User not found",404);
        }

        const roles = user.userRoles.map(userRole => userRole.role.name);
        
        const permissions = user.userRoles.flatMap(userRole=>userRole.role.rolePermissions.map(rolePermission=>rolePermission.permission.name))


        const result =  {
            userId: user.id,
            roles:[... new Set(roles)],
            permissions:[... new Set(permissions)]
        }

        await authPermissionCache.set(userId,result)

    }
}