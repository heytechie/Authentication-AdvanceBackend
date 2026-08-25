import { AuthProvider, AuthAccount,User,Session } from "../../generated/prisma/index.js";

import {
    createUserType,
    userSessionType,
    findUserByIdType,
    linkAuthType,
    updateSessionType,
    createSessionType,
    userPermissionsType,
} from './auth.types.js'


export interface IAuthRepository {
    findUserByEmail(email: string): Promise<User | null>;

    findUserById(userId: string): Promise<findUserByIdType | null>;

    
    findSessionById(sessionId: string): Promise<userSessionType | null>;
    findUserByUserIdandSessionId(userId: string, sessionId: string): Promise<Session | null>;
    revokeUserAllSessions(userId: string): Promise<void>;
    
    createUser(data: createUserType): Promise<AuthAccount>;
    createSession(data:createSessionType): Promise<userSessionType>;
    updateSession(sessionId: string, data: updateSessionType): Promise<Session>;
    deleteSession(sessionId: string): Promise<void>;
    deleteUserAllSessions(userId: string): Promise<void>;
    getUserPermissions(userId: string): Promise<userPermissionsType | null>;

    findAuthAccount(provider: AuthProvider, providerAccountId: string): Promise<AuthAccount | null>;
    createAuthAccount(
    data: AuthAccount,
  ): Promise<AuthAccount>;

  linkAuthAccount(
    data: linkAuthType,
  ): Promise<AuthAccount>;
}