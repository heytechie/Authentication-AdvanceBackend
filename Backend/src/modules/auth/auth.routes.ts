import {Router} from 'express';
import oauthRoutes from '../oauth/oauth.route.js';

const router = Router();

router.use('/oauth', oauthRoutes);


export default router;