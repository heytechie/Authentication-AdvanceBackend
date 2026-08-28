import { AuthProvider, AuthAccount,User,Session,EmailVerificationToken } from "../../generated/prisma/index.js";

import {
    createUserType,
    userSessionType,
    findUserByIdType,
    linkAuthType,
    updateSessionType,
    createSessionType,
    userPermissionsType,
    LinkAuthAccountType,
} from './auth.types.js'


export interface IAuthRepository {
    findUserByEmail(email: string): Promise<User | null>;

    findUserById(userId: string): Promise<findUserByIdType | null>;

    
    findSessionById(sessionId: string): Promise<Session | null>;
    findSessionByUserIdandSessionId(userId: string, sessionId: string): Promise<Session | null>;
    revokeUserAllSessions(userId: string): Promise<void>;
    
    createUser(data: createUserType): Promise<User>;
    createSession(data:createSessionType): Promise<Session>;
    updateSession(sessionId: string, data: updateSessionType): Promise<Session>;
    deleteSession(sessionId: string): Promise<void>;
    deleteUserAllSessions(userId: string): Promise<void>;
    getUserPermissions(userId: string): Promise<userPermissionsType | null>;

    findAuthAccount(provider: AuthProvider, providerAccountId: string): Promise<AuthAccount | null>;
    createAuthAccount(
    data: LinkAuthAccountType,
  ): Promise<AuthAccount>;

  linkAuthAccount(
    data: linkAuthType,
  ): Promise<AuthAccount>;

  createEmailVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ):Promise<EmailVerificationToken>;

  findEmailVerificationToken(token: string): Promise<EmailVerificationToken | null>;

  deleteEmailVerificationToken(token: string): Promise<void>;

  verifyUserEmail(userId: string): Promise<void>;
}