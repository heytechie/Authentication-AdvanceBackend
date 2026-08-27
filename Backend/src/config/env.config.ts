import dotenv from "dotenv";
import Redis from "ioredis";
import {z} from "zod";

dotenv.config({
    path:"./.env"
})

const envSchema = z.object({
    // PORT : z.coerce.number(),
    NODE_ENV: z.enum(["dev","prod","test"]),
    ACCESS_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_SECRET : z.string(),
    JWT_ACCESS_TOKEN_EXPIRATION: z.string(),
    JWT_REFRESH_TOKEN_EXPIRATION: z.string(),
    DATABASE_URL: z.string(),
    PRISMA_DATABASE_URL: z.string().optional(),
    BYCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
    TURNSTILE_SITE_KEY: z.string(),
    TURNSTILE_SECRET_KEY: z.string(),
    Redis_URL: z.string(),
    REDIS_PORT: z.coerce.number(),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_USER: z.string(),
    SMTP_PASSWORD: z.string(),
    EMAIL_FROM: z.string(),
    FRONTEND_URL:z.string(),
    EMAIL_VERIFICATION_TOKEN_EXPIRATION:z.string(),
    GOOGLE_CLIENT_ID:z.string(),
    GOOGLE_CLIENT_SECRET:z.string(),
    GOOGLE_CALLBACK_URL:z.string()
})


const parsedEnv = envSchema.safeParse(process.env)

if(!parsedEnv.success){
    console.error(
        "Invalid env vars",
        z.treeifyError(parsedEnv.error)
    )

    process.exit(1);
}

export const env = parsedEnv.data;