import type {Response} from "express";
import {env } from '../../config/env.config.js'

const REFRESH_TOKEN_COOKIE = "refreshToken";

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "prod",
        sameSite: "lax",
        path:"/api/v1/auth",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });
}

export const clearRefreshTokenCookie = (res: Response) => {
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
        httpOnly: true,
        secure: env.NODE_ENV === "prod",
        sameSite: "lax",
        path:"/api/v1/auth"
    });
}