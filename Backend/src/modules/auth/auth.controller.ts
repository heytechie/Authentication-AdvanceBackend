import { Request, Response } from "express";

import { AuthService } from "./auth.service.js";
// import { RegisterUserDto, LoginUserDto } from "./auth.schema.js";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "./auth.cookie.js";
import { BadRequestError } from "../../utils/error/index.js";


export class AuthController {
    constructor(private readonly authService: AuthService) { }


    registerUser = async (req: Request, res: Response) => {
        // const input = req.body as RegisterUserDto & {
        //     userAgent: string,
        //     ipAddress: string
        // }

        const result = await this.authService.registerUser({
            ...req.body,
            userAgent: req.get("User-Agent") ?? "Unknown",
            ipAddress: req.ip ?? "Unknown"
        });

        setRefreshTokenCookie(res, result.refreshToken);

        return res.status(201).json({
            success: true,
            data: {
                user: result.user,
                accessToken: result.accessToken
            }
        })
    }

    loginUser = async (req: Request, res: Response) => {
        // const input = req.body as LoginUserDto & {
        //     userAgent: string,
        //     ipAddress: string
        // }

        const result = await this.authService.loginUser({
            ...req.body,
            userAgent: req.get("User-Agent") ?? "Unknown",
            ipAddress: req.ip ?? "Unknown"
        });

        setRefreshTokenCookie(res, result.refreshToken);

        return res.status(200).json({
            success: true,
            data: {
                user: result.user,
                accessToken: result.accessToken
            }
        })
    }


    refreshSession = async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new BadRequestError("Refresh token is missing");
        }

        const result = await this.authService.refreshSession(refreshToken);

        setRefreshTokenCookie(res, result.refreshToken);

        return res.status(200).json({
            success: true,
            data: {
                accessToken: result.accessToken
            }
        })
    }

    getMe = async (req: Request, res: Response) => {
        const userSession = req.user;
        if (!userSession) {
            throw new BadRequestError("User session is missing");
        }
        const user = await this.authService.getLoggedInUser(userSession!);

        if (!user) {
            throw new BadRequestError("User not found");
        }
        return res.status(200).json({
            success: true,
            data: {
                user
            }
        })
    }

    logoutUser = async (req: Request, res: Response) => {
        const { userId, sessionId } = req.user!;

        await this.authService.logoutUser({ userId, sessionId });

        clearRefreshTokenCookie(res);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    }

    logOutAll = async (req: Request, res: Response) => {
        const { userId } = req.user!;

        await this.authService.logOutAll(userId);

        clearRefreshTokenCookie(res);

        return res.status(200).json({
            success: true,
            message: "Logged out from all sessions successfully"
        })
    }


    verifyEmail = async (req: Request, res: Response) => {
        const { token } = req.query;

        if (!token || typeof token !== "string") {
            throw new BadRequestError("Verification token is missing or invalid");
        }

        const result = await this.authService.verifyEmail(token);

        return res.status(200).json({
            success: true,
            data: result
        })
    }

    requestPasswordReset = async (
        req: Request,
        res: Response,
    ) => {
        const { email } = req.body;

        const result =
            await this.authService.reqResetPassword(
                email,
            );

        return res.status(200).json({
            success: true,
            data: result,
        });
    };

    verifyPasswordResetToken = async (
        req: Request,
        res: Response,
    ) => {
        const { token } = req.query;

        if (typeof token !== "string" || !token) {
            throw new BadRequestError(
                "Reset token is required",
            );
        }

        const result =
            await this.authService.verifyPasswordResetToken(
                token,
            );

        return res.status(200).json({
            success: true,
            data: result,
        });
    };

    resetPassword = async (
        req: Request,
        res: Response,
    ) => {
        const { token, newPassword } = req.body;

        if (
            typeof token !== "string" ||
            !token
        ) {
            throw new BadRequestError(
                "Reset token is required",
            );
        }

        const result =
            await this.authService.resetPassword(
                token,
                newPassword,
            );

        return res.status(200).json({
            success: true,
            data: result,
        });
    };
}