// src/modules/auth/auth.service.ts

import ms from "ms";

import { env } from "../../config/env.config.js";
import { AuthProvider } from "../../generated/prisma/client.js";

import {
  generateSessionId,
  hashRefreshToken,
  generateVerificationToken,
  hashVerificationToken,
} from "./auth.helper.js";

import {
  RegisterUserDto,
  LoginUserDto,
} from "./auth.schema.js";

import {
  signJwt,
  signRefreshJwt,
  verifyRefreshToken,
} from "../../utils/auth/jwt.js";

import {
  hashPassword,
  comparePassword,
} from "../../utils/auth/password.js";

import {
  BadRequestError,
  UnauthorizedError,
  AppError,
} from "../../utils/error/index.js";

import { sanitizedUserResponse } from "./auth.response.js";

import { captchaService } from "../security/captcha.service.js";

import { emailQueue } from "../../queue/email.queue.js";

import { authRepository } from "./auth.repository.js";
import type { userSessionType } from "./auth.types.js";
import { loginLockoutService } from "../security/login-lockout.service.js";
import { refreshProtectionService } from "../security/refresh-protection.service.js";

export class AuthService {
  constructor(
    private readonly authRepository: authRepository,
  ) { }

  async createAuthenticatedSession(
    userId: string,
    userAgent: string,
    ipAddress: string,
  ) {
    const sessionId = generateSessionId();

    // Access token
    const accessToken = signJwt({
      sub: userId,
      sessionId,
    });

    // Refresh token
    const refreshToken = signRefreshJwt({
      sub: userId,
      sessionId,
    });

    // Store only the hash of the refresh token
    const hashedRefreshToken =
      hashRefreshToken(refreshToken);

    const refreshTokenExpiresIn = ms(
      env.JWT_REFRESH_TOKEN_EXPIRATION as ms.StringValue,
    );

    if (typeof refreshTokenExpiresIn !== "number") {
      throw new Error(
        "Invalid refresh token expiration value",
      );
    }

    const expiresAt = new Date(
      Date.now() + refreshTokenExpiresIn,
    );

    await this.authRepository.createSession({
      id: sessionId,
      userId,
      refreshTokenHash: hashedRefreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async createEmailVerificationToken(
    userId: string,
  ) {
    const rawToken =
      generateVerificationToken();

    const hashedToken =
      hashVerificationToken(rawToken);

    const verificationTokenExpiresIn = ms(
      env.EMAIL_VERIFICATION_TOKEN_EXPIRATION as ms.StringValue,
    );

    if (
      typeof verificationTokenExpiresIn !==
      "number"
    ) {
      throw new Error(
        "Invalid email verification token expiry config",
      );
    }

    const expiresAt = new Date(
      Date.now() + verificationTokenExpiresIn,
    );

    await this.authRepository
      .createEmailVerificationToken(
        userId,
        hashedToken,
        expiresAt,
      );

    return rawToken;
  }

  async registerUser(
    userData: RegisterUserDto & {
      userAgent: string;
      ipAddress: string;
    },
  ) {
    // 1. Verify CAPTCHA
    await captchaService.verifyTurnstileToken(
      userData.captchaToken,
      userData.ipAddress,
    );

    // 2. Check if email already exists
    const existingUser =
      await this.authRepository.findUserByEmail(
        userData.email,
      );

    if (existingUser) {
      throw new BadRequestError(
        "User with this email already exists",
      );
    }

    // 3. Hash password
    const hashedPassword =
      await hashPassword(
        userData.password,
      );

    // 4. Create user
    const newUser =
      await this.authRepository.createUser({
        name: userData.name,
        email: userData.email,
        hashedPassword,
      });

    // 5. Create EMAIL auth account
    await this.authRepository.createAuthAccount({
      userId: newUser.id,
      provider: AuthProvider.EMAIL,
      providerAccountId: newUser.id,
    });

    // 6. Create email verification token
    const verificationToken =
      await this.createEmailVerificationToken(
        newUser.id,
      );

    // 7. Queue verification email
    await emailQueue.add("VERIFY-EMAIL", {
      type: "VERIFY-EMAIL",
      email: newUser.email,
      name: newUser.name,
      verificationToken,
    });

    // 8. Create authenticated session
    const authSession =
      await this.createAuthenticatedSession(
        newUser.id,
        userData.userAgent,
        userData.ipAddress,
      );

    return {
      user: sanitizedUserResponse(newUser),
      ...authSession,
    };
  }

  async loginUser(
    loginData: LoginUserDto & {
      userAgent: string;
      ipAddress: string;
    },
  ) {

    const requiresCaptcha = await loginLockoutService.requiresCaptcha(
      loginData.email,
      loginData.ipAddress
    );

    if (requiresCaptcha && !loginData.captchaToken) {
      await captchaService.verifyTurnstileToken(
        loginData.captchaToken!,
        loginData.ipAddress
      );
    }
    // 1. Find user
    const user =
      await this.authRepository.findUserByEmail(
        loginData.email,
      );


    // 2. Don't reveal whether account exists
    if (!user || !user.passwordHash) {

      await loginLockoutService.recordFailure(
        loginData.email,
        loginData.ipAddress
      )
      throw new UnauthorizedError(
        "Invalid email or password",
      );
    }

    // 3. Compare password
    const isPasswordValid =
      await comparePassword(
        loginData.password,
        user.passwordHash,
      );

    if (!isPasswordValid) {
      await loginLockoutService.recordFailure(
        loginData.email,
        loginData.ipAddress
      )
      throw new UnauthorizedError(
        "Invalid email or password",
      );
    }


    await loginLockoutService.clearFailures(
      loginData.email,
      loginData.ipAddress
    )

    // 4. Create authenticated session
    const authSession =
      await this.createAuthenticatedSession(
        user.id,
        loginData.userAgent,
        loginData.ipAddress,
      );

    return {
      user: sanitizedUserResponse(user),
      ...authSession,
    };
  }


  async refreshSession(
    refreshToken: string,
    userAgent?: string
  ) {
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    await refreshProtectionService.acquireLock(payload.sessionId);

    try {
      const session =
        await this.authRepository.findSessionById(
          payload.sessionId,
        );

      if (!session) {
        throw new UnauthorizedError(
          "Session not found",
        );
      }

      refreshProtectionService.validateSession(session);


      if (
        userAgent &&
        session.userAgent &&
        userAgent !== session.userAgent
      ) {
        refreshProtectionService.logSuspiciousRefreshActivity({
          userId: session.userId,
          sessionId: session.id,
          previousUserAgent: session.userAgent,
          currentUserAgent: userAgent,
        });
      }

      const incomingRefreshTokenHash =
        hashRefreshToken(refreshToken);

      if (
        incomingRefreshTokenHash !==
        session.refreshTokenHash
      ) {
        refreshProtectionService.logRefreshReuse({
          userId: session.userId,
          sessionId: session.id,
        });

        await this.authRepository.revokeUserAllSessions(
          session.userId,
        );

        throw new UnauthorizedError(
          "Refresh token reuse detected",
        );
      }

      const newAccessToken = signJwt({
        sub: session.userId,
        sessionId: session.id,
      });

      const newRefreshToken = signRefreshJwt({
        sub: session.userId,
        sessionId: session.id,
      });

      const hashedNewRefreshToken =
        hashRefreshToken(newRefreshToken);

      const refreshTokenExpiresIn = ms(
        env.JWT_REFRESH_TOKEN_EXPIRATION as ms.StringValue,
      );

      if (typeof refreshTokenExpiresIn !== "number") {
        throw new Error(
          "Invalid refresh token expiration value",
        );
      }

      const newRefreshTokenExpiresAt = new Date(
        Date.now() + refreshTokenExpiresIn,
      );

      await this.authRepository.updateSession(
        session.id,
        {
          hashedNewRefreshToken,
          newRefreshTokenExpiresAt,
        },
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } finally {
      await refreshProtectionService.releaseLock(
        payload.sessionId,
      );
    }
  }

  async getLoggedInUser(data: userSessionType) {
    const user = await this.authRepository.findUserById(data.userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user
  }

  async logoutUser(data: userSessionType) {
    const session = await this.authRepository.findSessionByUserIdandSessionId(data.userId, data.sessionId);

    if (!session) {
      throw new AppError("Session not found", 404);
    }

    await this.authRepository.deleteSession(session.id);
  }

  async logOutAll(userId: string) {
    await this.authRepository.revokeUserAllSessions(userId);
  }


  //verify email
  async verifyEmail(token: string) {
    const hashedToken = hashVerificationToken(token);

    const emailVerificationToken = await this.authRepository.findEmailVerificationToken(hashedToken);

    if (!emailVerificationToken) {
      throw new BadRequestError("Invalid or expired email verification token");
    }

    if (emailVerificationToken.expiresAt < new Date()) {
      await this.authRepository.deleteEmailVerificationToken(hashedToken);
      throw new BadRequestError("Email verification token has expired");
    }

    await this.authRepository.verifyUserEmail(emailVerificationToken.userId);

    await this.authRepository.deleteEmailVerificationToken(hashedToken);

    return {
      message: "Email verified successfully"
    }
  }

}