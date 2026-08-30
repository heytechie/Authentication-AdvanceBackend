import {Worker} from "bullmq";

import redis from "../lib/redis.js";
import type {verifyEmailJobType} from "../queue/email.type.js";
import {emailService} from "../services/email/email.service.js";


export const emailWorker = new Worker<verifyEmailJobType>(
    "email",
    async(job)=>{
        switch(job.data.type){
            case "VERIFY-EMAIL":
                await emailService.sendVerificationEmail(
                    job.data.email,
                    job.data.name,
                    job.data.verificationToken
                );
                break;
            

            default:
                throw new Error(
                    `Unknown email job type ${job.data.type}`
                )
        }
    },
    {
        connection:redis
    }
)