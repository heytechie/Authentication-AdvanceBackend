import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { env } from "../config/env.config.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/error/AppError.js";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  if (err instanceof AppError) {
    logger.error({
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack,
    });

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(env.NODE_ENV === "dev" && {
        stack: err.stack,
      }),
    });
  }

  logger.error({
    message:
      err instanceof Error
        ? err.message
        : "Unknown error",
    stack:
      err instanceof Error
        ? err.stack
        : undefined,
  });

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
    ...(env.NODE_ENV === "dev" &&
      err instanceof Error && {
        stack: err.stack,
      }),
  });
};