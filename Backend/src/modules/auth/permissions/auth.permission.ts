import { AppError } from "../../../utils/error/AppError.js";
import {authRepository} from "../auth.repository.js";

export class AuthPermissionService{
    constructor(private authRepo : authRepository){}

    async getEffectivePermissions(userId:string){
        const user = await this.authRepo.getUserPermissions(userId);
        if(!user){
            throw new AppError("User not found",404);
        }

        const roles = user.userRoles.map(userRole => userRole.role.name);
        
        const permissions = user.userRoles.flatMap(userRole=>userRole.role.rolePermissions.map(rolePermission=>rolePermission.permission.name))

        return {
            userId: user.id,
            roles:[... new Set(roles)],
            permissions:[... new Set(permissions)]
        }

    }
}