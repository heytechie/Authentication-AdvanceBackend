import dotenv from "dotenv";
import {z} from "zod";

dotenv.config({
    path:"./.env"
})

const envSchema = z.object({
    // PORT : z.coerce.number(),
    NODE_ENV: z.enum(["dev","prod","test"]),
    // ACCESS_TOKEN_SECRET: z.string(),
    // REFRESH_TOKEN_SECRET : z.string(),
    DATABASE_URL: z.string(),
    PRISMA_DATABASE_URL: z.string().optional()
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