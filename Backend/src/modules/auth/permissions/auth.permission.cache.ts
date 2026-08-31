import { RoleName } from '../../../generated/prisma/index.js';
import redis from '../../../lib/redis.js'

const PERMISSION_CACHE_TTL_SECONDS = 5*60;

const getPermissionCacheString = (
    userId :string
)=>{
    return `auth:permissions:${userId}`
}

type CachedPermissions = {
  userId: string;
  roles: RoleName[];
  permissions: string[];
};

export const authPermissionCache = {
    async get(userId:string):Promise<CachedPermissions|null>{
        const key = getPermissionCacheString(userId);
        const cached = await redis.get(key);

        if(!cached)return null;

        return JSON.parse(cached) as {
            userId : string,
            roles: RoleName[],
            permissions:string[]
        }
    },


    async set(userId:string,data:CachedPermissions){
        const key = getPermissionCacheString(userId);

        await redis.set(
            key,
            JSON.stringify(data),
            'EX',
            PERMISSION_CACHE_TTL_SECONDS
        )
    },


    async invalidateCache(userId:string){
        const key = getPermissionCacheString(userId)

        await redis.del(key);
    }
}