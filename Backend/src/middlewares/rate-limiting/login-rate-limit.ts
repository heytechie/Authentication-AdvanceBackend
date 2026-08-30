import { createRateLimit } from "./rate-limit.middleware.js";


export const loginRateLimit = createRateLimit({
    keyPrefix: 'login',
    limit: 10,
    windowSeconds: 60
});