import type { Request, Response, NextFunction } from 'express';
import redis from '../../lib/redis.js';
import { AppError } from '../../utils/error/index.js';

type RateLimitConfig={
    keyPrefix: string;
    limit: number;
    windowSeconds: number;
}

export const createRateLimit = (config: RateLimitConfig) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try{
            const identifier = req.ip;
            const key = `rate-limit:${config.keyPrefix}:${identifier}`;
            const current = await redis.incr(key);

            if (current === 1) {
                await redis.expire(key, config.windowSeconds);
            }
            
            const ttl = await redis.ttl(key);

            const remaining = Math.max(0, config.limit - current);

            res.setHeader('X-RateLimit-Limit', config.limit);
            res.setHeader('X-RateLimit-Remaining', remaining);

            if (current > config.limit) {
                res.setHeader('Retry-After', ttl);
                throw new AppError('Too many requests, please try again later.', 429);
            }

            next();
        }catch(err){
            next(err);
        }
    }
}