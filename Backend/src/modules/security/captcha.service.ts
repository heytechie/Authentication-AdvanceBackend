import {env} from '../../config/env.config.js'
import { AppError } from '../../utils/error/AppError.js';
import type {TurnstileVerificationResponse} from '../auth/auth.types.js';


export const captchaService ={
    async verifyTurnstileToken(
        token:string,
        remoteIp?:string
    ):Promise<void>{
        if(!token){
            throw new AppError("Captcha token is required",400);
        }
        try{
            const formData = new URLSearchParams()
            formData.append("secret",env.TURNSTILE_SECRET_KEY)
            formData.append("response",token)

            if(remoteIp){
                formData.append("remoteip",remoteIp)
            }
            const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",
                {method:"POST",
                headers:{
                    "content-type":"application/x-www-form-urlencoded"
                },
                body:formData}
            )

            if(!res.ok){
                throw new AppError("Captcha verification service unavailable",503)
            }

            const result = (await res.json()) as TurnstileVerificationResponse;

            if(!result.success){
                throw new AppError("Captcha verification failed",400)
            }

        }catch(err){
            throw new AppError("Server error captcha",500)
        }
    }
}