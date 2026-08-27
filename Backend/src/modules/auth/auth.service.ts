import ms from 'ms';
import { env } from "../../config/env.config.js";

import { generateSessionId, hashRefreshToken,generateVerificationToken,hashVerificationToken } from './auth.helper.js';
import { IAuthRepository } from "./auth.interface.js";
import { RegisterUserDto, LoginUserDto } from "./auth.schema.js";
import { signJwt, signRefreshJwt } from "../../utils/auth/jwt.js"
import { hashPassword, comparePassword } from '../../utils/auth/password.js'
import { BadRequestError } from "../../utils/error/index.js"
import { sanitizedUserResponse } from "./auth.response.js"
import { captchaService } from "../security/captcha.service.js";
import { emailQueue } from '../../queue/email.queue.js';
import { AuthProvider } from '../../generated/prisma/edge.js';

export class AuthService {
    constructor(private readonly authRepository: IAuthRepository) { }


    async createAuthenticatedSession(userId: string, userAgent: string, ipAddress: string) {
        const sessionId = generateSessionId();

        //access token
        const accessToken = signJwt({
            sub: userId,
            sessionId
        })

        //refresh token
        const refreshToken = signRefreshJwt({
            sub: userId,
            sessionId
        })

        const hashedRefreshToken = hashRefreshToken(refreshToken);

        const refreshTokenExpiresIn = ms(env.JWT_REFRESH_TOKEN_EXPIRATION as ms.StringValue);

        if (typeof refreshTokenExpiresIn !== "number") {
            throw new Error("Invalid refresh token expiration value");
        }

        const expiresAt = new Date(Date.now() + refreshTokenExpiresIn);

        await this.authRepository.createSession({
            id: sessionId,
            userId,
            refreshTokenHash: hashedRefreshToken,
            userAgent,
            ipAddress,
            expiresAt
        })

        return {
            accessToken,
            refreshToken
        }
    }

    async createEmailVerificationToken(userId:string){
        const rawToken = generateVerificationToken();
        const hashedToken = hashVerificationToken(rawToken)

        const verificationTokenExpiresIn = ms(
            env.EMAIL_VERIFICATION_TOKEN_EXPIRATION as ms.StringValue
        )

        if(typeof verificationTokenExpiresIn !== "number"){
            throw new Error(
                "Invalid email verification token expiry config"
            )
        }
        
        const expiresAt = new Date(
            Date.now()+verificationTokenExpiresIn
        )

        await this.authRepository.createEmailVerificationToken(
            userId,
            hashedToken,
            expiresAt
        )

        return rawToken
    }
    async registerUser(userData: RegisterUserDto & { userAgent: string, ipAddress: string }) {
        try {
            await captchaService.verifyTurnstileToken(
                userData.captchaToken,
                userData.ipAddress,
            );
            const existingUser = await this.authRepository.findUserByEmail(userData.email);
            if (existingUser) {
                throw new BadRequestError("User with this email already exists");
            }
            const hashedPassword = await hashPassword(userData.password);



            const newUser = await this.authRepository.createUser({ name: userData.name, email: userData.email, hashedPassword });
            
            await this.authRepository.createAuthAccount({
                userId: newUser.id,
                provider: AuthProvider.EMAIL,
                providerAccountId: newUser.id
            })


            const verificationToken = await this.createEmailVerificationToken(
                newUser.id
            )

            await emailQueue.add('VERIFY_EMAIL',{
                type:"VERIFY-EMAIL",
                email:newUser.email,
                name:newUser.name,
                verificationToken
            })

            const authSession = await this.createAuthenticatedSession(newUser.id, userData.userAgent, userData.ipAddress);

            return {
                user: sanitizedUserResponse(newUser),
                ...authSession
            }
        } catch (error) {
            throw new BadRequestError("Failed to register user");
        }
    }

    async loginUser(loginData: LoginUserDto & { userAgent: string, ipAddress: string }) {
        try {
            const user = await this.authRepository.findUserByEmail(loginData.email);
            if (!user) {
                throw new BadRequestError("Invalid email or password");
            }
            const isPasswordValid = await comparePassword(loginData.password, user.passwordHash as string);
            if (!isPasswordValid) {
                throw new BadRequestError("Invalid password");
            }
            const authSession = await this.createAuthenticatedSession(user.id, loginData.userAgent, loginData.ipAddress);

            return {
                user: sanitizedUserResponse(user),
                ...authSession
            }
        } catch (err) {
            throw new BadRequestError("Failed to login user");
        }   

    }



}
