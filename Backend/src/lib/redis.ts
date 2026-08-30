import {Redis} from 'ioredis';
import {env} from '../config/env.config.js'
import {logger} from '../config/logger.js'

const redis = new Redis({
    host: env.Redis_URL,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
})

redis.on('connect', () => {
    logger.info('Redis connected');
})

redis.on('error', () => {
    logger.error('Redis error');
})

export default redis;