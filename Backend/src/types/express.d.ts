import type { userSessionType } from "../modules/auth/auth.types.js";


declare global {
    namespace Express {
        interface Request {
            user?: userSessionType;
        }
    }
}

export {};
