import {google} from 'googleapis';
import {env} from '../config/env.config.js'

export const googleOauthClient = ()=>{
    return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_CALLBACK_URL
    )
}
