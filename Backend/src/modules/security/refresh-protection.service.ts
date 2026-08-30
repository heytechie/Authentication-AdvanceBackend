import redis from "../../lib/redis.js";
import { AppError } from '../../utils/error/index.js'
import crypto from "crypto";

const LOCK_TTL_SECONDS = 10; // 10 seconds lockout period

const getRefreshLockKey = (refreshToken: string) => {
    return `auth:refresh-lock:${refreshToken}`;
}
const RELEASE_LOCK_SCRIPT = `
  if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
  end

  return 0
`;
export const refreshProtectionService = {
    async acquireLock(refreshToken: string): Promise<string> {
        const lockKey = getRefreshLockKey(refreshToken);
        const lockValue = crypto.randomUUID(); // Generate a unique value for the lock
        const lockAcquired = await redis.set(lockKey,
            lockValue,
            "EX",
            LOCK_TTL_SECONDS,
            "NX"
        )

        if (lockAcquired !== "OK") {
            throw new AppError("Refresh Reqquest already in progress", 409);
        }

        return lockValue; // Return the unique value for the lock
    },

    async releaseLock(refreshToken: string,lockValue: string): Promise<void> {
        const lockKey = getRefreshLockKey(refreshToken);
        await redis.eval(RELEASE_LOCK_SCRIPT, 1, lockKey, lockValue);
    },

    validateSession(session: {
        isRevoked: boolean;
        expiresAt: Date;
    }): void {
        if (session.isRevoked ) {
            throw new AppError(
                "Session is no longer valid",
                401,
            );
        }

        if (session.expiresAt.getTime() <= Date.now()) {
            throw new AppError(
                "Refresh session has expired",
                401,
            );
        }
    },

    logRefreshReuse(data: { userId: string, sessionId: string, }): void {
        console.warn(
            `Refresh token reuse detected. userId=${data.userId} sessionId=${data.sessionId}`,
        );
    },

    logSuspiciousRefreshActivity(data: { userId: string, sessionId: string,currentUserAgent: string,previousUserAgent: string }): void {
        console.warn(
            `Suspicious refresh detected. userId=${data.userId} sessionId=${data.sessionId}`,
            data,
        );
    }
}