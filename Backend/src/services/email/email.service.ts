import nodemailer from "nodemailer";
import {env} from '../../config/env.config.js'
import {verificationEmailTemplate} from './template/verificationEmail.js'

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth:{
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD
    }
})


export const emailService = {
    async sendVerificationEmail(email:string,name:string,verificationToken:string):Promise<void> {
        const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`

        const template = verificationEmailTemplate(name,verificationUrl);

        await transporter.sendMail({
            from:env.EMAIL_FROM,
            to:email,
            subject:template.subject,
            text:template.text,
            html:template.html
        })
    }
}