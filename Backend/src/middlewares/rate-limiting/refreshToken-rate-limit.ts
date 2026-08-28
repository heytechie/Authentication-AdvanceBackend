import { createRateLimit } from "./rate-limit.middleware.js";

export const refreshTokenRateLimit = createRateLimit({
  keyPrefix: "refresh",
  limit: 20,
  windowSeconds: 60,
});