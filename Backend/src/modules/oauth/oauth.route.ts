import {Router} from 'express'
import {OauthController} from './oauth.controller.js'
import {OauthService} from './oauth.service.js'

const router = Router();

const oauthService = new OauthService();
const oauthController = new OauthController(oauthService);

router.get('/google',oauthController.startGoogleAuth);

router.get('/google/callback',oauthController.googleCallback);

export default router;
