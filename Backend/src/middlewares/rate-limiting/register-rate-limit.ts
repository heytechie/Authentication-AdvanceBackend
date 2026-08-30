import { createRateLimit } from "./rate-limit.middleware.js";


export const registerRateLimit = createRateLimit({
    keyPrefix: 'register',
    limit: 5,
    windowSeconds: 60
});