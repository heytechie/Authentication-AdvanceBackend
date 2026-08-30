import redis from '../../lib/redis.js';

const MAX_ATTEMPTS = 5;
const FAILED_ATTEMPT_WINDOW = 15 * 60; // 1 hour in seconds

const getFailureKey = (email:string,ip:string) => {
    return `login-failures:${email}:${ip}`;
}

export const loginLockoutService = {
    async requiresCaptcha(email:string, ip:string): Promise<boolean> {
        const key = getFailureKey(email, ip);
        const failures = await redis.get(key);
        return (Number(failures)??0)>= MAX_ATTEMPTS;
    },


    async recordFailure(email:string, ip:string): Promise<void> {
        const key = getFailureKey(email, ip);
        const failures = await redis.incr(key);
        if (failures === 1) {
            await redis.expire(key, FAILED_ATTEMPT_WINDOW);
        }
    },

    async clearFailures(email:string, ip:string): Promise<void> {
        const key = getFailureKey(email, ip);
        await redis.del(key);
    }
}