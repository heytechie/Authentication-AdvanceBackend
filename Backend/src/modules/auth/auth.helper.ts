import crypto from "node:crypto";

export const generateSessionId = (): string => {
  return crypto.randomUUID();
};

export const hashRefreshToken = (
  refreshToken: string,
): string => {
  return crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
};