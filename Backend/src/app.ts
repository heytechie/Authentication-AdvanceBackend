import express from "express";
import authRouter from './modules/auth/auth.routes.js'
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import cookieParser  from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/auth', authRouter);
app.use(globalErrorHandler);

export default app;