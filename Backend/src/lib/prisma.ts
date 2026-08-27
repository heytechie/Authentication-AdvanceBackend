import "dotenv/config";

import { PrismaClient } from "../../src/generated/prisma/client.js";
import {env} from "../config/env.config.js"
import { PrismaPg } from '@prisma/adapter-pg';


const connectionString = `${env.DATABASE_URL}`
const adapter = new PrismaPg({connectionString})
const prisma  = new PrismaClient({adapter})

export {prisma}

