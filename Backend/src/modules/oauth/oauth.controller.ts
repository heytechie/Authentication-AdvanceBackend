import { Request, Response } from "express";

import {
    clearOAuthStateCookie,
    setOAuthStateCookie,
    OAUTH_STATE_COOKIE
} from "./oauth.helper.js";

import { oauthService } from "./oauth.container.js";

export class OauthController {


    startGoogleAuth = (req: Request, res: Response) => {
        const { url, state } = oauthService.generateGoogleAuthUrl();

        setOAuthStateCookie(res, state);

        return res.redirect(url);
    }

    googleCallback = async (req: Request, res: Response) => {
        const { code, state } = req.query;

        if (
            typeof code !== "string" ||
            typeof state !== "string"
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid request"
            });
        }

        const storedState = req.cookies[OAUTH_STATE_COOKIE];

        if (!storedState || storedState !== state) {
            clearOAuthStateCookie(res);
            return res.status(400).json({
                success: false,
                error: "Invalid state parameter"
            });
        }

        clearOAuthStateCookie(res);

        const userProfile = await oauthService.getGoogleUserProfile(code);
        
        const result =
            await oauthService.authenticateUser(
                userProfile,
                req.get("User-Agent") ?? "unknown",
                req.ip ?? "unknown",
            );

        return res.status(200).json({
            success: true,
            data: result
        })

    }

}
