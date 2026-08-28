import redis from "../../lib/redis.js";
import { AppError } from '../../utils/error/index.js'

const LOCK_TTL_SECONDS = 10; // 10 seconds lockout period

const getRefreshLockKey = (refreshToken: string) => {
    return `auth:refresh-lock:${refreshToken}`;
}

export const refreshProtectionService = {
    async acquireLock(refreshToken: string): Promise<void> {
        const lockKey = getRefreshLockKey(refreshToken);
        const lockAcquired = await redis.set(lockKey,
            "1",
            "EX",
            LOCK_TTL_SECONDS,
            "NX"
        )

        if (lockAcquired !== "OK") {
            throw new AppError("Refresh Reqquest already in progress", 409);
        }
    },

    async releaseLock(refreshToken: string): Promise<void> {
        const lockKey = getRefreshLockKey(refreshToken);
        await redis.del(lockKey);
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