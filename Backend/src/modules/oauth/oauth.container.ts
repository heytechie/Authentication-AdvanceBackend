import { authRepository } from "../auth/auth.repository.js";
import { AuthService } from "../auth/auth.service.js";

import { OauthService } from "./oauth.service.js";

const authRepo = new authRepository();
const authService = new AuthService(authRepo);
const oauthService = new OauthService(authRepo, authService);

export { oauthService };
