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

export const generateVerificationToken=():string=>{
  return crypto.randomBytes(32).toString('hex')
}

export const hashVerificationToken=(token:string):string=>{
  return crypto
  .createHash('sha256')
  .update(token)
  .digest('hex')
}