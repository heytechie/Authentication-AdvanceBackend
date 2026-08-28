import { googleOauthClient } from "../../lib/google.js";
import { generateOAuthState } from "./oauth.helper.js";
import  type { GoogleUserProfile } from './oauth.dto.js';
import { google } from "googleapis";
import { AuthProvider } from "../../generated/prisma/client.js";
import { AuthService } from '../auth/auth.service.js'
import { AppError } from '../../utils/error/AppError.js'
import { authRepository } from "../auth/auth.repository.js";

export class OauthService {
    constructor(private readonly authRepo: authRepository, private readonly authService: AuthService) { }


    generateGoogleAuthUrl() {
        const state = generateOAuthState();
        const client = googleOauthClient();
        const url = client.generateAuthUrl({
            access_type: "offline",
            scope: [
                "openid",
                "profile",
                "email"
            ],
            state,
            prompt: 'select_account'
        })

        return { url, state };
    }

  

    async getGoogleUserProfile(code: string): Promise<GoogleUserProfile> {
        const client = googleOauthClient();
        const {tokens} = await client.getToken(code);
        client.setCredentials(tokens);

        const oauth2 = google.oauth2({
            auth: client,
            version: "v2"
        })

        const { data } = await oauth2.userinfo.get();
        if (!data.id || !data.email || data.verified_email === undefined) {
            throw new AppError("Failed to retrieve user profile from Google",400);
        }

        return {
            providerAccountId: data.id,
            email: data.email,
            name: data.name ?? undefined,
            picture: data.picture ?? undefined,
            emailVerified: data.verified_email ?? false
        }
    }


    async authenticateUser(
        profile: GoogleUserProfile,
        userAgent: string,
        ipAddress: string
    ) {
        if (!profile.emailVerified) {
            throw new AppError("Google email is not verified ", 403);
        }

        //check if this account is already linked to a user
        const existingAuthAccount = await this.authRepo.findAuthAccount(
            AuthProvider.GOOGLE,
            profile.providerAccountId
        );

        if (existingAuthAccount) {
            const authSession = await this.authService.createAuthenticatedSession(
                existingAuthAccount.userId,
                userAgent,
                ipAddress
            )


            return {
                user: existingAuthAccount.userId,
                ...authSession
            }
        }

        const existingUser = await this.authRepo.findUserByEmail(profile.email);
        let useraccount;

        if (existingUser) {
            useraccount = existingUser;

            await this.authRepo.createAuthAccount({
                userId: useraccount.id,
                provider: AuthProvider.GOOGLE,
                providerAccountId: profile.providerAccountId,
            });
        }else{
            useraccount = await this.authRepo.createUser({
                name: profile.name ?? "Google User",
                email: profile.email,
                hashedPassword: null,
                isEmailVerified: true
            });

            await this.authRepo.createAuthAccount({
                userId: useraccount.id,
                provider: AuthProvider.GOOGLE,
                providerAccountId: profile.providerAccountId,
            })
        }

        const authSession = await this.authService.createAuthenticatedSession(
            useraccount.id,
            userAgent,
            ipAddress
        );

        return {
            user: useraccount,
            ...authSession
        }
    }
}


