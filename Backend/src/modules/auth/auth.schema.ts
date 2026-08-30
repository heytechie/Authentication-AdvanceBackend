import {z} from 'zod';

export const registerUserSchema = z.object({
    name: z.string().trim().min(1, {message: 'Name is required'}).max(50, {message: 'Name must be less than 50 characters'}),
    email: z.email("Invalid email address").trim().toLowerCase(),
    password: z.string().min(6, {message: 'Password must be at least 6 characters long'}).max(50, {message: 'Password must be less than 50 characters'}),
    confirmPassword: z.string(),
    captchaToken: z.string()
})
.refine((data)=> data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
})


export const loginUserSchema = z.object({
    email : z.email("Invalid email address").trim().toLowerCase(),
    password : z.string(),
    captchaToken: z.string().optional()
})
export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginUserDto = z.infer<typeof loginUserSchema>;