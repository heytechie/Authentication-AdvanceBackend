import {Queue} from "bullmq";
import redis from '../lib/redis.js'
import { verifyEmailJobType } from "./email.type.js";

export const emailQueue = new Queue<verifyEmailJobType>('email',{
    connection: redis,
})