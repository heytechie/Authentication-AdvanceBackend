import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { authRepository } from './auth.repository.js';
import oauthRoutes from '../oauth/oauth.route.js';
import { authenticate } from '../../middlewares/authentication.middleware.js';
import { loginRateLimit, registerRateLimit, refreshTokenRateLimit, googleOAuthRateLimit } from '../../middlewares/rate-limiting/index.js';

const authRepo = new authRepository();
const authService = new AuthService(authRepo);
const authController = new AuthController(authService);


const router = Router();
//Authentication Routes
router.post('/register', registerRateLimit, authController.registerUser);
router.post('/login', loginRateLimit, authController.loginUser);
router.post('/refresh', refreshTokenRateLimit, authController.refreshSession);
router.get("/verify-email", authController.verifyEmail);
router.post(
    "/forgot-password",
    authController.requestPasswordReset,
);

router.get(
    "/reset-password/verify",
    authController.verifyPasswordResetToken,
);

router.post(
    "/reset-password",
    authController.resetPassword,
);

//Authenticated Routes  
router.get('/me', authenticate, authController.getMe);
router.get('/logout', authenticate, authController.logoutUser);
router.get('/logout-all', authenticate, authController.logOutAll);


//Oauth Route
router.use('/oauth', googleOAuthRateLimit, oauthRoutes);


export default router;