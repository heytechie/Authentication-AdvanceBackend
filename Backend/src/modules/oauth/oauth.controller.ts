import { Request,Response } from "express";

import {
  clearOAuthStateCookie,
  setOAuthStateCookie,
} from "./oauth.helper.js";

import  {OauthService}  from "./oauth.service.js";

export class OauthController {
    constructor(private readonly oauthService: OauthService) {}


    startGoogleAuth = (req: Request, res: Response) => {
        const {url, state}=this.oauthService.generateGoogleAuthUrl();

        setOAuthStateCookie(res, state);

        return res.redirect(url);
    }

    googleCallback = async (req: Request, res: Response) => {
        const {code, state} = req.query;

        if(
            typeof code !== "string" ||
            typeof state !== "string"
        ){
            return res.status(400).json({
                success:false,
                error:"Invalid request"});
        }

        const storedState = req.cookies.oauth_state;

        if(!storedState || storedState !== state){
            clearOAuthStateCookie(res);
            return res.status(400).json({
                success:false,
                error:"Invalid state parameter"
            });
        }

        clearOAuthStateCookie(res);

        const userProfile = await this.oauthService.getGoogleUserProfile(code);

        return res.status(200).json({
            success:true,
            data:userProfile
        })

    }

}
