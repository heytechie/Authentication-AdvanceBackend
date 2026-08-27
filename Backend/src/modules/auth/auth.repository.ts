import { date } from "zod";
import {
    AuthAccount,
    AuthProvider,
    EmailVerificationToken,
    Session,
    User,
} from "../../generated/prisma/client.js";

import { prisma } from "../../lib/prisma.js";

import { IAuthRepository } from "./auth.interface.js";

import {
    AuthAccountWithUser,
    createSessionType,
    createUserType,
    findUserByIdType,
    LinkAuthAccountType,
    linkAuthType,
    updateSessionType,
    userPermissionsType,
} from "./auth.types.js";

export class authRepository implements IAuthRepository {
    async findUserByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: {
                email
            }
        })
    }

    async findUserById(userId: string): Promise<findUserByIdType | null> {
        return await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        })
    }

    async findUserByUserIdandSessionId(userId: string, sessionId: string): Promise<Session | null> {
        return await prisma.session.findFirst({
            where: {
                userId,
                id: sessionId
            }
        })
    }

    async findSessionById(sessionId: string): Promise<Session | null> {
        return await prisma.session.findUnique({
            where: {
                id: sessionId
            }
        })
    }

    async revokeUserAllSessions(userId: string): Promise<void> {
        await prisma.session.updateMany({
            where: {
                userId,
                isRevoked: false
            },
            data: {
                isRevoked: true,
                revokedAt: new Date()
            }
        })
    }

    async createUser(data: createUserType): Promise<User> {
        return await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: data.hashedPassword
            }
        })
    }

    async createSession(data: createSessionType): Promise<Session> {
        return await prisma.session.create({
            data: {
                id: data.id,
                userId: data.userId,
                refreshTokenHash: data.refreshTokenHash,
                userAgent: data.userAgent,
                ipAddress: data.ipAddress,
                expiresAt: data.expiresAt
            }
        })
    }

    async updateSession(sessionId: string, data: updateSessionType): Promise<Session> {
        return await prisma.session.update({
            where: {
                id: sessionId
            },
            data: {
                refreshTokenHash: data.hashedNewRefreshToken,
                expiresAt: data.newRefreshTokenExpiresAt
            }
        })
    }

    async deleteSession(sessionId: string): Promise<void> {
        await prisma.session.delete({
            where: {
                id: sessionId
            }
        })
    }

    async deleteUserAllSessions(userId: string): Promise<void> {
        await prisma.session.deleteMany({
            where: {
                userId
            }
        })
    }

    async getUserPermissions(userId: string): Promise<userPermissionsType | null> {
        return await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
                userRoles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                rolePermissions: {
                                    select: {
                                        permission: {
                                            select: {
                                                id: true,
                                                name: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    }

    async findAuthAccount(provider: AuthProvider, providerAccountId: string): Promise<AuthAccount | null> {
        return await prisma.authAccount.findUnique({
            where: {
                provider_providerAccountId: {
                    provider,
                    providerAccountId
                }
            }
        })
    }

    async createAuthAccount(data: LinkAuthAccountType): Promise<AuthAccount> {
        return await prisma.authAccount.create({
            data
        })
    }

    async linkAuthAccount(data: linkAuthType): Promise<AuthAccount> {
        return await prisma.authAccount.create({
            data: {
                userId: data.userId,
                provider: data.provider,
                providerAccountId: data.providerAccountId
            }
        })
    }

    async createEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<EmailVerificationToken> {
        return await prisma.emailVerificationToken.create({
            data: {
                userId,
                token,
                expiresAt
            }
        })
    }

    async findEmailVerificationToken(token: string): Promise<EmailVerificationToken | null> {
        return await prisma.emailVerificationToken.findUnique({
            where: {
                token
            }
        })
    }

    async deleteEmailVerificationToken(token: string): Promise<void> {
        await prisma.emailVerificationToken.delete({
            where: {
                id: token
            }
        })
    }


    async verifyUserEmail(userId: string): Promise<void> {
        await prisma.user.update({
            where: {
                id: userId
            },

            data: {
                isEmailVerified: true
            }

        })
    }

}