import {Router} from 'express'
import {OauthController} from './oauth.controller.js'

const router = Router();


const oauthController = new OauthController();

router.get('/google',oauthController.startGoogleAuth);

router.get('/google/callback',oauthController.googleCallback);

export default router;
