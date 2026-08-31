import redis from '../../lib/redis.js';
import crypto from 'crypto';
import {LOGIN_LOCKOUT_SCRIPT} from './login-lockout.script.js';
const ACCOUNT_MAX_FAILURES = 5;
const IP_MAX_FAILURES = 20;
const FAILED_ATTEMPT_WINDOW = 15 * 60; // 15 minutes in seconds

const hashIdentifier = (value:string): string => {
    return crypto.createHash('sha256').update(value).digest('hex')
}

const normalizeEmail = (email:string): string => {
    return email.trim().toLowerCase();
}
const getFailureKey = (email:string) => {
    const hashedEmail = hashIdentifier(normalizeEmail(normalizeEmail(email)));
    return `auth:login-failures:account:${hashedEmail}`;
}

const getIpFailureKey = (ip:string) => {
    const hashedIp = hashIdentifier(ip);
    return `auth:login-failures:ip:${hashedIp}`;
}
export const loginLockoutService = {
    async requiresCaptcha(email:string, ip:string): Promise<boolean> {
        const accountKey = getFailureKey(email);
        const ipKey = getIpFailureKey(ip);
        
        const [accountFailures,ipFailures] = await Promise.all([
            redis.get(accountKey) ,
            redis.get(ipKey)
        ]);
        return (Number(accountFailures)??0)>= ACCOUNT_MAX_FAILURES || (Number(ipFailures)??0)>= IP_MAX_FAILURES;
    },


    async recordFailure(email:string, ip:string): Promise<void> {
        const accountKey = getFailureKey(email);
        const ipKey = getIpFailureKey(ip);
        redis.eval(LOGIN_LOCKOUT_SCRIPT, 2, accountKey, ipKey, FAILED_ATTEMPT_WINDOW.toString());
    },

    async clearFailures(email:string, ip:string): Promise<void> {
      const accountKey = getFailureKey(email);
      const ipKey = getIpFailureKey(ip);
      await redis.del(accountKey, ipKey);
    }
}