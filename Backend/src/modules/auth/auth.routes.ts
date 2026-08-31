import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { authRepository } from './auth.repository.js';
import oauthRoutes from '../oauth/oauth.route.js';
import { authenticate } from '../../middlewares/authentication.middleware.js';
import { loginRateLimit, registerRateLimit, refreshTokenRateLimit, googleOAuthRateLimit } from '../../middlewares/rate-limiting/index.js';
import { csrfProtectionMiddleware } from '../../middlewares/crsf.middleware.js';
const authRepo = new authRepository();
const authService = new AuthService(authRepo);
const authController = new AuthController(authService);


const router = Router();
//Authentication Routes
router.post('/register', registerRateLimit, authController.registerUser);
router.post('/login', loginRateLimit, authController.loginUser);
router.post('/refresh',  refreshTokenRateLimit,csrfProtectionMiddleware, authController.refreshSession);
router.get("/verify-email", authController.verifyEmail);
router.post(
    "/forgot-password",
    authController.requestPasswordReset,
);

//get csrf token when frontend loads for the first time
router.get("/csrf-token", authController.getCsrfToken);

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