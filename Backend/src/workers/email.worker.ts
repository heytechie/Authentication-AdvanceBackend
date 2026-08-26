import {Worker} from "bullmq";

import {redis} from "../lib/redis.js";
import type {verifyEmailJobType} from "../queue/email.type.js";
import {emailService} from "../services/email/email.service.js";