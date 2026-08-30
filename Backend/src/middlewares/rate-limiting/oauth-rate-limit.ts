import { createRateLimit } from "./rate-limit.middleware.js";

export const googleOAuthRateLimit = createRateLimit({
  keyPrefix: "google-oauth",
  limit: 20,
  windowSeconds: 60,
});