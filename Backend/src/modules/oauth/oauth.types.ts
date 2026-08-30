export type GoogleOAuthResult = {
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
};